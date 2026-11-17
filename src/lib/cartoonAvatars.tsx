import React from 'react';

/**
 * Cartoon Avatar Vector Illustrations inspired by Ludo King, casual multiplayer,
 * and arcade games. Clean, 100% self-contained SVGs with gradients, accessories,
 * and expressive cartoon facial features.
 */

interface CartoonSvgProps {
  className?: string;
}

// 1. LUDO KING / MAHARAJA
export function AvatarLudoKing({ className = 'w-full h-full' }: CartoonSvgProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="lk-bg" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#7c2d12" />
          <stop offset="100%" stopColor="#2e0804" />
        </radialGradient>
        <linearGradient id="lk-crown" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
        <linearGradient id="lk-cape" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#dc2626" />
          <stop offset="100%" stopColor="#7f1d1d" />
        </linearGradient>
      </defs>

      {/* Background circle */}
      <circle cx="50" cy="50" r="48" fill="url(#lk-bg)" stroke="#f59e0b" strokeWidth="2" />

      {/* Royal Ermine Cape Collar */}
      <path d="M22 92 C22 74 34 70 50 70 C66 70 78 74 78 92 Z" fill="url(#lk-cape)" />
      <path d="M32 72 Q50 78 68 72 Q50 82 32 72 Z" fill="#fef08a" />
      <circle cx="50" cy="76" r="3" fill="#dc2626" stroke="#fbbf24" strokeWidth="1" />

      {/* Neck & Ears */}
      <rect x="44" y="60" width="12" height="12" fill="#d97706" rx="2" />
      <ellipse cx="28" cy="52" rx="4" ry="6" fill="#f59e0b" />
      <ellipse cx="72" cy="52" rx="4" ry="6" fill="#f59e0b" />
      {/* Gold Earrings */}
      <circle cx="28" cy="58" r="2.5" fill="#fef08a" stroke="#b45309" strokeWidth="0.8" />
      <circle cx="72" cy="58" r="2.5" fill="#fef08a" stroke="#b45309" strokeWidth="0.8" />

      {/* Face */}
      <ellipse cx="50" cy="52" rx="22" ry="20" fill="#fbb040" />
      {/* Rosy Cheeks */}
      <circle cx="34" cy="54" r="3.5" fill="#f87171" opacity="0.4" />
      <circle cx="66" cy="54" r="3.5" fill="#f87171" opacity="0.4" />

      {/* Eyes & Eyebrows */}
      <ellipse cx="38" cy="47" rx="3" ry="3.5" fill="#18181b" />
      <circle cx="37" cy="46" r="1.2" fill="#ffffff" />
      <ellipse cx="62" cy="47" rx="3" ry="3.5" fill="#18181b" />
      <circle cx="61" cy="46" r="1.2" fill="#ffffff" />
      <path d="M33 42 Q39 39 43 41" stroke="#18181b" strokeWidth="2" strokeLinecap="round" />
      <path d="M67 42 Q61 39 57 41" stroke="#18181b" strokeWidth="2" strokeLinecap="round" />

      {/* Nose */}
      <ellipse cx="50" cy="51" rx="2.2" ry="1.8" fill="#d97706" />

      {/* Big Curled Ludo Handlebar Mustache */}
      <path
        d="M50 56 C44 54 30 52 28 60 C32 63 42 61 50 58 C58 61 68 63 72 60 C70 52 56 54 50 56 Z"
        fill="#18181b"
      />
      {/* Happy smile under mustache */}
      <path d="M46 62 Q50 65 54 62" stroke="#7f1d1d" strokeWidth="1.8" strokeLinecap="round" />

      {/* Royal Crown */}
      <path
        d="M26 36 L30 18 L40 26 L50 14 L60 26 L70 18 L74 36 Z"
        fill="url(#lk-crown)"
        stroke="#78350f"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <rect x="25" y="34" width="50" height="5" fill="#b45309" rx="1.5" />
      {/* Crown Jewels */}
      <circle cx="50" cy="20" r="2.5" fill="#ef4444" stroke="#ffffff" strokeWidth="0.8" />
      <circle cx="30" cy="23" r="2" fill="#06b6d4" stroke="#ffffff" strokeWidth="0.6" />
      <circle cx="70" cy="23" r="2" fill="#06b6d4" stroke="#ffffff" strokeWidth="0.6" />
      <circle cx="40" cy="36.5" r="1.5" fill="#10b981" />
      <circle cx="50" cy="36.5" r="1.8" fill="#ef4444" />
      <circle cx="60" cy="36.5" r="1.5" fill="#10b981" />
    </svg>
  );
}

