const Task = require('../../models/task');

class QaManagementController {

    // Get all tasks
    async getAllTasks(req, res) {
        try {
            const { project } = req.query;
            const tasks = await Task.find({ project, status: { $ne: 'Done' } }).populate({ path: 'assignee', select: 'name' });
            res.status(200).json({ status: 200, data: tasks });
        } catch (error) {
            res.status(500).json({ status: 500, message: 'Server Error', error });
        }
    }

}

module.exports = new QaManagementController();