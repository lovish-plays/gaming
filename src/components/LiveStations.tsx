'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Monitor, Gamepad2, Wifi, WifiOff, RefreshCw, Zap } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import type { Station, Profile } from '@/lib/types';

interface LiveStationsProps {
  profile: Profile | null;
}

export default function LiveStations({ profile }: LiveStationsProps) {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();
  const isAdmin = profile?.role === 'ADMIN';

  const fetchStations = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('stations')
        .select('*')
        .order('name');
      if (error) throw error;
      setStations(data || []);
      setError(null);
    } catch (err) {
      setError('Failed to load stations. Please refresh.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchStations();

    const channel = supabase
      .channel('stations-realtime')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'stations' },
        (payload) => {
          setStations((prev) =>
            prev.map((s) =>
              s.id === payload.new.id ? { ...s, ...(payload.new as Station) } : s
            )
          );
        }
      )
      .subscribe((status) => {
        setConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchStations, supabase]);

  const handleToggle = async (station: Station) => {
    if (!isAdmin || toggling) return;
    setToggling(station.id);
    try {
      const { error } = await supabase.rpc('toggle_station_status', {
        p_station_id: station.id,
      });
      if (error) throw error;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Toggle failed';
      setError(msg);
      setTimeout(() => setError(null), 4000);
    } finally {
      setToggling(null);
    }
  };

  const getStationIcon = (type: Station['type']) => {
    return type === 'CONSOLE' ? Gamepad2 : Monitor;
  };

  if (loading) {
    return (
      <section id="floor-status" className="mb-8 scroll-mt-20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Floor Availability</span>
            <span className="w-2 h-2 rounded-full bg-gray-600 animate-pulse" />
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-40 rounded-2xl glass-card border border-white/10 animate-pulse"
            />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section id="floor-status" className="mb-8 scroll-mt-20">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Floor Availability</span>
            <span className="text-[10px] font-semibold text-neon-green bg-neon-green/10 border border-neon-green/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
              Real-time
            </span>
          </h2>
          <p className="text-[11px] text-gray-500">2× Pool Tables & 2× PlayStation Consoles</p>
        </div>

        <div className="flex items-center gap-2">
          {connected ? (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-neon-green bg-neon-green/10 border border-neon-green/20 px-2.5 py-1 rounded-lg">
              <Wifi size={12} className="animate-pulse" />
              Live
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs text-gray-400 bg-white/5 px-2.5 py-1 rounded-lg">
              <WifiOff size={12} />
              Reconnecting…
            </span>
          )}
          <button
            onClick={fetchStations}
            className="p-1.5 rounded-lg glass-card border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-colors"
            title="Refresh floor status"
          >
            <RefreshCw size={13} />
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-4 px-4 py-2.5 rounded-xl bg-crimson/10 border border-crimson/30 text-crimson text-xs flex items-center gap-2">
          <span>{error}</span>
        </div>
      )}

      {/* Admin Quick Help */}
      {isAdmin && (
        <div className="mb-3 px-3 py-1.5 rounded-xl bg-gold/10 border border-gold/25 flex items-center justify-between text-xs text-gold">
          <span className="flex items-center gap-1.5 font-medium">
            <Zap size={13} className="animate-pulse" />
            Admin Quick-Toggle: Tap any station to flip FREE ↔ BOOKED
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider">Instant Broadcast</span>
        </div>
      )}

      {/* 4 Animated Station Cards */}
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {stations.map((station, index) => {
            const isFree = station.status === 'FREE';
            const Icon = getStationIcon(station.type);
            const isToggling = toggling === station.id;

            return (
              <motion.button
                key={station.id}
                layout
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.08,
                  layout: { duration: 0.25, ease: 'easeInOut' },
                }}
                whileHover={isAdmin ? { scale: 1.03, y: -2 } : { scale: 1.015 }}
                whileTap={isAdmin ? { scale: 0.98 } : undefined}
                onClick={() => handleToggle(station)}
                disabled={!isAdmin || isToggling}
                className={[
                  'relative flex flex-col items-center justify-center gap-2.5',
                  'h-40 rounded-2xl border transition-colors duration-300',
                  'focus:outline-none focus-visible:ring-2 backdrop-blur-xl',
                  isFree
                    ? 'bg-[#06140e]/75 border-neon-green/40 shadow-[0_0_25px_rgba(16,185,129,0.2)] hover:border-neon-green'
                    : 'bg-[#16060c]/75 border-crimson/40 shadow-[0_0_25px_rgba(244,63,94,0.18)] hover:border-crimson',
                  isAdmin ? 'cursor-pointer' : 'cursor-default',
                ].join(' ')}
              >
                {/* Live Status Beacon Dot */}
                <div className="absolute top-3 right-3 flex items-center justify-center">
                  <span
                    className={[
                      'w-2 h-2 rounded-full',
                      isFree
                        ? 'bg-neon-green shadow-[0_0_8px_#10b981] animate-pulse'
                        : 'bg-crimson shadow-[0_0_8px_#f43f5e]',
                    ].join(' ')}
                  />
                  {isFree && (
                    <span className="absolute w-4 h-4 rounded-full bg-neon-green/30 animate-ping" />
                  )}
                </div>

                {/* Station Icon Badge */}
                <div
                  className={[
                    'p-3 rounded-2xl transition-transform duration-300',
                    isFree
                      ? 'bg-neon-green/15 text-neon-green shadow-inner'
                      : 'bg-crimson/15 text-crimson shadow-inner',
                  ].join(' ')}
                >
                  {isToggling ? (
                    <RefreshCw size={24} className="animate-spin" />
                  ) : (
                    <Icon size={24} />
                  )}
                </div>

                {/* Station Name & Subtitle */}
                <div className="text-center px-2">
                  <span className="text-sm font-bold text-white block leading-tight">
                    {station.name.includes('PlayStation')
                      ? station.name
                      : station.type === 'CONSOLE'
                      ? `${station.name} (PlayStation)`
                      : station.name}
                  </span>
                  <span className="text-[10px] font-medium text-gray-400 block mt-0.5">
                    {station.type === 'CONSOLE' ? 'PS5 Lounge' : 'Billiards Table'}
                  </span>
                </div>

                {/* Status Pill Badge */}
                <span
                  className={[
                    'text-[10px] font-black tracking-widest uppercase px-2.5 py-0.5 rounded-full',
                    isFree
                      ? 'bg-neon-green/20 text-neon-green border border-neon-green/40 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                      : 'bg-crimson/20 text-crimson border border-crimson/40 shadow-[0_0_10px_rgba(244,63,94,0.3)]',
                  ].join(' ')}
                >
                  {station.status}
                </span>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Status Legend */}
      <div className="mt-4 flex items-center justify-between text-xs text-gray-500 px-1">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-neon-green shadow-[0_0_6px_#10b981] inline-block" />
            <span className="text-gray-400 font-medium">Free — Open to walk-in</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-crimson shadow-[0_0_6px_#f43f5e] inline-block" />
            <span className="text-gray-400 font-medium">Booked — In session</span>
          </span>
        </div>
        <span className="hidden sm:inline text-[11px] text-gray-600">
          Syncs via WebSocket
        </span>
      </div>
    </section>
  );
}
