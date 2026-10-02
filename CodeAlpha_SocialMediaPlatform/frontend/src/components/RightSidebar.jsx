import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import UserAvatar from './UserAvatar';
import { UserPlus, UserCheck, Sparkles, TrendingUp, CheckCircle2 } from 'lucide-react';

const RightSidebar = ({ onFollowChange }) => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followingMap, setFollowingMap] = useState({});

  useEffect(() => {
    const fetchSuggested = async () => {
      try {
        setLoading(true);
        const res = await userService.getSuggested();
        if (res.data && res.data.success) {
          setSuggestedUsers(res.data.users || []);
        }
      } catch (err) {
        console.error('Failed to load suggestions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggested();
  }, [user]);

  const handleFollow = async (targetUser) => {
    try {
      const res = await userService.toggleFollow(targetUser._id);
      if (res.data && res.data.success) {
        const isNowFollowing = res.data.isFollowing;
        setFollowingMap((prev) => ({
          ...prev,
          [targetUser._id]: isNowFollowing,
        }));
        addToast(res.data.message, 'success');
        if (onFollowChange) onFollowChange();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update follow status', 'error');
    }
  };

  return (
    <aside className="w-80 shrink-0 hidden xl:block sticky top-20 h-[calc(100vh-5.5rem)] space-y-4">
      {/* CodeAlpha Project Badge */}
      <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-sky-950 text-white rounded-2xl p-4 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          CodeAlpha Internship
        </div>
        <h4 className="text-sm font-bold text-white mb-1">Task 2: Social Media Platform</h4>
        <p className="text-xs text-slate-300 leading-relaxed">
          Full stack app featuring MERN stack, JWT auth, MongoDB relationships, profiles, feeds, likes, comments & follows.
        </p>
      </div>

      {/* Suggested Users Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-sky-600" />
            Who to follow
          </h3>
          <Link
            to="/explore"
            className="text-xs font-semibold text-sky-600 hover:text-sky-700"
          >
            See all
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3 py-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-10 h-10 bg-slate-200 rounded-full shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="w-24 h-3.5 bg-slate-200 rounded" />
                  <div className="w-16 h-2.5 bg-slate-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : suggestedUsers.length === 0 ? (
          <p className="text-xs text-slate-500 py-3 text-center">
            No suggestions available right now.
          </p>
        ) : (
          <div className="space-y-3">
            {suggestedUsers.slice(0, 5).map((sUser) => {
              const isFollowing = followingMap[sUser._id] ?? sUser.isFollowing;
              return (
                <div
                  key={sUser._id}
                  className="flex items-center justify-between gap-3 group"
                >
                  <Link
                    to={`/profile/${sUser.username}`}
                    className="flex items-center gap-2.5 min-w-0 flex-1 hover:opacity-85 transition-opacity"
                  >
                    <UserAvatar
                      src={sUser.avatar}
                      name={sUser.name}
                      username={sUser.username}
                      size="sm"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate group-hover:text-sky-600 transition-colors">
                        {sUser.name}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        @{sUser.username}
                      </p>
                    </div>
                  </Link>

                  <button
                    onClick={() => handleFollow(sUser)}
                    className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full transition-all flex items-center gap-1 ${
                      isFollowing
                        ? 'bg-slate-100 text-slate-700 hover:bg-red-50 hover:text-red-600 border border-slate-200'
                        : 'bg-slate-900 text-white hover:bg-sky-600 shadow-sm'
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <UserCheck className="w-3 h-3" />
                        <span>Following</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3 h-3" />
                        <span>Follow</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="px-2 text-[11px] text-slate-400 space-y-1">
        <p>© 2026 Nexus • CodeAlpha Internship Task 2</p>
        <p>Built with React, Express, Node.js & MongoDB</p>
      </div>
    </aside>
  );
};

export default RightSidebar;
