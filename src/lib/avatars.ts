import React from 'react';
import {
  Crown,
  Gamepad2,
  Heart,
  Ghost,
  Bot,
  Glasses,
  Flame,
  CircleDot,
  Crosshair,
  Sparkles,
  Shield,
  Zap,
  LucideIcon,
} from 'lucide-react';
import {
  CARTOON_AVATAR_COMPONENTS,
  AvatarLudoKing,
  AvatarProGamer,
  AvatarGamerQueen,
  AvatarShadowNinja,
  AvatarMechaBot,
  AvatarStreetHustler,
  AvatarVikingWarrior,
  AvatarCyberSkull,
  AvatarPoolHustler,
  AvatarInfernoDragon,
  AvatarSynthwavePunk,
  AvatarTacticalSniper,
} from './cartoonAvatars';

export interface GamingAvatar {
  id: string;
  name: string;
  tagline: string;
  Icon: LucideIcon;
  CartoonComponent: React.FC<{ className?: string }>;
  bgGradient: string;
  borderColor: string;
  glowClass: string;
  iconColor: string;
}

export const GAMING_AVATARS: GamingAvatar[] = [
  {
    id: 'crown_king',
    name: 'Ludo King',
    tagline: 'The Royal Maharaja',
    Icon: Crown,
    CartoonComponent: AvatarLudoKing,
    bgGradient: 'from-amber-950 via-yellow-950 to-black',
    borderColor: 'border-amber-400/70',
    glowClass: 'shadow-[0_0_14px_rgba(245,158,11,0.4)]',
    iconColor: 'text-amber-300',
  },
  {
    id: 'ps_controller',
    name: 'Pro Gamer',
    tagline: 'DualSense Ace',
    Icon: Gamepad2,
    CartoonComponent: AvatarProGamer,
    bgGradient: 'from-emerald-950 via-zinc-900 to-black',
    borderColor: 'border-emerald-500/60',
    glowClass: 'shadow-[0_0_12px_rgba(16,185,129,0.35)]',
    iconColor: 'text-emerald-400',
  },
  {
    id: 'gamer_girl',
    name: 'Gamer Queen',
    tagline: 'Cat-Ear Headset Star',
    Icon: Heart,
    CartoonComponent: AvatarGamerQueen,
    bgGradient: 'from-fuchsia-950 via-pink-950 to-black',
    borderColor: 'border-pink-500/60',
    glowClass: 'shadow-[0_0_12px_rgba(236,72,153,0.35)]',
    iconColor: 'text-pink-400',
  },
  {
    id: 'ninja_ghost',
    name: 'Shadow Ninja',
    tagline: 'Stealth Shinobi',
    Icon: Ghost,
    CartoonComponent: AvatarShadowNinja,
    bgGradient: 'from-indigo-950 via-zinc-900 to-black',
    borderColor: 'border-indigo-500/60',
    glowClass: 'shadow-[0_0_12px_rgba(99,102,241,0.35)]',
    iconColor: 'text-indigo-400',
  },
  {
    id: 'mecha_bot',
    name: 'Mecha Cyborg',
    tagline: 'Titanium Android',
    Icon: Bot,
    CartoonComponent: AvatarMechaBot,
    bgGradient: 'from-cyan-950 via-zinc-900 to-black',
    borderColor: 'border-cyan-500/60',
    glowClass: 'shadow-[0_0_12px_rgba(6,182,212,0.35)]',
    iconColor: 'text-cyan-400',
  },
  {
    id: 'urban_hustler',
    name: 'Street Hustler',
    tagline: 'Shades & Gold Chain',
    Icon: Glasses,
    CartoonComponent: AvatarStreetHustler,
    bgGradient: 'from-zinc-900 via-zinc-950 to-black',
    borderColor: 'border-yellow-400/60',
    glowClass: 'shadow-[0_0_12px_rgba(234,179,8,0.35)]',
    iconColor: 'text-yellow-400',
  },
  {
    id: 'viking_warrior',
    name: 'Barbarian Chief',
    tagline: 'Viking Horns & Beard',
    Icon: Shield,
    CartoonComponent: AvatarVikingWarrior,
    bgGradient: 'from-orange-950 via-slate-900 to-black',
    borderColor: 'border-orange-500/60',
    glowClass: 'shadow-[0_0_12px_rgba(249,115,22,0.35)]',
    iconColor: 'text-orange-400',
  },
  {
    id: 'cyber_skull',
    name: 'Cyber Reaper',
    tagline: 'Neon Phantom Skull',
    Icon: Flame,
    CartoonComponent: AvatarCyberSkull,
    bgGradient: 'from-rose-950 via-zinc-900 to-black',
    borderColor: 'border-rose-500/60',
    glowClass: 'shadow-[0_0_12px_rgba(244,63,94,0.35)]',
    iconColor: 'text-rose-400',
  },
  {
    id: 'pool_8ball',
    name: '8-Ball Hustler',
    tagline: 'Billiards Shark',
    Icon: CircleDot,
    CartoonComponent: AvatarPoolHustler,
    bgGradient: 'from-teal-950 via-zinc-900 to-black',
    borderColor: 'border-teal-500/60',
    glowClass: 'shadow-[0_0_12px_rgba(20,184,166,0.35)]',
    iconColor: 'text-teal-300',
  },
  {
    id: 'dragon_fire',
    name: 'Inferno Dragon',
    tagline: 'Fiery Champion',
    Icon: Flame,
    CartoonComponent: AvatarInfernoDragon,
    bgGradient: 'from-amber-950 via-red-950 to-black',
    borderColor: 'border-orange-500/60',
    glowClass: 'shadow-[0_0_12px_rgba(249,115,22,0.35)]',
    iconColor: 'text-orange-400',
  },
  {
    id: 'visor_punk',
    name: 'Synthwave Punk',
    tagline: 'Neon Retro Mohawk',
    Icon: Zap,
    CartoonComponent: AvatarSynthwavePunk,
    bgGradient: 'from-pink-950 via-purple-950 to-black',
    borderColor: 'border-fuchsia-500/60',
    glowClass: 'shadow-[0_0_12px_rgba(217,70,239,0.35)]',
    iconColor: 'text-fuchsia-400',
  },
  {
    id: 'laser_crosshair',
    name: 'Tactical Sniper',
    tagline: 'Night Vision Spec-Ops',
    Icon: Crosshair,
    CartoonComponent: AvatarTacticalSniper,
    bgGradient: 'from-emerald-950 via-zinc-900 to-black',
    borderColor: 'border-green-500/60',
    glowClass: 'shadow-[0_0_12px_rgba(34,197,94,0.35)]',
    iconColor: 'text-green-400',
  },
];

