const Project = require("../../models/project");
const ClientProject = require("../../models/clientProject");
const Milestone = require("../../models/milestones");
const ClientMilestone = require("../../models/clientMilestone");
const Task = require("../../models/task");
const ClientTask = require("../../models/clientTask");
const Client = require("../../models/client");
const Role = require("../../models/role");
const Users = require("../../models/user");

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

            // ── Get Milestones from Milestone model (Milestone.js) ────────────
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

            // ── Get Project Manager Users ─────────────────────────────────────
            const pmRoles = await Role.find({ name: { $regex: /project\s*manager/i } }).select('_id');
            const pmRoleIds = pmRoles.map(r => r._id);
            const pmUsers = await Users.find({
                $or: [
                    { role: { $in: pmRoleIds } },
                    { designation: { $regex: /project\s*manager/i } }
                ]
            }).select('_id');
            const pmUserIds = pmUsers.map(u => u._id);

            // ── Get Tasks ONLY from ClientTask (clienttasks collection) ──────────
            const clientTaskQuery = {
                project: project._id,
                isActive: true,
            };
            if (pmUserIds.length > 0) {
                clientTaskQuery.$or = [
                    { createdBy: { $in: pmUserIds } },
                    { createdBy: { $exists: false } },
                    { createdBy: null }
                ];
            }
            const tasks = await ClientTask.find(clientTaskQuery)
                .populate("assignee", "name email")
                .populate("reporter", "name email")
                .lean();

            const totalTasks = tasks.length;
            const completedTasks = tasks.filter(
                (t) => t.status === "Completed" || t.status === "Done"
            ).length;
            const remainingTasks = totalTasks - completedTasks;

            const totalProjectHours = tasks.reduce((sum, t) => sum + (Number(t.estimatedTime) || 0), 0);
            const completedProjectHours = tasks
                .filter(t => t.status === "Completed" || t.status === "Done")
                .reduce((sum, t) => sum + (Number(t.estimatedTime) || 0), 0);
            const pendingProjectHours = totalProjectHours - completedProjectHours;

            // ── Overall Progress ──────────────────────────────────────────────
            let overallProgress = 0;
            if (project.projectStatus === "Delivered") {
                overallProgress = 100;
            } else if (totalTasks > 0) {
                overallProgress = Math.round((completedTasks / totalTasks) * 100);
            }

            // ── Milestone Progress & Detailed Task Breakdown ───────────────────
            const milestonesWithProgress = milestones.map((milestone) => {
                const mIdStr = milestone._id.toString();
                const milestoneTasks = tasks.filter((t) => {
                    if (!t.milestone) return false;
                    const tMilestoneId = t.milestone._id ? t.milestone._id.toString() : t.milestone.toString();
                    return tMilestoneId === mIdStr;
                });

                const milestoneTotalTasks = milestoneTasks.length;
                const milestoneCompletedTasks = milestoneTasks.filter(
                    (t) => t.status === "Completed" || t.status === "Done"
                ).length;
                const milestonePendingTasks = milestoneTotalTasks - milestoneCompletedTasks;

                const milestoneTotalHours = milestoneTasks.reduce((sum, t) => sum + (Number(t.estimatedTime) || 0), 0);
                const milestoneCompletedHours = milestoneTasks
                    .filter((t) => t.status === "Completed" || t.status === "Done")
                    .reduce((sum, t) => sum + (Number(t.estimatedTime) || 0), 0);
                const milestonePendingHours = milestoneTotalHours - milestoneCompletedHours;

                let progress = 0;
                if (milestone.status === "Completed" || milestone.status === "Done") {
                    progress = 100;
                } else if (milestoneTotalTasks > 0) {
                    progress = Math.round((milestoneCompletedTasks / milestoneTotalTasks) * 100);
                } else if (milestone.status === "In Progress" || milestone.status === "Ongoing") {
                    progress = 0;
                }

                return {
                    ...(typeof milestone.toObject === 'function' ? milestone.toObject() : milestone),
                    totalTasks: milestoneTotalTasks,
                    completedTasks: milestoneCompletedTasks,
                    pendingTasks: milestonePendingTasks,
                    remainingTasks: milestonePendingTasks,
                    totalHours: milestoneTotalHours,
                    completedHours: milestoneCompletedHours,
                    pendingHours: milestonePendingHours,
                    progress,
                    tasks: milestoneTasks.map(t => ({
                        _id: t._id,
                        summary: t.summary || t.title || 'Untitled Task',
                        status: t.status || 'To Do',
                        priority: t.priority || 'Medium',
                        estimatedTime: Number(t.estimatedTime) || 0,
                        startDate: t.startDate,
                        dueDate: t.dueDate,
                        assignee: t.assignee ? { name: t.assignee.name, email: t.assignee.email } : null,
                    })),
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

            // ── Recent Activities (filtered by Project Manager) ───────────────
            const recentTasks = tasks.slice(0, 6);

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
                    pendingTasks: remainingTasks,
                    overallProgress,
                    progressText: `${completedTasks}/${totalTasks}`,
                    totalHours: totalProjectHours,
                    completedHours: completedProjectHours,
                    pendingHours: pendingProjectHours,
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
