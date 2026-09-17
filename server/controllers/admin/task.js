const Task = require('../../models/task');
const TaskComment = require('../../models/taskComment');
const User = require('../../models/user');
const Project = require('../../models/project');
const NotificationService = require('../../utils/notificationService');

class TaskController {
    // Create task
    /** @ Post : api/v1/admin/task/ */
    async createTask(req, res) {
        try {
            let data = req.body;
            data.createdBy =req.user._id;
            if (!data.project || !data.summary || !data.reporter) {
                return res.status(400).json({
                    status: 400,
                    message: 'Project, summary and reporter are required'
                });
            }

            const task = await Task.create(data);
            const populatedTask = await Task.findById(task._id)
                .populate('assignee', 'name email')
                .populate('project', 'name description');

            // Send notification if task is assigned
            if (populatedTask.assignee) {
                await NotificationService.sendTaskAssignedNotification(
                    task._id,
                    populatedTask.assignee._id,
                    data.reporter,
                    populatedTask.summary
                );

                await NotificationService.sendTaskAssignmentEmail(
                    populatedTask.assignee,
                    populatedTask,
                    populatedTask.project
                );
            }

            return res.status(201).json({
                status: 201,
                message: 'Task created successfully',
                data: task
            });
        } catch (error) {
            console.error('Error creating task:', error);
            return res.status(500).json({
                status: 500,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Update task
    /** @ Put : api/v1/admin/task/:id */
    async updateTask(req, res) {
        try {
            const { id } = req.params;
            const data = req.body;

            const oldTask = await Task.findById(id).populate('assignee', 'name email');
            const task = await Task.findByIdAndUpdate(id, data, { new: true })
                .populate('assignee', 'name email')
                .populate('project', 'name description');

            if (!task) {
                return res.status(404).json({
                    status: 404,
                    message: 'Task not found'
                });
            }

            // // Check if assignee changed
            // if (data.assignee && (!oldTask.assignee || oldTask.assignee._id.toString() !== data.assignee)) {
            //     await NotificationService.sendTaskAssignedNotification(
            //         task._id,
            //         task.assignee._id,
            //         req.user._id,
            //         task.summary
            //     );

            //     await NotificationService.sendTaskAssignmentEmail(
            //         task.assignee,
            //         task,
            //         task.project
            //     );
            // }

            // // Send update notification to assignee if task details changed
            // if (task.assignee && (data.status || data.priority || data.description)) {
            //     await NotificationService.sendTaskUpdatedNotification(
            //         task._id,
            //         task.assignee._id,
            //         req.user._id,
            //         task.summary
            //     );
            // }

            return res.status(200).json({
                status: 200,
                message: 'Task updated successfully',
                data: task
            });
        } catch (error) {
            return res.status(500).json({
                status: 500,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Get all tasks
    /** @ Get : api/v1/admin/task */
    async getAllTasks(req, res) {
        try {
            const {
                page = 1,
                limit = 10, 
                search = '',
                status,
                priority,
                workType,
                project,
                milestone,
                sprint,
                assignee,
                reporter,
                startDate,
                endDate
            } = req.query;

            let searchQuery = { isActive: true };

            if (search) {
                searchQuery.$or = [
                    { summary: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } }
                ];
            }
            if (!project) {
                return res.status(400).json({
                    status: 400,
                    message: 'Project is required to fetch tasks'
                });
            }

            if (status) searchQuery.status = status;
            if (priority) searchQuery.priority = priority;
            if (workType) searchQuery.workType = workType;
            if (project) searchQuery.project = project;
            if (milestone) searchQuery.milestone = milestone;
            if (sprint) searchQuery.sprint = sprint;
            if (assignee) searchQuery.assignee = assignee;
            if (reporter) searchQuery.reporter = reporter;
            if (startDate && endDate) {
                searchQuery.startDate = {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            }

            const tasks = await Task.find(searchQuery)
                .populate('project', 'name client')
                .populate('milestone', 'title status')
                .populate('sprint', 'sprintName progress')
                .populate('assignee', 'name email designation')
                .populate('reporter', 'name email')
                .populate('team', 'name email')
                .populate('parent', 'summary status')
                .populate('linkedItems.item', 'summary status')
                .limit(limit * 1)
                .skip((page - 1) * limit)
                .sort({ createdAt: -1 })
                .lean();


            // GET COMMENT COUNTS FOR EACH TASK
            const tasksWithCommentCounts = await Promise.all(tasks.map(async (task) => {
                const commentCount = await TaskComment.countDocuments({ task: task._id });
                return { ...task, commentCount };
            }))

            const count = await Task.countDocuments(searchQuery);

            return res.status(200).json({
                status: 200,
                message: 'Tasks retrieved successfully',
                data: tasksWithCommentCounts,
                totalPages: Math.ceil(count / limit),
                currentPage: parseInt(page),
                totalTasks: count
            });
        } catch (error) {
            return res.status(500).json({
                status: 500,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Get single task
    /** @ Get : api/v1/admin/task/:id */
    async getSingleTask(req, res) {
        try {
            const { id } = req.params;
            const task = await Task.findById(id)
                .populate('project', 'name description client team')
                .populate({
                    path: 'project',
                    populate: {
                        path: 'team',
                        select: 'name email designation'
                    }
                })
                .populate('milestone', 'title description status')
                .populate('sprint', 'sprintName sprintDesc progress')
                .populate('assignee', 'name email designation')
                .populate('reporter', 'name email designation')
                .populate('team', 'name email designation')
                .lean();

            if (!task) {
                return res.status(404).json({
                    status: 404,
                    message: 'Task not found'
                });
            }

            // Get task comments using TaskComment model
            const comments = await TaskComment.find({ task: id })
                .populate('user', 'name email')
                .sort({ createdAt: -1 })
                .lean();

            return res.status(200).json({
                status: 200,
                message: 'Task retrieved successfully',
                data: {
                    ...task,
                    comments
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

    // Delete task
    /** @ Delete : api/v1/admin/task/:id */
    async deleteTask(req, res) {
        try {
            const { id } = req.params;
            const task = await Task.findByIdAndDelete(id);

            if (!task) {
                return res.status(404).json({
                    status: 404,
                    message: 'Task not found'
                });
            }

            return res.status(200).json({
                status: 200,
                message: 'Task deleted successfully'
            });
        } catch (error) {
            return res.status(500).json({
                status: 500,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Get tasks by project
    /** @ Get : api/v1/admin/task/project/:projectId */
    async getTasksByProject(req, res) {
        try {
            const { projectId } = req.params;
            const { status, priority, assignee, milestone, sprint } = req.query;

            let query = { project: projectId };
            if (status) query.status = status;
            if (priority) query.priority = priority;
            if (assignee) query.assignee = assignee;
            if (milestone) query.milestone = milestone;
            if (sprint) query.sprint = sprint;

            const tasks = await Task.find(query)
                .populate('milestone', 'title')
                .populate('sprint', 'sprintName')
                .populate('assignee', 'name email')
                .populate('reporter', 'name email')
                .sort({ createdAt: -1 })
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

    /** @ Get : api/v1/admin/task/assignee/:assigneeId */
    async getTasksByAssignee(req, res) {
        try {
            const { assigneeId } = req.params;
            const { status, priority, project } = req.query;

            let query = { assignee: assigneeId };
            if (status) query.status = status;
            if (priority) query.priority = priority;
            if (project) query.project = project;

            const tasks = await Task.find(query)
                .populate('project', 'name')
                .populate('milestone', 'title')
                .populate('sprint', 'sprintName')
                .populate('reporter', 'name email')
                .sort({ dueDate: 1 })
                .lean();

            return res.status(200).json({
                status: 200,
                message: 'Assignee tasks retrieved successfully',
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
    /** @ Post : api/v1/admin/task/:id/comment */
    async addTaskComment(req, res) {
        try {
            const { id } = req.params;
            const { comment } = req.body;
            const userId = req.user._id;

            // Verify task exists
            const task = await Task.findById(id)
                .populate('assignee', 'name email')
                .populate('reporter', 'name email');

            if (!task) {
                return res.status(404).json({
                    status: 404,
                    message: 'Task not found'
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

            // Send notification to assignee if comment is from someone else
            if (task.assignee && task.assignee._id.toString() !== userId.toString()) {
                await NotificationService.sendCommentNotification(
                    task._id,
                    task.assignee._id,
                    userId,
                    task.summary
                );
            }

            // Send notification to reporter if comment is from someone else
            if (task.reporter && task.reporter._id.toString() !== userId.toString()) {
                await NotificationService.sendCommentNotification(
                    task._id,
                    task.reporter._id,
                    userId,
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

    // Get task comments
    /** @ Get : api/v1/admin/task/:id/comments */
    async getTaskComments(req, res) {
        try {
            const { id } = req.params;
            const { page = 1, limit = 10 } = req.query;

            // Verify task exists
            const task = await Task.findById(id);
            if (!task) {
                return res.status(404).json({
                    status: 404,
                    message: 'Task not found'
                });
            }

            const comments = await TaskComment.find({ task: id })
                .populate('user', 'name email')
                .sort({ createdAt: -1 })
                .limit(limit * 1)
                .skip((page - 1) * limit);

            const total = await TaskComment.countDocuments({ task: id });

            return res.status(200).json({
                status: 200,
                message: 'Comments retrieved successfully',
                data: comments,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
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

    // Update comment
    /** @ Put : api/v1/admin/task/comment/:commentId */
    async updateTaskComment(req, res) {
        try {
            const { commentId } = req.params;
            const { comment } = req.body;
            const userId = req.user._id;

            const updatedComment = await TaskComment.findOneAndUpdate(
                { _id: commentId, user: userId },
                { comment, isEdited: true, editedAt: new Date() },
                { new: true }
            ).populate('user', 'name email');

            if (!updatedComment) {
                return res.status(404).json({
                    status: 404,
                    message: 'Comment not found or unauthorized'
                });
            }

            return res.status(200).json({
                status: 200,
                message: 'Comment updated successfully',
                data: updatedComment
            });
        } catch (error) {
            return res.status(500).json({
                status: 500,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Delete comment
    /** @ Delete : api/v1/admin/task/comment/:commentId */
    async deleteTaskComment(req, res) {
        try {
            const { commentId } = req.params;
            const userId = req.user._id;

            const deletedComment = await TaskComment.findOneAndDelete({
                _id: commentId,
                user: userId
            });

            if (!deletedComment) {
                return res.status(404).json({
                    status: 404,
                    message: 'Comment not found or unauthorized'
                });
            }

            return res.status(200).json({
                status: 200,
                message: 'Comment deleted successfully'
            });
        } catch (error) {
            return res.status(500).json({
                status: 500,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // reassign task 
    /** @ Put : api/v1/admin/task/reassign */
    async reassignTask(req, res) {
        try {
            const { taskId, assigneeId } = req.body;

            const task = await Task.findById(taskId);

            if (!task) {
                return res.status(404).json({
                    status: 404,
                    message: 'Task not found'
                });
            }

            // Check if assignee exists in previousAssignees
            const prevAssigneeIndex = task.previousAssignees?.findIndex(
                pa => pa?.user?.toString() === assigneeId
            );

            if (prevAssigneeIndex > -1) {
                // Increment assignedCount if assignee exists
                task.previousAssignees[prevAssigneeIndex].assignedCount += 1;
            } else {
                // Add new previousAssignee entry
                task.previousAssignees.push({
                    user: assigneeId,
                    assignedCount: 1
                });
            }

            // Increment reassignedCount
            task.reassignedCount = (task.reassignedCount || 0) + 1;

            // Update task assignee
            task.assignee = assigneeId;
            task.status = 'To Do';
            await task.save();

            // Send notification to the new assignee
            await NotificationService.sendReassignNotification(
                task._id,
                assigneeId,
                task.summary
            );

            return res.status(200).json({
                status: 200,
                message: 'Task reassigned successfully',
                data: task
            });

        } catch (error) {
            console.log(error)
            return res.status(500).json({
                status: 500,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

}

module.exports = new TaskController();
