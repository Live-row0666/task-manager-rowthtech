const ProjectComment = require('../../models/projectComment');
const Project = require('../../models/project');
const User = require('../../models/user');
const CommentMention = require('../../models/commentMention');
const notificationService = require('../../utils/notificationService');

class ProjectCommentController {
    // Create project comment
    /** @ Post : api/v1/admin/project-comment */
    async createComment(req, res) {
        try {
            const { project, comment } = req.body;
            const author = req.user._id;
            if (!project || !comment) {
                return res.status(400).json({
                    status: 400,
                    message: 'Project ID and comment are required'
                });
            }

            // Check if project exists
            const projectExists = await Project.findById(project).select('_id').lean();
            if (!projectExists) {
                return res.status(404).json({
                    status: 404,
                    message: 'Project not found'
                });
            }

            const newComment = await ProjectComment.create({
                project,
                comment,
                author
            });

            const populatedComment = await ProjectComment.findById(newComment._id)
                .populate('author', 'name email')
                .lean();

            // Extract email mentions and send notifications
            const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
            const mentionedEmails = comment.match(emailRegex);
            
            if (mentionedEmails && mentionedEmails.length > 0) {
                try {
                    const mentionedUsers = await User.find({ 
                        email: { $in: mentionedEmails },
                        isActive: true 
                    }).select('email name');
                    
                    for (const user of mentionedUsers) {
                        // Update mention count
                        await CommentMention.findOneAndUpdate(
                            { user: user._id, project },
                            { $inc: { mentionCount: 1 } },
                            { upsert: true, new: true }
                        );
                        
                        // await notificationService.sendProjectCommentMentionEmail(
                        //     user,
                        //     populatedComment.author,
                        //     projectExists,
                        //     comment
                        // );
                    }
                } catch (emailError) {
                    console.error('Error sending mention emails:', emailError);
                }
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

    // Get project comments
    /** @ Get : api/v1/admin/project-comment/:projectId */
    async getComments(req, res) {
        try {
            const { projectId } = req.params;
            const { page = 1, limit = 50 } = req.query;
            const userId = req.user._id;

            if (!projectId) {
                return res.status(400).json({
                    status: 400,
                    message: 'Project ID is required'
                });
            }

            // Reset mention count when user opens comments
            await CommentMention.findOneAndUpdate(
                { user: userId, project: projectId },
                { mentionCount: 0 },
                { upsert: true }
            );

            const comments = await ProjectComment.find({
                project: projectId,
                isActive: true
            })
                .populate('author', 'name email')
                .sort({ createdAt: -1 })
                .limit(limit * 1)
                .skip((page - 1) * limit)
                .lean();

            // Get all users for email-to-name mapping
            const allUsers = await User.find({ isActive: true }).select('email name').lean();
            const emailToNameMap = allUsers.reduce((acc, user) => {
                acc[user.email] = user.name;
                return acc;
            }, {});

            const count = await ProjectComment.countDocuments({
                project: projectId,
                isActive: true
            });

            return res.status(200).json({
                status: 200,
                message: 'Comments retrieved successfully',
                data: comments,
                emailToNameMap,
                totalPages: Math.ceil(count / limit),
                currentPage: parseInt(page),
                totalComments: count
            });

        } catch (error) {
            return res.status(500).json({
                status: 500,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Update project comment
    /** @ Put : api/v1/admin/project-comment/:id */
    async updateComment(req, res) {
        try {
            const { id } = req.params;
            const { comment } = req.body;
            const userId = req.user._id;

            if (!comment) {
                return res.status(400).json({
                    status: 400,
                    message: 'Comment text is required'
                });
            }

            const existingComment = await ProjectComment.findById(id);
            if (!existingComment) {
                return res.status(404).json({
                    status: 404,
                    message: 'Comment not found'
                });
            }

            // Check if user is the author
            if (existingComment.author.toString() !== userId.toString()) {
                return res.status(403).json({
                    status: 403,
                    message: 'You can only update your own comments'
                });
            }

            const updatedComment = await ProjectComment.findByIdAndUpdate(
                id,
                { comment, updatedAt: new Date() },
                { new: true }
            ).populate('author', 'name email').lean();

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

    // Delete project comment
    /** @ Delete : api/v1/admin/project-comment/:id */
    async deleteComment(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user._id;

            const comment = await ProjectComment.findById(id);
            if (!comment) {
                return res.status(404).json({
                    status: 404,
                    message: 'Comment not found'
                });
            }

            // Check if user is the author or admin
            if (comment.author.toString() !== userId.toString() && req.user.role !== 'admin') {
                return res.status(403).json({
                    status: 403,
                    message: 'You can only delete your own comments'
                });
            }

            await ProjectComment.findByIdAndUpdate(id, { isActive: false });

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


}

module.exports = new ProjectCommentController();