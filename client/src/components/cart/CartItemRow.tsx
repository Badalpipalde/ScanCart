import React from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import type { CartItem } from '../../store/cartStore';
import { formatCurrency } from '../../lib/formatters';

interface CartItemRowProps {
  item: CartItem;
  onUpdateQty: (productId: string, qty: number) => void;
  onRemove: (productId: string) => void;
  isUpdating?: boolean;
}

export const CartItemRow: React.FC<CartItemRowProps> = ({
  item,
  onUpdateQty,
  onRemove,
  isUpdating = false,
}) => {
  const { product, qty, itemSubtotal } = item;

  return (
    <div className="flex items-center gap-3 sm:gap-4 p-3.5 bg-white dark:bg-neutral-800 rounded-xl border border-stone-200/80 dark:border-neutral-700/80 shadow-subtle transition-all">
      {/* Product Image */}
      <img
        src={product.image}
        alt={product.name}
        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl border border-stone-100 dark:border-neutral-700 shrink-0 bg-stone-50"
      />

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="text-[10px] font-mono uppercase text-ink-500 dark:text-neutral-400">
              {product.category}
            </span>
            <h4 className="text-sm font-semibold text-ink-900 dark:text-neutral-100 leading-snug line-clamp-1">
              {product.name}
            </h4>
          </div>
          {/* Delete Icon */}
          <button
            onClick={() => onRemove(product.id)}
            disabled={isUpdating}
            className="p-1.5 text-ink-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg transition-colors"
            title="Remove item"
            aria-label={`Remove ${product.name} from cart`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Price and Quantity Controls */}
        <div className="flex items-center justify-between mt-2 pt-1 border-t border-stone-100 dark:border-neutral-700/60">
          <div>
            <span className="text-xs text-ink-500 dark:text-neutral-400">
              {formatCurrency(product.price)} each
            </span>
            <div className="text-sm font-bold text-ink-900 dark:text-neutral-100 tabular-nums">
              {formatCurrency(itemSubtotal)}
            </div>
          </div>

          {/* Stepper with 44px touch targets */}
          <div className="flex items-center border border-stone-200 dark:border-neutral-700 rounded-xl overflow-hidden bg-stone-50 dark:bg-neutral-900">
            <button
              onClick={() => onUpdateQty(product.id, qty - 1)}
              disabled={isUpdating || qty <= 1}
              className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-ink-700 dark:text-neutral-300 hover:bg-stone-200 dark:hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-8 text-center text-xs font-semibold text-ink-900 dark:text-neutral-100 tabular-nums">
              {qty}
            </span>
            <button
              onClick={() => onUpdateQty(product.id, qty + 1)}
              disabled={isUpdating || qty >= product.stock}
              className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-ink-700 dark:text-neutral-300 hover:bg-stone-200 dark:hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Increase quantity"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
