import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { postService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import UserAvatar from './UserAvatar';
import CommentSection from './CommentSection';
import {
  Heart,
  MessageCircle,
  Share2,
  Trash2,
  MoreHorizontal,
  Loader2,
  Check,
} from 'lucide-react';

const PostCard = ({ post, onPostDeleted, onPostUpdated }) => {
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0);
  const [showComments, setShowComments] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  const isAuthor = user && post.author && (post.author._id === user._id || post.author === user._id);

  const handleLike = async () => {
    if (!isAuthenticated) {
      addToast('Please log in to like posts', 'info');
      navigate('/login');
      return;
    }

    if (isLiking) return;

    // Optimistic UI update
    const nextIsLiked = !isLiked;
    const nextCount = nextIsLiked ? likesCount + 1 : Math.max(0, likesCount - 1);
    setIsLiked(nextIsLiked);
    setLikesCount(nextCount);
    setIsLiking(true);

    try {
      const res = await postService.toggleLike(post._id);
      if (res.data && res.data.success) {
        setIsLiked(res.data.isLiked);
        setLikesCount(res.data.likesCount);
        if (onPostUpdated) {
          onPostUpdated({
            ...post,
            isLiked: res.data.isLiked,
            likesCount: res.data.likesCount,
          });
        }
      }
    } catch (err) {
      // Revert optimistic update
      setIsLiked(!nextIsLiked);
      setLikesCount(likesCount);
      addToast(err.response?.data?.message || 'Failed to update like status', 'error');
    } finally {
      setIsLiking(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      setIsDeleting(true);
      const res = await postService.deletePost(post._id);
      if (res.data && res.data.success) {
        addToast('Post deleted', 'success');
        if (onPostDeleted) {
          onPostDeleted(post._id);
        }
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete post', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleShare = () => {
    const postUrl = `${window.location.origin}/post/${post._id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(postUrl);
      setCopied(true);
      addToast('Post link copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const formatPostDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffSecs < 60) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;

      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      });
    } catch {
      return '';
    }
  };

  return (
    <article className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 sm:p-5 transition-all hover:border-slate-300">
      {/* Post Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            to={`/profile/${post.author?.username}`}
            className="hover:opacity-85 transition-opacity shrink-0"
          >
            <UserAvatar
              src={post.author?.avatar}
              name={post.author?.name}
              username={post.author?.username}
              size="md"
            />
          </Link>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Link
                to={`/profile/${post.author?.username}`}
                className="text-sm font-bold text-slate-900 hover:text-sky-600 transition-colors"
              >
                {post.author?.name || 'Anonymous User'}
              </Link>
              <span className="text-xs text-slate-500">
                @{post.author?.username || 'user'}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-400">
                {formatPostDate(post.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Post Actions Menu */}
        {isAuthor && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            title="Delete post"
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {/* Post Text Content */}
      <div className="mt-3 text-slate-800 text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words">
        {post.content}
      </div>

      {/* Post Media Image if attached */}
      {post.mediaUrl && (
        <div className="mt-3.5 rounded-xl overflow-hidden border border-slate-200/80 bg-slate-50 max-h-[450px]">
          <img
            src={post.mediaUrl}
            alt="Post content"
            className="w-full h-full object-cover max-h-[450px] hover:scale-[1.01] transition-transform duration-200"
            loading="lazy"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Post Action Buttons */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 text-slate-500">
        {/* Like Button */}
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all active:scale-90 ${
            isLiked
              ? 'text-rose-600 bg-rose-50/80 hover:bg-rose-100'
              : 'hover:text-rose-600 hover:bg-slate-50'
          }`}
        >
          <Heart
            className={`w-4 h-4 transition-transform ${
              isLiked ? 'fill-rose-600 stroke-rose-600 scale-110' : ''
            }`}
          />
          <span>{likesCount}</span>
        </button>

        {/* Comment Button */}
        <button
          onClick={() => setShowComments(!showComments)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${
            showComments
              ? 'text-sky-600 bg-sky-50'
              : 'hover:text-sky-600 hover:bg-slate-50'
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          <span>{commentsCount}</span>
        </button>

        {/* Share Button */}
        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold hover:text-slate-900 hover:bg-slate-50 transition-colors"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
          <span className="hidden sm:inline">{copied ? 'Copied' : 'Share'}</span>
        </button>
      </div>

      {/* Nested Comments Section */}
      {showComments && (
        <CommentSection
          postId={post._id}
          postAuthorId={post.author?._id || post.author}
          onCommentCountChange={(newCount) => setCommentsCount(newCount)}
        />
      )}
    </article>
  );
};

export default PostCard;
