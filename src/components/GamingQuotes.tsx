'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gamepad2, Sparkles, Shuffle } from 'lucide-react';

export interface GamingQuote {
  quote: string;
  category: 'FUNNY' | 'MOTIVATION' | 'ATTITUDE';
  source: string;
}

export const GAMING_QUOTES: GamingQuote[] = [
  // ==========================================
  // FUNNY GAMING QUOTES (18)
  // ==========================================
  { quote: "I don't need to get a life. I'm a gamer, I have lots of lives.", category: "FUNNY", source: "Gamer Logic" },
  { quote: "I'm not lagging, I'm just giving you a head start.", category: "FUNNY", source: "Rage Quit Defense" },
  { quote: "Just one more game... said at 11 PM, now it's 4 AM.", category: "FUNNY", source: "True Story" },
  { quote: "Keep calm and blame the ping.", category: "FUNNY", source: "Ranked Excuse" },
  { quote: "I didn't lose, I just found 100 ways that didn't win.", category: "FUNNY", source: "Casual Mode" },
  { quote: "You can't buy happiness, but you can book a PlayStation session here.", category: "FUNNY", source: "Underground Cafe" },
  { quote: "My mom said 'Go outside'. So I moved my console next to the window.", category: "FUNNY", source: "Problem Solver" },
  { quote: "Controller battery at 1% during a boss fight is true horror.", category: "FUNNY", source: "Dark Souls Survivor" },
  { quote: "I paused my game to be here. You should feel honored.", category: "FUNNY", source: "VIP Gamer" },
  { quote: "I'm not aggressive, I'm just aggressively wiping the lobby.", category: "FUNNY", source: "FPS Veteran" },
  { quote: "They told me to 'touch grass'. So I booted up Skyrim.", category: "FUNNY", source: "Dragonborn" },
  { quote: "If at first you don't succeed, call it a warm-up round.", category: "FUNNY", source: "Underground Rules" },
  { quote: "I'm not antisocial, I'm just in an unpausable cutscene.", category: "FUNNY", source: "Story Mode" },
  { quote: "WiFi drops for 2 seconds: *Heart rate reaches 180 BPM.*", category: "FUNNY", source: "Every Gamer" },
  { quote: "Eat. Sleep. Game. (Forget the sleep part).", category: "FUNNY", source: "Weekend Grind" },
  { quote: "The cake is a lie, but this loyalty free hour is real.", category: "FUNNY", source: "Portal Wisdom" },
  { quote: "I don't get older, I just level up.", category: "FUNNY", source: "Birthday Gamer" },
  { quote: "My aim isn't bad, the enemy is just dodging between my bullets.", category: "FUNNY", source: "Sniper Lore" },

  // ==========================================
  // MOTIVATING GAMING QUOTES (19)
  // ==========================================
  { quote: "Hesitation is defeat.", category: "MOTIVATION", source: "Isshin, Sekiro" },
  { quote: "The right man in the wrong place can make all the difference in the world.", category: "MOTIVATION", source: "G-Man, Half-Life 2" },
  { quote: "Stand amongst the ashes of a trillion dead souls, and ask if honor matters. Silence is your answer.", category: "MOTIVATION", source: "Javik, Mass Effect 3" },
  { quote: "Don't wish it were easier, wish you were better.", category: "MOTIVATION", source: "Master Chief" },
  { quote: "It's not about how many times you fall, it's about hitting Respawn.", category: "MOTIVATION", source: "Underground Creed" },
  { quote: "A hero need not speak. When he is gone, the world will speak for him.", category: "MOTIVATION", source: "Halo" },
  { quote: "Failure doesn't mean game over; it means try again with more experience.", category: "MOTIVATION", source: "Next Level" },
  { quote: "No matter how dark the night, the morning always comes.", category: "MOTIVATION", source: "Final Fantasy X" },
  { quote: "Courage is knowing what not to fear.", category: "MOTIVATION", source: "Assassin's Creed" },
  { quote: "Protocol 3: Protect the Pilot.", category: "MOTIVATION", source: "BT-7274, Titanfall 2" },
  { quote: "Praise the Sun! \\[T]/", category: "MOTIVATION", source: "Solaire, Dark Souls" },
  { quote: "Every master was once a noob who refused to give up.", category: "MOTIVATION", source: "Ranked Mindset" },
  { quote: "The world is full of ordinary players. Strive to be the Final Boss.", category: "MOTIVATION", source: "Underground Lounge" },
  { quote: "You miss 100% of the trickshots you never take.", category: "MOTIVATION", source: "Clutch King" },
  { quote: "Greatness is not where we stand, but in what direction we are moving.", category: "MOTIVATION", source: "Uncharted" },
  { quote: "A champion is someone who gets up even when they can't.", category: "MOTIVATION", source: "FGC Community" },
  { quote: "Level 1 is where everyone begins. Level 100 is where legends finish.", category: "MOTIVATION", source: "RPG Grind" },
  { quote: "Even when hope is lost, keep swinging that cue stick.", category: "MOTIVATION", source: "Pool Table 8-Ball" },
  { quote: "Keep moving forward, because stopping is the only real loss.", category: "MOTIVATION", source: "God of War" },

  // ==========================================
  // ATTITUDE & BADASS GAMING QUOTES (18)
  // ==========================================
  { quote: "Boy! Read the room, aim for the head.", category: "ATTITUDE", source: "Kratos, God of War" },
  { quote: "Nothing is true, everything is permitted.", category: "ATTITUDE", source: "Assassin's Creed" },
  { quote: "They outnumber us 3 to 1! Then it is an even fight.", category: "ATTITUDE", source: "Halo 3" },
  { quote: "I survived Malenia blade of Miquella. Your trash talk can't hurt me.", category: "ATTITUDE", source: "Elden Lord" },
  { quote: "Born to clutch, forced to carry.", category: "ATTITUDE", source: "Solo Queue Reality" },
  { quote: "War. War never changes. But my K/D ratio just did.", category: "ATTITUDE", source: "Fallout Veteran" },
  { quote: "I don't play to participate. I play to conquer.", category: "ATTITUDE", source: "Tournament Mode" },
  { quote: "They call it sweaty. I call it superior mechanics.", category: "ATTITUDE", source: "Esports Truth" },
  { quote: "I'm not camping. I'm strategically holding an advantageous perimeter.", category: "ATTITUDE", source: "Tactical Pro" },
  { quote: "Kept you waiting, huh?", category: "ATTITUDE", source: "Solid Snake, MGS" },
  { quote: "Fear is not an option when the whole cafe is watching your screen.", category: "ATTITUDE", source: "Underground Arena" },
  { quote: "You're playing against me. That was your first mistake.", category: "ATTITUDE", source: "Duelist" },
  { quote: "Headshots don't lie.", category: "ATTITUDE", source: "FPS Rule #1" },
  { quote: "You can copy my build, but you can't copy my reflexes.", category: "ATTITUDE", source: "Pro Reflexes" },
  { quote: "Win with class, lose with grace, but respawn with vengeance.", category: "ATTITUDE", source: "Gamer Code" },
  { quote: "Respect the 1v1, or get sent back to the lobby.", category: "ATTITUDE", source: "Tekken / Street Fighter" },
  { quote: "They laughed at my pick until I carried the entire squad.", category: "ATTITUDE", source: "The Wildcard" },
  { quote: "GG WP — Good Game, Well Played. Now queue up again.", category: "ATTITUDE", source: "Underground Gaming" },
];

