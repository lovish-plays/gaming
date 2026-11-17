'use client';

import { useState } from 'react';
import { Gamepad2, Mail, Lock, User, Phone, Loader2, Eye, EyeOff } from 'lucide-react';
import { createClient } from '@/lib/supabase';

type Mode = 'login' | 'signup';

export default function AuthForm() {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        // Validate phone uniqueness hint
        if (!phone.trim() || phone.trim().length < 10) {
          setError('Please enter a valid 10-digit phone number.');
          return;
        }
        if (!fullName.trim()) {
          setError('Please enter your full name.');
          return;
        }

        const { error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
              phone: phone.trim(),
            },
          },
        });

        if (signUpError) throw signUpError;
        setSuccess('Account created! You can now sign in.');
        setMode('login');
        setFullName('');
        setPhone('');
        setPassword('');
      } else {
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (loginError) throw loginError;
        // Page will re-render from parent state change
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen hero-gradient flex flex-col items-center justify-center px-4 py-12">
      {/* Logo / Brand */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-neon-green/10 border border-neon-green/30 mb-4 shadow-[0_0_20px_rgba(0,255,135,0.2)]">
          <Gamepad2 size={32} className="text-neon-green" />
        </div>
        <h1 className="text-3xl font-black text-white tracking-widest uppercase leading-none">
          Underground
        </h1>
        <p className="text-xs font-semibold tracking-widest text-neon-green uppercase mt-2">
          A Gaming Playstation
        </p>
        <p className="text-xs text-gray-400 mt-2">Your underground gaming lounge</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm glass-card border border-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur-2xl">
        {/* Tab switcher */}
        <div className="flex gap-1 p-1 bg-black/60 border border-white/5 rounded-xl mb-6">
          {(['login', 'signup'] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(''); setSuccess(''); }}
              className={[
                'flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all',
                mode === m
                  ? 'bg-neon-green text-brand-bg shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                  : 'text-gray-400 hover:text-white',
              ].join(' ')}
            >
              {m === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        {/* Error / Success */}
        {error && (
          <div className="mb-4 px-3 py-2 rounded-lg bg-crimson/10 border border-crimson/30 text-crimson text-xs">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 px-3 py-2 rounded-lg bg-neon-green/10 border border-neon-green/30 text-neon-green text-xs">
            {success}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'signup' && (
            <>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Full Name"
                  required
                  className="w-full bg-brand-bg border border-brand-border rounded-lg pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:border-neon-green/60 focus:ring-1 focus:ring-neon-green/30 transition-colors"
                />
              </div>
              <div className="relative">
                <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="tel"
                  inputMode="numeric"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone Number (10 digits)"
                  required
                  maxLength={10}
                  className="w-full bg-brand-bg border border-brand-border rounded-lg pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:border-neon-green/60 focus:ring-1 focus:ring-neon-green/30 transition-colors"
                />
              </div>
            </>
          )}

          <div className="relative">
            <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              required
              className="w-full bg-brand-bg border border-brand-border rounded-lg pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:border-neon-green/60 focus:ring-1 focus:ring-neon-green/30 transition-colors"
            />
          </div>

          <div className="relative">
            <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              minLength={6}
              className="w-full bg-brand-bg border border-brand-border rounded-lg pl-9 pr-10 py-2.5 text-sm text-white placeholder:text-gray-600 focus:border-neon-green/60 focus:ring-1 focus:ring-neon-green/30 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
            >
              {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-neon-green text-brand-bg font-bold text-sm hover:bg-neon-green-dim active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 mt-2"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : mode === 'login' ? (
              'Sign In'
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {mode === 'login' && (
          <p className="mt-4 text-center text-xs text-gray-600">
            New here?{' '}
            <button
              onClick={() => setMode('signup')}
              className="text-neon-green hover:underline font-medium"
            >
              Create a free account
            </button>
          </p>
        )}
      </div>

      {/* Guest note */}
      <p className="mt-6 text-xs text-gray-600 text-center max-w-xs">
        You can also view station availability without signing in — just scroll down.
      </p>
    </div>
  );
}
