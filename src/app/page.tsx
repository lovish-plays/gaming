'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import type { Profile } from '@/lib/types';
import Header from '@/components/Header';
import ParallaxHero from '@/components/ParallaxHero';
import AdminTerminal from '@/components/AdminTerminal';
import LiveStations from '@/components/LiveStations';
import PricingSection from '@/components/PricingSection';
import CommunityPoll from '@/components/CommunityPoll';
import LoungeChat from '@/components/LoungeChat';
import CustomerWallet from '@/components/CustomerWallet';
import Leaderboard from '@/components/Leaderboard';
import AuthForm from '@/components/AuthForm';
import { Gamepad2, Shield, QrCode, ArrowRight, Sparkles } from 'lucide-react';

export default function HomePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [showAuth, setShowAuth] = useState(false);

  const supabase = createClient();

  // Load session and profile on mount safely without blocking page render
  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user && mounted) {
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          if (mounted) setProfile(data ?? null);
        }
      } catch (err) {
        console.warn('Session check note:', err);
      }
    };

    loadProfile();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        try {
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          if (mounted) {
            setProfile(data ?? null);
            setShowAuth(false);
          }
        } catch {
          // ignore
        }
      } else {
        if (mounted) setProfile(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  if (showAuth) {
    return <AuthForm onClose={() => setShowAuth(false)} />;
  }

  return (
    <div className="min-h-screen bg-transparent text-white">
      <Header profile={profile} onAuthClick={() => setShowAuth(true)} />

      <main className="max-w-3xl mx-auto px-4 py-4 sm:py-6">
        {/* ======================================================== */}
        {/* 1. 3D PARALLAX SCROLL-DRIVEN HERO SECTION                */}
        {/* ======================================================== */}
        <ParallaxHero />

        {/* ======================================================== */}
        {/* 2. ADMIN TERMINAL (SHOWN ONLY TO USERS WITH ROLE === ADMIN) */}
        {/* ======================================================== */}
        {profile?.role === 'ADMIN' && (
          <div className="mb-8">
            <AdminTerminal />
          </div>
        )}

        {/* ======================================================== */}
        {/* 3. REAL-TIME LIVE STATIONS (POOL TABLES & CONSOLES)      */}
        {/* ======================================================== */}
        <LiveStations profile={profile} />

        {/* ======================================================== */}
        {/* 4. TIME-AWARE PRICING & HAPPY HOURS SECTION              */}
        {/* ======================================================== */}
        <PricingSection />

        {/* ======================================================== */}
        {/* 5. INTERACTIVE COMMUNITY: LIVE POLL & LOUNGE LIVE CHAT   */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 items-stretch">
          <CommunityPoll profile={profile} onAuthClick={() => setShowAuth(true)} />
          <LoungeChat profile={profile} onAuthClick={() => setShowAuth(true)} />
        </div>

        {/* ======================================================== */}
        {/* 6. CUSTOMER WALLET (IF LOGGED IN) OR CLEAN AUTH CARD     */}
        {/* ======================================================== */}
        {profile && profile.role === 'CUSTOMER' ? (
          <CustomerWallet
            initialProfile={profile}
            onProfileUpdate={(updated) => setProfile(updated)}
          />
        ) : !profile ? (
          <section id="auth-card" className="mb-8 scroll-mt-20">
            <div className="relative overflow-hidden rounded-2xl glass-card border border-gold/40 p-6 sm:p-8 text-center shadow-[0_0_35px_rgba(245,158,11,0.12)]">
              {/* Background ambient glow */}
              <div className="absolute top-0 right-0 w-44 h-44 rounded-full bg-gold/10 blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-44 h-44 rounded-full bg-neon-green/10 blur-3xl pointer-events-none" />

              <div className="w-12 h-12 rounded-2xl bg-gold/15 border border-gold/30 mx-auto flex items-center justify-center text-gold mb-3.5 shadow-inner">
                <QrCode size={24} />
              </div>

              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-gold block mb-1">
                VIP Gaming Rewards
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white mb-2 tracking-wide">
                Get Your Digital Member Pass
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 max-w-md mx-auto mb-5 leading-relaxed">
                Spend <span className="text-gold font-bold">₹1,000</span> across visits and unlock <span className="text-neon-green font-bold">1 Free Hour</span> on any Pool Table or PS5 Console. Track your balance and checkout instantly at the counter with your personal QR pass.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => setShowAuth(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gold text-brand-bg text-xs font-black uppercase tracking-wider hover:bg-gold-dim active:scale-95 transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] cursor-pointer"
                >
                  <Sparkles size={14} />
                  <span>Sign In or Claim Free Pass</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </section>
        ) : null}

        {/* ======================================================== */}
        {/* 6. HALL OF FAME LEADERBOARD (TOP 5 GAMERS)               */}
        {/* ======================================================== */}
        <Leaderboard />

        {/* ======================================================== */}
        {/* FOOTER                                                   */}
        {/* ======================================================== */}
        <footer className="mt-12 pb-8 text-center text-xs text-gray-500 border-t border-white/10 pt-6">
          <p className="font-bold text-gray-400 uppercase tracking-widest">
            Underground <span className="text-neon-green">· A Gaming Playstation</span>
          </p>
          <p className="text-[11px] text-gray-500 mt-1">
            Real-time Station WebSockets · Digital Member QR Pass · Happy Hours Lounge
          </p>
        </footer>
      </main>
    </div>
  );
}
