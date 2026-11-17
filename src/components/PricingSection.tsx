'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Zap, CheckCircle2 } from 'lucide-react';

export default function PricingSection() {
  const [isHappyHour, setIsHappyHour] = useState(false);
  const [currentHourText, setCurrentHourText] = useState('');

  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      const hours = now.getHours();
      // Happy hours: 12:00 PM to 4:59 PM (12 <= hours < 17)
      const happy = hours >= 12 && hours < 17;
      setIsHappyHour(happy);

      if (happy) {
        setCurrentHourText('Happy Hours Live Now • Ends at 5:00 PM');
      } else if (hours < 12) {
        setCurrentHourText('Happy Hours start today at 12:00 PM');
      } else {
        setCurrentHourText('Happy Hours return tomorrow at 12:00 PM');
      }
    };

    checkTime();
    const interval = setInterval(checkTime, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="pricing" className="mb-8 scroll-mt-20">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Transparent Rates</span>
            {isHappyHour ? (
              <span className="flex items-center gap-1 text-[10px] font-bold text-neon-green bg-neon-green/10 border border-neon-green/30 px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                <Zap size={10} />
                Happy Hours Live
              </span>
            ) : (
              <span className="text-[10px] font-semibold text-gray-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Standard / Prime
              </span>
            )}
          </h2>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Same flat rate across Pool Tables and PS5 Consoles
          </p>
        </div>

        <span className="text-[11px] text-gray-500 hidden sm:flex items-center gap-1">
          <Clock size={12} className="text-neon-green" />
          {currentHourText}
        </span>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        {/* ======================================================== */}
        {/* CARD 1: HAPPY HOURS (12:00 PM – 5:00 PM)                */}
        {/* ======================================================== */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
          className={[
            'relative overflow-hidden rounded-2xl p-5 border transition-all duration-300 backdrop-blur-xl',
            isHappyHour
              ? 'bg-[#061811]/85 border-neon-green shadow-[0_0_30px_rgba(16,185,129,0.22)] ring-1 ring-neon-green/50'
              : 'bg-[#0a0a10]/75 border-white/10 hover:border-white/20',
          ].join(' ')}
        >
          {/* Active Highlight Badge */}
          {isHappyHour && (
            <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-neon-green text-black text-[10px] font-black tracking-wider uppercase shadow-[0_0_12px_rgba(16,185,129,0.6)]">
              <Zap size={11} fill="currentColor" />
              Active Now
            </div>
          )}

          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 rounded-lg bg-neon-green/15 text-neon-green border border-neon-green/30">
              <Zap size={16} />
            </span>
            <div>
              <h3 className="text-base font-bold text-white">Happy Hours</h3>
              <p className="text-[11px] text-gray-400">12:00 PM – 5:00 PM Daily</p>
            </div>
          </div>

          <div className="my-3 flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-neon-green drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]">
              ₹100
            </span>
            <span className="text-xs text-gray-300 font-semibold">/ hour</span>
          </div>

          <ul className="space-y-1.5 text-xs text-gray-300 mb-4">
            <li className="flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-neon-green flex-shrink-0" />
              <span>Valid on both Pool Tables & PS5 Consoles</span>
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-neon-green flex-shrink-0" />
              <span>Walk-ins & WhatsApp bookings welcome</span>
            </li>
          </ul>

          <div className="text-[10px] text-gray-400 pt-2 border-t border-white/10">
            {isHappyHour
              ? '⚡ Currently applied automatically for all walk-ins!'
              : 'Applies daily between 12:00 PM and 5:00 PM.'}
          </div>
        </motion.div>

        {/* ======================================================== */}
        {/* CARD 2: PRIME / REGULAR HOURS (AFTER 5:00 PM)           */}
        {/* ======================================================== */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
          className={[
            'relative overflow-hidden rounded-2xl p-5 border transition-all duration-300 backdrop-blur-xl',
            !isHappyHour
              ? 'bg-[#0f0e1a]/85 border-amber-400/60 shadow-[0_0_30px_rgba(245,158,11,0.18)] ring-1 ring-amber-400/40'
              : 'bg-[#0a0a10]/75 border-white/10 hover:border-white/20',
          ].join(' ')}
        >
          {/* Active Badge if outside happy hour */}
          {!isHappyHour && (
            <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gold text-black text-[10px] font-black tracking-wider uppercase shadow-[0_0_12px_rgba(245,158,11,0.5)]">
              <Clock size={11} />
              Current Rate
            </div>
          )}

          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 rounded-lg bg-gold/15 text-gold border border-gold/30">
              <Clock size={16} />
            </span>
            <div>
              <h3 className="text-base font-bold text-white">Prime / Regular</h3>
              <p className="text-[11px] text-gray-400">After 5:00 PM & Peak Hours</p>
            </div>
          </div>

          <div className="my-3 flex items-baseline gap-2">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-gold drop-shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                ₹150
              </span>
              <span className="text-xs text-gray-300 font-semibold">/ hour</span>
            </div>
            <span className="text-gray-500 text-xs">|</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-gray-200">₹90</span>
              <span className="text-[11px] text-gray-400 font-medium">/ 30 mins</span>
            </div>
          </div>

          <ul className="space-y-1.5 text-xs text-gray-300 mb-4">
            <li className="flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-gold flex-shrink-0" />
              <span>Full 60 mins: ₹150 | Half-hour quick game: ₹90</span>
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-gold flex-shrink-0" />
              <span>Every ₹1,000 counts toward 1 Free Hour</span>
            </li>
          </ul>

          <div className="text-[10px] text-gray-400 pt-2 border-t border-white/10">
            {!isHappyHour
              ? '✨ Prime evening lounge atmosphere in session!'
              : 'Regular rates resume daily after 5:00 PM.'}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
