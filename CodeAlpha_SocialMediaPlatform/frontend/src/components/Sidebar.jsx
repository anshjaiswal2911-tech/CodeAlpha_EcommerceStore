import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserAvatar from './UserAvatar';
import {
  Home,
  Compass,
  User,
  LogOut,
  PlusSquare,
  Sparkles,
  Users,
  FileText,
} from 'lucide-react';

const Sidebar = ({ onOpenCreatePost }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Feed', path: '/', icon: Home, exact: true },
    { label: 'Explore', path: '/explore', icon: Compass },
    { label: 'My Profile', path: `/profile/${user?.username}`, icon: User },
  ];

  return (
    <aside className="w-64 shrink-0 hidden lg:block sticky top-20 h-[calc(100vh-5.5rem)] flex-col justify-between">
      <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 justify-between">
        <div className="space-y-6">
          {/* User Mini Profile Card */}
          {user && (
            <div className="p-3.5 bg-gradient-to-br from-slate-50 to-sky-50/50 rounded-xl border border-slate-100">
              <div className="flex items-center gap-3">
                <UserAvatar
                  src={user.avatar}
                  name={user.name}
                  username={user.username}
                  size="md"
                />
                <div className="overflow-hidden">
                  <h3 className="text-sm font-bold text-slate-900 truncate">
                    {user.name}
                  </h3>
                  <p className="text-xs text-slate-500 truncate">
                    @{user.username}
                  </p>
                </div>
              </div>

              {/* Stats Counters */}
              <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-200/60 text-center">
                <div>
                  <span className="block text-xs font-bold text-slate-900">
                    {user.followersCount || 0}
                  </span>
                  <span className="text-[11px] text-slate-500">Followers</span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-900">
                    {user.followingCount || 0}
                  </span>
                  <span className="text-[11px] text-slate-500">Following</span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.exact}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-sky-50 text-sky-600 shadow-sm border border-sky-100/80 font-bold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Quick Create Post Button */}
          {onOpenCreatePost && (
            <button
              onClick={onOpenCreatePost}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-bold text-sm rounded-xl shadow-md shadow-sky-500/20 hover:shadow-lg transition-all active:scale-[0.98]"
            >
              <PlusSquare className="w-4 h-4" />
              <span>Create Post</span>
            </button>
          )}
        </div>

        {/* Logout Bottom Button */}
        <div className="pt-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
