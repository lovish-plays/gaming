'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search,
  UserCheck,
  PlusCircle,
  Clock,
  IndianRupee,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Trophy,
  TrendingUp,
  X,
  Camera,
  QrCode,
  ScanLine,
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { createClient } from '@/lib/supabase';
import type { Profile } from '@/lib/types';

const MILESTONE = 1000;

interface ToastMessage {
  type: 'success' | 'error';
  text: string;
}

export default function AdminTerminal() {
  const [phone, setPhone] = useState('');
  const [searching, setSearching] = useState(false);
  const [customer, setCustomer] = useState<Profile | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [billAmount, setBillAmount] = useState('');
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // QR Scanner States
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [lastScannedId, setLastScannedId] = useState<string | null>(null);

  const phoneRef = useRef<HTMLInputElement>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const supabase = createClient();

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  // Real-time profile updates while admin is viewing a customer
  useEffect(() => {
    if (!customer) return;

    const channel = supabase
      .channel(`admin-view-profile-${customer.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${customer.id}`,
        },
        (payload) => {
          setCustomer((prev) =>
            prev ? { ...prev, ...(payload.new as Profile) } : prev
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [customer?.id]);

  // Safe scanner cleanup
  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        await scannerRef.current.clear();
      } catch (err) {
        console.warn('Scanner stop/clear warning:', err);
      } finally {
        scannerRef.current = null;
        setIsScanning(false);
      }
    } else {
      setIsScanning(false);
    }
  }, []);

  // Cleanup scanner on unmount
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, [stopScanner]);

  // Handle scanned QR payload (supports UUID or phone number)
  const handleScannedData = useCallback(
    async (decodedText: string) => {
      const cleanValue = decodedText.trim();
      if (!cleanValue || cleanValue === lastScannedId) return;

      setLastScannedId(cleanValue);
      await stopScanner();

      setSearching(true);
      setNotFound(false);
      setCustomer(null);
      setBillAmount('');

      try {
        const isUuid =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
            cleanValue
          );

        let query = supabase.from('profiles').select('*');
        if (isUuid) {
          query = query.eq('id', cleanValue);
        } else {
          query = query.eq('phone', cleanValue);
        }

        const { data, error } = await query.single();

        if (error || !data) {
          setNotFound(true);
          setToast({
            type: 'error',
            text: `No customer found for scanned QR code.`,
          });
        } else {
          setCustomer(data);
          setToast({
            type: 'success',
            text: `🎯 Member verified: ${data.full_name} (${data.phone})`,
          });
        }
      } catch {
        setNotFound(true);
        setToast({
          type: 'error',
          text: 'Failed to look up member from scanned code.',
        });
      } finally {
        setSearching(false);
        setTimeout(() => setLastScannedId(null), 3000);
      }
    },
    [lastScannedId, stopScanner, supabase]
  );

  // Start QR Camera Viewfinder
  const startScanner = async () => {
    setCameraError(null);
    setIsScanning(true);

    // Allow DOM element to mount
    setTimeout(async () => {
      try {
        const readerElement = document.getElementById('admin-qr-reader');
        if (!readerElement) {
          throw new Error('Scanner container element not found');
        }

        const html5QrCode = new Html5Qrcode('admin-qr-reader');
        scannerRef.current = html5QrCode;

        const config = {
          fps: 15,
          qrbox: { width: 220, height: 220 },
          aspectRatio: 1.0,
        };

        await html5QrCode.start(
          { facingMode: 'environment' },
          config,
          (decodedText) => {
            handleScannedData(decodedText);
          },
          () => {
            // Frame parse error — ignore to avoid console clutter
          }
        );
      } catch (err: unknown) {
        console.error('Camera initialization error:', err);
        const msg =
          err instanceof Error
            ? err.message
            : 'Unable to access camera. Please allow camera permissions.';
        setCameraError(msg);
        await stopScanner();
      }
    }, 250);
  };

  const handleSearch = async () => {
    const cleanPhone = phone.trim();
    if (!cleanPhone) return;

    await stopScanner();
    setSearching(true);
    setCustomer(null);
    setNotFound(false);
    setBillAmount('');

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('phone', cleanPhone)
        .single();

      if (error || !data) {
        setNotFound(true);
      } else {
        setCustomer(data);
      }
    } catch {
      setNotFound(true);
    } finally {
      setSearching(false);
    }
  };

  const handleAddBill = async () => {
    if (!customer || !billAmount || processing) return;
    const amount = parseInt(billAmount, 10);
    if (isNaN(amount) || amount <= 0) {
      setToast({ type: 'error', text: 'Please enter a valid amount' });
      return;
    }

    setProcessing(true);
    try {
      const { data, error } = await supabase.rpc('add_customer_spend', {
        p_customer_id: customer.id,
        p_amount_inr: amount,
      });

      if (error) throw error;

      const result = data as {
        earned_hours: number;
        new_progress: number;
        new_total: number;
        free_hours: number;
      };

      setBillAmount('');
      setToast({
        type: 'success',
        text:
          result.earned_hours > 0
            ? `✅ ₹${amount.toLocaleString('en-IN')} added! 🎉 ${result.earned_hours} free hour${result.earned_hours > 1 ? 's' : ''} earned!`
            : `✅ ₹${amount.toLocaleString('en-IN')} added! Progress: ₹${result.new_progress}/₹1,000`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to add bill';
      setToast({ type: 'error', text: msg });
    } finally {
      setProcessing(false);
    }
  };

  const handleRedeemHour = async () => {
    if (!customer || processing || customer.free_hours < 1) return;

    setProcessing(true);
    try {
      const { error } = await supabase.rpc('redeem_free_hour', {
        p_customer_id: customer.id,
      });
      if (error) throw error;
      setToast({ type: 'success', text: '✅ 1 free hour redeemed successfully!' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Redemption failed';
      setToast({ type: 'error', text: msg });
    } finally {
      setProcessing(false);
    }
  };

  const clearCustomer = () => {
    setCustomer(null);
    setNotFound(false);
    setPhone('');
    setBillAmount('');
    setTimeout(() => phoneRef.current?.focus(), 100);
  };

  const progressPct = customer
    ? Math.min((customer.spend_progress / MILESTONE) * 100, 100)
    : 0;

  return (
    <section className="mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gold/15 border border-gold/30">
            <UserCheck size={18} className="text-gold" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Admin Counter Terminal
            </h2>
            <p className="text-[10px] text-gray-500">Scan member pass or enter phone</p>
          </div>
        </div>

        {/* Live Camera Scanner Toggle Button */}
        <button
          onClick={() => {
            if (isScanning) {
              stopScanner();
            } else {
              startScanner();
            }
          }}
          className={[
            'flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all',
            isScanning
              ? 'bg-crimson/20 border border-crimson/40 text-crimson hover:bg-crimson/30'
              : 'bg-neon-green/15 border border-neon-green/30 text-neon-green hover:bg-neon-green/25 shadow-[0_0_15px_rgba(16,185,129,0.15)]',
          ].join(' ')}
        >
          {isScanning ? (
            <>
              <X size={14} />
              <span>Close Camera</span>
            </>
          ) : (
            <>
              <Camera size={14} />
              <span>Scan Member QR</span>
            </>
          )}
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={[
            'mb-4 flex items-start gap-3 px-4 py-3 rounded-xl border text-sm backdrop-blur-md',
            toast.type === 'success'
              ? 'bg-neon-green/10 border-neon-green/30 text-neon-green'
              : 'bg-crimson/10 border-crimson/30 text-crimson',
          ].join(' ')}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0" />
          ) : (
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          )}
          <span className="flex-1 font-medium">{toast.text}</span>
          <button onClick={() => setToast(null)} className="p-0.5 hover:opacity-80">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Camera Viewfinder Panel (Visible when isScanning) */}
      {isScanning && (
        <div className="rounded-2xl glass-card border border-neon-green/40 p-4 mb-4 relative overflow-hidden shadow-[0_0_30px_rgba(16,185,129,0.15)]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neon-green">
              <ScanLine size={14} className="animate-pulse" />
              <span>Position Member QR inside frame</span>
            </div>
            <button
              onClick={stopScanner}
              className="text-gray-400 hover:text-white p-1"
            >
              <X size={15} />
            </button>
          </div>

          {/* Camera stream container */}
          <div className="relative w-full max-w-sm mx-auto overflow-hidden rounded-xl border border-white/20 bg-black min-h-[260px] flex items-center justify-center">
            <div id="admin-qr-reader" className="w-full h-full" />
            
            {/* Viewfinder Target Overlays */}
            <div className="absolute inset-8 border-2 border-neon-green/40 rounded-xl pointer-events-none flex flex-col justify-between">
              <div className="flex justify-between p-1">
                <span className="w-4 h-4 border-t-2 border-l-2 border-neon-green" />
                <span className="w-4 h-4 border-t-2 border-r-2 border-neon-green" />
              </div>
              <div className="flex justify-between p-1">
                <span className="w-4 h-4 border-b-2 border-l-2 border-neon-green" />
                <span className="w-4 h-4 border-b-2 border-r-2 border-neon-green" />
              </div>
            </div>
          </div>

          <p className="mt-2 text-center text-[11px] text-gray-500">
            Supports customer mobile screens and printed member cards.
          </p>
        </div>
      )}

      {/* Camera Error Alert */}
      {cameraError && (
        <div className="rounded-xl bg-crimson/10 border border-crimson/30 p-3 mb-4 text-xs text-crimson flex items-center gap-2">
          <AlertCircle size={15} className="flex-shrink-0" />
          <span>{cameraError}</span>
        </div>
      )}

      {/* Phone Number Search box (Always available as fallback) */}
      <div className="rounded-2xl glass-card border border-white/10 p-4 mb-4">
        <label className="block text-[11px] text-gray-400 font-semibold mb-2 uppercase tracking-widest flex items-center justify-between">
          <span>Search Customer by Phone</span>
          <span className="text-[10px] text-gray-500 lowercase">e.g. 10 digits</span>
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              ref={phoneRef}
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="e.g. 9876543210"
              className={[
                'w-full bg-[#080811] border rounded-xl px-3.5 py-2.5 text-white',
                'placeholder:text-gray-600 text-sm transition-colors',
                'focus:border-gold/60 focus:ring-1 focus:ring-gold/30',
                'border-white/10',
              ].join(' ')}
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={!phone.trim() || searching}
            className={[
              'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all',
              'bg-gold text-brand-bg hover:bg-gold-dim active:scale-95',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
            ].join(' ')}
          >
            {searching ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Search size={16} />
            )}
            Find
          </button>
        </div>
      </div>

      {/* Not found state */}
      {notFound && (
        <div className="rounded-2xl glass-card border border-crimson/30 p-4 text-center text-sm text-crimson">
          <AlertCircle size={20} className="mx-auto mb-2 text-crimson" />
          <p className="font-semibold">No registered member found.</p>
          <span className="text-gray-500 text-xs">
            Verify the phone number or ask customer to sign up on their phone first.
          </span>
        </div>
      )}

      {/* Customer Card Found */}
      {customer && (
        <div className="space-y-3">
          {/* Customer info header */}
          <div className="relative rounded-2xl glass-card border border-gold/40 p-5 shadow-[0_0_25px_rgba(245,158,11,0.1)]">
            <button
              onClick={clearCustomer}
              className="absolute top-3.5 right-3.5 p-1 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
              title="Clear customer"
            >
              <X size={15} />
            </button>

            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-gold/15 border border-gold/30 flex items-center justify-center text-gold font-black text-lg flex-shrink-0">
                {customer.full_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-white text-base leading-tight">
                  {customer.full_name}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">📞 {customer.phone}</p>
                <span className="text-[10px] text-gray-500 font-mono">
                  ID: {customer.id.slice(0, 8)}…
                </span>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2 mt-4">
              <div className="bg-black/40 rounded-xl p-2.5 text-center border border-white/5">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">
                  Free Hours
                </p>
                <p
                  className={`text-xl font-black ${
                    customer.free_hours > 0 ? 'text-gold' : 'text-gray-500'
                  }`}
                >
                  {customer.free_hours}
                </p>
              </div>
              <div className="bg-black/40 rounded-xl p-2.5 text-center border border-white/5">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">
                  Progress
                </p>
                <p className="text-xl font-black text-neon-green">
                  ₹{customer.spend_progress}
                </p>
              </div>
              <div className="bg-black/40 rounded-xl p-2.5 text-center border border-white/5">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">
                  Lifetime
                </p>
                <p className="text-xl font-black text-white">
                  ₹{customer.total_spent.toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-3.5">
              <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5 font-medium">
                <span className="flex items-center gap-1">
                  <TrendingUp size={11} className="text-neon-green" />
                  Next milestone
                </span>
                <span>₹{customer.spend_progress} / ₹1,000</span>
              </div>
              <div className="h-2 rounded-full bg-black/60 border border-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-neon-green to-neon-green-bright transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Add Bill Section */}
          <div className="rounded-2xl glass-card border border-white/10 p-4">
            <label className="block text-[11px] text-gray-400 font-semibold mb-2 uppercase tracking-widest">
              Add Bill Amount (₹)
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <IndianRupee
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                />
                <input
                  type="number"
                  inputMode="numeric"
                  value={billAmount}
                  onChange={(e) => setBillAmount(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddBill()}
                  placeholder="Enter amount (e.g. 1000)"
                  min="1"
                  className={[
                    'w-full bg-[#080811] border border-white/10 rounded-xl',
                    'pl-8 pr-3 py-2.5 text-white placeholder:text-gray-600 text-sm',
                    'focus:border-neon-green/60 focus:ring-1 focus:ring-neon-green/30',
                    'transition-colors',
                  ].join(' ')}
                />
              </div>
              <button
                onClick={handleAddBill}
                disabled={!billAmount || processing}
                className={[
                  'flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold',
                  'bg-neon-green text-brand-bg hover:bg-neon-green-bright active:scale-95',
                  'transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 shadow-[0_0_15px_rgba(16,185,129,0.2)]',
                ].join(' ')}
              >
                {processing ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <PlusCircle size={16} />
                )}
                Add
              </button>
            </div>

            {/* Preview earned hours */}
            {billAmount && parseInt(billAmount, 10) > 0 && (
              <div className="mt-2 text-xs text-gray-400 font-medium">
                {(() => {
                  const amt = parseInt(billAmount, 10);
                  const newTotal = customer.spend_progress + amt;
                  const earned = Math.floor(newTotal / MILESTONE);
                  const remainder = newTotal % MILESTONE;
                  return earned > 0 ? (
                    <span className="text-gold font-semibold">
                      🎉 This will award {earned} Free Hour{earned > 1 ? 's' : ''}! New progress: ₹{remainder}/₹1,000
                    </span>
                  ) : (
                    <span>Progress after adding: ₹{newTotal} / ₹1,000</span>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Redeem Hour Section */}
          <div className="rounded-2xl glass-card border border-white/10 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-white">Redeem Free Hour</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {customer.free_hours > 0
                    ? `${customer.free_hours} hour${
                        customer.free_hours > 1 ? 's' : ''
                      } available to use`
                    : 'Customer has no free hours balance'}
                </p>
              </div>
              <button
                onClick={handleRedeemHour}
                disabled={customer.free_hours < 1 || processing}
                className={[
                  'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold',
                  'transition-all active:scale-95',
                  customer.free_hours > 0
                    ? 'bg-gold text-brand-bg hover:bg-gold-dim shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                    : 'bg-black/40 border border-white/10 text-gray-600 cursor-not-allowed',
                  'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
                ].join(' ')}
              >
                {processing ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    <Clock size={16} />
                    <Trophy size={14} />
                  </>
                )}
                Redeem 1 Hr
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
