'use client';

import { useState } from 'react';
import { Gamepad2, LogOut, User, Shield, Menu, X, Crown, UserPlus } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import type { Profile } from '@/lib/types';
import { getPlayerRank } from '@/lib/ranks';
import { PlayerAvatar } from '@/lib/avatars';

interface HeaderProps {
  profile: Profile | null;
  onAuthClick: (mode?: 'signin' | 'signup') => void;
}

export default function Header({ profile, onAuthClick }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#030306]/85 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-neon-green/10 border border-neon-green/30 flex items-center justify-center shadow-[0_0_12px_rgba(16,185,129,0.2)]">
            <Gamepad2 size={16} className="text-neon-green" />
          </div>
          <div className="leading-tight">
            <h1 className="text-base font-black tracking-wider text-white uppercase leading-none">
              Underground
            </h1>
            <p className="text-[10px] font-bold tracking-widest text-neon-green uppercase leading-none mt-1">
              A Gaming Playstation
            </p>
          </div>
        </div>

        {/* Right side */}
        {profile ? (
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl glass-card border border-white/10 hover:border-neon-green/40 transition-colors"
            >
              <PlayerAvatar
                avatarId={profile.avatar_id}
                name={profile.full_name}
                tier={profile.role === 'ADMIN' ? 'ADMIN' : undefined}
                size="sm"
              />
              <span className="text-xs font-semibold text-white max-w-24 truncate">
                {profile.full_name.split(' ')[0]}
              </span>
              {menuOpen ? (
                <X size={12} className="text-gray-400" />
              ) : (
                <Menu size={12} className="text-gray-400" />
              )}
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 glass-card border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
                <div className="px-3.5 py-3 border-b border-white/10">
                  <p className="text-xs font-bold text-white truncate">
                    {profile.full_name}
                  </p>
                  <p className="text-[11px] text-gray-400 truncate mt-0.5">
                    {profile.phone ? `📞 +91 ${profile.phone}` : (profile.email ? `✉️ ${profile.email}` : '🔒 Phone unlinked')}
                  </p>
                  <div className="mt-2 flex items-center gap-1.5">
                    {(() => {
                      const rank = getPlayerRank(profile.total_spent, profile.role);
                      return (
                        <span
                          className={`inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${rank.colorClasses}`}
                        >
                          {rank.title === 'Lounge Boss' || rank.title === 'Underground Legend' ? (
                            <Crown size={9} fill="currentColor" />
                          ) : (
                            <Shield size={9} />
                          )}
                          <span>{rank.title}</span>
                        </span>
                      );
                    })()}
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold text-crimson hover:bg-crimson/10 transition-colors"
                >
                  <LogOut size={13} />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onAuthClick('signin')}
              className="text-xs font-bold px-3 py-1.5 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={() => onAuthClick('signup')}
              className="text-xs font-bold px-3.5 py-1.5 rounded-xl bg-neon-green/15 border border-neon-green/30 text-neon-green hover:bg-neon-green/25 transition-all shadow-[0_0_15px_rgba(16,185,129,0.15)] flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus size={12} />
              <span>Sign Up</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