// 2. PRO GAMER BOY (DualSense / Esports Pro)
export function AvatarProGamer({ className = 'w-full h-full' }: CartoonSvgProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="pg-bg" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#064e3b" />
          <stop offset="100%" stopColor="#021f17" />
        </radialGradient>
        <linearGradient id="pg-hair" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3f3f46" />
          <stop offset="100%" stopColor="#18181b" />
        </linearGradient>
      </defs>

      <circle cx="50" cy="50" r="48" fill="url(#pg-bg)" stroke="#10b981" strokeWidth="2" />

      {/* Gamer Hoodie */}
      <path d="M22 92 C22 75 34 72 50 72 C66 72 78 75 78 92 Z" fill="#18181b" />
      <path d="M40 73 L50 84 L60 73 Z" fill="#10b981" />
      <path d="M48 84 L48 94" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M52 84 L52 94" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />

      {/* Face & Ears */}
      <rect x="44" y="62" width="12" height="10" fill="#f59e0b" rx="2" />
      <ellipse cx="29" cy="54" rx="3.5" ry="5.5" fill="#fcd34d" />
      <ellipse cx="71" cy="54" rx="3.5" ry="5.5" fill="#fcd34d" />
      <ellipse cx="50" cy="54" rx="21" ry="19" fill="#fcd34d" />

      {/* Spiky Anime Gamer Hair */}
      <path
        d="M28 44 C26 30 36 22 50 22 C64 22 74 30 72 44 C68 36 62 34 56 35 C52 28 44 28 40 35 C36 34 30 36 28 44 Z"
        fill="url(#pg-hair)"
      />
      <path d="M34 36 L30 26 L40 32 Z" fill="#18181b" />
      <path d="M48 24 L52 16 L56 26 Z" fill="#27272a" />
      <path d="M62 30 L70 24 L66 36 Z" fill="#18181b" />

      {/* Gaming Glasses */}
      <rect x="33" y="46" width="14" height="11" rx="3" fill="#18181b" stroke="#06b6d4" strokeWidth="1.5" />
      <rect x="53" y="46" width="14" height="11" rx="3" fill="#18181b" stroke="#06b6d4" strokeWidth="1.5" />
      <line x1="47" y1="51" x2="53" y2="51" stroke="#06b6d4" strokeWidth="1.5" />
      {/* Glint on glasses */}
      <line x1="36" y1="48" x2="40" y2="48" stroke="#67e8f9" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="56" y1="48" x2="60" y2="48" stroke="#67e8f9" strokeWidth="1.5" strokeLinecap="round" />

      {/* Confident Smirk */}
      <path d="M44 63 Q52 67 57 62" stroke="#78350f" strokeWidth="2" strokeLinecap="round" />

      {/* Gaming Headset (Over-Ear) */}
      <path d="M26 48 C24 30 34 20 50 20 C66 20 76 30 74 48" stroke="#10b981" strokeWidth="4" strokeLinecap="round" />
      {/* Left Earcup */}
      <rect x="21" y="44" width="8" height="16" rx="4" fill="#09090b" stroke="#10b981" strokeWidth="1.5" />
      <circle cx="25" cy="52" r="2.5" fill="#10b981" />
      {/* Right Earcup */}
      <rect x="71" y="44" width="8" height="16" rx="4" fill="#09090b" stroke="#10b981" strokeWidth="1.5" />
      <circle cx="75" cy="52" r="2.5" fill="#10b981" />
      {/* Microphone Boom */}
      <path d="M25 56 Q28 68 42 66" stroke="#27272a" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="43" cy="66" r="2.5" fill="#10b981" />
    </svg>
  );
}

