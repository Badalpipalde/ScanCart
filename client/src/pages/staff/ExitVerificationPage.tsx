import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RefreshCw,
  ShoppingBag,
} from 'lucide-react';
import { api } from '../../lib/api';
import { formatCurrency, formatDate } from '../../lib/formatters';
import { BarcodeScanner } from '../../components/scanner/BarcodeScanner';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { useUIStore } from '../../store/uiStore';

type VerificationState =
  | { type: 'idle' }
  | { type: 'loading' }
  | {
      type: 'success';
      order: any;
      verifiedAt: string;
      verifiedBy: string;
      message: string;
    }
  | {
      type: 'already_verified';
      order?: any;
      previouslyVerifiedAt: string;
      previouslyVerifiedBy: string;
      message: string;
    }
  | {
      type: 'invalid';
      message: string;
      error?: string;
    };

export const ExitVerificationPage: React.FC = () => {
  const [verificationResult, setVerificationResult] = useState<VerificationState>({
    type: 'idle',
  });
  const [manualToken, setManualToken] = useState('');
  const { showToast } = useUIStore();

  const handleVerifyToken = async (receiptToken: string) => {
    if (!receiptToken.trim()) return;
    setVerificationResult({ type: 'loading' });

    try {
      const res = await api.post('/orders/verify-exit', { receiptToken: receiptToken.trim() });
      const { order, verifiedAt, verifiedBy } = res.data.data;

      // Play success chime
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
          osc.frequency.setValueAtTime(880.0, ctx.currentTime + 0.1); // A5
          gain.gain.setValueAtTime(0.2, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.3);
        }
      } catch {}

      setVerificationResult({
        type: 'success',
        order,
        verifiedAt,
        verifiedBy,
        message: 'Exit Pass Cleared! All cryptographic checks passed.',
      });
      showToast('Customer verified for exit', 'success');
    } catch (err: any) {
      const resData = err.response?.data;
      const status = resData?.status;

      // Duplicate exit attempt
      if (status === 'ALREADY_VERIFIED') {
        setVerificationResult({
          type: 'already_verified',
          order: resData.data?.order,
          previouslyVerifiedAt: resData.data?.previouslyVerifiedAt,
          previouslyVerifiedBy: resData.data?.previouslyVerifiedBy,
          message: resData.message || 'Warning: QR code has already been verified for exit!',
        });
        showToast('Security Alert: Duplicate QR pass', 'error');
      } else {
        setVerificationResult({
          type: 'invalid',
          message: resData?.message || 'Invalid or unverified receipt token.',
          error: resData?.error,
        });
        showToast('Receipt verification failed', 'error');
      }
    }
  };

  const resetScanner = () => {
    setVerificationResult({ type: 'idle' });
    setManualToken('');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-neutral-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[11px] font-semibold uppercase font-mono tracking-wider mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Store Exit Lane Security</span>
          </div>
          <h1 className="font-serif text-3xl font-medium tracking-tight text-ink-900 dark:text-neutral-100">
            Exit Verification Gate
          </h1>
          <p className="text-xs text-ink-500 dark:text-neutral-400">
            Scan customer QR pass to cryptographically verify signature, check single-use status, and reconcile basket items.
          </p>
        </div>

        {verificationResult.type !== 'idle' && (
          <Button variant="outline" size="sm" onClick={resetScanner} leftIcon={<RefreshCw className="w-4 h-4" />}>
            Scan Next
          </Button>
        )}
      </div>

      {/* When IDLE or LOADING: Show Camera Viewfinder */}
      {verificationResult.type === 'idle' || verificationResult.type === 'loading' ? (
        <div className="space-y-4">
          <BarcodeScanner
            onScanSuccess={(decoded) => handleVerifyToken(decoded)}
            isProcessing={verificationResult.type === 'loading'}
          />

          {/* Manual Token Fallback for Staff */}
          <div className="bg-white dark:bg-neutral-800 p-4 rounded-2xl border border-stone-200 dark:border-neutral-700">
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink-700 dark:text-neutral-300 mb-2">
              Manual Receipt Token Input (Fallback)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
                placeholder="Paste token or order signature..."
                className="flex-1 bg-stone-50 dark:bg-neutral-900 border border-stone-200 dark:border-neutral-700 rounded-xl px-3 py-2 text-xs font-mono text-ink-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              <Button
                size="sm"
                variant="primary"
                onClick={() => handleVerifyToken(manualToken)}
                disabled={!manualToken.trim() || verificationResult.type === 'loading'}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Verify
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {/* STATE 1: VERIFIED SUCCESSFULLY */}
      {verificationResult.type === 'success' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
          {/* Banner */}
          <div className="p-5 bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-500 rounded-3xl flex items-center gap-4">
            <div className="p-3 bg-emerald-500 text-white rounded-2xl shrink-0">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 font-mono">
                Cryptographic Signature Verified
              </span>
              <h2 className="text-xl font-bold text-emerald-950 dark:text-emerald-100">
                EXIT APPROVED — CLEAR TO LEAVE
              </h2>
              <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-0.5">
                Cleared by {verificationResult.verifiedBy} at {formatDate(verificationResult.verifiedAt)}
              </p>
            </div>
          </div>

          {/* Physical Bag Inspection Item List */}
          <div className="bg-white dark:bg-neutral-800 p-5 rounded-3xl border border-stone-200/90 dark:border-neutral-700 shadow-card">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-neutral-700">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-brand-600" />
                <h3 className="font-serif text-lg font-medium text-ink-900 dark:text-neutral-100">
                  Physical Bag Check (Reconcile Items)
                </h3>
              </div>
              <Badge variant="success">
                Total: {formatCurrency(verificationResult.order?.total || 0)}
              </Badge>
            </div>

            <div className="divide-y divide-stone-100 dark:divide-neutral-700/60 mt-3 max-h-72 overflow-y-auto pr-1">
              {verificationResult.order?.items?.map((it: any, index: number) => (
                <div key={index} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-ink-900 dark:text-neutral-100">
                      {it.name}
                    </span>
                    <span className="block text-[10px] text-ink-500 font-mono">
                      SKU: {it.sku}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-neutral-700 font-bold text-ink-900 dark:text-neutral-100 font-mono">
                      Qty: {it.qty}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t border-stone-200 dark:border-neutral-700 flex justify-between items-center">
              <div className="text-xs text-ink-500 font-mono">
                Order #{verificationResult.order?._id.slice(-8).toUpperCase()}
              </div>
              <Button variant="primary" size="md" onClick={resetScanner}>
                Clear & Scan Next Customer
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* STATE 2: ALREADY VERIFIED (DUPLICATE PASS FRAUD ATTEMPT) */}
      {verificationResult.type === 'already_verified' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
          <div className="p-5 bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-500 rounded-3xl flex items-center gap-4">
            <div className="p-3 bg-rose-600 text-white rounded-2xl shrink-0">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800 dark:text-rose-300 font-mono">
                Security Alert: Single-Use Policy Violation
              </span>
              <h2 className="text-xl font-bold text-rose-950 dark:text-rose-100">
                PASS ALREADY VERIFIED & EXITED
              </h2>
              <p className="text-xs text-rose-800 dark:text-rose-300 mt-1">
                This receipt QR was already verified on{' '}
                <span className="font-semibold font-mono">
                  {formatDate(verificationResult.previouslyVerifiedAt)}
                </span>{' '}
                by guard <span className="font-semibold">{verificationResult.previouslyVerifiedBy}</span>.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-800 p-5 rounded-3xl border border-stone-200 dark:border-neutral-700">
            <p className="text-xs text-ink-700 dark:text-neutral-300 mb-4">
              Instruct customer to present proof of payment in their order history or contact store management.
            </p>
            <Button variant="outline" size="md" onClick={resetScanner}>
              Dismiss & Scan Next
            </Button>
          </div>
        </div>
      )}

      {/* STATE 3: INVALID / TAMPERED TOKEN */}
      {verificationResult.type === 'invalid' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
          <div className="p-5 bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-400 rounded-3xl flex items-center gap-4">
            <div className="p-3 bg-rose-600 text-white rounded-2xl shrink-0">
              <XCircle className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800 dark:text-rose-300 font-mono">
                Invalid Pass
              </span>
              <h2 className="text-xl font-bold text-rose-950 dark:text-rose-100">
                VERIFICATION REJECTED
              </h2>
              <p className="text-xs text-rose-800 dark:text-rose-300 mt-1">
                {verificationResult.message}
              </p>
            </div>
          </div>

          <Button variant="outline" size="md" onClick={resetScanner}>
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
};
