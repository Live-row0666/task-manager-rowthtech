const ClientProject   = require("../../models/clientProject");
const ClientMilestone = require("../../models/clientMilestone");
const ClientTask      = require("../../models/clientTask");

class ClientDashboardController {

    async getDashboard(req, res) {
        console.log("Dashboard Route Hit");

        try {
            const clientId  = req.client._id;
            const { projectId } = req.query;

            const projects = await ClientProject.find({
                client:   clientId,
                isActive: true,
            })
                .populate("technology")
                .populate("team");

            if (!projects.length) {
                return res.status(404).json({
                    success: false,
                    message: "No projects assigned.",
                });
            }

            // ── Selected Project ──────────────────────────────────────────────
            let project;

            if (projectId) {
                project = await ClientProject.findOne({
                    _id:      projectId,
                    client:   clientId,
                    isActive: true,
                })
                    .populate("technology")
                    .populate("team");
            } else {
                project = projects[0];
            }

            if (!project) {
                return res.status(404).json({
                    success: false,
                    message: "Project not found.",
                });
            }

            // ── Get Milestones ────────────────────────────────────────────────
            const milestones = await ClientMilestone.find({
                project:  project._id,
                isActive: true,
            }).sort({ startDate: 1 });

            const totalMilestones       = milestones.length;
            const completedMilestones   = milestones.filter((m) => m.status === "Completed").length;
            const inProgressMilestones  = milestones.filter((m) => m.status === "In Progress").length;
            const pendingMilestones     = milestones.filter((m) => m.status === "Not Started").length;

            // ── Get Tasks ─────────────────────────────────────────────────────
            const tasks = await ClientTask.find({
                project:  project._id,
                isActive: true,
            });

            const totalTasks     = tasks.length;
            const completedTasks = tasks.filter(
                (t) => t.status === "Completed" || t.status === "Done"
            ).length;
            const remainingTasks = totalTasks - completedTasks;

            // ── Overall Progress ──────────────────────────────────────────────
            let overallProgress = 0;
            if (project.projectStatus === "Delivered") {
                overallProgress = 100;
            } else if (totalTasks > 0) {
                overallProgress = Math.round((completedTasks / totalTasks) * 100);
            }

            // ── Milestone Progress ────────────────────────────────────────────
            const milestonesWithProgress = milestones.map((milestone) => {
                const milestoneTasks = tasks.filter(
                    (t) => t.milestone && t.milestone.toString() === milestone._id.toString()
                );

                const milestoneTotalTasks     = milestoneTasks.length;
                const milestoneCompletedTasks = milestoneTasks.filter(
                    (t) => t.status === "Completed" || t.status === "Done"
                ).length;
                const milestoneRemainingTasks = milestoneTotalTasks - milestoneCompletedTasks;
                const progress = milestoneTotalTasks > 0
                    ? Math.round((milestoneCompletedTasks / milestoneTotalTasks) * 100)
                    : 0;

                return {
                    ...milestone.toObject(),
                    totalTasks:     milestoneTotalTasks,
                    completedTasks: milestoneCompletedTasks,
                    remainingTasks: milestoneRemainingTasks,
                    progress,
                };
            });

            // ── Current Milestone ─────────────────────────────────────────────
            const currentMilestone =
                milestonesWithProgress.find((m) => m.status === "In Progress") || null;

            // ── Upcoming Deliverables ─────────────────────────────────────────
            const upcomingDeliverables = milestonesWithProgress
                .filter((m) => m.status !== "Completed")
                .sort((a, b) => new Date(a.completionDate) - new Date(b.completionDate))
                .slice(0, 3);

            // ── Response ──────────────────────────────────────────────────────
            return res.status(200).json({
                success: true,
                projects,
                project,
                summary: {
                    totalProjects:      projects.length,
                    totalMilestones,
                    completedMilestones,
                    inProgressMilestones,
                    pendingMilestones,
                    totalTasks,
                    completedTasks,
                    remainingTasks,
                    overallProgress,
                    progressText: `${completedTasks}/${totalTasks}`,
                },
                currentMilestone,
                milestones:           milestonesWithProgress,
                upcomingDeliverables,
                recentActivities:     [],
                team:                 project.team || [],
            });

        } catch (err) {
            console.log("Dashboard Error =>", err);
            return res.status(500).json({
                success: false,
                message: err.message,
            });
        }
    }
}

module.exports = new ClientDashboardController();
