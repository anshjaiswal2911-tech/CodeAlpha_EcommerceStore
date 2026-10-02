import React, { useState, useEffect, useCallback } from 'react';
import { postService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import CreatePostCard from '../components/CreatePostCard';
import PostCard from '../components/PostCard';
import { Sparkles, Users, Loader2, RefreshCw, MessageSquareDashed } from 'lucide-react';

const FeedPage = () => {
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('explore'); // 'explore' or 'following'
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPosts = useCallback(async (showRefreshingSpinner = false) => {
    try {
      if (showRefreshingSpinner) setRefreshing(true);
      else setLoading(true);

      const params = {
        feedType: activeTab,
      };

      const res = await postService.getFeed(params);
      if (res.data && res.data.success) {
        setPosts(res.data.posts || []);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to load posts', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab, addToast]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handlePostDeleted = (deletedPostId) => {
    setPosts((prev) => prev.filter((p) => p._id !== deletedPostId));
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts((prev) =>
      prev.map((p) => (p._id === updatedPost._id ? updatedPost : p))
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Create Post Section (Authenticated Only) */}
      {isAuthenticated && (
        <CreatePostCard onPostCreated={handlePostCreated} />
      )}

      {/* Feed Filter Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-1.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5 flex-1">
          <button
            onClick={() => setActiveTab('explore')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'explore'
                ? 'bg-sky-50 text-sky-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>For You</span>
          </button>

          {isAuthenticated && (
            <button
              onClick={() => setActiveTab('following')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'following'
                  ? 'bg-sky-50 text-sky-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Following</span>
            </button>
          )}
        </div>

        <button
          onClick={() => fetchPosts(true)}
          disabled={loading || refreshing}
          title="Refresh Feed"
          className="p-2.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors ml-1"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-sky-600' : ''}`} />
        </button>
      </div>

      {/* Posts List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
          <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
          <p className="text-sm font-semibold text-slate-500">Loading your feed...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm text-center space-y-3">
          <div className="w-14 h-14 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center">
            <MessageSquareDashed className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {activeTab === 'following'
                ? 'No posts from people you follow'
                : 'No posts yet'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mt-1">
              {activeTab === 'following'
                ? 'Follow other developers to see their thoughts, code snippets, and updates in this tab.'
                : 'Be the first to share something with the community! Write your first post above.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onPostDeleted={handlePostDeleted}
              onPostUpdated={handlePostUpdated}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FeedPage;
