const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  getPostComments,
  createComment,
  deleteComment,
} = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');

// Handled at /api/posts/:postId/comments OR /api/comments/:id
router.get('/', getPostComments);
router.post('/', protect, createComment);

module.exports = router;
