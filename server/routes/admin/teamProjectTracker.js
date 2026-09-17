const router = require('express').Router();
const teamProjectTrackerController = require('../../controllers/admin/teamProjectTracker');
const { verifyAdminUser } = require('../../middleware/auth');

router.use(verifyAdminUser);

// Get team project tracker data
router.get('/', teamProjectTrackerController.getTeamProjectTracker);

module.exports = router;