// 3. GAMER QUEEN (Cute Anime Cat-Ear Girl)
export function AvatarGamerQueen({ className = 'w-full h-full' }: CartoonSvgProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="gq-bg" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#701a75" />
          <stop offset="100%" stopColor="#2e0530" />
        </radialGradient>
        <linearGradient id="gq-hair" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e879f9" />
          <stop offset="100%" stopColor="#a21caf" />
        </linearGradient>
      </defs>

      <circle cx="50" cy="50" r="48" fill="url(#gq-bg)" stroke="#ec4899" strokeWidth="2" />

      {/* Cyber Crop Jacket */}
      <path d="M24 92 C24 76 36 73 50 73 C64 73 76 76 76 92 Z" fill="#18181b" />
      <path d="M42 74 L50 82 L58 74 Z" fill="#f43f5e" />
      <circle cx="50" cy="74" r="2" fill="#fbcfe8" />

      {/* Long Purple Hair (Back) */}
      <path d="M22 45 C18 65 20 85 24 92 C30 92 32 80 30 65 Z" fill="url(#gq-hair)" />
      <path d="M78 45 C82 65 80 85 76 92 C70 92 68 80 70 65 Z" fill="url(#gq-hair)" />

      {/* Face & Neck */}
      <rect x="45" y="62" width="10" height="9" fill="#fcd34d" rx="1" />
      <ellipse cx="50" cy="54" rx="20" ry="18" fill="#ffedd5" />

      {/* Bangs */}
      <path
        d="M28 42 C30 30 40 24 50 24 C60 24 70 30 72 42 C68 36 60 34 50 36 C42 34 32 36 28 42 Z"
        fill="url(#gq-hair)"
      />
      <path d="M38 34 Q45 42 42 46 Q40 40 35 37 Z" fill="#c026d3" />
      <path d="M62 34 Q55 42 58 46 Q60 40 65 37 Z" fill="#c026d3" />

      {/* Anime Eyes */}
      <ellipse cx="38" cy="50" rx="3.5" ry="4.5" fill="#701a75" />
      <circle cx="37" cy="48" r="1.5" fill="#ffffff" />
      <circle cx="39" cy="52" r="0.8" fill="#ffffff" />
      {/* Winking Right Eye */}
      <path d="M58 51 Q63 46 68 51" stroke="#701a75" strokeWidth="2.5" strokeLinecap="round" />

      {/* Eyelashes */}
      <path d="M34 46 L32 44" stroke="#701a75" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M42 46 L44 44" stroke="#701a75" strokeWidth="1.5" strokeLinecap="round" />

      {/* Blush & Smile */}
      <circle cx="34" cy="56" r="3" fill="#f43f5e" opacity="0.45" />
      <circle cx="66" cy="56" r="3" fill="#f43f5e" opacity="0.45" />
      <path d="M47 58 Q50 62 53 58" stroke="#be123c" strokeWidth="2" strokeLinecap="round" />

      {/* Pink Cat-Ear Headset */}
      <path d="M26 48 C24 30 34 20 50 20 C66 20 76 30 74 48" stroke="#ec4899" strokeWidth="4" strokeLinecap="round" />
      {/* Cat Ears */}
      <path d="M32 24 L24 8 L40 18 Z" fill="#f43f5e" stroke="#fbcfe8" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M32 21 L28 12 L37 18 Z" fill="#fdf2f8" />
      <path d="M68 24 L76 8 L60 18 Z" fill="#f43f5e" stroke="#fbcfe8" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M68 21 L72 12 L63 18 Z" fill="#fdf2f8" />

      {/* Headset Ear Cups */}
      <circle cx="25" cy="50" r="5" fill="#f43f5e" stroke="#fbcfe8" strokeWidth="1.5" />
      <circle cx="75" cy="50" r="5" fill="#f43f5e" stroke="#fbcfe8" strokeWidth="1.5" />
    </svg>
  );
}

// 4. SHADOW NINJA (Stealth Shinobi)
export function AvatarShadowNinja({ className = 'w-full h-full' }: CartoonSvgProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="sn-bg" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#1e1b4b" />
          <stop offset="100%" stopColor="#09090b" />
        </radialGradient>
      </defs>

      <circle cx="50" cy="50" r="48" fill="url(#sn-bg)" stroke="#818cf8" strokeWidth="2" />

      {/* Ninja Robes */}
      <path d="M22 92 C22 74 34 70 50 70 C66 70 78 74 78 92 Z" fill="#18181b" />
      <path d="M36 71 L50 88 L64 71 Z" fill="#27272a" />
      <path d="M45 74 L55 86" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" />
      <path d="M55 74 L45 86" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" />

      {/* Ninja Cowl/Hood */}
      <ellipse cx="50" cy="50" rx="24" ry="25" fill="#18181b" />

      {/* Face Opening (Skin visible only around eyes) */}
      <rect x="32" y="44" width="36" height="12" rx="4" fill="#fcd34d" />

      {/* Sharp Glowing Eyes */}
      <ellipse cx="40" cy="50" rx="3.5" ry="2.5" fill="#06b6d4" />
      <circle cx="40" cy="50" r="1.2" fill="#ffffff" />
      <ellipse cx="60" cy="50" rx="3.5" ry="2.5" fill="#06b6d4" />
      <circle cx="60" cy="50" r="1.2" fill="#ffffff" />
      {/* Fierce Anime Brows */}
      <path d="M35 46 L45 48" stroke="#18181b" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M65 46 L55 48" stroke="#18181b" strokeWidth="2.5" strokeLinecap="round" />

      {/* Lower Face Mask */}
      <path d="M30 54 Q50 62 70 54 L70 72 Q50 78 30 72 Z" fill="#27272a" stroke="#09090b" strokeWidth="1" />
      <path d="M42 63 Q50 66 58 63" stroke="#3f3f46" strokeWidth="1.2" strokeLinecap="round" />

      {/* Crimson Headband */}
      <rect x="25" y="34" width="50" height="9" rx="2" fill="#dc2626" />
      {/* Silver Plate */}
      <rect x="42" y="35" width="16" height="7" rx="1.5" fill="#e4e4e7" stroke="#71717a" strokeWidth="0.8" />
      <circle cx="45" cy="38.5" r="0.8" fill="#71717a" />
      <circle cx="55" cy="38.5" r="0.8" fill="#71717a" />
      {/* Emblem */}
      <path d="M48 38.5 L50 36.5 L52 38.5 L50 40.5 Z" fill="#dc2626" />

      {/* Headband Ribbon Tails Floating */}
      <path d="M74 38 Q84 34 88 42 Q82 43 75 42 Z" fill="#dc2626" />
    </svg>
  );
}

