'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Gamepad2,
  Mail,
  KeyRound,
  User,
  Phone,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
  ShieldCheck,
  LogIn,
  UserPlus,
  Lock,
} from 'lucide-react';
import { createClient } from '@/lib/supabase';

interface AuthSectionProps {
  onClose?: () => void;
  onSuccess?: () => void;
  initialMode?: 'signin' | 'signup';
}

export default function AuthSection({
  onClose,
  onSuccess,
  initialMode = 'signin',
}: AuthSectionProps) {
  // Mode: 'signin' | 'signup'
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);

  // Step 1: 'form' | Step 2: 'otp'
  const [step, setStep] = useState<'form' | 'otp'>('form');

  // Form inputs
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
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

  // Clean phone helper
  const getCleanPhone = (raw: string) => {
    let digits = raw.replace(/\D/g, '');
    if (digits.length > 10 && digits.startsWith('91')) {
      digits = digits.slice(2);
    }
    return digits;
  };

  // Switch between Sign In and Sign Up tabs
  const handleSwitchMode = (newMode: 'signin' | 'signup') => {
    setMode(newMode);
    setStep('form');
    setError(null);
    setInfo(null);
    setOtpCode('');
  };

  // Step 1: Submit Form (Sign In or Sign Up)
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError('Please enter a valid email address.');
      return;
    }

    let cleanPhone = '';
    if (mode === 'signup') {
      if (!fullName.trim() || fullName.trim().length < 2) {
        setError('Please enter your full name (minimum 2 characters).');
        return;
      }

      cleanPhone = getCleanPhone(phone);
      if (!cleanPhone || cleanPhone.length !== 10) {
        setError('Please enter a valid 10-digit Indian mobile number.');
        return;
      }
    }

    setLoading(true);

    try {
      // 1. Check if user already exists
      const { data: checkData, error: checkError } = await supabase.rpc(
        'check_user_exists',
        {
          p_email: cleanEmail,
          p_phone: cleanPhone || null,
        }
      );

      if (!checkError && checkData) {
        if (mode === 'signup') {
          // If Sign Up and email already exists -> THROW ERROR
          if (checkData.email_exists) {
            throw new Error(
              'An account with this email already exists. Please switch to Sign In.'
            );
          }
          // If Sign Up and phone already exists -> THROW ERROR
          if (checkData.phone_exists) {
            throw new Error(
              'This mobile number is already registered to another account. Please use a different number.'
            );
          }
        } else if (mode === 'signin') {
          // If Sign In and email doesn't exist -> GUIDE TO SIGN UP
          if (checkData.email_exists === false) {
            throw new Error(
              'No account found with this email. Please switch to Sign Up to create your account.'
            );
          }
        }
      }

      // 2. Send 6-digit OTP code to email
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          shouldCreateUser: mode === 'signup',
          data:
            mode === 'signup'
              ? {
                  full_name: fullName.trim(),
                  phone: cleanPhone,
                }
              : undefined,
        },
      });

      if (otpError) {
        // If Supabase throws signups not allowed or user not found
        if (
          otpError.message.toLowerCase().includes('signups not allowed') ||
          otpError.message.toLowerCase().includes('user not found')
        ) {
          throw new Error(
            'No account found with this email. Please switch to Sign Up to register.'
          );
        }
        throw otpError;
      }

      setStep('otp');
      setResendTimer(30);
      setInfo(`We've sent a 6-digit verification code to ${cleanEmail}`);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Failed to proceed. Please check your details and try again.';
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
      const cleanEmail = email.trim().toLowerCase();

      const { data: authData, error: verifyError } = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token: cleanCode,
        type: 'email',
      });

      if (verifyError) throw verifyError;

      // Auto-upsert initial profile row immediately upon OTP verification to guarantee existence
      if (authData?.user) {
        try {
          const cleanPhone = phone ? getCleanPhone(phone) : null;
          await supabase.from('profiles').upsert(
            {
              id: authData.user.id,
              email: cleanEmail,
              full_name: fullName.trim() || cleanEmail.split('@')[0] || 'Gamer',
              phone: cleanPhone && cleanPhone.length === 10 ? cleanPhone : null,
              avatar_id: 'ps_controller',
            },
            { onConflict: 'id' }
          );
        } catch (upsertErr) {
          console.warn('Initial profile upsert note:', upsertErr);
        }
      }

      // If this was a sign up, link the phone number and name permanently
      if (mode === 'signup' && phone) {
        const cleanPhone = getCleanPhone(phone);
        if (cleanPhone && cleanPhone.length === 10) {
          try {
            await supabase.rpc('link_phone_to_profile', {
              p_phone: cleanPhone,
              p_full_name: fullName.trim(),
            });
          } catch (linkErr) {
            console.error('Phone linking trigger warning:', linkErr);
          }
        }
      }

      setInfo(
        mode === 'signup'
          ? '🎉 Account created & verified! Welcome to Underground.'
          : '⚡ Verified! Welcome back.'
      );

      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Invalid or expired verification code. Please request a new code.';
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
      const cleanEmail = email.trim().toLowerCase();
      const cleanPhone = getCleanPhone(phone);

      const { error: resendError } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          shouldCreateUser: mode === 'signup',
          data:
            mode === 'signup'
              ? {
                  full_name: fullName.trim(),
                  phone: cleanPhone,
                }
              : undefined,
        },
      });

      if (resendError) throw resendError;
      setResendTimer(30);
      setInfo(`A fresh 6-digit code has been sent to ${cleanEmail}`);
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

        {/* Mode Switcher Tabs (Sign In vs Sign Up) */}
        {step === 'form' && (
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-white/5 border border-white/10 mb-5">
            <button
              type="button"
              onClick={() => handleSwitchMode('signin')}
              className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                mode === 'signin'
                  ? 'bg-neon-green text-black shadow-[0_0_12px_rgba(16,185,129,0.35)]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <LogIn size={13} />
              <span>Sign In</span>
            </button>

            <button
              type="button"
              onClick={() => handleSwitchMode('signup')}
              className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-neon-green text-black shadow-[0_0_12px_rgba(16,185,129,0.35)]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <UserPlus size={13} />
              <span>Sign Up</span>
            </button>
          </div>
        )}

        {/* Step Progression Indicators */}
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                step === 'form'
                  ? 'bg-neon-green text-black shadow-[0_0_8px_rgba(16,185,129,0.4)]'
                  : 'bg-neon-green/20 text-neon-green border border-neon-green/40'
              }`}
            >
              1
            </span>
            <span className="text-xs font-bold text-gray-200">
              {mode === 'signup' ? 'Profile Details' : 'Email'}
            </span>
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
              <div className="flex-1 font-medium leading-relaxed">
                <p>{error}</p>
                {mode === 'signup' && error.includes('already exists') && (
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('signin')}
                    className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold text-neon-green hover:underline cursor-pointer"
                  >
                    <LogIn size={11} />
                    <span>Click here to Switch to Sign In</span>
                  </button>
                )}
                {mode === 'signin' && error.includes('No account found') && (
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('signup')}
                    className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold text-neon-green hover:underline cursor-pointer"
                  >
                    <UserPlus size={11} />
                    <span>Click here to Create an Account (Sign Up)</span>
                  </button>
                )}
              </div>
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
        {/* STEP 1: FORM INPUTS                                      */}
        {/* ======================================================== */}
        {step === 'form' ? (
          <form onSubmit={handleSubmitForm} className="space-y-4">
            {/* SIGN UP: Name Input */}
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  Full Name <span className="text-neon-green">*</span>
                </label>
                <div className="relative">
                  <User
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"
                  />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Alex Walker"
                    className="w-full bg-[#080811] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-neon-green focus:ring-1 focus:ring-neon-green/30 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                Email Address <span className="text-neon-green">*</span>
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
                {mode === 'signup'
                  ? 'Must be a unique email (locked permanently to this pass).'
                  : "We'll email you a 6-digit login verification code."}
              </p>
            </div>

            {/* SIGN UP: 10-Digit Mobile Phone */}
            {mode === 'signup' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                    Phone Number <span className="text-neon-green">*</span>
                  </label>
                  <span className="text-[10px] text-neon-green font-semibold flex items-center gap-1">
                    <Lock size={10} /> 1-to-1 Locked
                  </span>
                </div>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-xs font-mono font-bold text-neon-green select-none">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="9876543210"
                    className="w-full bg-[#080811] border border-white/10 rounded-xl pl-12 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-neon-green focus:ring-1 focus:ring-neon-green/30 transition-all font-mono"
                  />
                </div>
                <p className="text-[10px] text-gray-500 mt-1">
                  10-digit Indian mobile number for lounge pass &amp; loyalty.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={
                loading ||
                !email.trim() ||
                (mode === 'signup' &&
                  (!fullName.trim() || getCleanPhone(phone).length !== 10))
              }
              className="w-full py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider bg-neon-green text-black hover:bg-neon-green/90 active:scale-[0.99] transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>
                    {mode === 'signup' ? 'Checking & Sending…' : 'Sending Code…'}
                  </span>
                </>
              ) : (
                <>
                  <span>
                    {mode === 'signup' ? 'Send Sign Up Code' : 'Send Login Code'}
                  </span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>

            {/* Bottom Mode Switch Link */}
            <div className="text-center pt-1">
              {mode === 'signin' ? (
                <p className="text-xs text-gray-400">
                  New to Underground?{' '}
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('signup')}
                    className="font-bold text-neon-green hover:underline cursor-pointer"
                  >
                    Sign Up here
                  </button>
                </p>
              ) : (
                <p className="text-xs text-gray-400">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('signin')}
                    className="font-bold text-neon-green hover:underline cursor-pointer"
                  >
                    Sign In here
                  </button>
                </p>
              )}
            </div>
          </form>
        ) : (
          /* ======================================================== */
          /* STEP 2: ENTER 6-DIGIT VERIFICATION CODE                  */
          /* ======================================================== */
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                  6-Digit Verification Code
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setStep('form');
                    setOtpCode('');
                    setError(null);
                  }}
                  className="text-[10px] text-neon-green hover:underline cursor-pointer"
                >
                  Edit Details
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

              {/* Verified Details Summary Pill */}
              <div className="mt-2 p-2 rounded-xl bg-black/40 border border-white/10 text-[11px] space-y-0.5">
                <p className="text-gray-400 truncate">
                  Sent to: <span className="text-white font-mono">{email}</span>
                </p>
                {mode === 'signup' && (
                  <p className="text-gray-400 truncate">
                    Creating pass for:{' '}
                    <span className="text-neon-green font-semibold">
                      {fullName}
                    </span>{' '}
                    • <span className="font-mono text-gray-300">+91 {phone}</span>
                  </p>
                )}
              </div>
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
                  <span>
                    {mode === 'signup'
                      ? 'Verify & Create Pass'
                      : 'Verify & Sign In'}
                  </span>
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
          <p className="text-[11px] text-gray-500 flex items-center justify-center gap-1">
            <Lock size={11} className="text-neon-green" />
            <span>Permanent 1-to-1 Email &amp; Phone locking enforced.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
