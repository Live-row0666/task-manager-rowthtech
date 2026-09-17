const express = require('express');
const router = express.Router();
const milestoneController = require('../../controllers/user/milestone');
const { verifyUser } = require('../../middleware/auth');

// All routes require user authentication
router.use(verifyUser);

// Milestone routes will be implemented based on user requirements
// router.get('/', milestoneController.getMilestones);
// router.get('/:id', milestoneController.getMilestone);

module.exports = router;