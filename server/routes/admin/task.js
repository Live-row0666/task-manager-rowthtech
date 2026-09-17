const router = require('express').Router();
const taskController = require('../../controllers/admin/task');
const { verifyAdminUser } = require('../../middleware/auth');

router.use(verifyAdminUser);

// Create task
router.post('/', taskController.createTask);
// Update task
router.put('/:id', taskController.updateTask);
// Get all tasks
router.get('/', taskController.getAllTasks);
// Get tasks by project
router.get('/project/:projectId', taskController.getTasksByProject);
// Get tasks by assignee
router.get('/assignee/:assigneeId', taskController.getTasksByAssignee);
// Get single task
router.get('/:id', taskController.getSingleTask);
// Delete task
router.delete('/:id', taskController.deleteTask);
// Add comment to task
router.post('/:id/comment', taskController.addTaskComment);
// Get task comments
router.get('/:id/comments', taskController.getTaskComments);
// Update comment
router.put('/comment/:commentId', taskController.updateTaskComment);
// Delete comment
router.delete('/comment/:commentId', taskController.deleteTaskComment);

router.post('/re-assign', taskController.reassignTask);

module.exports = router;