const TaskStatus = require('../../models/taskStatus');

class UserTaskStatusController {
    // Get task statuses for a project
    /** @ Get : api/v1/user/task-status/project/:projectId */
    async getTaskStatusesByProject(req, res) {
        try {
            const { projectId } = req.params;
            
            const taskStatuses = await TaskStatus.find({
                project: projectId,
                isActive: true
            }).sort({ order: 1 });

            return res.status(200).json({
                status: 200,
                message: 'Task statuses retrieved successfully',
                data: taskStatuses
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

module.exports = new UserTaskStatusController();