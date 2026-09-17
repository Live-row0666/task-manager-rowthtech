const router = require('express').Router();
const userOverviewController = require('../../controllers/admin/userOvervew');
const { verifyAdminUser } = require('../../middleware/auth');

// router.use(verifyAdminUser);

router.get('/', userOverviewController.getUserOverview);

module.exports = router;