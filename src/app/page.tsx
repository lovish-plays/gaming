'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import type { Profile } from '@/lib/types';
import Header from '@/components/Header';
import ParallaxHero from '@/components/ParallaxHero';
import LiveStations from '@/components/LiveStations';
import CustomerWallet from '@/components/CustomerWallet';
import AdminTerminal from '@/components/AdminTerminal';
import AuthForm from '@/components/AuthForm';
import { Gamepad2, Shield, QrCode, ArrowRight } from 'lucide-react';

export default function HomePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);

  const supabase = createClient();

  // Load session and profile on mount
  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
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
      if (mounted) setLoading(false);
    };

    loadProfile();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        if (mounted) {
          setProfile(data ?? null);
          setShowAuth(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-neon-green/10 border border-neon-green/30 mb-4 animate-pulse shadow-[0_0_25px_rgba(16,185,129,0.2)]">
            <Gamepad2 size={32} className="text-neon-green" />
          </div>
          <p className="text-xs uppercase tracking-widest text-gray-500 font-mono">
            Loading Underground Lounge…
          </p>
        </div>
      </div>
    );
  }

  if (showAuth) {
    return <AuthForm />;
  }

  return (
    <div className="min-h-screen bg-brand-bg text-white">
      <Header profile={profile} onAuthClick={() => setShowAuth(true)} />

      <main className="max-w-2xl mx-auto px-4 py-5">
        {/* ======================================================== */}
        {/* 3D SCROLL-DRIVEN PARALLAX CYBERPUNK HERO                */}
        {/* ======================================================== */}
        <ParallaxHero
          onScrollToStations={() => {
            const el = document.getElementById('floor-status');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* ======================================================== */}
        {/* LOGGED IN USER QUICK BANNER                             */}
        {/* ======================================================== */}
        {profile && (
          <div className="mb-6 rounded-2xl glass-card border border-white/10 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-neon-green/15 border border-neon-green/30 flex items-center justify-center text-neon-green font-bold">
                {profile.full_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-white">
                    {profile.full_name}
                  </p>
                  {profile.role === 'ADMIN' ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gold bg-gold/15 border border-gold/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      <Shield size={10} /> Admin
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-neon-green bg-neon-green/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Member
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">📞 {profile.phone}</p>
              </div>
            </div>

            {profile.role === 'CUSTOMER' && (
              <div className="text-right">
                <span className="text-xs text-gray-400 block font-medium">Free Hours</span>
                <span className="text-lg font-black text-gold font-mono">
                  {profile.free_hours} hrs
                </span>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* ADMIN TERMINAL (SCANNER + PHONE + BILLING + REDEEM)      */}
        {/* ======================================================== */}
        {profile?.role === 'ADMIN' && <AdminTerminal />}

        {/* ======================================================== */}
        {/* LIVE FLOOR STATUS (4 STATIONS WITH 3D TILT ANIMATION)   */}
        {/* ======================================================== */}
        <LiveStations profile={profile} />

        {/* ======================================================== */}
        {/* CUSTOMER WALLET + DIGITAL MEMBER QR PASS                 */}
        {/* ======================================================== */}
        {profile && profile.role === 'CUSTOMER' && (
          <CustomerWallet initialProfile={profile} />
        )}

        {/* ======================================================== */}
        {/* GUEST REWARDS CTA BANNER                                */}
        {/* ======================================================== */}
        {!profile && (
          <div className="mt-4 mb-8 rounded-2xl glass-card border border-gold/30 p-6 text-center relative overflow-hidden shadow-[0_0_35px_rgba(245,158,11,0.1)]">
            <div className="absolute top-0 right-0 w-36 h-36 rounded-full bg-gold/5 blur-2xl pointer-events-none" />
            <div className="w-12 h-12 rounded-2xl bg-gold/15 border border-gold/30 mx-auto flex items-center justify-center text-gold mb-3">
              <QrCode size={24} />
            </div>
            <h3 className="text-lg font-black text-white mb-1 tracking-wide">
              Unlock Your Digital Member Pass
            </h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto mb-4">
              Earn 1 Free Gaming Hour for every ₹1,000 spent. Get your scannable counter QR pass and track balance in real time.
            </p>
            <button
              onClick={() => setShowAuth(true)}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gold text-brand-bg text-sm font-bold hover:bg-gold-dim active:scale-95 transition-all shadow-[0_0_20px_rgba(245,158,11,0.25)]"
            >
              <span>Join VIP Rewards</span>
              <ArrowRight size={15} />
            </button>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 pb-8 text-center text-xs text-gray-600 border-t border-white/5 pt-6">
          <p className="font-bold text-gray-400 uppercase tracking-widest">
            Underground <span className="text-neon-green">· A Gaming Playstation</span>
          </p>
          <p className="text-[11px] text-gray-600 mt-1">
            Real-time Station WebSockets · Digital Member QR Pass · High-Score Lounge
          </p>
        </footer>
      </main>
    </div>
  );
}
