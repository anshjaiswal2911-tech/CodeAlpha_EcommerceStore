const User = require('../models/User');
const Post = require('../models/Post');

// @desc    Get user profile by username
// @route   GET /api/users/profile/:username
// @access  Public (Enhanced with optionalAuth)
const getUserProfile = async (req, res, next) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username: username.toLowerCase().trim() })
      .populate('followers', 'name username avatar bio')
      .populate('following', 'name username avatar bio');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found',
      });
    }

    const postsCount = await Post.countDocuments({ author: user._id });

    const isFollowing = req.user
      ? user.followers.some((f) => f._id.toString() === req.user._id.toString())
      : false;

    const isSelf = req.user ? req.user._id.toString() === user._id.toString() : false;

    return res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        bio: user.bio,
        avatar: user.avatar,
        coverImage: user.coverImage,
        location: user.location,
        website: user.website,
        followersCount: user.followers.length,
        followingCount: user.following.length,
        postsCount,
        followers: user.followers,
        following: user.following,
        isFollowing,
        isSelf,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update current user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, bio, avatar, coverImage, location, website } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (name !== undefined) user.name = name.trim();
    if (bio !== undefined) user.bio = bio;
    if (avatar !== undefined) user.avatar = avatar;
    if (coverImage !== undefined) user.coverImage = coverImage;
    if (location !== undefined) user.location = location;
    if (website !== undefined) user.website = website;

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        bio: user.bio,
        avatar: user.avatar,
        coverImage: user.coverImage,
        location: user.location,
        website: user.website,
        followersCount: user.followers.length,
        followingCount: user.following.length,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle follow / unfollow user
// @route   POST /api/users/:id/follow
// @access  Private
const toggleFollowUser = async (req, res, next) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user._id;

    if (targetUserId === currentUserId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot follow yourself',
      });
    }

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser || !currentUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const isAlreadyFollowing = currentUser.following.some(
      (id) => id.toString() === targetUserId
    );

    let isFollowing = false;

    if (isAlreadyFollowing) {
      // Unfollow
      currentUser.following = currentUser.following.filter(
        (id) => id.toString() !== targetUserId
      );
      targetUser.followers = targetUser.followers.filter(
        (id) => id.toString() !== currentUserId.toString()
      );
      isFollowing = false;
    } else {
      // Follow
      currentUser.following.push(targetUserId);
      targetUser.followers.push(currentUserId);
      isFollowing = true;
    }

    await currentUser.save();
    await targetUser.save();

    return res.status(200).json({
      success: true,
      message: isFollowing ? `You are now following @${targetUser.username}` : `Unfollowed @${targetUser.username}`,
      isFollowing,
      targetFollowersCount: targetUser.followers.length,
      currentFollowingCount: currentUser.following.length,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get suggested users to follow
// @route   GET /api/users/suggested
// @access  Private (or Public)
const getSuggestedUsers = async (req, res, next) => {
  try {
    const query = req.user
      ? {
          _id: {
            $nin: [req.user._id, ...req.user.following],
          },
        }
      : {};

    const suggested = await User.find(query)
      .select('name username avatar bio followers following')
      .limit(10);

    return res.status(200).json({
      success: true,
      users: suggested.map((u) => ({
        _id: u._id,
        name: u.name,
        username: u.username,
        avatar: u.avatar,
        bio: u.bio,
        followersCount: u.followers.length,
        followingCount: u.following.length,
        isFollowing: false,
      })),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search users by name or username
// @route   GET /api/users/search
// @access  Public
const searchUsers = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) {
      return res.status(200).json({ success: true, users: [] });
    }

    const regex = new RegExp(q.trim(), 'i');
    const users = await User.find({
      $or: [{ name: regex }, { username: regex }],
    })
      .select('name username avatar bio followers following')
      .limit(20);

    const formatted = users.map((u) => {
      const isFollowing = req.user
        ? u.followers.some((f) => f.toString() === req.user._id.toString())
        : false;
      return {
        _id: u._id,
        name: u.name,
        username: u.username,
        avatar: u.avatar,
        bio: u.bio,
        followersCount: u.followers.length,
        followingCount: u.following.length,
        isFollowing,
      };
    });

    return res.status(200).json({
      success: true,
      users: formatted,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserProfile,
  updateProfile,
  toggleFollowUser,
  getSuggestedUsers,
  searchUsers,
};