// 5. MECHA CYBORG (Titanium Robot)
export function AvatarMechaBot({ className = 'w-full h-full' }: CartoonSvgProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="mb-bg" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#082f49" />
          <stop offset="100%" stopColor="#02131f" />
        </radialGradient>
        <linearGradient id="mb-metal" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#94a3b8" />
          <stop offset="50%" stopColor="#64748b" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>
      </defs>

      <circle cx="50" cy="50" r="48" fill="url(#mb-bg)" stroke="#06b6d4" strokeWidth="2" />

      {/* Shoulders */}
      <path d="M22 92 C22 76 34 72 50 72 C66 72 78 76 78 92 Z" fill="#1e293b" />
      <rect x="40" y="73" width="20" height="8" rx="2" fill="#0ea5e9" opacity="0.8" />
      <circle cx="50" cy="77" r="2" fill="#ffffff" />

      {/* Neck */}
      <rect x="44" y="62" width="12" height="10" fill="#334155" />
      <line x1="44" y1="65" x2="56" y2="65" stroke="#0ea5e9" strokeWidth="1" />
      <line x1="44" y1="69" x2="56" y2="69" stroke="#0ea5e9" strokeWidth="1" />

      {/* Head */}
      <rect x="28" y="28" width="44" height="38" rx="10" fill="url(#mb-metal)" stroke="#cbd5e1" strokeWidth="1.5" />

      {/* Screws & Bolted Ear Pods */}
      <rect x="23" y="38" width="6" height="16" rx="3" fill="#0284c7" />
      <rect x="71" y="38" width="6" height="16" rx="3" fill="#0284c7" />
      <circle cx="34" cy="34" r="1.5" fill="#f8fafc" />
      <circle cx="66" cy="34" r="1.5" fill="#f8fafc" />

      {/* Antenna with Beacon */}
      <line x1="36" y1="28" x2="33" y2="15" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
      <circle cx="33" cy="14" r="3" fill="#ef4444" />
      <circle cx="33" cy="14" r="1" fill="#ffffff" />

      {/* Digital Visor */}
      <rect x="33" y="38" width="34" height="13" rx="4" fill="#020617" stroke="#06b6d4" strokeWidth="1.5" />
      {/* Digital Glow Eyes */}
      <rect x="37" y="42" width="7" height="4" rx="1" fill="#06b6d4" />
      <rect x="56" y="42" width="7" height="4" rx="1" fill="#06b6d4" />

      {/* Speaker Grill / Mouth */}
      <rect x="42" y="55" width="16" height="6" rx="2" fill="#0f172a" />
      <line x1="45" y1="58" x2="47" y2="58" stroke="#38bdf8" strokeWidth="1.5" />
      <line x1="49" y1="58" x2="51" y2="58" stroke="#38bdf8" strokeWidth="1.5" />
      <line x1="53" y1="58" x2="55" y2="58" stroke="#38bdf8" strokeWidth="1.5" />
    </svg>
  );
}

