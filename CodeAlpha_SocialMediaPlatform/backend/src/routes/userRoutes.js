const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateProfile,
  toggleFollowUser,
  getSuggestedUsers,
  searchUsers,
} = require('../controllers/userController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

router.get('/suggested', optionalAuth, getSuggestedUsers);
router.get('/search', optionalAuth, searchUsers);
router.put('/profile', protect, updateProfile);
router.get('/profile/:username', optionalAuth, getUserProfile);
router.post('/:id/follow', protect, toggleFollowUser);

module.exports = router;
