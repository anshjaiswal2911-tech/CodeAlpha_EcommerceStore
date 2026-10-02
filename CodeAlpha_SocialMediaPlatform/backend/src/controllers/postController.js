const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');

// Helper to format post with isLiked and author info
const formatPost = (post, currentUserId) => {
  const isLiked = currentUserId
    ? post.likes.some((id) => id.toString() === currentUserId.toString())
    : false;

  return {
    _id: post._id,
    content: post.content,
    mediaUrl: post.mediaUrl,
    author: post.author,
    likesCount: post.likes ? post.likes.length : 0,
    likes: post.likes,
    commentsCount: post.commentsCount || 0,
    isLiked,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  };
};

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res, next) => {
  try {
    const { content, mediaUrl } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Post content cannot be empty',
      });
    }

    const post = await Post.create({
      author: req.user._id,
      content: content.trim(),
      mediaUrl: mediaUrl ? mediaUrl.trim() : '',
      likes: [],
      commentsCount: 0,
    });

    const populatedPost = await Post.findById(post._id).populate(
      'author',
      'name username avatar bio'
    );

    return res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post: formatPost(populatedPost, req.user._id),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get feed posts (explore, following, or user specific)
// @route   GET /api/posts
// @access  Public (Enhanced with optionalAuth)
const getFeedPosts = async (req, res, next) => {
  try {
    const { feedType, username, likedBy, search, page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    let filter = {};

    // 1. Filter by specific user posts
    if (username) {
      const targetUser = await User.findOne({ username: username.toLowerCase() });
      if (!targetUser) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      filter.author = targetUser._id;
    }
    // 2. Filter by posts liked by a user
    else if (likedBy) {
      const targetUser = await User.findOne({ username: likedBy.toLowerCase() });
      if (!targetUser) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      filter.likes = targetUser._id;
    }
    // 3. Filter by Following feed
    else if (feedType === 'following' && req.user) {
      const followingList = [...(req.user.following || []), req.user._id];
      filter.author = { $in: followingList };
    }
    // 4. Search text
    if (search && search.trim()) {
      filter.content = { $regex: search.trim(), $options: 'i' };
    }

    const totalPosts = await Post.countDocuments(filter);
    const posts = await Post.find(filter)
      .populate('author', 'name username avatar bio')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const currentUserId = req.user ? req.user._id : null;
    const formattedPosts = posts.map((p) => formatPost(p, currentUserId));

    return res.status(200).json({
      success: true,
      count: formattedPosts.length,
      total: totalPosts,
      page: pageNum,
      totalPages: Math.ceil(totalPosts / limitNum) || 1,
      posts: formattedPosts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single post by ID
// @route   GET /api/posts/:id
// @access  Public (Enhanced with optionalAuth)
const getPostById = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      'author',
      'name username avatar bio'
    );

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    const currentUserId = req.user ? req.user._id : null;

    return res.status(200).json({
      success: true,
      post: formatPost(post, currentUserId),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private (Author only)
const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    // Check ownership
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this post',
      });
    }

    // Delete associated comments
    await Comment.deleteMany({ post: post._id });
    await post.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Post and associated comments deleted successfully',
      deletedPostId: req.params.id,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle like / unlike post
// @route   POST /api/posts/:id/like
// @access  Private
const toggleLikePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    const currentUserId = req.user._id;
    const isAlreadyLiked = post.likes.some(
      (id) => id.toString() === currentUserId.toString()
    );

    let isLiked = false;

    if (isAlreadyLiked) {
      // Unlike
      post.likes = post.likes.filter(
        (id) => id.toString() !== currentUserId.toString()
      );
      isLiked = false;
    } else {
      // Like
      post.likes.push(currentUserId);
      isLiked = true;
    }

    await post.save();

    return res.status(200).json({
      success: true,
      message: isLiked ? 'Post liked' : 'Post unliked',
      isLiked,
      likesCount: post.likes.length,
      postId: post._id,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPost,
  getFeedPosts,
  getPostById,
  deletePost,
  toggleLikePost,
};
