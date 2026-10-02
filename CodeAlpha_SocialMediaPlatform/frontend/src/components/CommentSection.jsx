import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { commentService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import UserAvatar from './UserAvatar';
import { Trash2, Send, Loader2, MessageSquare } from 'lucide-react';

const CommentSection = ({ postId, postAuthorId, onCommentCountChange }) => {
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchComments = async () => {
      try {
        setLoading(true);
        const res = await commentService.getComments(postId);
        if (isMounted && res.data && res.data.success) {
          setComments(res.data.comments || []);
        }
      } catch (err) {
        console.error('Error fetching comments:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchComments();
    return () => {
      isMounted = false;
    };
  }, [postId]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    if (!isAuthenticated) {
      addToast('Please log in to leave a comment', 'info');
      return;
    }

    try {
      setSubmitting(true);
      const res = await commentService.addComment(postId, {
        content: newComment.trim(),
      });

      if (res.data && res.data.success) {
        const createdComment = res.data.comment;
        setComments((prev) => [...prev, createdComment]);
        setNewComment('');
        addToast('Comment added', 'success');
        if (onCommentCountChange) {
          onCommentCountChange(res.data.commentsCount);
        }
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to add comment', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      setDeletingId(commentId);
      const res = await commentService.deleteComment(commentId);
      if (res.data && res.data.success) {
        setComments((prev) => prev.filter((c) => c._id !== commentId));
        addToast('Comment removed', 'success');
        if (onCommentCountChange) {
          onCommentCountChange(res.data.commentsCount);
        }
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete comment', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const formatCommentDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-slate-100 space-y-4">
      {/* Input box */}
      {isAuthenticated ? (
        <form onSubmit={handleAddComment} className="flex items-center gap-2.5">
          <UserAvatar
            src={user?.avatar}
            name={user?.name}
            username={user?.username}
            size="xs"
          />
          <div className="flex-1 relative flex items-center">
            <input
              type="text"
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              maxLength={1000}
              className="w-full text-xs sm:text-sm bg-slate-100 focus:bg-white border border-transparent focus:border-sky-400 rounded-full py-2 pl-3.5 pr-10 outline-none transition-all placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={!newComment.trim() || submitting}
              className="absolute right-1.5 p-1.5 bg-sky-600 hover:bg-sky-700 disabled:opacity-40 text-white rounded-full transition-colors"
            >
              {submitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </form>
      ) : (
        <div className="p-2.5 bg-slate-50 rounded-xl text-center text-xs text-slate-500">
          <Link to="/login" className="font-semibold text-sky-600 hover:underline">
            Log in
          </Link>{' '}
          to join the conversation and comment.
        </div>
      )}

      {/* Comment List */}
      {loading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="w-5 h-5 text-sky-600 animate-spin" />
        </div>
      ) : comments.length === 0 ? (
        <div className="py-3 text-center text-slate-400 text-xs flex flex-col items-center gap-1">
          <MessageSquare className="w-4 h-4 text-slate-300" />
          <span>No comments yet. Be the first to share your thoughts!</span>
        </div>
      ) : (
        <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
          {comments.map((comment) => {
            const isCommentAuthor = user && comment.author?._id === user._id;
            const isPostAuthor = user && postAuthorId === user._id;
            const canDelete = isCommentAuthor || isPostAuthor;

            return (
              <div
                key={comment._id}
                className="flex items-start justify-between gap-2.5 group/comment bg-slate-50/80 p-2.5 rounded-xl border border-slate-100"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <Link to={`/profile/${comment.author?.username}`}>
                    <UserAvatar
                      src={comment.author?.avatar}
                      name={comment.author?.name}
                      username={comment.author?.username}
                      size="xs"
                    />
                  </Link>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Link
                        to={`/profile/${comment.author?.username}`}
                        className="text-xs font-bold text-slate-900 hover:text-sky-600"
                      >
                        {comment.author?.name}
                      </Link>
                      <span className="text-[11px] text-slate-400">
                        @{comment.author?.username}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        • {formatCommentDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 mt-1 whitespace-pre-wrap break-words">
                      {comment.content}
                    </p>
                  </div>
                </div>

                {canDelete && (
                  <button
                    onClick={() => handleDeleteComment(comment._id)}
                    disabled={deletingId === comment._id}
                    title="Delete comment"
                    className="opacity-0 group-hover/comment:opacity-100 p-1 text-slate-400 hover:text-red-600 rounded transition-opacity"
                  >
                    {deletingId === comment._id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CommentSection;
