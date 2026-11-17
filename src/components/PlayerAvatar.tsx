'use client';

import React from 'react';
import { getAvatarById } from '@/lib/avatars';

export interface PlayerAvatarProps {
  avatarId?: string | null;
  name?: string;
  tier?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
  showTierRing?: boolean;
}

export default function PlayerAvatar({
  avatarId,
  name = '',
  tier,
  size = 'md',
  className = '',
  onClick,
  showTierRing = true,
}: PlayerAvatarProps) {
  const avatar = getAvatarById(avatarId, name);
  const CartoonComponent = avatar.CartoonComponent;

  const isImageUrl =
    typeof avatarId === 'string' &&
    (avatarId.startsWith('http://') ||
      avatarId.startsWith('https://') ||
      avatarId.startsWith('data:image/'));

  // Size dimensions
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-9 h-9',
    lg: 'w-14 h-14 sm:w-16 sm:h-16',
    xl: 'w-20 h-20',
  }[size];

  // Ring and glow based on player's Rank Tier
  let tierRingClass = 'ring-1 ring-zinc-700/50';
  if (showTierRing && tier) {
    const t = tier.toLowerCase();
    if (t.includes('boss') || t.includes('admin')) {
      tierRingClass = 'ring-2 ring-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.5)]';
    } else if (t.includes('legend')) {
      tierRingClass = 'ring-2 ring-amber-400 shadow-[0_0_14px_rgba(245,158,11,0.55)]';
    } else if (t.includes('elite')) {
      tierRingClass = 'ring-2 ring-violet-500 shadow-[0_0_12px_rgba(139,92,246,0.45)]';
    } else if (t.includes('pro')) {
      tierRingClass = 'ring-2 ring-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.45)]';
    } else {
      tierRingClass = 'ring-1 ring-zinc-500/50';
    }
  }

  return (
    <div
      onClick={onClick}
      className={[
        'relative inline-flex items-center justify-center flex-shrink-0 select-none rounded-full overflow-hidden transition-transform duration-200',
        sizeClasses,
        tierRingClass,
        onClick ? 'cursor-pointer hover:scale-105 active:scale-95' : '',
        className,
      ].join(' ')}
      title={`${name ? `${name} — ` : ''}${avatar.name} (${avatar.tagline})`}
    >
      {isImageUrl ? (
        <img
          src={avatarId!}
          alt={name || avatar.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : CartoonComponent ? (
        <CartoonComponent className="w-full h-full object-contain pointer-events-none" />
      ) : (
        <div
          className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${avatar.bgGradient}`}
        >
          <avatar.Icon className={`w-1/2 h-1/2 ${avatar.iconColor}`} />
        </div>
      )}
    </div>
  );
}