// 6. STREET HUSTLER (Cap, Aviator Shades & Gold Chain)
export function AvatarStreetHustler({ className = 'w-full h-full' }: CartoonSvgProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="sh-bg" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#27272a" />
          <stop offset="100%" stopColor="#09090b" />
        </radialGradient>
      </defs>

      <circle cx="50" cy="50" r="48" fill="url(#sh-bg)" stroke="#eab308" strokeWidth="2" />

      {/* Street Tee */}
      <path d="M22 92 C22 75 34 72 50 72 C66 72 78 75 78 92 Z" fill="#18181b" />

      {/* Heavy Gold Cuban Link Chain */}
      <path d="M38 74 Q50 88 62 74" stroke="#eab308" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="50" cy="84" r="4" fill="#fbbf24" stroke="#78350f" strokeWidth="1" />
      <text x="50" y="86.5" fontSize="5" fontWeight="bold" textAnchor="middle" fill="#78350f">
        $
      </text>

      {/* Face & Neck */}
      <rect x="44" y="62" width="12" height="10" fill="#d97706" rx="2" />
      <ellipse cx="28" cy="54" rx="3.5" ry="5.5" fill="#f59e0b" />
      <ellipse cx="72" cy="54" rx="3.5" ry="5.5" fill="#f59e0b" />
      <ellipse cx="50" cy="54" rx="21" ry="19" fill="#f59e0b" />

      {/* Backward Snapback Baseball Cap */}
      <path d="M26 44 C26 28 36 22 50 22 C64 22 74 28 74 44 Z" fill="#dc2626" />
      {/* Turned Brim at back */}
      <ellipse cx="50" cy="22" rx="18" ry="4" fill="#991b1b" />
      {/* Snapback Plastic Strap opening */}
      <path d="M42 42 Q50 38 58 42 Z" fill="#09090b" />
      <circle cx="50" cy="40" r="1" fill="#ffffff" />

      {/* Aviator Sunglasses */}
      <path
        d="M32 46 C32 44 46 44 46 46 L45 57 C45 60 33 60 33 57 Z"
        fill="#09090b"
        stroke="#eab308"
        strokeWidth="1.2"
      />
      <path
        d="M54 46 C54 44 68 44 68 46 L67 57 C67 60 55 60 55 57 Z"
        fill="#09090b"
        stroke="#eab308"
        strokeWidth="1.2"
      />
      <line x1="46" y1="48" x2="54" y2="48" stroke="#eab308" strokeWidth="1.5" />
      {/* Neon Gradient Reflection on Lens */}
      <line x1="35" y1="49" x2="42" y2="56" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="57" y1="49" x2="64" y2="56" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />

      {/* Nose */}
      <ellipse cx="50" cy="57" rx="2" ry="1.5" fill="#b45309" />

      {/* Cheeky Smirk & Goatee */}
      <path d="M44 63 Q52 66 56 61" stroke="#451a03" strokeWidth="2" strokeLinecap="round" />
      <ellipse cx="50" cy="69" rx="3.5" ry="2" fill="#18181b" />
    </svg>
  );
}

// 7. BARBARIAN VIKING (Horned Helmet & Braided Orange Beard)
export function AvatarVikingWarrior({ className = 'w-full h-full' }: CartoonSvgProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="vk-bg" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </radialGradient>
      </defs>

      <circle cx="50" cy="50" r="48" fill="url(#vk-bg)" stroke="#f97316" strokeWidth="2" />

      {/* Fur Mantle */}
      <path d="M20 92 C20 74 34 70 50 70 C66 70 80 74 80 92 Z" fill="#78350f" />
      <circle cx="34" cy="75" r="5" fill="#92400e" />
      <circle cx="66" cy="75" r="5" fill="#92400e" />

      {/* Face & Fierce Eyes */}
      <ellipse cx="50" cy="52" rx="20" ry="18" fill="#fcd34d" />
      <ellipse cx="38" cy="46" rx="2.5" ry="2.5" fill="#18181b" />
      <ellipse cx="62" cy="46" rx="2.5" ry="2.5" fill="#18181b" />
      {/* Thick Orange Eyebrows */}
      <path d="M32 41 L44 44" stroke="#ea580c" strokeWidth="3" strokeLinecap="round" />
      <path d="M68 41 L56 44" stroke="#ea580c" strokeWidth="3" strokeLinecap="round" />

      {/* Big Bushy Braided Ginger Beard */}
      <path
        d="M28 54 C26 72 36 86 46 90 L50 94 L54 90 C64 86 74 72 72 54 C66 58 56 60 50 60 C44 60 34 58 28 54 Z"
        fill="#ea580c"
      />
      {/* Beard Ring / Braid */}
      <rect x="47" y="85" width="6" height="3" fill="#cbd5e1" rx="1" />
      {/* Mustache */}
      <path d="M36 56 Q50 64 64 56 Q50 54 36 56 Z" fill="#c2410c" />

      {/* Viking Steel Helmet */}
      <path d="M26 38 C26 22 36 18 50 18 C64 18 74 22 74 38 Z" fill="#64748b" stroke="#334155" strokeWidth="1.5" />
      <rect x="25" y="36" width="50" height="5" fill="#475569" rx="1" />
      {/* Nose Guard */}
      <path d="M47 38 L50 48 L53 38 Z" fill="#334155" />

      {/* Horns */}
      {/* Left Horn */}
      <path d="M27 34 C20 30 16 18 20 12 C24 20 28 26 30 32 Z" fill="#fef08a" stroke="#78350f" strokeWidth="1" />
      {/* Right Horn */}
      <path d="M73 34 C80 30 84 18 80 12 C76 20 72 26 70 32 Z" fill="#fef08a" stroke="#78350f" strokeWidth="1" />
    </svg>
  );
}

