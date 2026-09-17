const express = require('express');
const router = express.Router();
const uploadController = require('../../controllers/admin/upload');
const { verifyAdminUser } = require('../../middleware/auth');
const upload = require('../../middleware/upload');

router.post('/file', verifyAdminUser, upload.single('file'), uploadController.uploadFile);
router.delete('/file/:fileKey', verifyAdminUser, uploadController.deleteFile);
router.post('/presigned-url', verifyAdminUser, uploadController.getPresignedUrl);

module.exports = router;