import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { userService, postService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import UserAvatar from '../components/UserAvatar';
import PostCard from '../components/PostCard';
import {
  Search,
  Users,
  FileText,
  UserPlus,
  UserCheck,
  Loader2,
  Compass,
} from 'lucide-react';

const ExplorePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const { user: currentUser, isAuthenticated } = useAuth();
  const { addToast } = useToast();

  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'users', 'posts'
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [followingMap, setFollowingMap] = useState({});

  useEffect(() => {
    const query = searchParams.get('q') || '';
    setSearchTerm(query);
    performSearch(query);
  }, [searchParams]);

  const performSearch = async (query) => {
    setLoading(true);
    try {
      if (!query.trim()) {
        // Fetch suggested users & recent posts when search is blank
        const [usersRes, postsRes] = await Promise.all([
          userService.getSuggested(),
          postService.getFeed({ limit: 10 }),
        ]);

        if (usersRes.data?.success) setUsers(usersRes.data.users || []);
        if (postsRes.data?.success) setPosts(postsRes.data.posts || []);
      } else {
        const [usersRes, postsRes] = await Promise.all([
          userService.searchUsers(query),
          postService.getFeed({ search: query }),
        ]);

        if (usersRes.data?.success) setUsers(usersRes.data.users || []);
        if (postsRes.data?.success) setPosts(postsRes.data.posts || []);
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setSearchParams({ q: searchTerm.trim() });
    } else {
      setSearchParams({});
    }
  };

  const handleToggleFollow = async (targetUser) => {
    if (!isAuthenticated) {
      addToast('Please log in to follow users', 'info');
      return;
    }

    try {
      const res = await userService.toggleFollow(targetUser._id);
      if (res.data && res.data.success) {
        setFollowingMap((prev) => ({
          ...prev,
          [targetUser._id]: res.data.isFollowing,
        }));
        addToast(res.data.message, 'success');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update follow', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 sm:p-5">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-5 h-5 absolute left-4 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search developers, keywords, or topics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-28 py-3 text-sm sm:text-base bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-sky-500 outline-none transition-all"
          />
          <button
            type="submit"
            className="absolute right-2 top-2 px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-sm"
          >
            Search
          </button>
        </form>

        {/* Explore Sub-Tabs */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeTab === 'all'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Results
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeTab === 'users'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            People ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('posts')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeTab === 'posts'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Posts ({posts.length})
          </button>
        </div>
      </div>

      {/* Search Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
          <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
          <p className="text-xs font-medium text-slate-500">Searching...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* People Section */}
          {(activeTab === 'all' || activeTab === 'users') && users.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 sm:p-5">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-sky-600" />
                {searchTerm ? 'Matching Developers' : 'Suggested People'}
              </h3>
              <div className="divide-y divide-slate-100">
                {users.map((u) => {
                  const isFollowing = followingMap[u._id] ?? u.isFollowing;
                  const isSelf = currentUser && currentUser._id === u._id;

                  return (
                    <div
                      key={u._id}
                      className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3"
                    >
                      <Link
                        to={`/profile/${u.username}`}
                        className="flex items-center gap-3 min-w-0 flex-1 hover:opacity-85"
                      >
                        <UserAvatar
                          src={u.avatar}
                          name={u.name}
                          username={u.username}
                          size="md"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-900 truncate">
                            {u.name}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            @{u.username}
                          </p>
                          {u.bio && (
                            <p className="text-xs text-slate-600 truncate mt-0.5 max-w-md">
                              {u.bio}
                            </p>
                          )}
                        </div>
                      </Link>

                      {!isSelf && (
                        <button
                          onClick={() => handleToggleFollow(u)}
                          className={`text-xs font-semibold px-4 py-1.5 rounded-full transition-all flex items-center gap-1.5 shrink-0 ${
                            isFollowing
                              ? 'bg-slate-100 text-slate-700 hover:bg-red-50 hover:text-red-600 border border-slate-200'
                              : 'bg-slate-900 text-white hover:bg-sky-600 shadow-sm'
                          }`}
                        >
                          {isFollowing ? (
                            <>
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>Following</span>
                            </>
                          ) : (
                            <>
                              <UserPlus className="w-3.5 h-3.5" />
                              <span>Follow</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Posts Section */}
          {(activeTab === 'all' || activeTab === 'posts') && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 px-1">
                <FileText className="w-4 h-4 text-indigo-600" />
                {searchTerm ? 'Matching Posts' : 'Explore Recent Posts'}
              </h3>
              {posts.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center text-slate-400 text-sm">
                  No posts found matching your search.
                </div>
              ) : (
                posts.map((post) => (
                  <PostCard
                    key={post._id}
                    post={post}
                    onPostDeleted={(id) =>
                      setPosts((prev) => prev.filter((p) => p._id !== id))
                    }
                  />
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExplorePage;
