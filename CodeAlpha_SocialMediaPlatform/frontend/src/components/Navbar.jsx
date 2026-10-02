import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserAvatar from './UserAvatar';
import {
  Compass,
  Home,
  LogOut,
  Search,
  Sparkles,
  User as UserIcon,
  Menu,
  X,
  PlusCircle,
} from 'lucide-react';

const Navbar = ({ onOpenCreatePost }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform duration-200">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-sky-600 via-indigo-600 to-slate-900 bg-clip-text text-transparent">
                Nexus
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-600 -mt-1">
                CodeAlpha
              </span>
            </div>
          </Link>

          {/* Search Bar - Desktop */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-md relative items-center"
          >
            <Search className="w-4 h-4 absolute left-3.5 text-slate-600" />
            <input
              type="text"
              placeholder="Search people or posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-100 border border-transparent rounded-full focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all placeholder:text-slate-600"
            />
          </form>

          {/* Action Navigation */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {onOpenCreatePost && (
                  <button
                    onClick={onOpenCreatePost}
                    className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white rounded-full text-sm font-semibold shadow-sm shadow-sky-500/25 transition-all hover:shadow-md active:scale-95"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Post</span>
                  </button>
                )}

                {/* Profile Pill */}
                <Link
                  to={`/profile/${user?.username}`}
                  className="hidden sm:flex items-center gap-2.5 p-1.5 pr-3 rounded-full hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors"
                >
                  <UserAvatar
                    src={user?.avatar}
                    name={user?.name}
                    username={user?.username}
                    size="sm"
                  />
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-slate-800 leading-tight">
                      {user?.name}
                    </span>
                    <span className="text-[11px] text-slate-600 leading-tight">
                      @{user?.username}
                    </span>
                  </div>
                </Link>

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="sm:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
                >
                  {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold rounded-full shadow-sm hover:shadow transition-all"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="sm:hidden border-t border-slate-200 py-3 space-y-2 animate-in slide-in-from-top-2 duration-150">
            <form onSubmit={handleSearch} className="relative px-1 mb-3">
              <Search className="w-4 h-4 absolute left-4 top-3 text-slate-600" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-100 rounded-xl outline-none"
              />
            </form>

            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              <Home className="w-5 h-5 text-sky-600" />
              Home Feed
            </Link>

            <Link
              to="/explore"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              <Compass className="w-5 h-5 text-indigo-600" />
              Explore
            </Link>

            {isAuthenticated && (
              <>
                <Link
                  to={`/profile/${user?.username}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  <UserIcon className="w-5 h-5 text-emerald-600" />
                  My Profile
                </Link>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    logout();
                    navigate('/login');
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <LogOut className="w-5 h-5" />
                  Log Out
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
