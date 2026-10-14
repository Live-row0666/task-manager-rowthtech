const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');
const dashboardRoutes = require('./dashboard');
const Users = require('../../models/user');
const ClientProject = require('../../models/clientProject');
const ClientMilestone = require('../../models/clientMilestone');
const ClientDocumentsController = require('../../controllers/client/documents')
const ClientTask = require('../../models/clientTask');
const { verifyClient } = require('../../middleware/auth');

// Mount routes
router.use('/', dashboardRoutes);
router.use('/auth', authRoutes);

router.get("/client-documents", verifyClient, ClientDocumentsController.getDocuments);
// GET /api/v1/client/client-milestone
router.get('/client-milestone', verifyClient, async (req, res) => {
    try {
        const { projectId, isActive } = req.query;
        const clientProjects = await ClientProject.find({ client: req.client._id, isActive: true }).select('_id').lean();
        const clientProjectIds = clientProjects.map(p => p._id.toString());

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
        const milestones = await ClientMilestone.find(query)
            .populate('project', 'name')
            .sort({ startDate: 1 })
            .lean();
        return res.status(200).json({ status: 200, data: milestones });
    } catch (err) {
        return res.status(500).json({ status: 500, message: err.message });
    }
});

// GET /api/v1/client/client-task
router.get('/client-task', verifyClient, async (req, res) => {
    try {
        const { milestoneId, projectId, limit = 500 } = req.query;
        const clientProjects = await ClientProject.find({ client: req.client._id, isActive: true }).select('_id').lean();
        const clientProjectIds = clientProjects.map(p => p._id.toString());

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

        const tasks = await ClientTask.find(query)
            .populate('assignee', 'name email designation role profilePicture')
            .populate('milestone', 'title status startDate completionDate')
            .populate('project', 'name projectStatus projectType')
            .limit(Number(limit))
            .sort({ createdAt: -1 })
            .lean();
        return res.status(200).json({ status: 200, data: tasks });
    } catch (err) {
        return res.status(500).json({ status: 500, message: err.message });
    }
});

const ClientSupportController = require('../../controllers/client/support');
const ClientDependencyController = require('../../controllers/client/dependency');
const upload = require('../../middleware/upload');

// Support routes (client scoped with project & screenshot attachments)
router.get('/support/download', ClientSupportController.downloadFile);
router.get('/support', verifyClient, ClientSupportController.getTickets);
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

module.exports = router;