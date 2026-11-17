'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronDown, Gamepad2, Sparkles } from 'lucide-react';
import { CyclingQuoteBadge, ScrollingQuotesMarquee } from './GamingQuotes';

export default function ParallaxHero() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  // Multi-layered parallax transforms
  const yBg = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const yMid = useTransform(scrollYProgress, [0, 1], [0, 45]);
  const scaleMid = useTransform(scrollYProgress, [0, 1], [1, 0.94]);
  const opacityMid = useTransform(scrollYProgress, [0, 0.8], [1, 0.3]);
  const yFg = useTransform(scrollYProgress, [0, 1], [0, 15]);

  const scrollToStations = () => {
    const el = document.getElementById('floor-status');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden pt-4 pb-8 sm:pt-6 sm:pb-12 text-center"
    >
      {/* ======================================================== */}
      {/* LAYER 1: BACKGROUND (CYBER GRID & FLOATING PARTICLES)    */}
      {/* ======================================================== */}
      <motion.div
        style={{ y: yBg }}
        className="absolute inset-0 pointer-events-none z-0"
      >
        {/* Subtle grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(16,185,129,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(16,185,129,0.04)_1px,transparent_1px)] bg-[size:36px_36px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)]" />

        {/* Ambient floating neon particles */}
        <div className="absolute top-1/4 left-1/6 w-2 h-2 rounded-full bg-neon-green/60 blur-[1px] animate-pulse" />
        <div className="absolute top-1/3 right-1/5 w-1.5 h-1.5 rounded-full bg-crimson/60 blur-[1px] animate-pulse [animation-delay:1s]" />
        <div className="absolute top-2/3 left-1/4 w-2 h-2 rounded-full bg-gold/50 blur-[1px] animate-pulse [animation-delay:1.5s]" />
        <div className="absolute top-1/2 right-1/3 w-1.5 h-1.5 rounded-full bg-neon-green/40 blur-[1px] animate-pulse [animation-delay:2s]" />
      </motion.div>

      {/* ======================================================== */}
      {/* LAYER 2: MIDGROUND (3D PERSPECTIVE SILHOUETTES)          */}
      {/* ======================================================== */}
      <motion.div
        style={{ y: yMid, scale: scaleMid, opacity: opacityMid }}
        className="absolute inset-0 pointer-events-none z-1 flex items-center justify-center"
      >
        <div className="relative w-full max-w-3xl h-64 sm:h-80 mx-auto opacity-35">
          {/* DualSense Controller Silhouette SVG in Center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              className="w-56 h-56 sm:w-80 sm:h-80 text-neon-green/25 drop-shadow-[0_0_35px_rgba(16,185,129,0.25)]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="6" x2="10" y1="12" y2="12" strokeWidth="1.5" />
              <line x1="8" x2="8" y1="10" y2="14" strokeWidth="1.5" />
              <circle cx="16" cy="10" r="0.8" fill="currentColor" />
              <circle cx="18" cy="12" r="0.8" fill="currentColor" />
              <circle cx="16" cy="14" r="0.8" fill="currentColor" />
              <circle cx="14" cy="12" r="0.8" fill="currentColor" />
              <path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z" />
            </svg>
          </div>

          {/* Angled PS5 Console Spine (Left) */}
          <div className="absolute left-4 sm:left-12 top-6 w-14 sm:w-20 h-52 sm:h-64 border-l-2 border-white/20 rounded-l-[40px] transform -rotate-12 bg-gradient-to-r from-blue-500/10 via-neon-green/5 to-transparent blur-[0.5px]" />

          {/* Crossed Pool Cues & 8-Ball (Right) */}
          <div className="absolute right-4 sm:right-12 top-8 w-24 sm:w-32 h-48 sm:h-56 transform rotate-12 flex items-center justify-center">
            <div className="absolute w-44 sm:w-56 h-[1.5px] bg-gradient-to-r from-amber-400/40 via-yellow-200/60 to-transparent rotate-45 transform origin-left" />
            <div className="absolute w-44 sm:w-56 h-[1.5px] bg-gradient-to-r from-amber-400/40 via-yellow-200/60 to-transparent -rotate-45 transform origin-left" />
            <div className="w-6 h-6 rounded-full bg-black/80 border border-white/40 shadow-[0_0_12px_rgba(255,255,255,0.2)] flex items-center justify-center text-[9px] font-black text-white">
              8
            </div>
          </div>
        </div>
      </motion.div>

      {/* ======================================================== */}
      {/* LAYER 3: FOREGROUND (TYPOGRAPHY, BADGES & CTA)           */}
      {/* ======================================================== */}
      <motion.div
        style={{ y: yFg }}
        className="relative z-10 max-w-3xl mx-auto px-4"
      >
        {/* Dynamic Randomly Cycling Quotes Badge */}
        <div className="mb-3">
          <CyclingQuoteBadge />
        </div>

        {/* Primary Brand Heading: UNDERGROUND */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-[0.14em] sm:tracking-[0.22em] leading-tight mb-1 bg-gradient-to-b from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent drop-shadow-[0_8px_32px_rgba(0,0,0,0.95)]"
        >
          Underground
        </motion.h1>

        {/* Glowing Tagline: A GAMING PLAYSTATION */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
          className="text-xs sm:text-sm md:text-base font-extrabold uppercase tracking-[0.3em] sm:tracking-[0.45em] text-neon-green drop-shadow-[0_0_18px_rgba(16,185,129,0.55)] mb-5"
        >
          A Gaming Playstation
        </motion.p>

        {/* Lounge Feature Highlights */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 text-xs text-gray-300 mb-5 max-w-lg mx-auto"
        >
          <span className="px-3 py-1 rounded-xl bg-black/60 border border-white/10 backdrop-blur-md shadow-sm">
            🎮 2× PS5 Consoles
          </span>
          <span className="px-3 py-1 rounded-xl bg-black/60 border border-white/10 backdrop-blur-md shadow-sm">
            🎱 2× Pool Tables
          </span>
          <span className="px-3 py-1 rounded-xl bg-black/60 border border-gold/30 text-gold backdrop-blur-md shadow-sm">
            ⭐ ₹1,000 = 1 Free Hour
          </span>
        </motion.div>

        {/* Continuous Smooth Scrolling Quotes Marquee */}
        <div className="mb-5">
          <ScrollingQuotesMarquee />
        </div>

        {/* Quick-Scroll to Live Floor CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="mt-2"
        >
          <button
            onClick={scrollToStations}
            className="group inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-neon-green/15 hover:bg-neon-green/25 border border-neon-green/40 hover:border-neon-green text-neon-green text-xs font-bold tracking-wider uppercase transition-all duration-300 hover:scale-[1.03] active:scale-95 shadow-[0_0_22px_rgba(16,185,129,0.22)] backdrop-blur-md cursor-pointer"
          >
            <span>Live Floor Availability</span>
            <ChevronDown
              size={14}
              className="transition-transform duration-300 group-hover:translate-y-1 text-neon-green"
            />
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
