import React, { useState } from 'react';
import { userService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import UserAvatar from './UserAvatar';
import { X, Loader2, User, Globe, MapPin, Image, Sparkles } from 'lucide-react';

const EditProfileModal = ({ isOpen, onClose, onProfileUpdated }) => {
  const { user, updateUser } = useAuth();
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    avatar: user?.avatar || '',
    coverImage: user?.coverImage || '',
    location: user?.location || '',
    website: user?.website || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRandomizeAvatar = () => {
    const randomSeed = Math.random().toString(36).substring(7);
    const newAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${randomSeed}`;
    setFormData((prev) => ({ ...prev, avatar: newAvatar }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      addToast('Name is required', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await userService.updateProfile(formData);
      if (res.data && res.data.success) {
        updateUser(res.data.user);
        addToast('Profile updated successfully!', 'success');
        if (onProfileUpdated) {
          onProfileUpdated(res.data.user);
        }
        onClose();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Edit Profile</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4 flex-1">
          {/* Avatar Preview & Randomize */}
          <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <UserAvatar
              src={formData.avatar}
              name={formData.name}
              username={user?.username}
              size="lg"
            />
            <div className="flex-1 space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Avatar URL</label>
              <input
                type="url"
                name="avatar"
                placeholder="https://..."
                value={formData.avatar}
                onChange={handleChange}
                className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-sky-500"
              />
              <button
                type="button"
                onClick={handleRandomizeAvatar}
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-sky-600 hover:text-sky-700"
              >
                <Sparkles className="w-3 h-3" />
                Randomize Avatar
              </button>
            </div>
          </div>

          {/* Name Field */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Display Name *
            </label>
            <div className="relative flex items-center">
              <User className="w-4 h-4 absolute left-3 text-slate-400" />
              <input
                type="text"
                name="name"
                required
                maxLength={50}
                value={formData.name}
                onChange={handleChange}
                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-sky-500"
              />
            </div>
          </div>

          {/* Bio Field */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Bio
              </label>
              <span className="text-[11px] text-slate-400">
                {160 - formData.bio.length} characters left
              </span>
            </div>
            <textarea
              name="bio"
              rows={3}
              maxLength={160}
              placeholder="Tell the community about yourself, your tech stack, or interests..."
              value={formData.bio}
              onChange={handleChange}
              className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-sky-500 resize-none"
            />
          </div>

          {/* Location & Website */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Location
              </label>
              <div className="relative flex items-center">
                <MapPin className="w-4 h-4 absolute left-3 text-slate-400" />
                <input
                  type="text"
                  name="location"
                  placeholder="e.g. San Francisco, CA"
                  maxLength={50}
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Website
              </label>
              <div className="relative flex items-center">
                <Globe className="w-4 h-4 absolute left-3 text-slate-400" />
                <input
                  type="text"
                  name="website"
                  placeholder="e.g. https://myportfolio.dev"
                  maxLength={100}
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-sky-500"
                />
              </div>
            </div>
          </div>

          {/* Cover Image URL */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Cover Image URL (Optional)
            </label>
            <div className="relative flex items-center">
              <Image className="w-4 h-4 absolute left-3 text-slate-400" />
              <input
                type="url"
                name="coverImage"
                placeholder="https://images.unsplash.com/..."
                value={formData.coverImage}
                onChange={handleChange}
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-sky-500"
              />
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl shadow-sm transition-all"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <span>Save Changes</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
