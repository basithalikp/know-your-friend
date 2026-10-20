'use client';

import React, { useState } from 'react';
import { AvatarConfig } from '@/types/quiz';
import { getDiceBearUrl } from '@/lib/dicebear';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

export interface NeuAvatarProps {
  avatar?: AvatarConfig;
  fallbackSeed?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'card';
  variant?: 'inset' | 'flat' | 'float';
  className?: string;
  alt?: string;
}

const sizeMap = {
  xs: { box: 'w-6 h-6', img: 'w-4 h-4' },
  sm: { box: 'w-8 h-8', img: 'w-6 h-6' },
  md: { box: 'w-10 h-10', img: 'w-7 h-7' },
  lg: { box: 'w-14 h-14', img: 'w-10 h-10' },
  xl: { box: 'w-20 h-20', img: 'w-14 h-14' },
  '2xl': { box: 'w-28 h-28 sm:w-32 sm:h-32', img: 'w-20 h-20 sm:w-24 sm:h-24' },
  card: { box: 'w-20 h-20 sm:w-24 sm:h-24', img: 'w-14 h-14 sm:w-16 sm:h-16' },
};

const variantStyleMap = {
  inset: 'neu-pressed border border-white/40 shadow-inner',
  flat: 'neu-small border border-white/60 shadow-sm',
  float: 'neu-float border border-white/80 shadow-md',
};

export const NeuAvatar: React.FC<NeuAvatarProps> = ({
  avatar,
  fallbackSeed = 'friend',
  size = 'md',
  variant = 'flat',
  className,
  alt = 'Avatar',
}) => {
  const [loaded, setLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const url = getDiceBearUrl(avatar, fallbackSeed);
  const dims = sizeMap[size] || sizeMap.md;
  const variantClass = variantStyleMap[variant] || variantStyleMap.flat;

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center rounded-2xl overflow-hidden shrink-0 transition-transform duration-200 select-none bg-slate-100/70',
        dims.box,
        variantClass,
        className
      )}
      title={avatar ? `${avatar.style}: ${avatar.seed}` : 'Avatar'}
    >
      {/* Background subtle sheen */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none rounded-2xl" />

      {/* Loading Skeleton */}
      {!loaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center animate-pulse bg-slate-200/50">
          <Sparkles className="w-3.5 h-3.5 text-slate-400" />
        </div>
      )}

      {/* DiceBear SVG */}
      {!hasError ? (
        // Using standard img tag with optimized loading for external SVG avatar
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={alt}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setHasError(true)}
          className={cn(
            'object-contain transition-opacity duration-300 relative z-10',
            dims.img,
            loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          )}
        />
      ) : (
        <span className="text-xs font-bold text-slate-500 relative z-10">
          {avatar?.seed?.slice(0, 2).toUpperCase() || '✨'}
        </span>
      )}
    </div>
  );
};
