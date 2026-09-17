const express = require('express');
const router = express.Router();
const taskStatusController = require('../../controllers/user/taskStatus');
const { verifyUser } = require('../../middleware/auth');

router.use(verifyUser);

// Get task statuses by project
router.get('/project/:projectId', taskStatusController.getTaskStatusesByProject);

module.exports = router;