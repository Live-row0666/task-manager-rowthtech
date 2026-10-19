const ClientTask = require('../../models/clientTask');
const ClientProject = require('../../models/clientProject');
const ClientMilestone = require('../../models/clientMilestone');
const Project = require('../../models/project');
const Milestone = require('../../models/milestones');

class ClientTaskController {

    // POST /api/v1/admin/client-task
    async createClientTask(req, res) {
        try {
            const data = req.body;
            data.createdBy = req.user._id;

            if (!data.project) return res.status(400).json({ status: 400, message: 'Project is required' });
            if (!data.summary) return res.status(400).json({ status: 400, message: 'Summary is required' });

            const task = await ClientTask.create(data);

            let populated = await ClientTask.findById(task._id)
                .populate('project', 'name')
                .populate('milestone', 'title')
                .populate('assignee', 'name email')
                .populate('reporter', 'name email')
                .lean();

            if (!populated.project && data.project) {
                const p = await Project.findById(data.project).select('name').lean() || await ClientProject.findById(data.project).select('name').lean();
                if (p) populated.project = p;
            }
            if (!populated.milestone && data.milestone) {
                const m = await Milestone.findById(data.milestone).select('title').lean() || await ClientMilestone.findById(data.milestone).select('title').lean();
                if (m) populated.milestone = m;
            }

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

            let tasks = await ClientTask.find(query)
                .populate('project', 'name')
                .populate('milestone', 'title')
                .populate('assignee', 'name email')
                .populate('reporter', 'name email')
                .limit(Number(limit))
                .skip((Number(page) - 1) * Number(limit))
                .sort({ createdAt: -1 })
                .lean();

            for (let t of tasks) {
                if (!t.project && t.project !== undefined) {
                    const raw = await ClientTask.findById(t._id).select('project').lean();
                    if (raw?.project) {
                        const p = await Project.findById(raw.project).select('name').lean() || await ClientProject.findById(raw.project).select('name').lean();
                        if (p) t.project = p;
                    }
                }
                if (!t.milestone && t.milestone !== undefined) {
                    const raw = await ClientTask.findById(t._id).select('milestone').lean();
                    if (raw?.milestone) {
                        const m = await Milestone.findById(raw.milestone).select('title').lean() || await ClientMilestone.findById(raw.milestone).select('title').lean();
                        if (m) t.milestone = m;
                    }
                }
            }

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
            let task = await ClientTask.findById(req.params.id)
                .populate('project', 'name')
                .populate('milestone', 'title')
                .populate('assignee', 'name email')
                .populate('reporter', 'name email')
                .lean();
            if (!task) return res.status(404).json({ status: 404, message: 'Client task not found' });

            if (!task.project) {
                const raw = await ClientTask.findById(task._id).select('project').lean();
                if (raw?.project) {
                    const p = await Project.findById(raw.project).select('name').lean() || await ClientProject.findById(raw.project).select('name').lean();
                    if (p) task.project = p;
                }
            }
            if (!task.milestone) {
                const raw = await ClientTask.findById(task._id).select('milestone').lean();
                if (raw?.milestone) {
                    const m = await Milestone.findById(raw.milestone).select('title').lean() || await ClientMilestone.findById(raw.milestone).select('title').lean();
                    if (m) task.milestone = m;
                }
            }

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
