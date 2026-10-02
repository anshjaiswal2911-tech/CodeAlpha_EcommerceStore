import React, { useState } from 'react';

const UserAvatar = ({ src, name = 'User', username = '', size = 'md', className = '' }) => {
  const [hasError, setHasError] = useState(false);

  const sizeClasses = {
    xs: 'w-7 h-7 text-xs',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-xl font-bold',
    '2xl': 'w-28 h-28 text-2xl font-bold',
  };

  const seed = username || name || 'default';
  const fallbackUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(seed)}`;
  const displaySrc = (!hasError && src) ? src : fallbackUrl;

  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-indigo-600 text-white font-semibold overflow-hidden border border-slate-200/80 shadow-sm shrink-0 select-none ${sizeClasses[size] || sizeClasses.md} ${className}`}
    >
      <img
        src={displaySrc}
        alt={name}
        onError={() => setHasError(true)}
        className="w-full h-full object-cover"
        loading="lazy"
      />
    </div>
  );
};

export default UserAvatar;
