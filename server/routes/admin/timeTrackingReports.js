const express = require('express');
const router = express.Router();
const timeTrackingReportsController = require('../../controllers/admin/timeTrackingReports');
const { verifyAdminUser } = require('../../middleware/auth');

/**
 * @route   GET /api/v1/admin/reports/time-tracking/employee-daily
 * @desc    Get employee daily logs
 * @access  Private/Admin
 */
router.get('/employee-daily', verifyAdminUser, timeTrackingReportsController.getEmployeeDailyLogs);

/**
 * @route   GET /api/v1/admin/reports/time-tracking/monthly-summary
 * @desc    Get monthly summary by employee
 * @access  Private/Admin
 */
router.get('/monthly-summary', verifyAdminUser, timeTrackingReportsController.getMonthlyEmployeeSummary);

/**
 * @route   GET /api/v1/admin/reports/time-tracking/project-daily
 * @desc    Get project daily summary
 * @access  Private/Admin
 */
router.get('/project-daily', verifyAdminUser, timeTrackingReportsController.getProjectDailySummary);

/**
 * @route   GET /api/v1/admin/reports/time-tracking/project-team
 * @desc    Get single project team view
 * @access  Private/Admin
 */
router.get('/project-team', verifyAdminUser, timeTrackingReportsController.getSingleProjectTeamView);

module.exports = router;