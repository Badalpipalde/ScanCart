import React from 'react';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../../lib/formatters';
import { Button } from '../common/Button';

interface CartOrderSummaryProps {
  subtotal: number;
  tax: number;
  total: number;
  itemCount: number;
  onCheckout: () => void;
  isLoading?: boolean;
}

export const CartOrderSummary: React.FC<CartOrderSummaryProps> = ({
  subtotal,
  tax,
  total,
  itemCount,
  onCheckout,
  isLoading = false,
}) => {
  return (
    <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-stone-200/80 dark:border-neutral-700/80 p-5 shadow-card">
      <h3 className="font-serif text-lg font-medium text-ink-900 dark:text-neutral-100 mb-4 pb-2 border-b border-stone-100 dark:border-neutral-700">
        Order Summary
      </h3>

      <div className="space-y-2.5 text-xs">
        <div className="flex justify-between text-ink-600 dark:text-neutral-400">
          <span>Items Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
          <span className="font-mono tabular-nums text-ink-900 dark:text-neutral-100">
            {formatCurrency(subtotal)}
          </span>
        </div>

        <div className="flex justify-between text-ink-600 dark:text-neutral-400">
          <span>Estimated Taxes (GST)</span>
          <span className="font-mono tabular-nums text-ink-900 dark:text-neutral-100">
            {formatCurrency(tax)}
          </span>
        </div>

        <div className="pt-3 border-t border-stone-100 dark:border-neutral-700 flex justify-between items-baseline">
          <div>
            <span className="text-sm font-semibold text-ink-900 dark:text-neutral-100">
              Total Amount
            </span>
            <p className="text-[10px] text-ink-500 dark:text-neutral-400">
              Zero-trust recalculated at gateway
            </p>
          </div>
          <span className="text-2xl font-bold tracking-tight text-brand-600 dark:text-brand-400 font-mono tabular-nums">
            {formatCurrency(total)}
          </span>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <Button
          variant="primary"
          size="lg"
          className="w-full text-base font-semibold"
          onClick={onCheckout}
          isLoading={isLoading}
          rightIcon={<ArrowRight className="w-5 h-5" />}
        >
          Proceed to Pay
        </Button>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-ink-500 dark:text-neutral-400">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Instant exit pass generated upon verification</span>
        </div>
      </div>
    </div>
  );
};

