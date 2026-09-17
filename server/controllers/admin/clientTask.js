const ClientTask = require('../../models/clientTask');

class ClientTaskController {

    // POST /api/v1/admin/client-task
    async createClientTask(req, res) {
        try {
            const data = req.body;
            data.createdBy = req.user._id;

            if (!data.project) return res.status(400).json({ status: 400, message: 'Project is required' });
            if (!data.summary) return res.status(400).json({ status: 400, message: 'Summary is required' });

            const task = await ClientTask.create(data);

            const populated = await ClientTask.findById(task._id)
                .populate('project', 'name')
                .populate('milestone', 'title')
                .populate('assignee', 'name email')
                .populate('reporter', 'name email')
                .lean();

            return res.status(201).json({
                status: 201,
                message: 'Client task created successfully',
                data: populated,
            });
        } catch (error) {
            return res.status(500).json({ status: 500, message: 'Internal server error', error: error.message });
        }
    }

    // PUT /api/v1/admin/client-task/:id
    async updateClientTask(req, res) {
        try {
            const task = await ClientTask.findByIdAndUpdate(req.params.id, req.body, { new: true });
            if (!task) return res.status(404).json({ status: 404, message: 'Client task not found' });
            return res.status(200).json({ status: 200, message: 'Client task updated successfully', data: task });
        } catch (error) {
            return res.status(500).json({ status: 500, message: 'Internal server error', error: error.message });
        }
    }

    // GET /api/v1/admin/client-task
    async getAllClientTasks(req, res) {
        try {
            const { page = 1, limit = 50, search = '', projectId = '', milestoneId = '', assigneeId = '', priority = '', status = '' } = req.query;
            const query = { isActive: true };

            if (projectId.trim())   query.project   = projectId;
            if (milestoneId.trim()) query.milestone  = milestoneId;
            if (assigneeId.trim())  query.assignee   = assigneeId;
            if (priority.trim())    query.priority   = priority;
            if (status.trim())      query.status     = status;
            if (search.trim())      query.summary    = { $regex: search, $options: 'i' };

            const tasks = await ClientTask.find(query)
                .populate('project', 'name')
                .populate('milestone', 'title')
                .populate('assignee', 'name email')
                .populate('reporter', 'name email')
                .limit(Number(limit))
                .skip((Number(page) - 1) * Number(limit))
                .sort({ createdAt: -1 })
                .lean();

            const count = await ClientTask.countDocuments(query);

            return res.status(200).json({
                status: 200,
                message: 'Client tasks retrieved successfully',
                data: tasks,
                total: count,
                totalPages: Math.ceil(count / limit),
                currentPage: Number(page),
            });
        } catch (error) {
            return res.status(500).json({ status: 500, message: 'Internal server error', error: error.message });
        }
    }

    // GET /api/v1/admin/client-task/:id
    async getSingleClientTask(req, res) {
        try {
            const task = await ClientTask.findById(req.params.id)
                .populate('project', 'name')
                .populate('milestone', 'title')
                .populate('assignee', 'name email')
                .populate('reporter', 'name email')
                .lean();
            if (!task) return res.status(404).json({ status: 404, message: 'Client task not found' });
            return res.status(200).json({ status: 200, message: 'Client task retrieved successfully', data: task });
        } catch (error) {
            return res.status(500).json({ status: 500, message: 'Internal server error', error: error.message });
        }
    }

    // DELETE /api/v1/admin/client-task/:id
    async deleteClientTask(req, res) {
        try {
            const task = await ClientTask.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
            if (!task) return res.status(404).json({ status: 404, message: 'Client task not found' });
            return res.status(200).json({ status: 200, message: 'Client task deleted successfully' });
        } catch (error) {
            return res.status(500).json({ status: 500, message: 'Internal server error', error: error.message });
        }
    }
}

module.exports = new ClientTaskController();
