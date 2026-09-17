const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');
const dashboardRoutes = require('./dashboard');
const ClientMilestone = require('../../models/clientMilestone');
const ClientDocumentsController = require('../../controllers/client/documents')
const ClientTask      = require('../../models/clientTask');
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
        const { milestoneId, projectId, limit = 200 } = req.query;
        const query = { isActive: true };
        if (milestoneId) query.milestone = milestoneId;
        if (projectId)   query.project   = projectId;
        const tasks = await ClientTask.find(query)
            .populate('assignee', 'name email')
            .populate('milestone', 'title')
            .limit(Number(limit))
            .sort({ createdAt: -1 })
            .lean();
        return res.status(200).json({ status: 200, data: tasks });
    } catch (err) {
        return res.status(500).json({ status: 500, message: err.message });
    }
});

module.exports = router;