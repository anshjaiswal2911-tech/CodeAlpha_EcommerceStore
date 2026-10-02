import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { postService } from '../services/api';
import UserAvatar from './UserAvatar';
import { Image, Send, X, Loader2, Sparkles } from 'lucide-react';

const CreatePostCard = ({ onPostCreated }) => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [showMediaInput, setShowMediaInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const maxLength = 1000;
  const charsRemaining = maxLength - content.length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      addToast('Please write something before posting', 'error');
      return;
    }

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
        addToast('Post published successfully!', 'success');
        if (onPostCreated) {
          onPostCreated(res.data.post);
        }
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create post', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 sm:p-5 transition-shadow hover:shadow-md">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-3.5">
          <UserAvatar
            src={user?.avatar}
            name={user?.name}
            username={user?.username}
            size="md"
          />
          <div className="flex-1 min-w-0">
            <textarea
              rows={3}
              placeholder="What's happening? Share your thoughts, project updates, or questions..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={maxLength}
              className="w-full resize-none text-slate-800 placeholder:text-slate-400 text-sm sm:text-base border-none outline-none focus:ring-0 p-0 bg-transparent"
            />

            {/* Optional Media URL input */}
            {showMediaInput && (
              <div className="mt-2.5 p-2.5 bg-slate-50 border border-slate-200 rounded-xl relative animate-in fade-in">
                <input
                  type="url"
                  placeholder="Paste image / GIF URL (e.g. https://images.unsplash.com/...)"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-transparent border-none outline-none pr-8 text-slate-700"
                />
                <button
                  type="button"
                  onClick={() => {
                    setMediaUrl('');
                    setShowMediaInput(false);
                  }}
                  className="absolute right-2 top-2 p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Media Image Preview */}
            {mediaUrl && (
              <div className="mt-3 relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 max-h-60">
                <img
                  src={mediaUrl}
                  alt="Post preview"
                  className="w-full h-full object-cover max-h-60"
                  onError={() => {
                    addToast('Could not load image from provided URL', 'error');
                  }}
                />
                <button
                  type="button"
                  onClick={() => setMediaUrl('')}
                  className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Bottom Actions Bar */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowMediaInput(!showMediaInput)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    showMediaInput || mediaUrl
                      ? 'bg-sky-50 text-sky-600'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                  }`}
                >
                  <Image className="w-4 h-4" />
                  <span>Image URL</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`text-xs font-medium ${
                    charsRemaining < 50 ? 'text-red-500 font-bold' : 'text-slate-400'
                  }`}
                >
                  {charsRemaining}
                </span>

                <button
                  type="submit"
                  disabled={!content.trim() || isSubmitting}
                  className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-bold rounded-full shadow-sm shadow-sky-500/20 hover:shadow-md transition-all active:scale-95"
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
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreatePostCard;
