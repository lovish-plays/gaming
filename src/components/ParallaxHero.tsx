'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Gamepad2, ChevronDown, Sparkles } from 'lucide-react';

interface ParallaxHeroProps {
  onScrollToStations?: () => void;
}

export default function ParallaxHero({ onScrollToStations }: ParallaxHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  // Layer transforms
  const yBg = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const yMid = useTransform(scrollYProgress, [0, 1], ['0%', '40%']);
  const scaleMid = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const rotateXMid = useTransform(scrollYProgress, [0, 1], [0, 15]);
  const yFore = useTransform(scrollYProgress, [0, 1], ['0%', '60%']);
  const opacityFore = useTransform(scrollYProgress, [0, 0.8], [1, 0.1]);

  const scrollToFloor = () => {
    if (onScrollToStations) {
      onScrollToStations();
    } else {
      const el = document.getElementById('floor-status');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative h-[480px] sm:h-[540px] w-full overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#090915] via-[#05050c] to-[#030306] mb-8 shadow-2xl"
      style={{ perspective: 1200 }}
    >
      {/* ======================================================== */}
      {/* LAYER 1: Deep Cyber Grid & Floating Neon Ambient Sparks */}
      {/* ======================================================== */}
      <motion.div
        style={{ y: yBg }}
        className="absolute inset-0 pointer-events-none select-none"
      >
        {/* Perspective grid floor */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'radial-gradient(ellipse at 50% 20%, rgba(16, 185, 129, 0.18) 0%, transparent 70%), linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)',
            backgroundSize: '100% 100%, 40px 40px, 40px 40px',
          }}
        />

        {/* Ambient floating glowing light orbs */}
        <div className="absolute top-1/4 left-1/4 w-48 h-48 rounded-full bg-neon-green/10 blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-52 h-52 rounded-full bg-crimson/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-gold/5 blur-3xl" />

        {/* Cyber geometric particles */}
        {[
          { top: '18%', left: '12%', size: 'w-1.5 h-1.5', delay: 0 },
          { top: '35%', left: '88%', size: 'w-2 h-2', delay: 1 },
          { top: '70%', left: '16%', size: 'w-1 h-1', delay: 1.5 },
          { top: '22%', left: '76%', size: 'w-1.5 h-1.5', delay: 2 },
          { top: '82%', left: '82%', size: 'w-2 h-2', delay: 0.5 },
        ].map((p, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -10, 0],
              opacity: [0.3, 0.9, 0.3],
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: p.delay,
            }}
            style={{ top: p.top, left: p.left }}
            className={`absolute ${p.size} rounded-full bg-neon-green shadow-[0_0_8px_#10b981]`}
          />
        ))}
      </motion.div>

      {/* ======================================================== */}
      {/* LAYER 2: 3D Perspective Gaming Silhouettes              */}
      {/* (PS5 console glow, DualSense Controller, Cue sticks)     */}
      {/* ======================================================== */}
      <motion.div
        style={{
          y: yMid,
          scale: scaleMid,
          rotateX: rotateXMid,
          transformStyle: 'preserve-3d',
        }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-45 sm:opacity-55"
      >
        <div className="relative w-full max-w-xl h-full flex items-center justify-center">
          {/* PS5 Console Silhouette (Left Angle) */}
          <div className="absolute left-4 sm:left-12 -bottom-6 w-28 sm:w-36 h-64 sm:h-80 opacity-70 transform -rotate-12">
            <svg
              viewBox="0 0 100 240"
              fill="none"
              className="w-full h-full drop-shadow-[0_0_25px_rgba(56,189,248,0.25)]"
            >
              {/* White collar wing curve */}
              <path
                d="M15 10 C35 5, 65 30, 75 220 L35 235 C25 150, 10 40, 15 10 Z"
                fill="url(#ps5Grad)"
                stroke="rgba(255,255,255,0.25)"
                strokeWidth="1.5"
              />
              {/* Inner core dark chassis */}
              <path
                d="M32 20 C42 40, 50 120, 52 225 L45 228 C40 140, 30 50, 32 20 Z"
                fill="#070710"
                stroke="rgba(56, 189, 248, 0.4)"
                strokeWidth="1"
              />
              {/* Neon accent strip */}
              <path
                d="M30 30 C38 60, 48 140, 50 220"
                stroke="#38bdf8"
                strokeWidth="2"
                strokeOpacity="0.8"
              />
              <defs>
                <linearGradient id="ps5Grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#0d0d1a" stopOpacity="0.9" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Central Holographic DualSense Controller Wireframe */}
          <div className="relative w-64 sm:w-80 h-44 sm:h-52 drop-shadow-[0_0_35px_rgba(16,185,129,0.35)]">
            <svg
              viewBox="0 0 200 130"
              fill="none"
              className="w-full h-full"
            >
              {/* Main Controller Shell */}
              <path
                d="M45 25 C65 22, 135 22, 155 25 C175 28, 192 65, 185 110 C182 125, 160 125, 148 105 C140 92, 130 88, 115 88 L85 88 C70 88, 60 92, 52 105 C40 125, 18 125, 15 110 C8 65, 25 28, 45 25 Z"
                stroke="#10b981"
                strokeWidth="2"
                fill="rgba(16, 185, 129, 0.05)"
              />
              {/* Touchpad Outline */}
              <rect
                x="76"
                y="30"
                width="48"
                height="30"
                rx="5"
                stroke="rgba(255,255,255,0.4)"
                strokeWidth="1.2"
                fill="rgba(255,255,255,0.03)"
              />
              {/* Thumbsticks */}
              <circle cx="78" cy="80" r="14" stroke="#10b981" strokeWidth="1.5" fill="rgba(0,0,0,0.5)" />
              <circle cx="122" cy="80" r="14" stroke="#10b981" strokeWidth="1.5" fill="rgba(0,0,0,0.5)" />
              {/* D-Pad on left */}
              <path
                d="M42 45 h6 v-6 h6 v6 h6 v6 h-6 v6 h-6 v-6 h-6 z"
                stroke="#10b981"
                strokeWidth="1.2"
                fill="none"
              />
              {/* PlayStation Action Buttons (Triangle, Circle, Cross, Square) */}
              <polygon points="158,40 154,46 162,46" stroke="#10b981" strokeWidth="1.2" fill="none" />
              <circle cx="168" cy="50" r="3" stroke="#f59e0b" strokeWidth="1.2" fill="none" />
              <line x1="155" y1="58" x2="161" y2="64" stroke="#38bdf8" strokeWidth="1.2" />
              <line x1="161" y1="58" x2="155" y2="64" stroke="#38bdf8" strokeWidth="1.2" />
              <rect x="145" y="47" width="5.5" height="5.5" stroke="#ec4899" strokeWidth="1.2" fill="none" />
            </svg>
          </div>

          {/* Crossed Pool Table Cue Sticks (Right Angle) */}
          <div className="absolute right-4 sm:right-10 -bottom-4 w-28 sm:w-36 h-64 sm:h-76 opacity-75 transform rotate-12">
            <svg
              viewBox="0 0 100 240"
              fill="none"
              className="w-full h-full drop-shadow-[0_0_20px_rgba(244,63,94,0.3)]"
            >
              {/* Cue 1 */}
              <line
                x1="15"
                y1="10"
                x2="85"
                y2="230"
                stroke="#f43f5e"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              {/* Cue 2 crossed */}
              <line
                x1="85"
                y1="10"
                x2="15"
                y2="230"
                stroke="#f59e0b"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              {/* 8-Ball in intersection */}
              <circle cx="50" cy="120" r="10" fill="#0b0b12" stroke="#ffffff" strokeWidth="1.5" />
              <text
                x="50"
                y="124"
                textAnchor="middle"
                fontSize="9"
                fontWeight="bold"
                fill="#ffffff"
              >
                8
              </text>
            </svg>
          </div>
        </div>
      </motion.div>

      {/* ======================================================== */}
      {/* LAYER 3: Foreground Cyberpunk Hero Content               */}
      {/* ======================================================== */}
      <motion.div
        style={{ y: yFore, opacity: opacityFore }}
        className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4"
      >
        {/* Subtle Cyber Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md mb-4 shadow-inner">
          <Sparkles size={13} className="text-neon-green" />
          <span className="text-[11px] font-semibold tracking-wider text-gray-300 uppercase">
            Underground Gaming Lounge & Bar
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-ping" />
        </div>

        {/* Primary Prominent Bold Header */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-[0.18em] sm:tracking-[0.24em] leading-none mb-3 bg-gradient-to-b from-white via-neutral-100 to-neutral-500 bg-clip-text text-transparent drop-shadow-[0_12px_24px_rgba(0,0,0,0.9)]">
          Underground
        </h1>

        {/* Tagline Subtitle */}
        <p className="text-xs sm:text-sm font-extrabold uppercase tracking-[0.3em] sm:tracking-[0.4em] text-neon-green drop-shadow-[0_0_16px_rgba(16,185,129,0.5)] mb-6">
          A Gaming Playstation
        </p>

        {/* Value Prop Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs text-gray-400 mb-8 max-w-md">
          <span className="px-3 py-1 rounded-lg bg-black/40 border border-white/10 backdrop-blur-sm">
            🎮 2× PS5 Consoles
          </span>
          <span className="px-3 py-1 rounded-lg bg-black/40 border border-white/10 backdrop-blur-sm">
            🎱 2× Pool Tables
          </span>
          <span className="px-3 py-1 rounded-lg bg-black/40 border border-gold/30 text-gold backdrop-blur-sm">
            ⭐ ₹1,000 = 1 Free Hour
          </span>
        </div>

        {/* Quick Jump / Scroll to Live Floor Status */}
        <button
          onClick={scrollToFloor}
          className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neon-green/10 hover:bg-neon-green/20 border border-neon-green/30 text-neon-green text-xs font-bold tracking-wider uppercase transition-all duration-300 hover:scale-[1.03] active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
        >
          <span>Live Floor Availability</span>
          <ChevronDown
            size={14}
            className="transition-transform duration-300 group-hover:translate-y-0.5"
          />
        </button>
      </motion.div>
    </div>
  );
}
