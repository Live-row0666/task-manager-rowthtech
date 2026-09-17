const router = require('express').Router();
const sprintController = require('../../controllers/admin/sprint');
const { verifyAdminUser } = require('../../middleware/auth');

router.use(verifyAdminUser);

// Create sprint
router.post('/', sprintController.createSprint);
// Update sprint
router.put('/:id', sprintController.updateSprint);
// Get all sprints
router.get('/', sprintController.getAllSprints);
// Get sprints by project
router.get('/project/:projectId', sprintController.getSprintsByProject);
// Get sprints by milestone
router.get('/milestone/:milestoneId', sprintController.getSprintsByMilestone);
// Get single sprint
router.get('/:id', sprintController.getSingleSprint);
// Delete sprint
router.delete('/:id', sprintController.deleteSprint);

module.exports = router;