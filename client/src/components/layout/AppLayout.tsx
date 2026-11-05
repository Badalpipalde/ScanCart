import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { useUIStore } from '../../store/uiStore';
import { MobileBottomNav } from './MobileBottomNav';
import { ToastContainer } from '../common/ToastContainer';
import { Logo } from '../common/Logo';
import {
  ShoppingBag,
  LogOut,
  Moon,
  Sun,
  ShieldCheck,
  Package,
  ScanLine,
} from 'lucide-react';

export const AppLayout: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { itemCount } = useCartStore();
  const { theme, toggleTheme } = useUIStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isScannerPage = location.pathname === '/scan';

  return (
    <div className="min-h-screen flex flex-col bg-surface dark:bg-surface-dark transition-colors duration-200">
      <ToastContainer />

      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-surface/90 dark:bg-surface-dark/90 backdrop-blur-md border-b border-stone-200/80 dark:border-neutral-800">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="group">
            <Logo size="md" />
          </Link>

          {/* Desktop Navigation Links & Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {user && (
              <div className="hidden md:flex items-center gap-6 text-sm font-medium text-ink-700 dark:text-neutral-300 mr-2">
                <Link to="/" className="hover:text-brand-500 transition-colors">
                  Store
                </Link>
                <Link
                  to="/scan"
                  className="inline-flex items-center gap-1.5 text-brand-600 dark:text-brand-400 font-semibold hover:text-brand-700"
                >
                  <ScanLine className="w-4 h-4" />
                  <span>Scan Items</span>
                </Link>
                <Link to="/orders" className="hover:text-brand-500 transition-colors">
                  My Receipts
                </Link>

                {user.role === 'staff' || user.role === 'admin' ? (
                  <Link
                    to="/staff/exit-gate"
                    className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 hover:underline"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Exit Gate</span>
                  </Link>
                ) : null}

                {user.role === 'admin' && (
                  <Link
                    to="/admin/products"
                    className="inline-flex items-center gap-1 text-stone-600 dark:text-stone-300 hover:text-brand-500"
                  >
                    <Package className="w-4 h-4" />
                    <span>Catalog</span>
                  </Link>
                )}
              </div>
            )}

            {/* Desktop Cart Shortcut */}
            {user && (
              <Link
                to="/cart"
                className="hidden sm:inline-flex relative p-2 rounded-xl text-ink-700 dark:text-neutral-300 hover:bg-stone-200/50 dark:hover:bg-neutral-800 transition-colors"
                aria-label="View shopping cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-[20px] px-1 text-xs font-bold text-white bg-brand-500 rounded-full tabular-nums">
                    {itemCount}
                  </span>
                )}
              </Link>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-ink-600 dark:text-neutral-400 hover:bg-stone-200/50 dark:hover:bg-neutral-800 transition-colors"
              aria-label="Toggle color theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* User Account / Logout */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-stone-200 dark:border-neutral-800">
                <Link
                  to="/profile"
                  className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium text-ink-700 dark:text-neutral-300 hover:bg-stone-200/50 dark:hover:bg-neutral-800 transition-colors"
                >
                  <span className="w-5 h-5 rounded-full bg-brand-500 text-white flex items-center justify-center text-[10px] font-bold">
                    {user.name[0].toUpperCase()}
                  </span>
                  <span className="truncate max-w-[100px]">{user.name.split(' ')[0]}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl text-ink-500 hover:text-rose-600 dark:text-neutral-400 dark:hover:text-rose-400 hover:bg-stone-200/50 dark:hover:bg-neutral-800 transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="text-xs font-medium px-3 py-1.5 rounded-lg bg-brand-500 text-white hover:bg-brand-600 transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main
        className={`flex-1 w-full max-w-4xl mx-auto ${
          isScannerPage ? 'p-0 sm:px-4 sm:py-6' : 'px-4 py-6'
        } pb-24 sm:pb-12`}
      >
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      {user && <MobileBottomNav />}
    </div>
  );
};

