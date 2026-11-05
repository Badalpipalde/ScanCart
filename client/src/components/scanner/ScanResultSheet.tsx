import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ShoppingBag, X } from 'lucide-react';
import type { CartProduct } from '../../store/cartStore';
import { useCartStore } from '../../store/cartStore';
import { formatCurrency } from '../../lib/formatters';
import { Button } from '../common/Button';

interface ScanResultSheetProps {
  item: CartProduct | null;
  onClose: () => void;
}

export const ScanResultSheet: React.FC<ScanResultSheetProps> = ({ item, onClose }) => {
  const navigate = useNavigate();
  const { items } = useCartStore();

  if (!item) return null;

  const currentCartItem = items.find((i) => i.product.id === item.id);
  const qtyInCart = currentCartItem ? currentCartItem.qty : 1;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 pointer-events-none flex items-end justify-center p-0 sm:p-4">
        {/* Backdrop overlay (subtle, non-blocking) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/30 pointer-events-auto"
        />

        {/* Slide-up Card */}
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative pointer-events-auto w-full max-w-lg bg-white dark:bg-neutral-800 rounded-t-2xl sm:rounded-2xl p-5 shadow-sheet border border-stone-200 dark:border-neutral-700"
        >
          {/* Header pill */}
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-neutral-700/60">
            <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
              <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center">
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider">
                Added to Cart
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-ink-400 hover:text-ink-700 dark:hover:text-neutral-200 rounded-lg"
              aria-label="Dismiss sheet"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Product Snapshot Info */}
          <div className="flex items-center gap-4 py-3.5">
            <img
              src={item.image}
              alt={item.name}
              className="w-16 h-16 object-cover rounded-xl border border-stone-100 dark:border-neutral-700 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <span className="text-[11px] font-mono uppercase text-ink-500 dark:text-neutral-400">
                {item.category} • SKU: {item.sku}
              </span>
              <h4 className="text-sm font-semibold text-ink-900 dark:text-neutral-100 truncate">
                {item.name}
              </h4>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-base font-semibold text-brand-600 dark:text-brand-400 tabular-nums">
                  {formatCurrency(item.price)}
                </span>
                <span className="text-xs text-ink-500 dark:text-neutral-400">
                  × {qtyInCart} in cart
                </span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button variant="outline" size="md" onClick={onClose}>
              Keep Scanning
            </Button>
            <Button
              variant="primary"
              size="md"
              leftIcon={<ShoppingBag className="w-4 h-4" />}
              onClick={() => {
                onClose();
                navigate('/cart');
              }}
            >
              View Cart
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
