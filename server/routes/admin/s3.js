const router = require('express').Router();
const { verifyAdminUser } = require('../../middleware/auth');
const { getPresignedUrl } = require('../../config/aws')
router.use(verifyAdminUser);

router.get('/get-presigned-url', getPresignedUrl);
module.exports = router;