// 8. NEON CYBER SKULL (Cyber Reaper)
export function AvatarCyberSkull({ className = 'w-full h-full' }: CartoonSvgProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="cs-bg" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#4c0519" />
          <stop offset="100%" stopColor="#09090b" />
        </radialGradient>
      </defs>

      <circle cx="50" cy="50" r="48" fill="url(#cs-bg)" stroke="#f43f5e" strokeWidth="2" />

      {/* Dark Tactical Hood */}
      <path d="M20 92 C20 74 32 68 50 68 C68 68 80 74 80 92 Z" fill="#18181b" />
      <path d="M24 50 C22 26 34 16 50 16 C66 16 78 26 76 50 C76 68 68 76 50 76 C32 76 24 68 24 50 Z" fill="#18181b" />

      {/* Skull Face */}
      <path
        d="M32 44 C32 30 40 26 50 26 C60 26 68 30 68 44 C68 54 62 58 60 64 L40 64 C38 58 32 54 32 44 Z"
        fill="#f4f4f5"
      />

      {/* Glowing Neon Sockets */}
      <ellipse cx="41" cy="45" rx="5" ry="6" fill="#09090b" stroke="#f43f5e" strokeWidth="1.2" />
      <circle cx="41" cy="45" r="2.5" fill="#f43f5e" />
      <circle cx="41" cy="45" r="1" fill="#ffffff" />

      <ellipse cx="59" cy="45" rx="5" ry="6" fill="#09090b" stroke="#f43f5e" strokeWidth="1.2" />
      <circle cx="59" cy="45" r="2.5" fill="#f43f5e" />
      <circle cx="59" cy="45" r="1" fill="#ffffff" />

      {/* Inverted Triangle Nose */}
      <path d="M48 53 L52 53 L50 56 Z" fill="#09090b" />

      {/* Skull Teeth Grid */}
      <rect x="42" y="60" width="16" height="5" rx="1.5" fill="#18181b" />
      <line x1="45" y1="60" x2="45" y2="65" stroke="#f4f4f5" strokeWidth="1" />
      <line x1="48" y1="60" x2="48" y2="65" stroke="#f4f4f5" strokeWidth="1" />
      <line x1="52" y1="60" x2="52" y2="65" stroke="#f4f4f5" strokeWidth="1" />
      <line x1="55" y1="60" x2="55" y2="65" stroke="#f4f4f5" strokeWidth="1" />

      {/* Cyber Circuit Forehead Engraving */}
      <path d="M50 28 L50 36 M44 32 L56 32" stroke="#06b6d4" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

// 9. BILLIARDS 8-BALL HUSTLER
export function AvatarPoolHustler({ className = 'w-full h-full' }: CartoonSvgProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="ph-bg" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#065f46" />
          <stop offset="100%" stopColor="#022c22" />
        </radialGradient>
      </defs>

      <circle cx="50" cy="50" r="48" fill="url(#ph-bg)" stroke="#10b981" strokeWidth="2" />

      {/* Waistcoat */}
      <path d="M22 92 C22 75 34 72 50 72 C66 72 78 75 78 92 Z" fill="#064e3b" />
      <path d="M40 73 L50 84 L60 73 Z" fill="#ffffff" />
      <polygon points="50,77 48,82 52,82" fill="#09090b" />

      {/* Face & Neck */}
      <rect x="44" y="62" width="12" height="10" fill="#f59e0b" rx="2" />
      <ellipse cx="50" cy="54" rx="21" ry="19" fill="#fcd34d" />

      {/* Cool Smug Eyes */}
      <ellipse cx="38" cy="50" rx="3" ry="3.5" fill="#18181b" />
      <circle cx="37" cy="49" r="1.2" fill="#ffffff" />
      {/* Winking right eye */}
      <path d="M57 51 Q62 47 67 51" stroke="#18181b" strokeWidth="2.5" strokeLinecap="round" />

      {/* Toothpick in mouth */}
      <line x1="54" y1="62" x2="66" y2="66" stroke="#fef08a" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M44 62 Q50 65 54 62" stroke="#78350f" strokeWidth="2" strokeLinecap="round" />

      {/* 8-Ball Flat Peaky Cap */}
      <ellipse cx="50" cy="38" rx="25" ry="14" fill="#18181b" />
      <path d="M24 38 Q50 42 76 38" stroke="#3f3f46" strokeWidth="3" />
      {/* 8-Ball Emblem on Cap */}
      <circle cx="50" cy="32" r="7" fill="#09090b" stroke="#ffffff" strokeWidth="1.2" />
      <circle cx="50" cy="32" r="4" fill="#ffffff" />
      <text x="50" y="34.5" fontSize="6" fontWeight="bold" textAnchor="middle" fill="#09090b">
        8
      </text>
    </svg>
  );
}

