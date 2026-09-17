const router = require('express').Router();
const projectController = require('../../controllers/admin/project');
const { verifyAdminUser } = require('../../middleware/auth');
const imsTicketsTOtaskConversion = require('../../utils/imsTickets')

router.use(verifyAdminUser);

// Create project
router.post('/', projectController.createProject);

// Update project
router.put('/:id', projectController.updateProject);

// update project status
router.put('/status/:id', projectController.updateProjectstatus);

// Get project status counts
router.get('/status-counts', projectController.getProjectStatusCounts);

// Get all projects
router.get('/', projectController.getAllProjects);

// Get single project
router.get('/:id', projectController.getSingleProject);

// Delete project
router.delete('/:id', projectController.deleteProject);

router.post('/ims-to-task', imsTicketsTOtaskConversion);

module.exports = router;