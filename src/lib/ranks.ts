export type RankTitle = 'Rookie' | 'Pro' | 'Elite' | 'Underground Legend' | 'Lounge Boss';

export interface RankTierInfo {
  title: RankTitle;
  badgeText: string;
  colorClasses: string;
  glowClasses: string;
  nextTierName: RankTitle | null;
  amountToNext: number;
  progressPercent: number;
  minSpend: number;
  maxSpend: number;
}

/**
 * Returns dynamic rank tier information based on total spend in INR or Admin role.
 */
export function getPlayerRank(totalSpent: number = 0, role?: string): RankTierInfo {
  const spent = Math.max(0, Math.floor(totalSpent || 0));

  // Lounge Boss (Admin)
  if (role === 'ADMIN') {
    return {
      title: 'Lounge Boss',
      badgeText: 'BOSS',
      colorClasses: 'border-rose-500/60 bg-gradient-to-r from-rose-500/20 via-rose-600/20 to-amber-500/20 text-rose-300 shadow-[0_0_14px_rgba(244,63,94,0.35)]',
      glowClasses: 'shadow-[0_0_14px_rgba(244,63,94,0.35)]',
      nextTierName: null,
      amountToNext: 0,
      progressPercent: 100,
      minSpend: 0,
      maxSpend: Infinity,
    };
  }

  // Tier 1: Rookie (₹0 - ₹999)
  if (spent < 1000) {
    const amountToNext = 1000 - spent;
    const progressPercent = Math.min(Math.max((spent / 1000) * 100, 0), 100);
    return {
      title: 'Rookie',
      badgeText: 'ROOKIE',
      colorClasses: 'border-zinc-500/40 bg-zinc-500/10 text-zinc-300',
      glowClasses: '',
      nextTierName: 'Pro',
      amountToNext,
      progressPercent,
      minSpend: 0,
      maxSpend: 1000,
    };
  }

  // Tier 2: Pro (₹1,000 - ₹2,999)
  if (spent < 3000) {
    const amountToNext = 3000 - spent;
    const progressPercent = Math.min(Math.max(((spent - 1000) / 2000) * 100, 0), 100);
    return {
      title: 'Pro',
      badgeText: 'PRO',
      colorClasses: 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.25)]',
      glowClasses: 'shadow-[0_0_12px_rgba(16,185,129,0.25)]',
      nextTierName: 'Elite',
      amountToNext,
      progressPercent,
      minSpend: 1000,
      maxSpend: 3000,
    };
  }

  // Tier 3: Elite (₹3,000 - ₹4,999)
  if (spent < 5000) {
    const amountToNext = 5000 - spent;
    const progressPercent = Math.min(Math.max(((spent - 3000) / 2000) * 100, 0), 100);
    return {
      title: 'Elite',
      badgeText: 'ELITE',
      colorClasses: 'border-violet-500/50 bg-violet-500/15 text-violet-300 shadow-[0_0_14px_rgba(139,92,246,0.3)]',
      glowClasses: 'shadow-[0_0_14px_rgba(139,92,246,0.3)]',
      nextTierName: 'Underground Legend',
      amountToNext,
      progressPercent,
      minSpend: 3000,
      maxSpend: 5000,
    };
  }

  // Tier 4: Underground Legend (₹5,000+)
  return {
    title: 'Underground Legend',
    badgeText: 'LEGEND',
    colorClasses: 'border-amber-400/60 bg-gradient-to-r from-amber-500/20 via-yellow-400/20 to-amber-500/20 text-amber-300 shadow-[0_0_18px_rgba(245,158,11,0.35)]',
    glowClasses: 'shadow-[0_0_18px_rgba(245,158,11,0.35)]',
    nextTierName: null,
    amountToNext: 0,
    progressPercent: 100,
    minSpend: 5000,
    maxSpend: 5000,
  };
}

/**
 * Helper to get styling attributes given a rank title string.
 */
export function getRankFromTitle(tierTitle?: string): RankTierInfo {
  const normalized = (tierTitle || '').toLowerCase();
  if (normalized.includes('boss') || normalized.includes('admin')) {
    return getPlayerRank(0, 'ADMIN');
  }
  if (normalized.includes('legend')) {
    return getPlayerRank(5000);
  }
  if (normalized.includes('elite')) {
    return getPlayerRank(3500);
  }
  if (normalized.includes('pro')) {
    return getPlayerRank(1500);
  }
  return getPlayerRank(0);
}
