const TaskComment = require('../../models/taskComment');
const Task = require('../../models/task');
const NotificationService = require('../../utils/notificationService');

class TaskCommentController {
    async addComment(req, res) {
        try {
            const { taskId, comment, attachments } = req.body;

            const newComment = await TaskComment.create({
                task: taskId,
                user: req.user._id,
                comment,
                attachments: attachments || []
            });

            await newComment.populate('user', 'name email');

            // Get task details and send notification to assignee
            const task = await Task.findById(taskId)
                .populate('assignee', 'name email')
                .populate('project', 'name');
                
            if (task && task.assignee && task.assignee._id.toString() !== req.user._id.toString()) {
                await NotificationService.sendCommentNotification(
                    taskId,
                    task.assignee._id,
                    req.user._id,
                    task.summary
                );
            }
            
            res.status(201).json({
                status: 201,
                message: 'Comment added successfully',
                data: newComment
            });
        } catch (error) {
            res.status(500).json({
                status: 500,
                message: 'Error adding comment',
                error: error.message
            });
        }
    }

    async getComments(req, res) {
        try {
            const { taskId } = req.params;
            const { page = 1, limit = 10 } = req.query;

            const comments = await TaskComment.find({ task: taskId })
                .populate('user', 'name email profilePicture')
                .sort({ createdAt: -1 })
                .limit(limit * 1)
                .skip((page - 1) * limit);

            const total = await TaskComment.countDocuments({ task: taskId });

            res.status(200).json({
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
            res.status(500).json({
                status: 500,
                message: 'Error retrieving comments',
                error: error.message
            });
        }
    }

    async updateComment(req, res) {
        try {
            const { commentId } = req.params;
            const { comment } = req.body;

            const updatedComment = await TaskComment.findOneAndUpdate(
                { _id: commentId, user: req.user._id },
                { comment, isEdited: true, editedAt: new Date() },
                { new: true }
            ).populate('user', 'name email');

            if (!updatedComment) {
                return res.status(404).json({
                    status: 404,
                    message: 'Comment not found or unauthorized'
                });
            }

            res.status(200).json({
                status: 200,
                message: 'Comment updated successfully',
                data: updatedComment
            });
        } catch (error) {
            res.status(500).json({
                status: 500,
                message: 'Error updating comment',
                error: error.message
            });
        }
    }

    async deleteComment(req, res) {
        try {
            const { commentId } = req.params;

            const deletedComment = await TaskComment.findOneAndDelete({
                _id: commentId,
                user: req.user._id
            });

            if (!deletedComment) {
                return res.status(404).json({
                    status: 404,
                    message: 'Comment not found or unauthorized'
                });
            }

            res.status(200).json({
                status: 200,
                message: 'Comment deleted successfully'
            });
        } catch (error) {
            res.status(500).json({
                status: 500,
                message: 'Error deleting comment',
                error: error.message
            });
        }
    }
}

module.exports = new TaskCommentController();