const Task = require('../../models/task');
const TaskComment = require('../../models/taskComment');
const TimeTracking = require('../../models/timeTracking');
const NotificationService = require('../../utils/notificationService');
const { getComments } = require('./taskComment');

class UserTaskController {
    // Get user's assigned tasks
    /** @ Get : api/v1/user/task */
    // async getUserTasks(req, res) {
    //     try {
    //         const {
    //             page = 1,
    //             limit = 10,
    //             search = '',
    //             status,
    //             priority,
    //             project,
    //             milestone,
    //             sprint
    //         } = req.query;
    //         const userId = req.user._id;

    //         let searchQuery = {
    //             assignee: userId
    //         };

    //         if (search) {
    //             searchQuery.$or = [
    //                 { summary: { $regex: search, $options: 'i' } },
    //                 { description: { $regex: search, $options: 'i' } }
    //             ];
    //         }

    //         if (status) searchQuery.status = status;
    //         if (priority) searchQuery.priority = priority;
    //         if (project) searchQuery.project = project;
    //         if (milestone) searchQuery.milestone = milestone;
    //         if (sprint) searchQuery.sprint = sprint;

    //         const tasks = await Task.find(searchQuery)
    //             .populate('project', 'name')
    //             .populate('milestone', 'title')
    //             .populate('sprint', 'sprintName')
    //             .populate('reporter', 'name email')
    //             .populate('assignee', 'name email designation')
    //             .limit(limit * 1)
    //             .skip((page - 1) * limit)
    //             .sort({ createdAt: -1 })
    //             .lean();

    //         // Get comment counts for each task
    //         const tasksWithCommentCounts = await Promise.all(tasks.map(async (task) => {
    //             const commentCount = await TaskComment.countDocuments({ task: task._id });
    //             return { ...task, commentCount };
    //         }));

    //         const count = await Task.countDocuments(searchQuery);

    //         return res.status(200).json({
    //             status: 200,
    //             message: 'Tasks retrieved successfully',
    //             data: tasksWithCommentCounts,
    //             totalPages: Math.ceil(count / limit),
    //             currentPage: parseInt(page),
    //             totalTasks: count
    //         });
    //     } catch (error) {
    //         return res.status(500).json({
    //             status: 500,
    //             message: 'Internal server error',
    //             error: error.message
    //         });
    //     }
    // }

    // Get single task details

