const express = require('express');
const router = express.Router();
const taskCommentController = require('../../controllers/user/taskComment');
const { verifyUser } = require('../../middleware/auth');

router.post('/', verifyUser, taskCommentController.addComment);
router.get('/:taskId', verifyUser, taskCommentController.getComments);
router.put('/:commentId', verifyUser, taskCommentController.updateComment);
router.delete('/:commentId', verifyUser, taskCommentController.deleteComment);

module.exports = router;