// 10. INFERNO DRAGON (Cute Cartoon Fire Dragon)
export function AvatarInfernoDragon({ className = 'w-full h-full' }: CartoonSvgProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="id-bg" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#9a3412" />
          <stop offset="100%" stopColor="#431407" />
        </radialGradient>
      </defs>

      <circle cx="50" cy="50" r="48" fill="url(#id-bg)" stroke="#f97316" strokeWidth="2" />

      {/* Dragon Scales Shoulders */}
      <path d="M22 92 C22 75 34 72 50 72 C66 72 78 75 78 92 Z" fill="#c2410c" />
      {/* Yellow Belly Scales */}
      <path d="M40 76 Q50 82 60 76 L62 92 L38 92 Z" fill="#fef08a" />

      {/* Golden Dragon Horns */}
      <path d="M30 36 C24 24 20 14 26 10 C32 16 34 26 36 34 Z" fill="#fbbf24" stroke="#b45309" strokeWidth="1" />
      <path d="M70 36 C76 24 80 14 74 10 C68 16 66 26 64 34 Z" fill="#fbbf24" stroke="#b45309" strokeWidth="1" />

      {/* Dragon Head */}
      <ellipse cx="50" cy="52" rx="23" ry="20" fill="#ea580c" />
      {/* Snout */}
      <path d="M34 54 Q50 48 66 54 L64 68 Q50 72 36 68 Z" fill="#f97316" />

      {/* Big Friendly Cartoon Eyes */}
      <ellipse cx="38" cy="46" rx="4" ry="5.5" fill="#fef08a" stroke="#78350f" strokeWidth="1" />
      <ellipse cx="38" cy="46" rx="2" ry="4" fill="#18181b" />
      <circle cx="37" cy="44" r="1.2" fill="#ffffff" />

      <ellipse cx="62" cy="46" rx="4" ry="5.5" fill="#fef08a" stroke="#78350f" strokeWidth="1" />
      <ellipse cx="62" cy="46" rx="2" ry="4" fill="#18181b" />
      <circle cx="61" cy="44" r="1.2" fill="#ffffff" />

      {/* Nostrils with Fire Puff */}
      <circle cx="45" cy="62" r="1.8" fill="#78350f" />
      <circle cx="55" cy="62" r="1.8" fill="#78350f" />
      {/* Tiny Smoke puff */}
      <circle cx="58" cy="59" r="1.5" fill="#fdba74" opacity="0.8" />
      <circle cx="61" cy="57" r="2" fill="#fed7aa" opacity="0.6" />

      {/* Cute Little Fangs */}
      <polygon points="42,67 44,71 46,67" fill="#ffffff" />
      <polygon points="54,67 56,71 58,67" fill="#ffffff" />
    </svg>
  );
}