export function CyclingQuoteBadge() {
  const [index, setIndex] = useState(0);

  // Pick a fresh random quote on every page load/refresh
  useEffect(() => {
    const randomStart = Math.floor(Math.random() * GAMING_QUOTES.length);
    setIndex(randomStart);

    // Auto-cycle every 5 seconds
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % GAMING_QUOTES.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const handleShuffle = () => {
    let next = Math.floor(Math.random() * GAMING_QUOTES.length);
    if (next === index) next = (next + 1) % GAMING_QUOTES.length;
    setIndex(next);
  };

  const current = GAMING_QUOTES[index];

  return (
    <div className="inline-flex items-center justify-center max-w-xl mx-auto mb-4 px-2">
      <button
        onClick={handleShuffle}
        title="Click to roll a new quote"
        className="group relative px-4 py-2 rounded-full bg-black/70 border border-white/10 hover:border-neon-green/40 backdrop-blur-md shadow-[0_0_20px_rgba(0,0,0,0.6)] flex items-center gap-2.5 overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-95 text-left"
      >
        <Sparkles size={13} className="text-neon-green flex-shrink-0 animate-pulse" />

        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 7 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -7 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="flex items-center gap-2 text-xs truncate"
          >
            <span className="text-gray-200 font-medium italic truncate max-w-[290px] sm:max-w-lg">
              &ldquo;{current.quote}&rdquo;
            </span>
            <span className="text-neon-green text-[10px] font-bold uppercase tracking-wider flex-shrink-0 hidden sm:inline">
              — {current.source}
            </span>
          </motion.div>
        </AnimatePresence>

        <Shuffle size={11} className="text-gray-500 group-hover:text-neon-green transition-colors flex-shrink-0" />
      </button>
    </div>
  );
}

export function ScrollingQuotesMarquee() {
  return (
    <div className="w-full overflow-hidden py-2.5 my-3 border-y border-white/10 bg-black/40 backdrop-blur-md select-none">
      <div className="flex w-max animate-marquee space-x-8 text-xs text-gray-400">
        {[...GAMING_QUOTES, ...GAMING_QUOTES].map((item, idx) => (
          <div key={idx} className="flex items-center gap-2.5 flex-shrink-0">
            <Gamepad2 size={12} className="text-neon-green/80" />
            <span className="text-gray-200 font-medium italic">
              &ldquo;{item.quote}&rdquo;
            </span>
            <span className="text-[10px] uppercase font-bold text-gold/90 tracking-wider">
              [{item.source}]
            </span>
            <span className="text-white/20">◆</span>
          </div>
        ))}
      </div>
    </div>
  );
}
