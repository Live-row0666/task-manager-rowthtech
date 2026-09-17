const express = require('express');
const router = express.Router();

// Import route modules
const s3Routes = require('./s3');
const authRoutes = require('./auth');
const taskRoutes = require('./task');
const taskStatusRoutes = require('./taskStatus');
const projectRoutes = require('./project');
const sprintRoutes = require('./sprint');
const milestoneRoutes = require('./milestone');
const timeTrackingRoutes = require('./timeTracking');
const taskCommentRoutes = require('./taskComment');
const notificationRoutes = require('./notification');
const supportRoutes = require('./support');

// Mount routes
router.use('/s3', s3Routes);
router.use('/auth', authRoutes);
router.use('/time-tracking', timeTrackingRoutes);
router.use('/task-comments', taskCommentRoutes);
router.use('/notification', notificationRoutes);
router.use('/task', taskRoutes);
router.use('/task-status', taskStatusRoutes);
router.use('/project', projectRoutes);
router.use('/sprint', sprintRoutes);
router.use('/milestone', milestoneRoutes);
router.use('/support', supportRoutes);

module.exports = router;