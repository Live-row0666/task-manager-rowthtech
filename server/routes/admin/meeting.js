const express = require('express');
const router = express.Router();
const {
    createMeeting,
    getMeetings,
    getMeetingById,
    updateMeeting,
    deleteMeeting,
    getMeetingsByProject
} = require('../../controllers/admin/meeting');
const { verifyAdminUser } = require('../../middleware/auth');

router.use(verifyAdminUser);

router.post('/', createMeeting);
router.get('/', getMeetings);
router.get('/:id', getMeetingById);
router.put('/:id', updateMeeting);
router.delete('/:id', deleteMeeting);
router.post('/:id/delete', deleteMeeting);
router.get('/project/:projectId', getMeetingsByProject);

module.exports = router;