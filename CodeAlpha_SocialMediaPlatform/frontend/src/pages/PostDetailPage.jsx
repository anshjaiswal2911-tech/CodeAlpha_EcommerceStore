import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { postService } from '../services/api';
import { useToast } from '../context/ToastContext';
import PostCard from '../components/PostCard';
import CommentSection from '../components/CommentSection';
import { ArrowLeft, Loader2 } from 'lucide-react';

const PostDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const res = await postService.getPost(id);
        if (res.data && res.data.success) {
          setPost(res.data.post);
        }
      } catch (err) {
        addToast(err.response?.data?.message || 'Post not found', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, addToast]);

  const handlePostDeleted = () => {
    addToast('Post deleted', 'success');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
        <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
        <p className="text-xs font-medium text-slate-500">Loading post...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-10 text-center space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Post Not Found</h2>
        <p className="text-sm text-slate-500">This post may have been deleted or does not exist.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-600 text-white rounded-full font-bold text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Feed
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <PostCard
        post={post}
        onPostDeleted={handlePostDeleted}
        onPostUpdated={(updated) => setPost(updated)}
      />

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 sm:p-5">
        <h3 className="text-sm font-bold text-slate-900 mb-3">Comments</h3>
        <CommentSection
          postId={post._id}
          postAuthorId={post.author?._id || post.author}
        />
      </div>
    </div>
  );
};

export default PostDetailPage;
