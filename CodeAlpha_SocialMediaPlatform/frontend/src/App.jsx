import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import RightSidebar from './components/RightSidebar';
import ProtectedRoute from './components/ProtectedRoute';
import FeedPage from './pages/FeedPage';
import ExplorePage from './pages/ExplorePage';
import ProfilePage from './pages/ProfilePage';
import PostDetailPage from './pages/PostDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';
import UserAvatar from './components/UserAvatar';
import { postService } from './services/api';
import { X, Send, Image, Loader2 } from 'lucide-react';

// Layout wrapper for standard app pages
const AppLayout = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMediaInput, setShowMediaInput] = useState(false);
  const [sidebarRefreshKey, setSidebarRefreshKey] = useState(0);

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await postService.createPost({
        content: content.trim(),
        mediaUrl: mediaUrl.trim(),
      });

      if (res.data && res.data.success) {
        setContent('');
        setMediaUrl('');
        setShowMediaInput(false);
        setIsCreateModalOpen(false);
        addToast('Post published successfully!', 'success');
        // Reload page to reflect post in active feed
        window.location.reload();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create post', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/70">
      <Navbar onOpenCreatePost={() => setIsCreateModalOpen(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-center gap-6">
          {/* Left Sidebar (Desktop) */}
          <Sidebar onOpenCreatePost={() => setIsCreateModalOpen(true)} />

          {/* Center Main Content Feed/Page */}
          <div className="flex-1 max-w-2xl min-w-0">
            {children}
          </div>

          {/* Right Sidebar (Desktop XL) */}
          <RightSidebar
            key={sidebarRefreshKey}
            onFollowChange={() => setSidebarRefreshKey((k) => k + 1)}
          />
        </div>
      </main>

      {/* Global Quick Create Post Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 animate-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Create New Post</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="p-6">
              <div className="flex gap-3">
                <UserAvatar
                  src={user?.avatar}
                  name={user?.name}
                  username={user?.username}
                  size="md"
                />
                <div className="flex-1">
                  <textarea
                    rows={4}
                    placeholder="What's happening? Share thoughts, code snippets, or ask questions..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    maxLength={1000}
                    className="w-full resize-none text-slate-800 placeholder:text-slate-400 text-sm border-none outline-none focus:ring-0 p-0"
                    autoFocus
                  />

                  {showMediaInput && (
                    <div className="mt-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl relative">
                      <input
                        type="url"
                        placeholder="Image URL (https://...)"
                        value={mediaUrl}
                        onChange={(e) => setMediaUrl(e.target.value)}
                        className="w-full text-xs bg-transparent border-none outline-none pr-8 text-slate-700"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setMediaUrl('');
                          setShowMediaInput(false);
                        }}
                        className="absolute right-2 top-2 p-1 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {mediaUrl && (
                    <div className="mt-2 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 max-h-48">
                      <img
                        src={mediaUrl}
                        alt="Preview"
                        className="w-full h-full object-cover max-h-48"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between mt-5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowMediaInput(!showMediaInput)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                >
                  <Image className="w-4 h-4" />
                  <span>Attach Image URL</span>
                </button>

                <button
                  type="submit"
                  disabled={!content.trim() || isSubmitting}
                  className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 disabled:opacity-50 text-white text-sm font-bold rounded-full shadow-sm"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Post</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const App = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Authentication Pages */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Main Application Pages */}
            <Route
              path="/"
              element={
                <AppLayout>
                  <FeedPage />
                </AppLayout>
              }
            />

            <Route
              path="/explore"
              element={
                <AppLayout>
                  <ExplorePage />
                </AppLayout>
              }
            />

            <Route
              path="/profile/:username"
              element={
                <AppLayout>
                  <ProfilePage />
                </AppLayout>
              }
            />

            <Route
              path="/post/:id"
              element={
                <AppLayout>
                  <PostDetailPage />
                </AppLayout>
              }
            />

            <Route
              path="*"
              element={
                <AppLayout>
                  <NotFoundPage />
                </AppLayout>
              }
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;
