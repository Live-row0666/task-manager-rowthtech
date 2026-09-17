const express = require('express');
const router = express.Router();
const taskController = require('../../controllers/user/task');
const { verifyUser } = require('../../middleware/auth');

// All routes require user authentication
router.use(verifyUser);

// Get user's assigned tasks
router.get('/', taskController.getUserTasks);

// Get single task details
router.get('/:id', taskController.getSingleTask);

// Update task status/progress
router.put('/:id', taskController.updateTask);

// Get tasks by project
router.get('/project/:projectId', taskController.getTasksByProject);

// Add comment to task
router.post('/:id/comment', taskController.addTaskComment);

module.exports = router;