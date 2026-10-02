const express = require('express');
const router = express.Router();
const {
  createPost,
  getFeedPosts,
  getPostById,
  deletePost,
  toggleLikePost,
} = require('../controllers/postController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

router.route('/')
  .get(optionalAuth, getFeedPosts)
  .post(protect, createPost);

router.route('/:id')
  .get(optionalAuth, getPostById)
  .delete(protect, deletePost);

router.post('/:id/like', protect, toggleLikePost);

module.exports = router;
