'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gamepad2, Quote, Sparkles } from 'lucide-react';

const GAMING_QUOTES = [
  { quote: "It's dangerous to go alone! Take this.", game: "The Legend of Zelda" },
  { quote: "Nothing is true, everything is permitted.", game: "Assassin's Creed" },
  { quote: "Boy! Read this.", game: "God of War" },
  { quote: "Hesitation is defeat.", game: "Sekiro: Shadows Die Twice" },
  { quote: "Praise the Sun! \\[T]/", game: "Dark Souls" },
  { quote: "War. War never changes.", game: "Fallout" },
  { quote: "Protocol 3: Protect the Pilot.", game: "Titanfall 2" },
  { quote: "The right man in the wrong place can make all the difference.", game: "Half-Life 2" },
  { quote: "GG WP — Play hard, respawn harder.", game: "Underground Cafe" },
  { quote: "Kept you waiting, huh?", game: "Metal Gear Solid" },
  { quote: "Stay awhile and listen!", game: "Diablo" },
  { quote: "I used to be an adventurer like you...", game: "Skyrim" },
  { quote: "Don't wish it were easier, wish you were better.", game: "Chief" },
  { quote: "Press ✕ to Jump, Press ○ to Roll.", game: "PlayStation" },
];

export function CyclingQuoteBadge() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % GAMING_QUOTES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const current = GAMING_QUOTES[index];

  return (
    <div className="inline-flex items-center justify-center max-w-lg mx-auto mb-4">
      <div className="relative px-4 py-2 rounded-full bg-black/60 border border-neon-green/30 backdrop-blur-md shadow-[0_0_15px_rgba(16,185,129,0.15)] flex items-center gap-2 overflow-hidden">
        <Sparkles size={13} className="text-neon-green flex-shrink-0 animate-pulse" />
        
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="flex items-center gap-1.5 text-xs truncate"
          >
            <span className="text-gray-200 font-medium italic truncate">
              &ldquo;{current.quote}&rdquo;
            </span>
            <span className="text-neon-green text-[10px] font-bold uppercase tracking-wider flex-shrink-0">
              — {current.game}
            </span>
          </motion.div>
        </AnimatePresence>

        <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-ping flex-shrink-0" />
      </div>
    </div>
  );
}

export function ScrollingQuotesMarquee() {
  return (
    <div className="w-full overflow-hidden py-2 my-2 border-y border-white/5 bg-black/30 backdrop-blur-sm select-none">
      <div className="flex w-max animate-marquee space-x-8 text-xs text-gray-400">
        {[...GAMING_QUOTES, ...GAMING_QUOTES].map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 flex-shrink-0">
            <Gamepad2 size={12} className="text-neon-green/70" />
            <span className="text-gray-300 font-medium italic">
              &ldquo;{item.quote}&rdquo;
            </span>
            <span className="text-[10px] uppercase font-bold text-gold/80 tracking-wider">
              [{item.game}]
            </span>
            <span className="text-white/20">◆</span>
          </div>
        ))}
      </div>
    </div>
  );
}
