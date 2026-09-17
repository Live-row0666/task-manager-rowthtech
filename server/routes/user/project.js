const express = require('express');
const router = express.Router();
const projectController = require('../../controllers/user/project');
const { verifyUser } = require('../../middleware/auth');

// All routes require user authentication
router.use(verifyUser);

// Get user's assigned projects
router.get('/', projectController.getUserProjects);

// Get single project details
router.get('/:id', projectController.getSingleProject);

module.exports = router;