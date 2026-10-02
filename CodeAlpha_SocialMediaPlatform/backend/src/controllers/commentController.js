const Comment = require('../models/Comment');
const Post = require('../models/Post');

// @desc    Get comments for a specific post
// @route   GET /api/posts/:postId/comments
// @access  Public
const getPostComments = async (req, res, next) => {
  try {
    const { postId } = req.params;

    const postExists = await Post.exists({ _id: postId });
    if (!postExists) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    const comments = await Comment.find({ post: postId })
      .populate('author', 'name username avatar bio')
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      count: comments.length,
      comments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add comment to a post
// @route   POST /api/posts/:postId/comments
// @access  Private
const createComment = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment text cannot be empty',
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    const comment = await Comment.create({
      post: postId,
      author: req.user._id,
      content: content.trim(),
    });

    // Increment post's comment count
    post.commentsCount = (post.commentsCount || 0) + 1;
    await post.save();

    const populatedComment = await Comment.findById(comment._id).populate(
      'author',
      'name username avatar bio'
    );

    return res.status(201).json({
      success: true,
      message: 'Comment posted',
      comment: populatedComment,
      commentsCount: post.commentsCount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete comment
// @route   DELETE /api/comments/:id
// @access  Private (Comment author or Post author)
const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      });
    }

    const post = await Post.findById(comment.post);

    const isCommentAuthor = comment.author.toString() === req.user._id.toString();
    const isPostAuthor = post && post.author.toString() === req.user._id.toString();

    if (!isCommentAuthor && !isPostAuthor) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this comment',
      });
    }

    await comment.deleteOne();

    if (post && post.commentsCount > 0) {
      post.commentsCount -= 1;
      await post.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Comment deleted successfully',
      deletedCommentId: req.params.id,
      commentsCount: post ? post.commentsCount : 0,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPostComments,
  createComment,
  deleteComment,
};
