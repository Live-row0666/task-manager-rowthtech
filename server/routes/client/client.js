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
        const query = {};
        if (projectId) query.project = projectId;
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
        const query = { isActive: true };
        if (milestoneId) query.milestone = milestoneId;
        if (projectId) {
            query.project = projectId;
        } else {
            // Find all active projects of this client
            const clientProjects = await ClientProject.find({ client: req.client._id, isActive: true }).select('_id').lean();
            if (clientProjects.length > 0) {
                query.project = { $in: clientProjects.map(p => p._id) };
            }
        }
        const tasks = await ClientTask.find(query)
            .populate('assignee', 'name email designation role')
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

// GET /api/v1/client/support
router.get('/support', verifyClient, async (req, res) => {
    try {
        const Support = require('../../models/support');
        const tickets = await Support.find()
            .sort({ createdAt: -1 })
            .lean();
        return res.status(200).json({ status: 200, data: tickets });
    } catch (err) {
        return res.status(500).json({ status: 500, message: err.message });
    }
});

// POST /api/v1/client/support
router.post('/support', verifyClient, async (req, res) => {
    try {
        const Support = require('../../models/support');
        const { title, description, category = 'general_inquiry', priority = 'medium' } = req.body;
        
        const newTicket = await Support.create({
            title,
            description,
            category,
            priority,
            status: 'open',
            createdAt: new Date()
        });
        
        return res.status(201).json({ status: 201, data: newTicket, message: "Support ticket created successfully" });
    } catch (err) {
        return res.status(500).json({ status: 500, message: err.message });
    }
});

module.exports = router;