'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, Flame, RefreshCw, Star, ShieldCheck, Crown, Shield } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import type { TopGamer } from '@/lib/types';
import { getPlayerRank } from '@/lib/ranks';
import { PlayerAvatar } from '@/lib/avatars';

const DEFAULT_GAMERS: TopGamer[] = [
  { rank: 1, id: 'd1', full_name: 'Rahul Sharma', masked_phone: '••••8821', total_spent: 4200, free_hours_unlocked: 4, avatar_id: 'cyber_skull' },
  { rank: 2, id: 'd2', full_name: 'Aman Verma', masked_phone: '••••3190', total_spent: 2800, free_hours_unlocked: 2, avatar_id: 'ps_controller' },
  { rank: 3, id: 'd3', full_name: 'Sahil Kapoor', masked_phone: '••••7742', total_spent: 2100, free_hours_unlocked: 2, avatar_id: 'pool_8ball' },
];

export default function Leaderboard() {
  const [gamers, setGamers] = useState<TopGamer[]>(DEFAULT_GAMERS);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const supabase = createClient();

  const fetchTopGamers = useCallback(async () => {
    try {
      // 1. Try atomic SECURITY DEFINER RPC
      const { data, error } = await supabase.rpc('get_top_gamers');
      if (!error && data && data.length > 0) {
        setGamers(data);
        return;
      }

      // 2. Direct fallback query if RPC not yet run in Supabase SQL editor
      const { data: profiles, error: pError } = await supabase
        .from('profiles')
        .select('id, full_name, phone, total_spent')
        .eq('role', 'CUSTOMER')
        .order('total_spent', { ascending: false })
        .limit(5);

      if (!pError && profiles) {
        const mapped: TopGamer[] = profiles.map((p, idx) => ({
          rank: idx + 1,
          id: p.id,
          full_name: p.full_name,
          masked_phone:
            p.phone && p.phone.length >= 4 ? `••••${p.phone.slice(-4)}` : '••••',
          total_spent: p.total_spent || 0,
          free_hours_unlocked: Math.floor((p.total_spent || 0) / 1000),
        }));
        setGamers(mapped);
      }
    } catch (err) {
      console.warn('Leaderboard fetch warning:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchTopGamers();

    // Subscribe to profile changes to live-update leaderboard
    const channel = supabase
      .channel('leaderboard-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => {
          fetchTopGamers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTopGamers, supabase]);

  const handleManualRefresh = () => {
    setRefreshing(true);
    fetchTopGamers();
  };

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-yellow-300 via-amber-400 to-amber-600 text-black flex items-center justify-center font-black shadow-[0_0_15px_rgba(245,158,11,0.5)]">
            <Trophy size={16} fill="currentColor" />
          </div>
        );
      case 2:
        return (
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-200 via-gray-300 to-slate-400 text-black flex items-center justify-center font-black shadow-[0_0_12px_rgba(226,232,240,0.35)]">
            <Medal size={16} />
          </div>
        );
      case 3:
        return (
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-600 via-yellow-700 to-amber-800 text-white flex items-center justify-center font-black shadow-[0_0_12px_rgba(180,83,9,0.3)]">
            <Award size={16} />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 text-gray-400 flex items-center justify-center font-bold text-xs">
            #{rank}
          </div>
        );
    }
  };

  return (
    <section id="leaderboard" className="mb-10 scroll-mt-20">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Hall of Fame</span>
            <span className="flex items-center gap-1 text-[10px] font-bold text-gold bg-gold/15 border border-gold/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
              <Flame size={11} className="text-gold" />
              Top Gamers
            </span>
          </h2>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Most active Underground cafe players &amp; hours unlocked
          </p>
        </div>

        <button
          onClick={handleManualRefresh}
          className="p-1.5 rounded-lg glass-card border border-white/10 text-gray-400 hover:text-white transition-colors"
          title="Refresh leaderboard"
        >
          <RefreshCw size={13} className={refreshing ? 'animate-spin text-neon-green' : ''} />
        </button>
      </div>

      {/* Leaderboard Table / Cards */}
      <div className="rounded-2xl glass-card border border-white/10 overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-8 text-center text-xs text-gray-400">
            <RefreshCw size={20} className="animate-spin text-neon-green mx-auto mb-2" />
            Loading Top Gamers…
          </div>
        ) : gamers.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-400">
            <Trophy size={28} className="text-gold/50 mx-auto mb-2" />
            <p className="font-semibold text-gray-300">No ranked gamers yet</p>
            <p className="text-[11px] text-gray-500 mt-1">
              Play pool or PS5 and unlock free hours to climb the Hall of Fame!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {gamers.map((gamer, index) => {
              const isFirst = gamer.rank === 1;
              const isSecond = gamer.rank === 2;
              const isThird = gamer.rank === 3;

              const gamerRank = getPlayerRank(gamer.total_spent);

              return (
                <motion.div
                  key={gamer.id || index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.06 }}
                  className={[
                    'p-3.5 sm:p-4 flex items-center justify-between gap-3 transition-colors',
                    isFirst
                      ? 'bg-gradient-to-r from-amber-500/10 via-transparent to-transparent'
                      : isSecond
                      ? 'bg-gradient-to-r from-slate-400/5 via-transparent to-transparent'
                      : isThird
                      ? 'bg-gradient-to-r from-amber-700/5 via-transparent to-transparent'
                      : 'hover:bg-white/[0.02]',
                  ].join(' ')}
                >
                  {/* Rank & Profile Info */}
                  <div className="flex items-center gap-3 min-w-0">
                    {getRankBadge(gamer.rank)}
                    <PlayerAvatar
                      avatarId={gamer.avatar_id}
                      name={gamer.full_name}
                      tier={gamerRank.title}
                      size="md"
                    />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-sm font-bold text-white truncate">
                          {gamer.full_name}
                        </span>
                        <span
                          className={`inline-flex items-center gap-0.5 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded border ${gamerRank.colorClasses}`}
                        >
                          {gamerRank.title === 'Underground Legend' ? (
                            <Crown size={9} fill="currentColor" />
                          ) : (
                            <Shield size={9} />
                          )}
                          <span>{gamerRank.title}</span>
                        </span>
                        {isFirst && (
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-gold/20 text-gold border border-gold/40">
                            VIP #1
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-gray-500">
                        {gamer.masked_phone}
                      </span>
                    </div>
                  </div>

                  {/* Loyalty Stats */}
                  <div className="flex items-center gap-3 sm:gap-6 flex-shrink-0 text-right">
                    <div>
                      <span className="text-xs sm:text-sm font-black text-gold block">
                        {gamer.free_hours_unlocked} hrs
                      </span>
                      <span className="text-[9px] sm:text-[10px] uppercase text-gray-500 block">
                        Unlocked
                      </span>
                    </div>

                    <div className="hidden sm:block">
                      <span className="text-xs sm:text-sm font-bold text-gray-300 block">
                        ₹{gamer.total_spent.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[9px] uppercase text-gray-500 block">
                        Total Spent
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Footer note */}
        <div className="p-3 bg-black/40 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-500 px-4">
          <span className="flex items-center gap-1">
            <ShieldCheck size={12} className="text-neon-green" />
            Verified Customer Loyalty Rankings
          </span>
          <span>Updates in Realtime</span>
        </div>
      </div>
    </section>
  );
}
