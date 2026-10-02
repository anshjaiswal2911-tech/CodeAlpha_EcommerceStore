import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { userService, postService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import UserAvatar from '../components/UserAvatar';
import PostCard from '../components/PostCard';
import EditProfileModal from '../components/EditProfileModal';
import {
  Calendar,
  MapPin,
  Globe,
  Edit3,
  UserPlus,
  UserCheck,
  Heart,
  FileText,
  Loader2,
  Users,
  ArrowLeft,
} from 'lucide-react';

const ProfilePage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, isAuthenticated } = useAuth();
  const { addToast } = useToast();

  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' or 'liked'
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const isSelf = currentUser && profileUser && currentUser.username === profileUser.username;

  // Load profile details
  const fetchProfile = useCallback(async () => {
    try {
      setLoadingProfile(true);
      const res = await userService.getProfile(username);
      if (res.data && res.data.success) {
        const u = res.data.user;
        setProfileUser(u);
        setIsFollowing(u.isFollowing || false);
        setFollowersCount(u.followersCount || 0);
        setFollowingCount(u.followingCount || 0);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Profile not found', 'error');
    } finally {
      setLoadingProfile(false);
    }
  }, [username, addToast]);

  // Load user posts or liked posts
  const fetchUserPosts = useCallback(async () => {
    try {
      setLoadingPosts(true);
      const params =
        activeTab === 'liked'
          ? { likedBy: username }
          : { username: username };

      const res = await postService.getFeed(params);
      if (res.data && res.data.success) {
        setPosts(res.data.posts || []);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to load user posts', 'error');
    } finally {
      setLoadingPosts(false);
    }
  }, [username, activeTab, addToast]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    fetchUserPosts();
  }, [fetchUserPosts]);

  const handleToggleFollow = async () => {
    if (!isAuthenticated) {
      addToast('Please log in to follow users', 'info');
      navigate('/login');
      return;
    }

    try {
      setIsFollowLoading(true);
      const res = await userService.toggleFollow(profileUser._id);
      if (res.data && res.data.success) {
        setIsFollowing(res.data.isFollowing);
        setFollowersCount(res.data.targetFollowersCount);
        addToast(res.data.message, 'success');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update follow', 'error');
    } finally {
      setIsFollowLoading(false);
    }
  };

  const handlePostDeleted = (deletedPostId) => {
    setPosts((prev) => prev.filter((p) => p._id !== deletedPostId));
    if (profileUser) {
      setProfileUser((prev) => ({
        ...prev,
        postsCount: Math.max(0, (prev.postsCount || 1) - 1),
      }));
    }
  };

  const handleProfileUpdated = (updatedUser) => {
    setProfileUser((prev) => ({
      ...prev,
      ...updatedUser,
    }));
  };

  const formatJoinedDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, {
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return '';
    }
  };

  if (loadingProfile) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
        <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Loading user profile...</p>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-10 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">User Not Found</h2>
        <p className="text-sm text-slate-500">The account @{username} does not exist or has been removed.</p>
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
    <div className="space-y-6">
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Cover Banner */}
        <div className="h-40 sm:h-52 bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-600 relative">
          {profileUser.coverImage && (
            <img
              src={profileUser.coverImage}
              alt="Profile cover"
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Profile Main Info */}
        <div className="px-5 sm:px-8 pb-6 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-4">
            <div className="p-1 bg-white rounded-full inline-block shadow-md">
              <UserAvatar
                src={profileUser.avatar}
                name={profileUser.name}
                username={profileUser.username}
                size="2xl"
                className="w-24 h-24 sm:w-32 sm:h-32 text-3xl"
              />
            </div>

            {/* Action Button: Edit or Follow */}
            <div>
              {isSelf ? (
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-bold rounded-full transition-all border border-slate-200"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <button
                  onClick={handleToggleFollow}
                  disabled={isFollowLoading}
                  className={`inline-flex items-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-bold rounded-full transition-all shadow-sm ${
                    isFollowing
                      ? 'bg-slate-100 text-slate-800 hover:bg-red-50 hover:text-red-600 border border-slate-200'
                      : 'bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white'
                  }`}
                >
                  {isFollowLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isFollowing ? (
                    <>
                      <UserCheck className="w-4 h-4" />
                      <span>Following</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Follow</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* User Details */}
          <div className="space-y-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                {profileUser.name}
              </h1>
              <p className="text-sm font-medium text-slate-500">
                @{profileUser.username}
              </p>
            </div>

            {profileUser.bio && (
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                {profileUser.bio}
              </p>
            )}

            {/* Meta Tags: Location, Website, Joined Date */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500 pt-1">
              {profileUser.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{profileUser.location}</span>
                </div>
              )}

              {profileUser.website && (
                <div className="flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-slate-400 shrink-0" />
                  <a
                    href={
                      profileUser.website.startsWith('http')
                        ? profileUser.website
                        : `https://${profileUser.website}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-600 hover:underline truncate max-w-xs"
                  >
                    {profileUser.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}

              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Joined {formatJoinedDate(profileUser.createdAt)}</span>
              </div>
            </div>

            {/* Counts Bar */}
            <div className="flex items-center gap-6 pt-3 border-t border-slate-100 text-sm">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900">{followersCount}</span>
                <span className="text-slate-500">Followers</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900">{followingCount}</span>
                <span className="text-slate-500">Following</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900">
                  {profileUser.postsCount || 0}
                </span>
                <span className="text-slate-500">Posts</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Headers */}
        <div className="flex border-t border-slate-100 bg-slate-50/50">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all ${
              activeTab === 'posts'
                ? 'border-sky-600 text-sky-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Posts</span>
          </button>

          <button
            onClick={() => setActiveTab('liked')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all ${
              activeTab === 'liked'
                ? 'border-sky-600 text-sky-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Liked Posts</span>
          </button>
        </div>
      </div>

      {/* Posts Section */}
      {loadingPosts ? (
        <div className="flex flex-col items-center justify-center py-12 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
          <Loader2 className="w-6 h-6 text-sky-600 animate-spin" />
          <p className="text-xs font-medium text-slate-500">Loading posts...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-10 text-center text-slate-400 text-sm">
          {activeTab === 'posts'
            ? `@${profileUser.username} hasn't published any posts yet.`
            : `@${profileUser.username} hasn't liked any posts yet.`}
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onPostDeleted={handlePostDeleted}
            />
          ))}
        </div>
      )}

      {/* Edit Profile Modal */}
      {isSelf && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onProfileUpdated={handleProfileUpdated}
        />
      )}
    </div>
  );
};

export default ProfilePage;
