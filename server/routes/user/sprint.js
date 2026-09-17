const express = require('express');
const router = express.Router();
const sprintController = require('../../controllers/user/sprint');
const { verifyUser } = require('../../middleware/auth');

// All routes require user authentication
router.use(verifyUser);

// Sprint routes will be implemented based on user requirements
// router.get('/', sprintController.getSprints);
// router.get('/:id', sprintController.getSprint);

module.exports = router;