const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');
const dashboardRoutes = require('./dashboard');
const Users = require('../../models/user');
const Project = require('../../models/project');
const Milestone = require('../../models/milestones');
const Task = require('../../models/task');
const Client = require('../../models/client');
const ClientProject = require('../../models/clientProject');
const ClientMilestone = require('../../models/clientMilestone');
const ClientDocumentsController = require('../../controllers/client/documents')
const ClientTask = require('../../models/clientTask');
const Role = require('../../models/role');
const { verifyClient } = require('../../middleware/auth');
const upload = require('../../middleware/upload');

// Mount routes
router.use('/', dashboardRoutes);
router.use('/auth', authRoutes);

router.get("/client-documents", verifyClient, ClientDocumentsController.getDocuments);
router.post(
    "/client-documents/upload",
    verifyClient,
    upload.array("documents"),
    ClientDocumentsController.uploadDocuments
);
router.delete("/client-documents/:id", verifyClient, ClientDocumentsController.deleteDocument);
// GET /api/v1/client/client-milestone
router.get('/client-milestone', verifyClient, async (req, res) => {
    try {
        const { projectId, isActive } = req.query;
        const clientDoc = await Client.findById(req.client._id).select('projects').lean();
        const clientProjectIdsFromDoc = Array.isArray(clientDoc?.projects) ? clientDoc.projects.map(p => p.toString()) : [];

        let clientProjects = await Project.find({
            $or: [
                { client: req.client._id },
                { _id: { $in: clientProjectIdsFromDoc } }
            ],
            isActive: true
        }).select('_id').lean();

        if (!clientProjects.length) {
            clientProjects = await ClientProject.find({ client: req.client._id, isActive: true }).select('_id').lean();
        }

        const clientProjectIds = [...clientProjects.map(p => p._id.toString()), ...clientProjectIdsFromDoc];

        const query = {};
        if (projectId) {
            if (clientProjectIds.includes(projectId.toString())) {
                query.project = projectId;
            } else {
                return res.status(200).json({ status: 200, data: [] });
            }
        } else if (clientProjects.length > 0) {
            query.project = { $in: clientProjects.map(p => p._id) };
        } else {
            return res.status(200).json({ status: 200, data: [] });
        }

        query.isActive = isActive === 'false' ? false : true;
        const { type } = req.query;
        if (type === 'AMC') {
            query.$or = [
                { isAmc: true },
                { title: { $regex: /AMC$/i } }
            ];
        } else if (type === 'Ongoing') {
            query.isAmc = { $ne: true };
            query.title = { $not: { $regex: /AMC$/i } };
        }

        let milestones = await Milestone.find(query)
            .populate('project', 'name amcHours')
            .sort({ startDate: 1 })
            .lean();

        if (!milestones.length) {
            milestones = await ClientMilestone.find(query)
                .populate('project', 'name')
                .sort({ startDate: 1 })
                .lean();
        }

        if (type === 'AMC') {
            const projectDetails = await Project.findById(projectId || clientProjects[0]?._id).lean();
            let amcHoursAre = projectDetails?.amcHours || 0;
            const milestonesWithHours = [];
            for (const milestone of milestones) {
                const worked = milestone.workedHours || 0;
                const remaining = Number((amcHoursAre - worked).toFixed(2));
                amcHoursAre = remaining;
                milestonesWithHours.push({
                    ...milestone,
                    amcHours: Number((Number(amcHoursAre) + worked).toFixed(2)),
                    workedHours: worked,
                    remainingHours: remaining
                });
            }
            return res.status(200).json({ status: 200, data: milestonesWithHours });
        }
        return res.status(200).json({ status: 200, data: milestones });
    } catch (err) {
        return res.status(500).json({ status: 500, message: err.message });
    }
});

