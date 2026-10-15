const Project = require("../../models/project");
const ClientProject = require("../../models/clientProject");
const Milestone = require("../../models/milestones");
const ClientMilestone = require("../../models/clientMilestone");
const Task = require("../../models/task");
const ClientTask = require("../../models/clientTask");
const Client = require("../../models/client");

class ClientDashboardController {
    async getDashboard(req, res) {
        try {
            const clientId = req.client._id;
            const { projectId } = req.query;

            // Check client's projects array
            const clientDoc = await Client.findById(clientId).select('projects').lean();
            const clientProjectIds = Array.isArray(clientDoc?.projects) ? clientDoc.projects : [];

            let projects = await Project.find({
                $or: [
                    { client: clientId },
                    { _id: { $in: clientProjectIds } }
                ],
                isActive: true,
            })
                .populate("technology")
                .populate({
                    path: "team",
                    select: "name email designation role"
                });

            // Fallback to ClientProject if none found in Project model
            if (!projects.length) {
                projects = await ClientProject.find({
                    client: clientId,
                    isActive: true,
                })
                    .populate("technology")
                    .populate({
                        path: "team",
                        select: "name email designation role"
                    });
            }

            if (!projects.length) {
                return res.status(404).json({
                    success: false,
                    message: "No projects assigned.",
                });
            }

            // ── Selected Project ──────────────────────────────────────────────
            let project;

            if (projectId) {
                project = await Project.findOne({
                    _id: projectId,
                    $or: [
                        { client: clientId },
                        { _id: { $in: clientProjectIds } }
                    ],
                    isActive: true,
                })
                    .populate("technology")
                    .populate({
                        path: "team",
                        select: "name email designation role",
                        populate: [
                            { path: "designation", select: "name" },
                            { path: "role", select: "name" }
                        ]
                    });

                if (!project) {
                    project = await ClientProject.findOne({
                        _id: projectId,
                        client: clientId,
                        isActive: true,
                    })
                        .populate("technology")
                        .populate({
                            path: "team",
                            select: "name email designation role",
                            populate: [
                                { path: "designation", select: "name" },
                                { path: "role", select: "name" }
                            ]
                        });
                }
            } else {
                project = projects[0];
            }

            if (!project) {
                return res.status(404).json({
                    success: false,
                    message: "Project not found.",
                });
            }

            // ── Get Milestones (Milestone model with ClientMilestone fallback) ──
            let milestones = await Milestone.find({
                project: project._id,
                isActive: true,
            }).sort({ startDate: 1 });

            if (!milestones.length) {
                milestones = await ClientMilestone.find({
                    project: project._id,
                    isActive: true,
                }).sort({ startDate: 1 });
            }

            const totalMilestones = milestones.length;
            const completedMilestones = milestones.filter((m) => m.status === "Completed" || m.status === "Done").length;
            const inProgressMilestones = milestones.filter((m) => m.status === "In Progress" || m.status === "Ongoing").length;
            const pendingMilestones = milestones.filter((m) => m.status === "Not Started" || m.status === "To Do").length;

            // ── Get Tasks (Task model with ClientTask fallback) ───────────────
            let tasks = await Task.find({
                project: project._id,
                isActive: true,
            });

            if (!tasks.length) {
                tasks = await ClientTask.find({
                    project: project._id,
                    isActive: true,
                });
            }

            const totalTasks = tasks.length;
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

                const milestoneTotalTasks = milestoneTasks.length;
                const milestoneCompletedTasks = milestoneTasks.filter(
                    (t) => t.status === "Completed" || t.status === "Done"
                ).length;
                const milestoneRemainingTasks = milestoneTotalTasks - milestoneCompletedTasks;
                const progress = milestoneTotalTasks > 0
                    ? Math.round((milestoneCompletedTasks / milestoneTotalTasks) * 100)
                    : 0;

                return {
                    ...(typeof milestone.toObject === 'function' ? milestone.toObject() : milestone),
                    totalTasks: milestoneTotalTasks,
                    completedTasks: milestoneCompletedTasks,
                    remainingTasks: milestoneRemainingTasks,
                    progress,
                };
            });

            // ── Current Milestone ─────────────────────────────────────────────
            const currentMilestone =
                milestonesWithProgress.find((m) => m.status === "In Progress" || m.status === "Ongoing") || milestonesWithProgress[0] || null;

            // ── Upcoming Deliverables ─────────────────────────────────────────
            const upcomingDeliverables = milestonesWithProgress
                .filter((m) => m.status !== "Completed" && m.status !== "Done")
                .sort((a, b) => new Date(a.completionDate) - new Date(b.completionDate))
                .slice(0, 3);

            // ── Recent Activities ─────────────────────────────────────────────
            let recentTasks = await Task.find({
                project: project._id,
                isActive: true,
            })
                .sort({ updatedAt: -1 })
                .limit(6)
                .populate("assignee", "name email");

            if (!recentTasks.length) {
                recentTasks = await ClientTask.find({
                    project: project._id,
                    isActive: true,
                })
                    .sort({ updatedAt: -1 })
                    .limit(6)
                    .populate("assignee", "name email");
            }

            const recentActivities = recentTasks.map((t) => ({
                id: t._id,
                title: t.summary || t.title,
                status: t.status,
                assigneeName: t.assignee ? t.assignee.name : "Team Member",
                updatedAt: t.updatedAt || t.createdAt,
            }));

            // Normalize project dates for backwards compatibility
            const rawProj = typeof project.toObject === 'function' ? project.toObject() : project;
            const projectData = {
                ...rawProj,
                start: rawProj.start || rawProj.startDate || rawProj.createdAt,
                end: rawProj.end || rawProj.estimatedCompletion || rawProj.startDate,
            };

            // ── Response ──────────────────────────────────────────────────────
            return res.status(200).json({
                success: true,
                projects,
                project: projectData,
                summary: {
                    totalProjects: projects.length,
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
                milestones: milestonesWithProgress,
                upcomingDeliverables,
                recentActivities,
                team: project.team || [],
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
