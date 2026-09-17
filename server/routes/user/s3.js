const router = require('express').Router();
const { verifyUser } = require('../../middleware/auth');
const { getPresignedUrl } = require('../../config/aws')
router.use(verifyUser);

router.get('/get-presigned-url', getPresignedUrl);
module.exports = router;