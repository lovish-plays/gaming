'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Gamepad2,
  Mail,
  KeyRound,
  User,
  ArrowRight,
  Loader2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
  ShieldCheck,
} from 'lucide-react';
import { createClient } from '@/lib/supabase';

interface AuthSectionProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

export default function AuthSection({ onClose, onSuccess }: AuthSectionProps) {
  // Step 1: 'email' | Step 2: 'otp'
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  // 30-second resend timer
  const [resendTimer, setResendTimer] = useState(0);

  const supabase = createClient();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Step 1: Send 6-Digit Email OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          shouldCreateUser: true,
          data: {
            full_name: fullName.trim() || undefined,
          },
        },
      });

      if (otpError) throw otpError;

      setStep('otp');
      setResendTimer(30);
      setInfo(`We've sent a 6-digit login code to ${cleanEmail}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send verification code.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify 6-Digit OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanCode = otpCode.trim();
    if (!cleanCode || cleanCode.length < 6) {
      setError('Please enter the full 6-digit verification code.');
      return;
    }

    setLoading(true);
    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: cleanCode,
        type: 'email',
      });

      if (verifyError) throw verifyError;

      setInfo('Verified! Welcome to Underground.');
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid or expired verification code.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Resend code
  const handleResend = async () => {
    if (resendTimer > 0 || loading) return;
    setError(null);
    setLoading(true);
    try {
      const { error: resendError } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          shouldCreateUser: true,
          data: {
            full_name: fullName.trim() || undefined,
          },
        },
      });
      if (resendError) throw resendError;
      setResendTimer(30);
      setInfo(`A fresh 6-digit code has been sent to ${email}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to resend code.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030306]/95 backdrop-blur-xl flex flex-col items-center justify-center px-4 py-8 relative z-50">
      {/* Background Cyber Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-neon-green/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-72 h-72 rounded-full bg-crimson/10 blur-[100px] pointer-events-none" />

      {/* Brand Header */}
      <div className="mb-6 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-neon-green/10 border border-neon-green/30 mb-3 shadow-[0_0_20px_rgba(16,185,129,0.25)]">
          <Gamepad2 size={28} className="text-neon-green" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-widest uppercase leading-none">
          Underground
        </h1>
        <p className="text-[10px] sm:text-xs font-bold tracking-widest text-neon-green uppercase mt-1.5">
          A Gaming Playstation
        </p>
      </div>

      {/* Main Glassmorphic Auth Card */}
      <div className="w-full max-w-sm glass-card border border-white/10 rounded-3xl p-6 sm:p-7 shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl relative overflow-hidden">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-xs font-semibold text-gray-400 hover:text-white p-1.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            title="Close"
          >
            <X size={15} />
          </button>
        )}

        {/* Step Progression Indicators */}
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                step === 'email'
                  ? 'bg-neon-green text-black shadow-[0_0_8px_rgba(16,185,129,0.4)]'
                  : 'bg-neon-green/20 text-neon-green border border-neon-green/40'
              }`}
            >
              1
            </span>
            <span className="text-xs font-bold text-gray-200">Email</span>
          </div>

          <span className="h-0.5 w-8 bg-white/10" />

          <div className="flex items-center gap-2">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                step === 'otp'
                  ? 'bg-neon-green text-black shadow-[0_0_8px_rgba(16,185,129,0.4)]'
                  : 'bg-white/10 text-gray-500'
              }`}
            >
              2
            </span>
            <span
              className={`text-xs font-bold ${
                step === 'otp' ? 'text-gray-200' : 'text-gray-500'
              }`}
            >
              6-Digit Code
            </span>
          </div>
        </div>

        {/* Error / Info Alerts */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="mb-4 flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl bg-crimson/15 border border-crimson/40 text-crimson text-xs"
            >
              <AlertCircle size={15} className="mt-0.5 flex-shrink-0" />
              <span className="flex-1 font-medium leading-relaxed">{error}</span>
            </motion.div>
          )}

          {info && !error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="mb-4 flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl bg-neon-green/15 border border-neon-green/30 text-neon-green text-xs"
            >
              <CheckCircle2 size={15} className="mt-0.5 flex-shrink-0" />
              <span className="flex-1 font-medium leading-relaxed">{info}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ======================================================== */}
        {/* STEP 1: ENTER EMAIL & OPTIONAL GAMER NAME                */}
        {/* ======================================================== */}
        {step === 'email' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="gamer@example.com"
                  autoFocus
                  className="w-full bg-[#080811] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-neon-green focus:ring-1 focus:ring-neon-green/30 transition-all font-mono"
                />
              </div>
              <p className="text-[10px] text-gray-500 mt-1">
                We'll email you a secure 6-digit one-time passcode.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                Gamer / Player Name <span className="text-gray-500 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <User
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"
                />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alex Hunter"
                  className="w-full bg-[#080811] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-neon-green focus:ring-1 focus:ring-neon-green/30 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider bg-neon-green text-black hover:bg-neon-green/90 active:scale-[0.99] transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Sending Code…</span>
                </>
              ) : (
                <>
                  <span>Send Verification Code</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>
        ) : (
          /* ======================================================== */
          /* STEP 2: ENTER 6-DIGIT VERIFICATION CODE                  */
          /* ======================================================== */
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                  6-Digit OTP Code
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setStep('email');
                    setOtpCode('');
                    setError(null);
                  }}
                  className="text-[10px] text-neon-green hover:underline cursor-pointer"
                >
                  Change Email
                </button>
              </div>

              <div className="relative">
                <KeyRound
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"
                />
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  autoFocus
                  className="w-full bg-[#080811] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-center text-lg tracking-[0.4em] font-mono font-bold text-white placeholder-gray-600 focus:outline-none focus:border-neon-green focus:ring-1 focus:ring-neon-green/30 transition-all"
                />
              </div>
              <p className="text-[10px] text-gray-500 mt-1">
                Sent to <span className="text-gray-300 font-mono">{email}</span>
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || otpCode.trim().length !== 6}
              className="w-full py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider bg-neon-green text-black hover:bg-neon-green/90 active:scale-[0.99] transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Verifying Code…</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={16} />
                  <span>Verify &amp; Sign In</span>
                </>
              )}
            </button>

            {/* Resend Timer & Button */}
            <div className="pt-2 text-center text-xs text-gray-400">
              {resendTimer > 0 ? (
                <span className="font-mono text-gray-500">
                  Resend code in {resendTimer}s
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 text-neon-green hover:underline font-semibold cursor-pointer"
                >
                  <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                  <span>Resend Verification Code</span>
                </button>
              )}
            </div>
          </form>
        )}

        <div className="mt-5 pt-4 border-t border-white/10 text-center">
          <p className="text-[11px] text-gray-500">
            🔒 Passwordless &amp; Instant. Verified 1-to-1 account link.
          </p>
        </div>
      </div>
    </div>
  );
}
