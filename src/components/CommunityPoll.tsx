'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Vote,
  PlusCircle,
  X,
  CheckCircle2,
  Lock,
  Sparkles,
  BarChart3,
  Clock,
  Shield,
  Loader2,
} from 'lucide-react';
import { createClient } from '@/lib/supabase';
import type { Profile, Poll, PollVote } from '@/lib/types';

interface CommunityPollProps {
  profile: Profile | null;
  onAuthClick?: () => void;
}

const POLL_MAX_DURATION_MS = 24 * 60 * 60 * 1000; // 24 Hours

export default function CommunityPoll({ profile, onAuthClick }: CommunityPollProps) {
  const [poll, setPoll] = useState<Poll | null>(null);
  const [votes, setVotes] = useState<PollVote[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingVote, setSubmittingVote] = useState(false);
  const [showAdminCreator, setShowAdminCreator] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number } | null>(null);

  // Admin creator form state
  const [newQuestion, setNewQuestion] = useState('');
  const [newOptions, setNewOptions] = useState(['', '', '']);
  const [creatingPoll, setCreatingPoll] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();
  const isAdmin = profile?.role === 'ADMIN';

  // Fetch only active admin poll that is within the 24-hour window
  const fetchPollData = useCallback(async () => {
    try {
      const { data: activePolls, error: pollErr } = await supabase
        .from('polls')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1);

      if (pollErr) throw pollErr;

      const candidate = activePolls?.[0] || null;

      if (candidate) {
        const createdAtTime = new Date(candidate.created_at).getTime();
        const elapsedMs = Date.now() - createdAtTime;

        // Check if within the 24-hour window
        if (elapsedMs < POLL_MAX_DURATION_MS) {
          setPoll(candidate);

          // Fetch associated votes
          const { data: voteData } = await supabase
            .from('poll_votes')
            .select('*')
            .eq('poll_id', candidate.id);

          setVotes(voteData || []);
          return;
        } else {
          // Poll exceeded 24 hours — auto-deactivate in background
          try {
            await supabase
              .from('polls')
              .update({ is_active: false })
              .eq('id', candidate.id);
          } catch {
            // Ignore deactivation warning
          }
        }
      }

      // No active poll within 24h
      setPoll(null);
      setVotes([]);
    } catch (err) {
      console.warn('Poll fetch warning:', err);
      setPoll(null);
      setVotes([]);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // Initial fetch and real-time subscription
  useEffect(() => {
    fetchPollData();

    const channel = supabase
      .channel('polls-live-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'polls' },
        () => fetchPollData()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'poll_votes' },
        () => fetchPollData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchPollData, supabase]);

  // 24-hour remaining countdown timer
  useEffect(() => {
    if (!poll) {
      setTimeLeft(null);
      return;
    }

    const calculateRemaining = () => {
      const createdTime = new Date(poll.created_at).getTime();
      const remainingMs = createdTime + POLL_MAX_DURATION_MS - Date.now();

      if (remainingMs <= 0) {
        setPoll(null);
        setVotes([]);
        setTimeLeft(null);
      } else {
        const hours = Math.floor(remainingMs / (1000 * 60 * 60));
        const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft({ hours, minutes });
      }
    };

    calculateRemaining();
    const interval = setInterval(calculateRemaining, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [poll]);

  // Vote calculation
  const totalVotes = votes.length;
  const userVote = profile ? votes.find((v) => v.user_id === profile.id) : null;
  const userVoteIndex = userVote ? userVote.option_index : null;

  const handleCastVote = async (optionIndex: number) => {
    if (!profile) {
      if (onAuthClick) onAuthClick();
      return;
    }
    if (!profile.phone) {
      setError('Please link your mobile number in My Loyalty Wallet above to cast your vote.');
      return;
    }
    if (!poll || !poll.is_active || submittingVote) return;

    setSubmittingVote(true);

    try {
      const { error: voteErr } = await supabase.from('poll_votes').upsert(
        {
          poll_id: poll.id,
          user_id: profile.id,
          option_index: optionIndex,
          created_at: new Date().toISOString(),
        },
        { onConflict: 'poll_id,user_id' }
      );

      if (voteErr) throw voteErr;

      // Optimistic update
      setVotes((prev) => [
        ...prev.filter((v) => v.user_id !== profile.id),
        {
          id: `opt-${Date.now()}`,
          poll_id: poll.id,
          user_id: profile.id,
          option_index: optionIndex,
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to cast vote';
      setError(msg);
      setTimeout(() => setError(null), 4000);
    } finally {
      setSubmittingVote(false);
    }
  };

  // Admin: Launch new 24-hour live poll
  const handleCreatePoll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || creatingPoll) return;

    const trimmedQ = newQuestion.trim();
    const validOptions = newOptions.map((o) => o.trim()).filter((o) => o.length > 0);

    if (!trimmedQ) {
      setError('Please enter a poll question.');
      return;
    }
    if (validOptions.length < 2) {
      setError('Please provide at least 2 options.');
      return;
    }

    setCreatingPoll(true);
    setError(null);

    try {
      // 1. Deactivate any previous active poll
      await supabase
        .from('polls')
        .update({ is_active: false })
        .eq('is_active', true);

      // 2. Insert new 24-hour poll
      const { data, error: insertErr } = await supabase
        .from('polls')
        .insert({
          question: trimmedQ,
          options: validOptions,
          is_active: true,
          created_by: profile?.id || null,
        })
        .select('*')
        .maybeSingle();

      if (insertErr) throw insertErr;

      setPoll(data);
      setVotes([]);
      setNewQuestion('');
      setNewOptions(['', '', '']);
      setShowAdminCreator(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create poll';
      setError(msg);
    } finally {
      setCreatingPoll(false);
    }
  };

  // Admin: Manually Close active poll
  const handleClosePoll = async () => {
    if (!isAdmin || !poll) return;
    try {
      await supabase
        .from('polls')
        .update({ is_active: false })
        .eq('id', poll.id);

      setPoll(null);
      setVotes([]);
    } catch (err) {
      console.error('Close poll error:', err);
    }
  };

  const handleOptionChange = (idx: number, val: string) => {
    setNewOptions((prev) => {
      const updated = [...prev];
      updated[idx] = val;
      return updated;
    });
  };

  const addOptionField = () => {
    if (newOptions.length < 4) {
      setNewOptions((prev) => [...prev, '']);
    }
  };

  const removeOptionField = (idx: number) => {
    if (newOptions.length > 2) {
      setNewOptions((prev) => prev.filter((_, i) => i !== idx));
    }
  };

  return (
    <section id="community-poll" className="h-full flex flex-col scroll-mt-20">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3.5">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Vote size={18} className="text-neon-green" />
            <span>Community Poll</span>
            {poll?.is_active ? (
              <span className="flex items-center gap-1 text-[9px] font-bold text-neon-green bg-neon-green/15 border border-neon-green/30 px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                <Clock size={10} />
                <span>
                  Live {timeLeft ? `· ${timeLeft.hours}h ${timeLeft.minutes}m left` : '· 24h Poll'}
                </span>
              </span>
            ) : (
              <span className="text-[9px] font-bold text-gray-500 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                No active polls
              </span>
            )}
          </h3>
          <p className="text-[11px] text-gray-400">
            {poll
              ? 'Vote on lounge features · Active for 24 hours'
              : 'Polls appear only when launched by admin'}
          </p>
        </div>

        {/* Admin Toggle Button */}
        {isAdmin && (
          <button
            onClick={() => setShowAdminCreator(!showAdminCreator)}
            className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg bg-gold/15 text-gold border border-gold/30 hover:bg-gold/25 transition-colors cursor-pointer"
          >
            {showAdminCreator ? <X size={12} /> : <PlusCircle size={12} />}
            <span>{showAdminCreator ? 'Cancel' : 'New Poll'}</span>
          </button>
        )}
      </div>

      {/* Error alert */}
      {error && (
        <div className="mb-3 px-3 py-1.5 rounded-xl bg-crimson/15 border border-crimson/40 text-crimson text-xs">
          {error}
        </div>
      )}

      {/* Admin Inline Poll Creator Modal/Card */}
      {isAdmin && showAdminCreator && (
        <motion.form
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleCreatePoll}
          className="mb-4 rounded-2xl glass-card border border-gold/30 p-4 shadow-xl"
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <Shield size={14} className="text-gold" />
              <span className="text-xs font-bold text-gold uppercase tracking-wider">
                Launch 24-Hour Live Poll
              </span>
            </div>
            <span className="text-[10px] text-gray-400 font-mono">
              Auto-closes in 24 hrs
            </span>
          </div>

          <p className="text-[11px] text-gray-400 mb-3">
            This poll will be displayed live to all lounge members for exactly 24 hours.
          </p>

          <label className="block text-[11px] font-semibold text-gray-300 mb-1">
            Poll Question
          </label>
          <input
            type="text"
            required
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            placeholder="e.g. Which PS5 game should we host a tournament for?"
            className="w-full px-3 py-2 text-xs rounded-xl bg-black/60 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-gold mb-3"
          />

          <label className="block text-[11px] font-semibold text-gray-300 mb-1">
            Options (2 to 4)
          </label>
          <div className="space-y-2 mb-3">
            {newOptions.map((opt, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  required={idx < 2}
                  value={opt}
                  onChange={(e) => handleOptionChange(idx, e.target.value)}
                  placeholder={`Option ${idx + 1}`}
                  className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-gold"
                />
                {newOptions.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOptionField(idx)}
                    className="p-1.5 text-gray-500 hover:text-crimson"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-1">
            {newOptions.length < 4 ? (
              <button
                type="button"
                onClick={addOptionField}
                className="text-xs text-gray-400 hover:text-gold flex items-center gap-1 transition-colors"
              >
                <PlusCircle size={12} />
                <span>Add Option</span>
              </button>
            ) : <span />}

            <button
              type="submit"
              disabled={creatingPoll}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gold hover:bg-gold-dim text-brand-bg text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
            >
              {creatingPoll ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
              <span>Launch 24h Live Poll</span>
            </button>
          </div>
        </motion.form>
      )}

      {/* Main Poll Card */}
      <div className="flex-1 rounded-2xl glass-card border border-white/10 p-4 sm:p-5 flex flex-col justify-between shadow-xl backdrop-blur-xl relative overflow-hidden">
        {/* Ambient subtle glow */}
        <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-neon-green/5 blur-3xl pointer-events-none" />

        {!poll ? (
          <div className="h-44 flex flex-col items-center justify-center text-center text-gray-500 text-xs px-4 my-auto">
            <Vote size={28} className="text-gray-600 mb-2 opacity-60" />
            <p className="font-bold text-gray-300 text-sm">No polls yet</p>
            <p className="text-[11px] text-gray-500 mt-1 max-w-xs leading-relaxed">
              Community polls appear only when launched by the admin and remain active for 24 hours.
            </p>
            {isAdmin && !showAdminCreator && (
              <button
                type="button"
                onClick={() => setShowAdminCreator(true)}
                className="mt-3.5 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gold/15 text-gold border border-gold/30 hover:bg-gold/25 transition-all text-xs font-bold cursor-pointer"
              >
                <PlusCircle size={13} />
                <span>Launch a 24h Poll</span>
              </button>
            )}
          </div>
        ) : (
          <>
            <div>
              {/* Poll Question & Header */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="min-w-0">
                  <h4 className="text-sm sm:text-base font-extrabold text-white leading-snug">
                    {poll.question}
                  </h4>
                  {timeLeft && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-neon-green font-mono font-semibold mt-1">
                      <Clock size={10} />
                      <span>Closes in {timeLeft.hours}h {timeLeft.minutes}m</span>
                    </span>
                  )}
                </div>

                {isAdmin && poll.is_active && (
                  <button
                    onClick={handleClosePoll}
                    className="text-[10px] font-bold text-gray-400 hover:text-crimson px-2 py-0.5 rounded border border-white/10 hover:border-crimson/40 transition-colors flex-shrink-0 cursor-pointer"
                  >
                    Close Poll
                  </button>
                )}
              </div>

              {/* Options List with Percentage Bars */}
              <div className="space-y-2.5">
                {poll.options.map((option, idx) => {
                  const optionVotes = votes.filter((v) => v.option_index === idx).length;
                  const percentage = totalVotes > 0 ? Math.round((optionVotes / totalVotes) * 100) : 0;
                  const isSelected = userVoteIndex === idx;

                  return (
                    <button
                      key={idx}
                      onClick={() => handleCastVote(idx)}
                      disabled={!poll.is_active || submittingVote}
                      className={[
                        'relative w-full overflow-hidden rounded-xl p-3 border text-left transition-all duration-300 group',
                        isSelected
                          ? 'border-neon-green/60 shadow-[0_0_15px_rgba(16,185,129,0.15)] bg-neon-green/[0.04]'
                          : 'border-white/10 hover:border-white/20 bg-black/40',
                        poll.is_active ? 'cursor-pointer active:scale-[0.99]' : 'cursor-default',
                      ].join(' ')}
                    >
                      {/* Shimmering Animated Percentage Fill */}
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className={[
                          'absolute inset-0 h-full pointer-events-none opacity-20',
                          isSelected ? 'bg-neon-green' : 'bg-gray-500',
                        ].join(' ')}
                      />

                      {/* Foreground Option Content */}
                      <div className="relative z-10 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className={[
                              'w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors',
                              isSelected
                                ? 'border-neon-green bg-neon-green text-black'
                                : 'border-white/30 group-hover:border-white/60',
                            ].join(' ')}
                          >
                            {isSelected && <CheckCircle2 size={12} strokeWidth={3} />}
                          </div>
                          <span className="text-xs sm:text-sm font-semibold text-white truncate">
                            {option}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0 text-right">
                          <span className="text-[10px] text-gray-400 font-mono">
                            {optionVotes} {optionVotes === 1 ? 'vote' : 'votes'}
                          </span>
                          <span
                            className={[
                              'text-xs font-black font-mono w-9 text-right',
                              isSelected ? 'text-neon-green' : 'text-gray-300',
                            ].join(' ')}
                          >
                            {percentage}%
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer / User Prompt */}
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-gray-500">
              <div className="flex items-center gap-2">
                <BarChart3 size={12} className="text-neon-green" />
                <span>{totalVotes} {totalVotes === 1 ? 'total vote' : 'total votes cast'}</span>
              </div>

              {!profile ? (
                <button
                  onClick={onAuthClick}
                  className="text-gold hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  Sign in to vote
                </button>
              ) : userVoteIndex !== null ? (
                <span className="text-neon-green flex items-center gap-1">
                  <CheckCircle2 size={11} /> Vote registered
                </span>
              ) : (
                <span className="text-gray-400">Click any option to vote</span>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
