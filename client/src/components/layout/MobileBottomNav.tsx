import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, ScanLine, ShoppingBag, Receipt, ShieldCheck, User } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';

export const MobileBottomNav: React.FC = () => {
  const { itemCount } = useCartStore();
  const { user } = useAuthStore();

  const isStaff = user?.role === 'staff' || user?.role === 'admin';

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#181818]/95 backdrop-blur-md border-t border-stone-200 dark:border-neutral-800 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-16 px-1">
        {/* 1. Home */}
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 h-full py-1 text-[11px] font-medium transition-colors ${
              isActive
                ? 'text-brand-500 dark:text-brand-400 font-semibold'
                : 'text-ink-500 hover:text-ink-900 dark:text-neutral-400 dark:hover:text-white'
            }`
          }
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span>Home</span>
        </NavLink>

        {/* 2. Orders or Exit Gate */}
        {isStaff ? (
          <NavLink
            to="/staff/exit-gate"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 h-full py-1 text-[11px] font-medium transition-colors ${
                isActive
                  ? 'text-brand-500 dark:text-brand-400 font-semibold'
                  : 'text-ink-500 hover:text-ink-900 dark:text-neutral-400 dark:hover:text-white'
              }`
            }
          >
            <ShieldCheck className="w-5 h-5 mb-0.5" />
            <span>Exit Gate</span>
          </NavLink>
        ) : (
          <NavLink
            to="/orders"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 h-full py-1 text-[11px] font-medium transition-colors ${
                isActive
                  ? 'text-brand-500 dark:text-brand-400 font-semibold'
                  : 'text-ink-500 hover:text-ink-900 dark:text-neutral-400 dark:hover:text-white'
              }`
            }
          >
            <Receipt className="w-5 h-5 mb-0.5" />
            <span>Orders</span>
          </NavLink>
        )}

        {/* 3. Floating Center Scan Button */}
        <NavLink
          to="/scan"
          className={({ isActive }) =>
            `relative -top-3.5 flex flex-col items-center justify-center w-14 h-14 rounded-full shadow-lg transition-transform active:scale-95 ${
              isActive
                ? 'bg-brand-600 text-white ring-4 ring-brand-100 dark:ring-brand-950'
                : 'bg-brand-500 text-white hover:bg-brand-600'
            }`
          }
          aria-label="Scan Barcode"
        >
          <ScanLine className="w-6 h-6 stroke-[2.2]" />
        </NavLink>

        {/* 4. Cart with Live Item Badge */}
        <NavLink
          to="/cart"
          className={({ isActive }) =>
            `relative flex flex-col items-center justify-center flex-1 h-full py-1 text-[11px] font-medium transition-colors ${
              isActive
                ? 'text-brand-500 dark:text-brand-400 font-semibold'
                : 'text-ink-500 hover:text-ink-900 dark:text-neutral-400 dark:hover:text-white'
            }`
          }
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 mb-0.5" />
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-brand-500 rounded-full tabular-nums">
                {itemCount}
              </span>
            )}
          </div>
          <span>Cart</span>
        </NavLink>

        {/* 5. Profile */}
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 h-full py-1 text-[11px] font-medium transition-colors ${
              isActive
                ? 'text-brand-500 dark:text-brand-400 font-semibold'
                : 'text-ink-500 hover:text-ink-900 dark:text-neutral-400 dark:hover:text-white'
            }`
          }
        >
          <User className="w-5 h-5 mb-0.5" />
          <span>Profile</span>
        </NavLink>
      </div>
    </nav>
  );
};
