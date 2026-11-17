'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import {
  Trophy,
  TrendingUp,
  Star,
  ChevronRight,
  QrCode,
  Sparkles,
  Phone,
  ShieldCheck,
  Shield,
  Crown,
  X,
  Lock,
  Mail,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Loader2,
  User,
} from 'lucide-react';
import { createClient } from '@/lib/supabase';
import type { Profile } from '@/lib/types';
import { getPlayerRank } from '@/lib/ranks';
import { PlayerAvatar, GAMING_AVATARS } from '@/lib/avatars';

interface CustomerWalletProps {
  initialProfile: Profile;
  onProfileUpdate?: (updated: Profile) => void;
}

const MILESTONE = 1000; // INR per free hour

export default function CustomerWallet({ initialProfile, onProfileUpdate }: CustomerWalletProps) {
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [updatingAvatar, setUpdatingAvatar] = useState(false);

  // Phone linking gate state
  const [phoneInput, setPhoneInput] = useState('');
  const [nameInput, setNameInput] = useState(initialProfile.full_name || '');
  const [linkingPhone, setLinkingPhone] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [phoneSuccess, setPhoneSuccess] = useState<string | null>(null);

  const supabase = createClient();

  // Keep state synced with parent prop updates
  useEffect(() => {
    setProfile(initialProfile);
    if (initialProfile.full_name) setNameInput(initialProfile.full_name);
  }, [initialProfile]);

  // Handle avatar update
  const handleSelectAvatar = async (avatarId: string) => {
    setUpdatingAvatar(true);
    try {
      setProfile((prev) => ({ ...prev, avatar_id: avatarId }));
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_id: avatarId })
        .eq('id', profile.id);
      if (error) console.error('Failed to update avatar:', error);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingAvatar(false);
      setShowAvatarPicker(false);
    }
  };

  // Step 3: Link phone permanently to email
  const handleLinkPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError(null);
    setPhoneSuccess(null);

    const clean = phoneInput.replace(/\D/g, '');
    if (clean.length !== 10) {
      setPhoneError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    setLinkingPhone(true);
    try {
      const { data, error } = await supabase.rpc('link_phone_to_profile', {
        p_phone: clean,
        p_full_name: nameInput.trim() || undefined,
      });

      if (error) throw error;

      const updated = data as Profile;
      setProfile(updated);
      setPhoneSuccess('Mobile number permanently locked and linked to your email!');
      if (onProfileUpdate) onProfileUpdate(updated);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to link phone number.';
      setPhoneError(msg);
    } finally {
      setLinkingPhone(false);
    }
  };

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
          const updated = { ...profile, ...(payload.new as Profile) };
          setProfile(updated);
          if (onProfileUpdate) onProfileUpdate(updated);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile.id]);

  const progressPct = Math.min((profile.spend_progress / MILESTONE) * 100, 100);
  const remaining = MILESTONE - profile.spend_progress;
  const rank = getPlayerRank(profile.total_spent, profile.role);

  return (
    <section id="loyalty-wallet" className="mb-8 scroll-mt-20">
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
        {/* STEP 3: MANDATORY 1-TIME PHONE NUMBER LINKING GATE       */}
        {/* ======================================================== */}
        {!profile.phone ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl glass-card border border-neon-green/40 p-6 sm:p-7 shadow-[0_0_40px_rgba(16,185,129,0.15)] relative overflow-hidden backdrop-blur-2xl"
          >
            {/* Ambient Background Glow */}
            <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-neon-green/10 blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-neon-green/15 border border-neon-green/30 flex items-center justify-center text-neon-green shadow-[0_0_15px_rgba(16,185,129,0.25)]">
                  <Lock size={19} />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white tracking-wide">
                    Link Your Mobile Number
                  </h3>
                  <p className="text-[10px] sm:text-xs text-neon-green font-semibold uppercase tracking-wider">
                    One-Time Permanent Account Lock
                  </p>
                </div>
              </div>

              {profile.email && (
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                  <CheckCircle2 size={12} /> {profile.email}
                </span>
              )}
            </div>

            {/* Mobile Verified Email pill */}
            {profile.email && (
              <div className="sm:hidden mb-4 inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
                <CheckCircle2 size={13} />
                <span>Verified: {profile.email}</span>
              </div>
            )}

            <p className="text-xs text-gray-300 leading-relaxed mb-4">
              To activate your <strong>Personal QR Member Pass</strong>, earn free gaming hours, and join live lounge chat, link your 10-digit mobile number.
            </p>

            {/* Permanent Lock Warning Banner */}
            <div className="mb-5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-300">
              <AlertTriangle size={16} className="mt-0.5 flex-shrink-0 text-amber-400" />
              <div className="leading-snug">
                <p className="font-bold text-amber-300">Permanent 1-to-1 Security Binding</p>
                <p className="text-[11px] text-amber-300/80 mt-0.5">
                  Once linked, this phone number cannot be changed, swapped, or linked to any other email account.
                </p>
              </div>
            </div>

            {/* Error / Success Feedback */}
            {phoneError && (
              <div className="mb-4 p-3 rounded-xl bg-crimson/15 border border-crimson/40 flex items-start gap-2 text-xs text-crimson">
                <AlertCircle size={15} className="mt-0.5 flex-shrink-0" />
                <span className="font-semibold leading-relaxed">{phoneError}</span>
              </div>
            )}

            {phoneSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-neon-green/15 border border-neon-green/30 flex items-start gap-2 text-xs text-neon-green">
                <CheckCircle2 size={15} className="mt-0.5 flex-shrink-0" />
                <span className="font-semibold leading-relaxed">{phoneSuccess}</span>
              </div>
            )}

            {/* Phone Link Form */}
            <form onSubmit={handleLinkPhone} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  10-Digit Mobile Number
                </label>
                <div className="flex items-center gap-2">
                  <span className="px-3.5 py-2.5 rounded-xl bg-[#080811] border border-white/10 text-xs font-bold text-gray-400 font-mono">
                    +91
                  </span>
                  <div className="relative flex-1">
                    <Phone
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"
                    />
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, ''))}
                      placeholder="9876543210"
                      className="w-full bg-[#080811] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-neon-green focus:ring-1 focus:ring-neon-green/30 transition-all font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  Confirm Gamer Name
                </label>
                <div className="relative">
                  <User
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"
                  />
                  <input
                    type="text"
                    required
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="Your Full Name / Handle"
                    className="w-full bg-[#080811] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-neon-green focus:ring-1 focus:ring-neon-green/30 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={linkingPhone || phoneInput.replace(/\D/g, '').length !== 10}
                className="w-full py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider bg-neon-green text-black hover:bg-neon-green/90 active:scale-[0.99] transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {linkingPhone ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Binding &amp; Locking Mobile…</span>
                  </>
                ) : (
                  <>
                    <Lock size={15} />
                    <span>Lock &amp; Link Phone Number</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        ) : (
          <>
            {/* VIP DIGITAL MEMBER QR PASS + BALANCE CARD */}
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
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
                      <div className="relative group">
                        <PlayerAvatar
                          avatarId={profile.avatar_id}
                          name={profile.full_name}
                          tier={rank.title}
                          size="lg"
                          onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                        />
                        <button
                          type="button"
                          onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                          className="absolute -bottom-1 -right-1 p-1 rounded-full bg-black/90 border border-white/20 text-neon-green hover:bg-neon-green hover:text-black transition-colors shadow-lg cursor-pointer"
                          title="Change Gaming Avatar"
                        >
                          <Sparkles size={11} />
                        </button>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                          <h3 className="text-lg font-black text-white tracking-wide truncate">
                            {profile.full_name}
                          </h3>
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${rank.colorClasses}`}
                          >
                            {rank.title === 'Underground Legend' || rank.title === 'Lounge Boss' ? (
                              <Crown size={10} fill="currentColor" />
                            ) : (
                              <Shield size={10} />
                            )}
                            <span>{rank.title}</span>
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-1">
                          <p className="text-xs text-gray-300 flex items-center gap-1 font-mono">
                            <Phone size={11} className="text-neon-green" />
                            <span>+91 {profile.phone}</span>
                          </p>
                          {profile.email && (
                            <p className="text-[11px] text-gray-400 flex items-center gap-1 truncate max-w-[170px]">
                              <Mail size={11} className="text-gray-500" />
                              <span className="truncate">{profile.email}</span>
                            </p>
                          )}
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-neon-green bg-neon-green/10 border border-neon-green/30 px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                            <Lock size={9} /> Verified 1-to-1
                          </span>
                        </div>

                        <div className="mt-1 flex items-center justify-center sm:justify-start">
                          <button
                            type="button"
                            onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                            className="text-[10px] font-semibold text-neon-green hover:underline cursor-pointer flex items-center gap-1"
                          >
                            <Sparkles size={10} />
                            <span>Change Avatar</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Avatar Picker Popover Grid */}
                    {showAvatarPicker && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -6 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="mt-3 p-3 rounded-2xl bg-[#090912]/95 border border-neon-green/30 backdrop-blur-xl shadow-2xl"
                      >
                        <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-white/10">
                          <span className="text-xs font-bold text-white flex items-center gap-1.5">
                            <Sparkles size={12} className="text-neon-green" />
                            Choose Your Gaming Avatar
                          </span>
                          <button
                            type="button"
                            onClick={() => setShowAvatarPicker(false)}
                            className="text-gray-400 hover:text-white p-0.5 cursor-pointer"
                          >
                            <X size={13} />
                          </button>
                        </div>
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 sm:gap-2.5">
                          {GAMING_AVATARS.map((av) => {
                            const isSelected = (profile.avatar_id || 'ps_controller') === av.id;
                            return (
                              <button
                                key={av.id}
                                type="button"
                                onClick={() => handleSelectAvatar(av.id)}
                                disabled={updatingAvatar}
                                className={`flex flex-col items-center p-1.5 rounded-xl border transition-all cursor-pointer ${
                                  isSelected
                                    ? 'border-neon-green bg-neon-green/20 ring-2 ring-neon-green/50 scale-105 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                                    : 'border-white/10 hover:border-white/30 bg-black/40 hover:bg-white/5'
                                }`}
                                title={`${av.name} — ${av.tagline}`}
                              >
                                <PlayerAvatar
                                  avatarId={av.id}
                                  name={profile.full_name}
                                  size="md"
                                  showTierRing={false}
                                />
                                <span className="text-[9px] font-bold text-gray-300 mt-1 truncate max-w-[60px] text-center">
                                  {av.name}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
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
                      more to unlock 1 Free Hour
                    </>
                  )}
                </p>
                <span className="font-extrabold text-gold text-xs font-mono">
                  {progressPct.toFixed(0)}%
                </span>
              </div>

              {/* ======================================================== */}
              {/* DYNAMIC GAMER RANK PROGRESSION TRACKER                   */}
              {/* ======================================================== */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg border ${rank.colorClasses}`}>
                      {rank.title === 'Underground Legend' || rank.title === 'Lounge Boss' ? (
                        <Crown size={13} fill="currentColor" />
                      ) : (
                        <Shield size={13} />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white">Rank Tier:</span>
                        <span
                          className={`text-[10px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded border ${rank.colorClasses}`}
                        >
                          {rank.title}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-400">
                        Lifetime Spend: ₹{profile.total_spent.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {rank.nextTierName && (
                    <div className="text-right">
                      <span className="text-[10px] text-gray-400 block">Next Tier</span>
                      <span className="text-xs font-bold text-white">{rank.nextTierName}</span>
                    </div>
                  )}
                </div>

                {/* Rank Progression Bar */}
                <div className="relative h-2 rounded-full bg-[#070710] overflow-hidden border border-white/10">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${rank.progressPercent}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className={`h-full rounded-full ${
                      rank.title === 'Underground Legend' || rank.title === 'Lounge Boss'
                        ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500'
                        : rank.title === 'Elite'
                        ? 'bg-gradient-to-r from-violet-500 to-purple-400'
                        : rank.title === 'Pro'
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                        : 'bg-gradient-to-r from-zinc-500 to-zinc-400'
                    }`}
                  />
                </div>

                <div className="mt-2 flex items-center justify-between text-[11px]">
                  {rank.nextTierName ? (
                    <p className="text-gray-400">
                      Spend{' '}
                      <span className="text-white font-bold">
                        ₹{rank.amountToNext.toLocaleString('en-IN')}
                      </span>{' '}
                      more to rank up to{' '}
                      <span className="text-white font-semibold uppercase">{rank.nextTierName}</span>
                    </p>
                  ) : (
                    <p className="text-amber-400 font-semibold flex items-center gap-1">
                      <Crown size={12} fill="currentColor" /> Max Rank Achieved! Underground Legend status.
                    </p>
                  )}
                  <span className="font-mono text-gray-400 text-[10px]">
                    {rank.progressPercent.toFixed(0)}%
                  </span>
                </div>
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
                  {Math.floor(profile.total_spent / 1000)} hrs
                </p>
                <p className="text-[10px] text-gray-500 mt-0.5">Unlocked so far</p>
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
          </>
        )}
      </div>
    </section>
  );
}
