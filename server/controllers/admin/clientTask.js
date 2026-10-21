const ClientTask = require('../../models/clientTask');
const Task = require('../../models/task');
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
            let normalTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });

            if (task) {
                await Task.updateMany(
                    { $or: [{ _id: req.params.id }, { project: task.project, summary: task.summary }] },
                    { $set: req.body }
                );
            }
            if (normalTask) {
                await ClientTask.updateMany(
                    { $or: [{ _id: req.params.id }, { project: normalTask.project, summary: normalTask.summary }] },
                    { $set: req.body }
                );
            }

            if (!task && !normalTask) return res.status(404).json({ status: 404, message: 'Client task not found' });
            return res.status(200).json({ status: 200, message: 'Client task updated successfully', data: task || normalTask });
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

    // PUT /api/v1/admin/client-task/:id/report
    async saveTaskReport(req, res) {
        try {
            const { id } = req.params;
            const existingTask = await ClientTask.findById(id);
            if (!existingTask) return res.status(404).json({ status: 404, message: 'Client task not found' });

            const reportData = {
                ...(existingTask.report || {}),
                ...req.body,
            };

            if (!reportData.createdBy) {
                reportData.createdBy = req.user._id;
            }

            if (req.body.status === 'Approved') {
                reportData.status = 'Approved';
                reportData.approvedBy = req.user._id;
                reportData.approvedAt = new Date();
            } else if (!reportData.status) {
                reportData.status = 'Draft';
            }

            const updatedTask = await ClientTask.findByIdAndUpdate(
                id,
                { $set: { report: reportData } },
                { new: true }
            )
                .populate('project', 'name')
                .populate('milestone', 'title')
                .populate('assignee', 'name email')
                .populate('reporter', 'name email')
                .populate('report.approvedBy', 'name email')
                .populate('report.createdBy', 'name email');

            return res.status(200).json({
                status: 200,
                message: reportData.status === 'Approved' ? 'Report approved and published successfully' : 'Report saved as draft',
                data: updatedTask,
            });
        } catch (error) {
            return res.status(500).json({ status: 500, message: 'Internal server error', error: error.message });
        }
    }

    // PUT /api/v1/admin/client-task/:id/report/approve
    async approveTaskReport(req, res) {
        try {
            const { id } = req.params;
            const task = await ClientTask.findById(id);
            if (!task) return res.status(404).json({ status: 404, message: 'Client task not found' });

            if (!task.report || !task.report.summaryOfWork) {
                return res.status(400).json({ status: 400, message: 'Cannot approve task without report summary' });
            }

            task.report.status = 'Approved';
            task.report.approvedBy = req.user._id;
            task.report.approvedAt = new Date();
            await task.save();

            const populated = await ClientTask.findById(id)
                .populate('project', 'name')
                .populate('milestone', 'title')
                .populate('assignee', 'name email')
                .populate('reporter', 'name email')
                .populate('report.approvedBy', 'name email')
                .populate('report.createdBy', 'name email');

            return res.status(200).json({
                status: 200,
                message: 'Report approved and published to client',
                data: populated,
            });
        } catch (error) {
            return res.status(500).json({ status: 500, message: 'Internal server error', error: error.message });
        }
    }
}

module.exports = new ClientTaskController();

