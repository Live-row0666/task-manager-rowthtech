const router = require('express').Router();
const milestoneController = require('../../controllers/admin/milestone');
const { verifyAdminUser } = require('../../middleware/auth');

router.use(verifyAdminUser);

// Create milestone
router.post('/', milestoneController.createMilestone);

// Renew Amc 
router.post('/renew-amc', milestoneController.renewAmcMilestones);

// Update milestone
router.put('/:id', milestoneController.updateMilestone);
// Get all milestones
router.get('/', milestoneController.getAllMilestones);
// Get milestones by project
router.get('/project/:projectId', milestoneController.getMilestonesByProject);
// Get single milestone
router.get('/:id', milestoneController.getSingleMilestone);
// Delete milestone
router.delete('/:id', milestoneController.deleteMilestone);

module.exports = router;