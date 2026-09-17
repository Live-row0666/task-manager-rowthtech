const express = require('express');
const router = express.Router();
const timeTrackingController = require('../../controllers/user/timeTracking');
const { verifyUser } = require('../../middleware/auth');

router.post('/start', verifyUser, timeTrackingController.startTimer);
router.post('/stop', verifyUser, timeTrackingController.stopTimer);
router.post('/pause', verifyUser, timeTrackingController.pauseTimer);
router.post('/resume', verifyUser, timeTrackingController.resumeTimer);
router.get('/', verifyUser, timeTrackingController.getTimeEntries);
router.get('/reports/summary', verifyUser, timeTrackingController.getTimeSummary);
router.get('/reports/project/:projectId', verifyUser, timeTrackingController.getProjectTimeReport);
router.get('/reports/daily', verifyUser, timeTrackingController.getDailyTimeReport);
router.get('/reports/weekly', verifyUser, timeTrackingController.getWeeklyTimeReport);
router.get('/reports/monthly', verifyUser, timeTrackingController.getMonthlyTimeReport);
router.get('/reports/project-summary', verifyUser, timeTrackingController.getProjectWiseSummary);
router.get('/reports/user-summary', verifyUser, timeTrackingController.getUserTimeSummary);
router.get('/:id', verifyUser, timeTrackingController.getTimeEntry)
module.exports = router;
