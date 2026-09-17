const express = require('express');
const router = express.Router();
const dashboardController = require('../../controllers/admin/dashboard');
const { verifyAdminUser } = require('../../middleware/auth');

router.get('/overview',verifyAdminUser,  dashboardController.getOverview);
router.get('/productivity',verifyAdminUser,  dashboardController.getProductivityReport);
router.get('/project-progress',verifyAdminUser,  dashboardController.getProjectProgress);


module.exports = router;