// GET /api/v1/client/client-task
router.get('/client-task', verifyClient, async (req, res) => {
    try {
        const { milestoneId, projectId, limit = 500 } = req.query;
        const clientDoc = await Client.findById(req.client._id).select('projects').lean();
        const clientProjectIdsFromDoc = Array.isArray(clientDoc?.projects) ? clientDoc.projects.map(p => p.toString()) : [];

        let clientProjects = await Project.find({
            $or: [
                { client: req.client._id },
                { _id: { $in: clientProjectIdsFromDoc } }
            ],
            isActive: true
        }).select('_id').lean();

        if (!clientProjects.length) {
            clientProjects = await ClientProject.find({ client: req.client._id, isActive: true }).select('_id').lean();
        }

        const clientProjectIds = [...clientProjects.map(p => p._id.toString()), ...clientProjectIdsFromDoc];

        const query = { isActive: true };
        if (projectId) {
            if (clientProjectIds.includes(projectId.toString())) {
                query.project = projectId;
            } else {
                return res.status(200).json({ status: 200, data: [] });
            }
        } else if (clientProjects.length > 0) {
            query.project = { $in: clientProjects.map(p => p._id) };
        } else {
            return res.status(200).json({ status: 200, data: [] });
        }

        if (milestoneId) query.milestone = milestoneId;

        // Only show tasks created by users with Project Manager role or designation
        const pmRoles = await Role.find({ name: { $regex: /project\s*manager/i } }).select('_id');
        const pmRoleIds = pmRoles.map(r => r._id);
        const pmUsers = await Users.find({
            $or: [
                { role: { $in: pmRoleIds } },
                { designation: { $regex: /project\s*manager/i } }
            ]
        }).select('_id');
        const pmUserIds = pmUsers.map(u => u._id);

        if (!pmUserIds.length) {
            return res.status(200).json({ status: 200, data: [] });
        }

        query.createdBy = { $in: pmUserIds };

        let clientTasks = await ClientTask.find(query)
            .populate('assignee', 'name email designation role profilePicture')
            .populate('milestone', 'title status startDate completionDate')
            .populate('project', 'name projectStatus projectType')
            .populate('createdBy', 'name email designation role')
            .limit(Number(limit))
            .sort({ createdAt: -1 })
            .lean();

        let normalTasks = await Task.find(query)
            .populate('assignee', 'name email designation role profilePicture')
            .populate('milestone', 'title status startDate completionDate')
            .populate('project', 'name projectStatus projectType')
            .populate('createdBy', 'name email designation role')
            .limit(Number(limit))
            .sort({ createdAt: -1 })
            .lean();

        const taskMap = new Map();
        for (let t of [...normalTasks, ...clientTasks]) {
            taskMap.set(t._id.toString(), t);
        }
        let tasks = Array.from(taskMap.values());

        // Normalize task summary to title for client UI & protect unapproved reports
        tasks = tasks.map(t => {
            const hasApprovedReport = t.report && t.report.status === 'Approved';
            return {
                ...t,
                title: t.summary || t.title,
                report: hasApprovedReport ? t.report : null,
                hasApprovedReport: !!hasApprovedReport,
            };
        });

        return res.status(200).json({ status: 200, data: tasks });
    } catch (err) {
        return res.status(500).json({ status: 500, message: err.message });
    }
});

// GET /api/v1/client/task/:taskId/report
router.get('/task/:taskId/report', async (req, res) => {
    try {
        const { taskId } = req.params;
        const task = await ClientTask.findById(taskId)
            .populate('project', 'name')
            .populate('milestone', 'title')
            .populate('assignee', 'name email designation')
            .populate('report.approvedBy', 'name email')
            .lean();

        if (!task || !task.report || task.report.status !== 'Approved') {
            return res.status(404).json({ status: 404, message: 'No approved completion report available for this task' });
        }

        return res.status(200).json({
            status: 200,
            data: {
                task: {
                    _id: task._id,
                    summary: task.summary,
                    status: task.status,
                    project: task.project,
                    milestone: task.milestone,
                    assignee: task.assignee,
                    estimatedTime: task.estimatedTime,
                    completionTime: task.completionTime,
                    timeSpent: task.timeSpent,
                },
                report: task.report,
            },
        });
    } catch (err) {
        return res.status(500).json({ status: 500, message: err.message });
    }
});

const ClientSupportController = require('../../controllers/client/support');
const ClientDependencyController = require('../../controllers/client/dependency');
const ClientChatController = require('../../controllers/client/chat');
const ClientCRController = require('../../controllers/client/clientCR');

// Support routes (client scoped with project & screenshot attachments)
router.get('/support/download', ClientSupportController.downloadFile);
router.get('/support', verifyClient, ClientSupportController.getTickets);
router.get('/support/unread-count', verifyClient, ClientSupportController.getUnreadCount);
router.post('/support', verifyClient, upload.array('screenshots'), ClientSupportController.createTicket);
router.get('/support/:id', verifyClient, ClientSupportController.getTicketById);
router.put('/support/:id', verifyClient, upload.array('screenshots'), ClientSupportController.updateTicket);
router.put('/support/:id/read', verifyClient, ClientSupportController.markAsRead);
router.delete('/support/:id', verifyClient, ClientSupportController.deleteTicket);
router.post('/support/:id/response', verifyClient, upload.array('attachments'), ClientSupportController.addResponse);

// Dependency routes (client scoped requirement fulfillment)
router.get('/dependency/stats', verifyClient, ClientDependencyController.getStats);
router.get('/dependency', verifyClient, ClientDependencyController.getDependencies);
router.get('/dependency/:id', verifyClient, ClientDependencyController.getDependencyById);
router.put('/dependency/:id/submit', verifyClient, upload.any(), ClientDependencyController.submitDependency);

// Direct Chat routes (LinkedIn-style client chat with Admin)
router.get('/chat/messages', verifyClient, ClientChatController.getMessages);
router.post('/chat/send', verifyClient, upload.array('attachments', 5), ClientChatController.sendMessage);
router.put('/chat/read', verifyClient, ClientChatController.markAsRead);


// Change Request (CR) routes
router.get('/cr/stats', verifyClient, ClientCRController.getStats);
router.get('/cr', verifyClient, ClientCRController.getCRs);
router.get('/cr/:id', verifyClient, ClientCRController.getCRById);
router.post('/cr', verifyClient, upload.array('attachments'), ClientCRController.createCR);
router.put('/cr/:id', verifyClient, upload.array('attachments'), ClientCRController.updateCR);
router.delete('/cr/:id', verifyClient, ClientCRController.deleteCR);

module.exports = router;