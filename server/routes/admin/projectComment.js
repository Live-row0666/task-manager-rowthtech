const router = require('express').Router();
const projectCommentController = require('../../controllers/admin/projectComment');
const { verifyAdminUser } = require('../../middleware/auth');

router.use(verifyAdminUser);

// Create project comment
router.post('/', projectCommentController.createComment);
// Get project comments by project ID
router.get('/:projectId', projectCommentController.getComments);
// Update project comment
router.put('/:id', projectCommentController.updateComment);
// Delete project comment
router.delete('/:id', projectCommentController.deleteComment);

module.exports = router;