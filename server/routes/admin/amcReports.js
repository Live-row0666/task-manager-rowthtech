const express = require('express');
const router = express.Router();

const AmcReportsController = require('../../controllers/admin/amcReports');
const { verifyAdminUser } = require('../../middleware/auth');


// api route to get AMC projects 
router.get('/',verifyAdminUser, AmcReportsController.getAmcProjects);

module.exports = router;