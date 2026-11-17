'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Monitor,
  Gamepad2,
  Wifi,
  WifiOff,
  RefreshCw,
  Zap,
  MessageCircle,
  Clock,
  CheckCircle2,
  X,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { createClient } from '@/lib/supabase';
import type { Station, Profile } from '@/lib/types';

// Underground Cafe WhatsApp contact (10-digit phone with 91 country code)
const CAFE_WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_CAFE_WHATSAPP || '917087513155';

// Synthesized Web Audio two-tone cyber chime
function playCyberChime() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    // Tone 1: 587.33 Hz (D5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Tone 2: 880 Hz (A5) - Bright celebratory chime
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.12);
    gain2.gain.setValueAtTime(0.15, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.6);
  } catch {
    // Autoplay blocked before interaction or unhandled audio context
  }
}

interface OpenStationAlert {
  id: string;
  stationId: string;
  stationName: string;
  stationType: Station['type'];
  subtitle: string;
  createdAt: number;
}

interface LiveStationsProps {
  profile: Profile | null;
}

export default function LiveStations({ profile }: LiveStationsProps) {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [alerts, setAlerts] = useState<OpenStationAlert[]>([]);

  const firedAlertsRef = useRef<Set<string>>(new Set());
  const supabase = createClient();
  const isAdmin = profile?.role === 'ADMIN';

  // Trigger real-time opening toast + chime
  const triggerOpenAlert = useCallback(
    (station: { id: string; name: string; type: Station['type'] }, customSubtitle?: string) => {
      // Skip modal popup if the current viewer is admin making counter changes
      if (isAdmin) return;

      playCyberChime();

      const newAlert: OpenStationAlert = {
        id: `${station.id}-${Date.now()}`,
        stationId: station.id,
        stationName: station.name,
        stationType: station.type,
        subtitle: customSubtitle || 'Grab your spot before it gets booked again.',
        createdAt: Date.now(),
      };

      setAlerts((prev) => [newAlert, ...prev.filter((a) => a.stationId !== station.id).slice(0, 2)]);

      // Auto-dismiss smoothly after 12 seconds
      setTimeout(() => {
        setAlerts((prev) => prev.filter((a) => a.id !== newAlert.id));
      }, 12000);
    },
    [isAdmin]
  );

  const handleDismissAlert = (alertId: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
  };

  const handleToastBook = (alert: OpenStationAlert) => {
    const isTable = alert.stationType === 'TABLE' || alert.stationName.toLowerCase().includes('table');
    const message = isTable
      ? `Hi Underground! I saw ${alert.stationName} just opened up. Book a pool table for me!`
      : `Hi Underground! I saw ${alert.stationName} just opened up. Book a PlayStation console for me!`;
    const url = `https://wa.me/${CAFE_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Live ticking countdown interval (updates every 1s)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Trigger Condition 2: Countdown Timer Finishes (00:00)
  useEffect(() => {
    stations.forEach((st) => {
      if (st.status === 'BOOKED' && st.booked_until) {
        const endTime = new Date(st.booked_until).getTime();
        const diff = endTime - currentTime;
        const alertKey = `${st.id}-${st.booked_until}`;

        // When exact moment reached (diff <= 0) and not yet fired for this booked session
        if (diff <= 0 && !firedAlertsRef.current.has(alertKey)) {
          firedAlertsRef.current.add(alertKey);
          triggerOpenAlert(st, `${st.name} session just ended — Free now!`);
        }
      }
    });
  }, [currentTime, stations, triggerOpenAlert]);

  const fetchStations = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('stations')
        .select('*')
        .order('name');
      if (error) throw error;

      // Deduplicate by name so exactly the 4 distinct stations are shown
      const uniqueStations: Station[] = [];
      const seenNames = new Set<string>();
      for (const s of data || []) {
        if (!seenNames.has(s.name)) {
          seenNames.add(s.name);
          uniqueStations.push(s);
        }
      }

      setStations(uniqueStations);
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
        { event: '*', schema: 'public', table: 'stations' },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            const updated = payload.new as Station;
            setStations((prev) => {
              // Trigger Condition 1: Admin Marks Station FREE
              const old = prev.find((s) => s.id === updated.id);
              if (old && old.status === 'BOOKED' && updated.status === 'FREE') {
                triggerOpenAlert(updated, 'Admin just marked it free — open for booking or walk-in!');
              }

              return prev.map((s) =>
                s.id === updated.id ? { ...s, ...(updated as Station) } : s
              );
            });
          } else {
            fetchStations();
          }
        }
      )
      .subscribe((status) => {
        setConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchStations, supabase, triggerOpenAlert]);

  // Formats human-readable time remaining for booked stations
  const getTimeLeft = (bookedUntil?: string | null) => {
    if (!bookedUntil) return null;
    const end = new Date(bookedUntil).getTime();
    const diff = end - currentTime;

    if (diff <= 0) {
      return {
        isExpired: true,
        text: 'Wrapping up / Almost free',
        shortText: 'Almost free',
        whatsappText: 'is almost free',
      };
    }

    const totalSeconds = Math.floor(diff / 1000);
    const totalMinutes = Math.ceil(diff / (1000 * 60));

    if (totalSeconds < 60) {
      return {
        isExpired: false,
        text: '< 1 min left',
        shortText: '< 1m left',
        whatsappText: 'shows < 1 min left',
      };
    }

    if (totalMinutes < 60) {
      return {
        isExpired: false,
        text: `${totalMinutes} mins left`,
        shortText: `${totalMinutes}m left`,
        whatsappText: `shows ${totalMinutes} mins left`,
      };
    }

    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    const text = mins === 0 ? `${hours} hr left` : `${hours} hr ${mins} mins left`;
    const shortText = mins === 0 ? `${hours}h left` : `${hours}h ${mins}m left`;

    return {
      isExpired: false,
      text,
      shortText,
      whatsappText: `shows ${text}`,
    };
  };

  // Set timed session or free up station
  const handleSetBooking = async (
    stationId: string,
    durationMinutes: number,
    extend = false,
    e?: React.MouseEvent
  ) => {
    if (e) e.stopPropagation();
    if (!isAdmin || toggling) return;
    setToggling(stationId);

    try {
      // 1. Call atomic set_station_booking RPC
      const { error: rpcError } = await supabase.rpc('set_station_booking', {
        p_station_id: stationId,
        p_duration_minutes: durationMinutes,
        p_extend: extend,
      });

      if (rpcError) {
        // Fallback: direct table update if RPC not yet created in Supabase SQL editor
        let updateData: Partial<Station> = {};
        if (durationMinutes <= 0) {
          updateData = { status: 'FREE', booked_until: null, updated_at: new Date().toISOString() };
        } else {
          const currentStation = stations.find((s) => s.id === stationId);
          let baseTime = Date.now();
          if (extend && currentStation?.booked_until) {
            const currentEnd = new Date(currentStation.booked_until).getTime();
            if (currentEnd > baseTime) baseTime = currentEnd;
          }
          const newEnd = new Date(baseTime + durationMinutes * 60 * 1000).toISOString();
          updateData = { status: 'BOOKED', booked_until: newEnd, updated_at: new Date().toISOString() };
        }

        const { error: updateError } = await supabase
          .from('stations')
          .update(updateData)
          .eq('id', stationId);

        if (updateError) throw updateError;
      }

      // Optimistic local update
      setStations((prev) =>
        prev.map((s) => {
          if (s.id !== stationId) return s;
          if (durationMinutes <= 0) {
            return { ...s, status: 'FREE', booked_until: null };
          }
          let baseTime = Date.now();
          if (extend && s.booked_until) {
            const currentEnd = new Date(s.booked_until).getTime();
            if (currentEnd > baseTime) baseTime = currentEnd;
          }
          const newEnd = new Date(baseTime + durationMinutes * 60 * 1000).toISOString();
          return { ...s, status: 'BOOKED', booked_until: newEnd };
        })
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Booking failed';
      setError(msg);
      setTimeout(() => setError(null), 4000);
    } finally {
      setToggling(null);
    }
  };

  const handleCardClick = (station: Station) => {
    // Admin clicking the card background defaults to a 1 hour session if free, or frees it if booked
    if (isAdmin) {
      if (station.status === 'FREE') {
        handleSetBooking(station.id, 60, false);
      } else {
        handleSetBooking(station.id, 0, false);
      }
      return;
    }

    // Normal customer or logged-out guest: open WhatsApp booking / inquiry
    const isTable = station.type === 'TABLE' || station.name.toLowerCase().includes('table');
    const isFree = station.status === 'FREE';
    const timeLeft = getTimeLeft(station.booked_until);

    let message = '';
    if (isTable) {
      if (isFree) {
        message = `Hi Underground! Book a pool table (${station.name}) for me.`;
      } else if (timeLeft?.isExpired) {
        message = `Hi Underground! ${station.name} is almost free. Can I book the next slot?`;
      } else if (timeLeft) {
        message = `Hi Underground! ${station.name} shows ${timeLeft.text}. Can I book the next slot?`;
      } else {
        message = `Hi Underground! ${station.name} is currently booked. Let me know when it's free!`;
      }
    } else {
      if (isFree) {
        message = `Hi Underground! Book a PlayStation console (${station.name}) for me.`;
      } else if (timeLeft?.isExpired) {
        message = `Hi Underground! ${station.name} is almost free. Can I book the next slot?`;
      } else if (timeLeft) {
        message = `Hi Underground! ${station.name} shows ${timeLeft.text}. Can I book the next slot?`;
      } else {
        message = `Hi Underground! ${station.name} is currently booked. Let me know when it's free!`;
      }
    }

    const whatsappUrl = `https://wa.me/${CAFE_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
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
              className="h-48 rounded-2xl glass-card border border-white/10 animate-pulse"
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

      {/* Admin Quick Help Banner */}
      {isAdmin && (
        <div className="mb-3.5 px-3 py-2 rounded-xl bg-gold/10 border border-gold/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 text-xs text-gold">
          <span className="flex items-center gap-1.5 font-medium">
            <Zap size={13} className="animate-pulse text-gold" />
            Admin Quick-Book: Set timed sessions (+30m, +1h, +2h) or Mark Free anytime
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider text-gold/80">
            Realtime Synced
          </span>
        </div>
      )}

      {/* Station Cards */}
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
        {stations.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-400 glass-card rounded-2xl border border-white/10 col-span-2 sm:col-span-4">
            <Gamepad2 size={28} className="text-gray-500 mx-auto mb-2 opacity-60" />
            <p className="font-semibold text-gray-300">No stations configured</p>
            <p className="text-[11px] text-gray-500 mt-1">
              Please check your station records in Supabase.
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {stations.map((station, index) => {
            const isFree = station.status === 'FREE';
            const Icon = getStationIcon(station.type);
            const isToggling = toggling === station.id;
            const timeLeft = getTimeLeft(station.booked_until);
            const isTable = station.type === 'TABLE' || station.name.toLowerCase().includes('table');
            const bgImage = isTable ? '/images/pool-table.jpg' : '/images/ps5-console.jpg';

            return (
              <motion.div
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
                whileHover={{ scale: 1.025, y: -2 }}
                onClick={() => handleCardClick(station)}
                className={[
                  'relative overflow-hidden flex flex-col items-center justify-between',
                  'min-h-[205px] sm:min-h-[225px] p-3 rounded-2xl border transition-all duration-300',
                  'focus:outline-none focus-visible:ring-2 backdrop-blur-xl cursor-pointer group',
                  isFree
                    ? 'border-neon-green/40 shadow-[0_0_25px_rgba(16,185,129,0.18)] hover:border-neon-green hover:shadow-[0_0_30px_rgba(16,185,129,0.35)]'
                    : 'border-crimson/40 shadow-[0_0_25px_rgba(244,63,94,0.18)] hover:border-crimson hover:shadow-[0_0_30px_rgba(244,63,94,0.35)]',
                ].join(' ')}
              >
                {/* 1. Station-Specific Moody Background Photograph with Hover Zoom */}
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-35 group-hover:opacity-50 transition-all duration-700 ease-out group-hover:scale-105 pointer-events-none"
                  style={{
                    backgroundImage: `url('${bgImage}')`,
                  }}
                />

                {/* 2. Dark Cyberpunk Gradient Scrim & Status Tint for 100% High-Contrast Legibility */}
                <div
                  className={[
                    'absolute inset-0 pointer-events-none transition-colors duration-500',
                    'bg-gradient-to-t from-[#08080e] via-[#08080e]/80 to-[#08080e]/60',
                    isFree ? 'bg-emerald-950/30' : 'bg-rose-950/35',
                  ].join(' ')}
                />

                {/* Live Status Beacon Dot */}
                <div className="absolute top-3 right-3 flex items-center justify-center z-10">
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

                {/* Top Section: Icon, Name & Type */}
                <div className="w-full flex flex-col items-center text-center pt-1 relative z-10">
                  <div
                    className={[
                      'p-2 rounded-2xl transition-transform duration-300 group-hover:scale-110 mb-2',
                      isFree
                        ? 'bg-neon-green/15 text-neon-green shadow-inner'
                        : 'bg-crimson/15 text-crimson shadow-inner',
                    ].join(' ')}
                  >
                    {isToggling ? (
                      <RefreshCw size={20} className="animate-spin" />
                    ) : (
                      <Icon size={20} />
                    )}
                  </div>

                  <span className="text-xs sm:text-sm font-bold text-white block leading-tight px-1 drop-shadow-md">
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

                {/* Middle Section: Status Pill & Live Ticking Countdown */}
                <div className="w-full flex flex-col items-center gap-1 my-1.5 relative z-10">
                  <span
                    className={[
                      'text-[9px] font-black tracking-widest uppercase px-2.5 py-0.5 rounded-full',
                      isFree
                        ? 'bg-neon-green/20 text-neon-green border border-neon-green/40 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                        : 'bg-crimson/20 text-crimson border border-crimson/40 shadow-[0_0_10px_rgba(244,63,94,0.3)]',
                    ].join(' ')}
                  >
                    {station.status}
                  </span>

                  {/* Live Countdown Badge for Booked Stations */}
                  {!isFree && (
                    <div className="mt-0.5 text-center">
                      {timeLeft ? (
                        <span
                          className={[
                            'inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-sm',
                            timeLeft.isExpired
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                              : 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
                          ].join(' ')}
                        >
                          <Clock size={10} className={timeLeft.isExpired ? 'animate-bounce' : ''} />
                          <span>{timeLeft.shortText}</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-400">In Session</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom Section: Admin Timed Duration Controls or Customer Action Hint */}
                <div className="w-full pt-1.5 border-t border-white/10 relative z-10" onClick={(e) => e.stopPropagation()}>
                  {isAdmin ? (
                    isFree ? (
                      /* Free Station Admin Controls: Quick Book +30m / +1h / +2h */
                      <div className="flex items-center justify-between gap-1 w-full">
                        <button
                          onClick={(e) => handleSetBooking(station.id, 30, false, e)}
                          disabled={isToggling}
                          className="flex-1 py-1 rounded-lg bg-neon-green/15 hover:bg-neon-green/30 text-neon-green border border-neon-green/30 hover:border-neon-green text-[10px] font-bold tracking-wider uppercase transition-colors"
                          title="Book for 30 minutes"
                        >
                          +30m
                        </button>
                        <button
                          onClick={(e) => handleSetBooking(station.id, 60, false, e)}
                          disabled={isToggling}
                          className="flex-1 py-1 rounded-lg bg-neon-green/15 hover:bg-neon-green/30 text-neon-green border border-neon-green/30 hover:border-neon-green text-[10px] font-bold tracking-wider uppercase transition-colors"
                          title="Book for 1 hour"
                        >
                          +1h
                        </button>
                        <button
                          onClick={(e) => handleSetBooking(station.id, 120, false, e)}
                          disabled={isToggling}
                          className="flex-1 py-1 rounded-lg bg-neon-green/15 hover:bg-neon-green/30 text-neon-green border border-neon-green/30 hover:border-neon-green text-[10px] font-bold tracking-wider uppercase transition-colors"
                          title="Book for 2 hours"
                        >
                          +2h
                        </button>
                      </div>
                    ) : (
                      /* Booked Station Admin Controls: Extend (+30m, +1h) & Mark Free */
                      <div className="flex flex-col gap-1 w-full">
                        <div className="flex items-center justify-between gap-1 w-full">
                          <button
                            onClick={(e) => handleSetBooking(station.id, 30, true, e)}
                            disabled={isToggling}
                            className="flex-1 py-0.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-[9px] font-bold tracking-wider uppercase transition-colors"
                            title="Extend session by 30 mins"
                          >
                            +30m
                          </button>
                          <button
                            onClick={(e) => handleSetBooking(station.id, 60, true, e)}
                            disabled={isToggling}
                            className="flex-1 py-0.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-[9px] font-bold tracking-wider uppercase transition-colors"
                            title="Extend session by 1 hour"
                          >
                            +1h
                          </button>
                        </div>
                        <button
                          onClick={(e) => handleSetBooking(station.id, 0, false, e)}
                          disabled={isToggling}
                          className="w-full py-0.5 rounded-lg bg-crimson/20 hover:bg-crimson/35 text-crimson border border-crimson/40 text-[9px] font-bold tracking-wider uppercase transition-colors text-center"
                          title="Finish session and mark station free"
                        >
                          Mark Free
                        </button>
                      </div>
                    )
                  ) : (
                    /* Customer / Visitor Action Hint */
                    <div className="flex items-center justify-center text-center py-0.5">
                      {isFree ? (
                        <span className="text-[10px] font-semibold text-neon-green flex items-center gap-1 group-hover:underline">
                          <MessageCircle size={10} />
                          Tap to book on WhatsApp
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-gray-400 flex items-center gap-1 group-hover:text-gray-200">
                          <MessageCircle size={10} />
                          Inquire on WhatsApp
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        )}
      </div>

      {/* Status Legend */}
      <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-gray-500 px-1 gap-2">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-neon-green shadow-[0_0_6px_#10b981] inline-block" />
            <span className="text-gray-400 font-medium">Free — Open to walk-in</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-crimson shadow-[0_0_6px_#f43f5e] inline-block" />
            <span className="text-gray-400 font-medium">Booked — Live timer</span>
          </span>
        </div>
        <span className="text-[11px] text-gray-500">
          Syncs via WebSocket
        </span>
      </div>

      {/* ======================================================== */}
      {/* REAL-TIME "STATION JUST OPENED UP!" CYBER TOAST BANNER  */}
      {/* ======================================================== */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col gap-3 max-w-[370px] w-[calc(100vw-32px)] pointer-events-none">
        <AnimatePresence mode="sync">
          {alerts.map((alert) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 35, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: 'spring', damping: 22, stiffness: 300 }}
              className="pointer-events-auto relative overflow-hidden rounded-2xl bg-[#06140e]/95 border-2 border-neon-green shadow-[0_0_35px_rgba(16,185,129,0.45)] backdrop-blur-2xl p-4 text-white"
            >
              {/* Radial Ambient Glow */}
              <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-neon-green/20 blur-2xl pointer-events-none" />

              {/* Close Button */}
              <button
                onClick={() => handleDismissAlert(alert.id)}
                className="absolute top-3 right-3 p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Dismiss"
              >
                <X size={15} />
              </button>

              <div className="flex items-start gap-3 pr-6">
                <div className="w-9 h-9 rounded-xl bg-neon-green/20 border border-neon-green/40 flex items-center justify-center text-neon-green flex-shrink-0 shadow-inner">
                  <Zap size={18} className="animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.2 rounded-full bg-neon-green text-black">
                      Live Open
                    </span>
                    <span className="text-[10px] text-gray-400">Just now</span>
                  </div>
                  <h4 className="text-sm font-black text-white tracking-wide leading-tight">
                    ⚡ {alert.stationName} IS NOW FREE!
                  </h4>
                  <p className="text-xs text-gray-300 mt-1 leading-snug">
                    {alert.subtitle}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-3.5 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleToastBook(alert)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-neon-green hover:bg-[#00ff87] text-black text-xs font-black uppercase tracking-wider transition-all duration-200 active:scale-95 shadow-[0_0_18px_rgba(16,185,129,0.5)] cursor-pointer"
                >
                  <MessageCircle size={14} fill="currentColor" />
                  <span>Book Now</span>
                </button>
                <button
                  onClick={() => handleDismissAlert(alert.id)}
                  className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}