    async getUserTasks(req, res) {
        try {
            const {
                page = 1,
                limit = 10,
                search = '',
                status,
                priority,
                project,
                milestone,
                sprint
            } = req.query;

            const userId = req.user._id;

            let searchQuery = {
                assignee: userId
            };

            if (search) {
                searchQuery.$or = [
                    { summary: { $regex: search, $options: "i" } },
                    { description: { $regex: search, $options: "i" } }
                ];
            }

            if (status) searchQuery.status = status;
            if (priority) searchQuery.priority = priority;
            if (project) searchQuery.project = project;
            if (milestone) searchQuery.milestone = milestone;
            if (sprint) searchQuery.sprint = sprint;

            const tasks = await Task.find(searchQuery)
                .populate("project", "name")
                .populate("milestone", "title")
                .populate("sprint", "sprintName")
                .populate("reporter", "name email")
                .populate("assignee", "name email designation")
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(Number(limit))
                .lean();

            const now = new Date();

            const tasksWithCommentCounts = await Promise.all(
                tasks.map(async (task) => {

                    const commentCount = await TaskComment.countDocuments({
                        task: task._id,
                    });

                    let isOverdue = false;
                    let overdueByMinutes = 0;

                    if (
                        task.status === "In Progress" &&
                        task.estimatedTime &&
                        task.timeSpent
                    ) {
                        const estimatedMs = 4 * 60 * 60 * 1000;

                        if (task.timeSpent > estimatedMs) {
                            isOverdue = true;

                            overdueByMinutes = Math.floor(
                                (task.timeSpent - estimatedMs) / (1000 * 60)
                            );
                        }

                    }

                    return {
                        ...task,
                        commentCount,
                        isOverdue,
                        overdueByMinutes,
                    };
                })
            );

            const overdueTasks = tasksWithCommentCounts.filter(
                (task) => task.isOverdue
            );

            const count = await Task.countDocuments(searchQuery);

            return res.status(200).json({
                status: 200,
                message: "Tasks retrieved successfully",

                data: tasksWithCommentCounts,

                overdueCount: overdueTasks.length,

                overdueTasks,

                totalPages: Math.ceil(count / limit),

                currentPage: Number(page),

                totalTasks: count,
            });

        } catch (error) {

            return res.status(500).json({
                status: 500,
                message: "Internal server error",
                error: error.message,
            });

        }
    }
    /** @ Get : api/v1/user/task/:id */
    async getSingleTask(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user._id;

            const task = await Task.findOne({
                _id: id,
                assignee: userId
            })
                .populate('project', 'name description')
                .populate('milestone', 'title description')
                .populate('sprint', 'sprintName sprintDesc')
                .populate('assignee', 'name email designation')
                .populate('reporter', 'name email designation')
                .populate('team', 'name email designation')
                .lean();

            if (!task) {
                return res.status(404).json({
                    status: 404,
                    message: 'Task not found or access denied'
                });
            }

            // Get task comments
            const comments = await TaskComment.find({ task: id })
                .populate('user', 'name email')
                .sort({ createdAt: -1 })
                .lean();

            // Get time tracking for this task
            const timeEntries = await TimeTracking.find({
                task: id,
                user: userId
            }).sort({ startTime: -1 }).lean();

            return res.status(200).json({
                status: 200,
                message: 'Task retrieved successfully',
                data: {
                    ...task,
                    comments,
                    timeEntries
                }
            });
        } catch (error) {
            return res.status(500).json({
                status: 500,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Update task status/progress
    /** @ Put : api/v1/user/task/:id */
    async updateTask(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user._id;
            const { status, progress, workLog, timeSpent } = req.body;

            const task = await Task.findOne({
                _id: id,
                assignee: userId
            });

            if (!task) {
                return res.status(404).json({
                    status: 404,
                    message: 'Task not found or access denied'
                });
            }

            const updateData = { ...req.body };
            if (status) updateData.status = status;
            if (progress !== undefined) updateData.progress = progress;
            if (timeSpent) updateData.timeSpent = (task.timeSpent || 0) + timeSpent;

            const updatedTask = await Task.findByIdAndUpdate(
                id,
                updateData,
                { new: true }
            ).populate('project', 'name')
                .populate('reporter', 'name email');

            // Add work log if provided
            if (workLog) {
                await TaskComment.create({
                    task: id,
                    user: userId,
                    comment: workLog,
                    type: 'work_log'
                });
            }

            // Send notification to reporter about task update
            // if (updatedTask.reporter) {
            //     await NotificationService.sendTaskUpdatedNotification(
            //         updatedTask._id,
            //         updatedTask.reporter._id,
            //         req.user._id,
            //         updatedTask.summary
            //     );
            // }

            return res.status(200).json({
                status: 200,
                message: 'Task updated successfully',
                data: updatedTask
            });
        } catch (error) {
            return res.status(500).json({
                status: 500,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Get tasks by project for user
    /** @ Get : api/v1/user/task/project/:projectId */
    async getTasksByProject(req, res) {
        try {
            const { projectId } = req.params;
            const { status, priority } = req.query;
            const userId = req.user._id;

            let query = {
                project: projectId,
                assignee: userId
            };

            if (status) query.status = status;
            if (priority) query.priority = priority;

            const tasks = await Task.find(query)
                .populate('milestone', 'title')
                .populate('sprint', 'sprintName')
                .populate('reporter', 'name email')
                .sort({ dueDate: 1 })
                .lean();

            return res.status(200).json({
                status: 200,
                message: 'Project tasks retrieved successfully',
                data: tasks,
                count: tasks.length
            });
        } catch (error) {
            return res.status(500).json({
                status: 500,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Add comment to task
    /** @ Post : api/v1/user/task/:id/comment */
    async addTaskComment(req, res) {
        try {
            const { id } = req.params;
            const { comment } = req.body;
            const userId = req.user._id;

            // Verify user has access to this task
            const task = await Task.findOne({
                _id: id,
                assignee: userId
            }).populate('reporter', 'name email');

            if (!task) {
                return res.status(404).json({
                    status: 404,
                    message: 'Task not found or access denied'
                });
            }

            const taskComment = await TaskComment.create({
                task: id,
                user: userId,
                comment,
                type: 'comment'
            });

            const populatedComment = await TaskComment.findById(taskComment._id)
                .populate('user', 'name email');

            // Send notification to reporter
            if (task.reporter) {
                await NotificationService.sendCommentNotification(
                    task._id,
                    task.reporter._id,
                    req.user._id,
                    task.summary
                );
            }

            return res.status(201).json({
                status: 201,
                message: 'Comment added successfully',
                data: populatedComment
            });
        } catch (error) {
            return res.status(500).json({
                status: 500,
                message: 'Internal server error',
                error: error.message
            });
        }
    }
}

module.exports = new UserTaskController();