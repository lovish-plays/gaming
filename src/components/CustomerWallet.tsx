'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import {
  Clock,
  Trophy,
  TrendingUp,
  Star,
  ChevronRight,
  QrCode,
  Sparkles,
  Phone,
  ShieldCheck,
} from 'lucide-react';
import { createClient } from '@/lib/supabase';
import type { Profile } from '@/lib/types';

interface CustomerWalletProps {
  initialProfile: Profile;
}

const MILESTONE = 1000; // INR per free hour

export default function CustomerWallet({ initialProfile }: CustomerWalletProps) {
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const supabase = createClient();

  // Subscribe to real-time profile updates (admin adds spend / redeems hours)
  useEffect(() => {
    const channel = supabase
      .channel(`profile-${profile.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${profile.id}`,
        },
        (payload) => {
          setProfile((prev) => ({ ...prev, ...(payload.new as Profile) }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile.id]);

  const progressPct = Math.min((profile.spend_progress / MILESTONE) * 100, 100);
  const remaining = MILESTONE - profile.spend_progress;

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <span>My Loyalty Wallet</span>
          <span className="text-[10px] font-semibold text-gold bg-gold/15 border border-gold/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
            VIP Pass
          </span>
        </h2>
        <span className="text-xs text-gray-500 flex items-center gap-1">
          <ShieldCheck size={12} className="text-neon-green" /> Live Synced
        </span>
      </div>

      <div className="space-y-4">
        {/* ======================================================== */}
        {/* VIP DIGITAL MEMBER QR PASS + BALANCE CARD               */}
        {/* ======================================================== */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden rounded-2xl glass-card border border-gold/40 p-5 shadow-[0_0_35px_rgba(245,158,11,0.12)]"
        >
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-gold/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-44 h-44 rounded-full bg-neon-green/10 blur-3xl pointer-events-none" />

          {/* Member Pass Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gold animate-pulse" />
              <p className="text-[11px] font-bold tracking-[0.2em] text-gold uppercase">
                Underground Digital Pass
              </p>
            </div>
            <span className="text-[10px] font-mono text-gray-500 truncate max-w-[130px]">
              ID: {profile.id.slice(0, 8)}…
            </span>
          </div>

          {/* Layout: QR Code + Free Hours Balance */}
          <div className="flex flex-col sm:flex-row items-center gap-5">
            {/* Scannable High-Contrast QR Code */}
            <div className="flex flex-col items-center flex-shrink-0">
              <div className="relative p-2.5 bg-white rounded-2xl shadow-[0_0_25px_rgba(245,158,11,0.35)] border-2 border-gold/50">
                <QRCodeSVG
                  value={profile.id}
                  size={120}
                  level="H"
                  includeMargin={false}
                  imageSettings={{
                    src: '/favicon.svg',
                    x: undefined,
                    y: undefined,
                    height: 24,
                    width: 24,
                    excavate: true,
                  }}
                />
              </div>
              <div className="mt-2 flex items-center gap-1 text-[10px] font-medium text-gray-400">
                <QrCode size={11} className="text-gold" />
                <span>Scan for Instant Checkout</span>
              </div>
            </div>

            {/* Member Details & Free Hours */}
            <div className="flex-1 w-full flex flex-col justify-between text-center sm:text-left">
              <div>
                <h3 className="text-lg font-black text-white tracking-wide">
                  {profile.full_name}
                </h3>
                <p className="text-xs text-gray-400 flex items-center justify-center sm:justify-start gap-1 mt-0.5">
                  <Phone size={11} className="text-neon-green" />
                  <span>{profile.phone}</span>
                </p>
              </div>

              {/* Free Hours Metric Box */}
              <div className="mt-3 p-3 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
                    Free Hours Available
                  </p>
                  <p className="text-xs text-gray-500">PlayStation or Pool</p>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-black text-gold drop-shadow-[0_0_12px_rgba(245,158,11,0.4)]">
                    {profile.free_hours}
                  </span>
                  <span className="text-gold/70 text-sm font-bold">hrs</span>
                </div>
              </div>

              <p className="mt-2 text-[11px] text-gray-400 italic">
                Show this QR pass or share your phone number at the counter.
              </p>
            </div>
          </div>
        </motion.div>

        {/* ======================================================== */}
        {/* ANIMATED LOYALTY PROGRESS CARD (₹1,000 MILESTONE)        */}
        {/* ======================================================== */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="rounded-2xl glass-card border border-white/10 p-5 shadow-lg"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-neon-green/10 border border-neon-green/20">
                <TrendingUp size={15} className="text-neon-green" />
              </div>
              <div>
                <span className="text-sm font-bold text-white block leading-tight">
                  Next Free Hour Milestone
                </span>
                <span className="text-[10px] text-gray-400">
                  Earn 1 hour for every ₹1,000 spent
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-bold text-white">
                ₹{profile.spend_progress.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-gray-500"> / ₹{MILESTONE.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Shimmering Animated Progress Bar */}
          <div className="relative h-3.5 rounded-full bg-[#070710] overflow-hidden border border-white/10 p-0.5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="relative h-full rounded-full bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.5)] overflow-hidden"
            >
              {/* Shimmer sweep effect */}
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
            </motion.div>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs">
            <p className="text-gray-400">
              {progressPct >= 100 ? (
                <span className="text-neon-green font-semibold flex items-center gap-1">
                  <Sparkles size={12} /> Milestone ready! Claim at counter.
                </span>
              ) : (
                <>
                  Spend{' '}
                  <span className="text-white font-bold">
                    ₹{remaining.toLocaleString('en-IN')}
                  </span>{' '}
                  more to unlock your next hour
                </>
              )}
            </p>
            <span className="font-extrabold text-gold text-xs font-mono">
              {progressPct.toFixed(0)}%
            </span>
          </div>
        </motion.div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl glass-card border border-white/10 p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <Trophy size={14} className="text-gold" />
              <span className="text-xs text-gray-400 font-medium">Lifetime Spend</span>
            </div>
            <p className="text-xl font-black text-white font-mono">
              ₹{profile.total_spent.toLocaleString('en-IN')}
            </p>
            <p className="text-[10px] text-gray-500 mt-0.5">Tracked at register</p>
          </div>

          <div className="rounded-xl glass-card border border-white/10 p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <Star size={14} className="text-neon-green" />
              <span className="text-xs text-gray-400 font-medium">Lifetime Rewards</span>
            </div>
            <p className="text-xl font-black text-white font-mono">
              {Math.floor(profile.total_spent / MILESTONE)} hrs
            </p>
            <p className="text-[10px] text-gray-500 mt-0.5">Total hours earned</p>
          </div>
        </div>

        {/* How It Works Accordion-style Box */}
        <div className="rounded-xl glass-card border border-white/10 p-4">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">
            How Rewards Work
          </p>
          <div className="space-y-2">
            {[
              'Every ₹1,000 you spend earns 1 Free Gaming Hour',
              'Valid on any PlayStation console or pool table',
              'Free hours never expire and accumulate across sessions',
              'Show your QR pass or provide your phone number at the counter',
            ].map((tip, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-gray-400">
                <ChevronRight size={13} className="text-neon-green mt-0.5 flex-shrink-0" />
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