// 11. SYNTHWAVE PUNK (Neon Retro Visor & Mohawk)
export function AvatarSynthwavePunk({ className = 'w-full h-full' }: CartoonSvgProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="sp-bg" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#831843" />
          <stop offset="100%" stopColor="#1e1b4b" />
        </radialGradient>
        <linearGradient id="sp-visor" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#f43f5e" />
          <stop offset="50%" stopColor="#d946ef" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>

      <circle cx="50" cy="50" r="48" fill="url(#sp-bg)" stroke="#ec4899" strokeWidth="2" />

      {/* Neon Jacket */}
      <path d="M22 92 C22 75 34 72 50 72 C66 72 78 75 78 92 Z" fill="#18181b" />
      <path d="M30 74 L50 92 L70 74" stroke="#f43f5e" strokeWidth="2" />

      {/* Neon Pink Spiked Mohawk */}
      <path d="M44 26 L50 10 L56 26 Z" fill="#ec4899" />
      <path d="M38 30 L42 16 L48 28 Z" fill="#d946ef" />
      <path d="M52 28 L58 16 L62 30 Z" fill="#d946ef" />

      {/* Face & Neck */}
      <rect x="44" y="62" width="12" height="10" fill="#78350f" rx="2" />
      <ellipse cx="28" cy="54" rx="3.5" ry="5.5" fill="#92400e" />
      <ellipse cx="72" cy="54" rx="3.5" ry="5.5" fill="#92400e" />
      {/* Earring */}
      <circle cx="28" cy="58" r="2" stroke="#fbbf24" strokeWidth="1" fill="none" />
      <ellipse cx="50" cy="54" rx="21" ry="19" fill="#92400e" />

      {/* Full Cyber Wraparound Neon Visor */}
      <rect x="26" y="44" width="48" height="13" rx="3" fill="url(#sp-visor)" stroke="#ffffff" strokeWidth="1" />
      {/* Scanlines */}
      <line x1="28" y1="48" x2="72" y2="48" stroke="#ffffff" strokeWidth="0.8" opacity="0.6" />
      <line x1="28" y1="52" x2="72" y2="52" stroke="#ffffff" strokeWidth="0.8" opacity="0.6" />

      {/* Smirk */}
      <path d="M44 64 Q52 68 56 63" stroke="#451a03" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// 12. TACTICAL SNIPER (Night Vision Spec-Ops)
export function AvatarTacticalSniper({ className = 'w-full h-full' }: CartoonSvgProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="ts-bg" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#14532d" />
          <stop offset="100%" stopColor="#052e16" />
        </radialGradient>
      </defs>

      <circle cx="50" cy="50" r="48" fill="url(#ts-bg)" stroke="#22c55e" strokeWidth="2" />

      {/* Tactical Vest */}
      <path d="M22 92 C22 75 34 70 50 70 C66 70 78 75 78 92 Z" fill="#1c1917" />
      <rect x="36" y="76" width="12" height="12" rx="2" fill="#292524" />
      <rect x="52" y="76" width="12" height="12" rx="2" fill="#292524" />

      {/* Balaclava Head */}
      <ellipse cx="50" cy="50" rx="22" ry="24" fill="#292524" />

      {/* Eye Slot */}
      <rect x="33" y="42" width="34" height="12" rx="3" fill="#fcd34d" />

      {/* Left Eye (Normal) */}
      <ellipse cx="40" cy="48" rx="3" ry="2.5" fill="#18181b" />

      {/* Right Eye (Tactical Red Laser Monocle) */}
      <circle cx="60" cy="48" r="7" fill="#09090b" stroke="#ef4444" strokeWidth="1.5" />
      <circle cx="60" cy="48" r="3.5" fill="#ef4444" />
      <circle cx="60" cy="48" r="1.5" fill="#ffffff" />
      {/* Crosshair lines on monocle */}
      <line x1="53" y1="48" x2="67" y2="48" stroke="#ef4444" strokeWidth="0.8" />
      <line x1="60" y1="41" x2="60" y2="55" stroke="#ef4444" strokeWidth="0.8" />

      {/* Comms Mic */}
      <path d="M28 54 Q32 66 42 64" stroke="#78716c" strokeWidth="2" strokeLinecap="round" />
      <circle cx="43" cy="64" r="2.2" fill="#22c55e" />
    </svg>
  );
}

/**
 * Registry mapping avatar ID to its dedicated Cartoon SVG Component
 */
export const CARTOON_AVATAR_COMPONENTS: Record<string, React.FC<CartoonSvgProps>> = {
  crown_king: AvatarLudoKing,
  ps_controller: AvatarProGamer,
  gamer_girl: AvatarGamerQueen,
  ninja_ghost: AvatarShadowNinja,
  mecha_bot: AvatarMechaBot,
  urban_hustler: AvatarStreetHustler,
  viking_warrior: AvatarVikingWarrior,
  cyber_skull: AvatarCyberSkull,
  pool_8ball: AvatarPoolHustler,
  dragon_fire: AvatarInfernoDragon,
  visor_punk: AvatarSynthwavePunk,
  laser_crosshair: AvatarTacticalSniper,
  lightning_bolt: AvatarSynthwavePunk, // Fallback to synthwave spark
};