/**
 * Deterministically pick an avatar given a player's name if none is explicitly set
 */
export function getDeterministicAvatar(name: string = ''): GamingAvatar {
  if (!name) return GAMING_AVATARS[1]; // default to Pro Gamer
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % GAMING_AVATARS.length;
  return GAMING_AVATARS[index];
}

/**
 * Resolves avatar object by id, falling back to deterministic name lookup
 */
export function getAvatarById(avatarId?: string | null, name: string = ''): GamingAvatar {
  if (avatarId) {
    const found = GAMING_AVATARS.find((a) => a.id === avatarId);
    if (found) return found;

    // Check if component exists in cartoon map for legacy or custom ids
    if (CARTOON_AVATAR_COMPONENTS[avatarId]) {
      return {
        id: avatarId,
        name: avatarId.replace(/_/g, ' '),
        tagline: 'Gaming Legend',
        Icon: Sparkles,
        CartoonComponent: CARTOON_AVATAR_COMPONENTS[avatarId],
        bgGradient: 'from-zinc-900 to-black',
        borderColor: 'border-zinc-500/50',
        glowClass: 'shadow-[0_0_10px_rgba(255,255,255,0.2)]',
        iconColor: 'text-white',
      };
    }
  }
  return getDeterministicAvatar(name);
}

export { default as PlayerAvatar } from '@/components/PlayerAvatar';
export type { PlayerAvatarProps } from '@/components/PlayerAvatar';
