import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User as UserIcon,
  Mail,
  ShieldCheck,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Smartphone,
  LogOut,
  Receipt,
  Store,
  Sparkles,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { api } from '../../lib/api';
import { formatDate } from '../../lib/formatters';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';

export const ProfilePage: React.FC = () => {
  const { user, logout, login } = useAuthStore();
  const { theme, toggleTheme, showToast } = useUIStore();
  const navigate = useNavigate();

  const [orderCount, setOrderCount] = useState<number>(0);
  const [activePassCount, setActivePassCount] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(
    localStorage.getItem('scancart_sound') !== 'false'
  );
  const [hapticsEnabled, setHapticsEnabled] = useState<boolean>(
    localStorage.getItem('scancart_haptics') !== 'false'
  );

  useEffect(() => {
    const fetchOrderStats = async () => {
      try {
        const res = await api.get('/orders');
        const orders = res.data.data.orders || [];
        setOrderCount(orders.length);
        const activePasses = orders.filter((o: any) => o.exitStatus === 'pending');
        setActivePassCount(activePasses.length);
      } catch {}
    };

    fetchOrderStats();
  }, []);

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem('scancart_sound', String(next));
    showToast(next ? 'Scan audio chime enabled' : 'Scan audio muted', 'info');
  };

  const handleToggleHaptics = () => {
    const next = !hapticsEnabled;
    setHapticsEnabled(next);
    localStorage.setItem('scancart_haptics', String(next));
    if (next && 'vibrate' in navigator) {
      navigator.vibrate(40);
    }
    showToast(next ? 'Vibration feedback enabled' : 'Vibration feedback disabled', 'info');
  };

  const handleSwitchAccount = async (targetEmail: string) => {
    try {
      await login(targetEmail, 'Password123!');
      showToast(`Switched account to ${targetEmail.split('@')[0]}`, 'success');
      navigate('/');
    } catch {
      showToast('Account switch failed', 'error');
    }
  };

  const handleSignOut = async () => {
    await logout();
    showToast('Signed out successfully', 'info');
    navigate('/login');
  };

  if (!user) return null;

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-medium tracking-tight text-ink-900 dark:text-neutral-100">
          Account & Preferences
        </h1>
        <p className="text-xs text-ink-500 dark:text-neutral-400">
          Manage your self-checkout profile, security, and retail preferences.
        </p>
      </div>

      {/* User Card */}
      <div className="bg-white dark:bg-neutral-800 rounded-3xl p-6 border border-stone-200/80 dark:border-neutral-700/80 shadow-card">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-500 text-white font-serif text-2xl font-bold flex items-center justify-center shadow-subtle shrink-0">
            {initials}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-ink-900 dark:text-neutral-100 truncate">
                {user.name}
              </h2>
              <Badge
                variant={
                  user.role === 'admin'
                    ? 'warning'
                    : user.role === 'staff'
                    ? 'success'
                    : 'brand'
                }
                size="sm"
              >
                {user.role.toUpperCase()}
              </Badge>
            </div>

            <p className="text-xs text-ink-500 dark:text-neutral-400 font-mono flex items-center gap-1.5 mt-0.5">
              <Mail className="w-3.5 h-3.5" />
              <span>{user.email}</span>
            </p>

            {user.createdAt && (
              <p className="text-[11px] text-ink-400 dark:text-neutral-500 mt-1">
                Member since {formatDate(user.createdAt)}
              </p>
            )}
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-stone-100 dark:border-neutral-700/60">
          <div
            onClick={() => navigate('/orders')}
            className="p-3 bg-stone-50 dark:bg-neutral-900 rounded-2xl cursor-pointer hover:bg-stone-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <span className="text-[11px] font-mono uppercase text-ink-500 dark:text-neutral-400 block">
              Total Receipts
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl font-bold text-ink-900 dark:text-neutral-100 font-mono tabular-nums">
                {orderCount}
              </span>
              <Receipt className="w-4 h-4 text-brand-600" />
            </div>
          </div>

          <div
            onClick={() => navigate('/orders')}
            className="p-3 bg-stone-50 dark:bg-neutral-900 rounded-2xl cursor-pointer hover:bg-stone-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <span className="text-[11px] font-mono uppercase text-ink-500 dark:text-neutral-400 block">
              Active Exit Passes
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span
                className={`text-xl font-bold font-mono tabular-nums ${
                  activePassCount > 0 ? 'text-emerald-600' : 'text-ink-900 dark:text-neutral-100'
                }`}
              >
                {activePassCount}
              </span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      {/* App Preferences */}
      <div className="bg-white dark:bg-neutral-800 rounded-3xl p-5 border border-stone-200/80 dark:border-neutral-700/80 shadow-subtle space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-neutral-400">
          App Preferences
        </h3>

        {/* Theme Setting */}
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-stone-100 dark:bg-neutral-700 text-ink-700 dark:text-neutral-300">
              {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </div>
            <div>
              <span className="text-sm font-semibold text-ink-900 dark:text-neutral-100 block">
                Appearance
              </span>
              <span className="text-xs text-ink-500 dark:text-neutral-400">
                {theme === 'dark' ? 'Dark Theme (Deep Ink)' : 'Light Theme (Warm Surface)'}
              </span>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={toggleTheme}>
            Toggle
          </Button>
        </div>

        {/* Audio Chime Setting */}
        <div className="flex items-center justify-between py-1 border-t border-stone-100 dark:border-neutral-700/60 pt-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-stone-100 dark:bg-neutral-700 text-ink-700 dark:text-neutral-300">
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </div>
            <div>
              <span className="text-sm font-semibold text-ink-900 dark:text-neutral-100 block">
                Scanner Audio Beep
              </span>
              <span className="text-xs text-ink-500 dark:text-neutral-400">
                Audible confirmation when item barcode is detected
              </span>
            </div>
          </div>
          <Button
            variant={soundEnabled ? 'primary' : 'outline'}
            size="sm"
            onClick={handleToggleSound}
          >
            {soundEnabled ? 'On' : 'Muted'}
          </Button>
        </div>

        {/* Haptics Setting */}
        <div className="flex items-center justify-between py-1 border-t border-stone-100 dark:border-neutral-700/60 pt-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-stone-100 dark:bg-neutral-700 text-ink-700 dark:text-neutral-300">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-semibold text-ink-900 dark:text-neutral-100 block">
                Haptic Vibration
              </span>
              <span className="text-xs text-ink-500 dark:text-neutral-400">
                Tactile pulse on successful phone scan
              </span>
            </div>
          </div>
          <Button
            variant={hapticsEnabled ? 'primary' : 'outline'}
            size="sm"
            onClick={handleToggleHaptics}
          >
            {hapticsEnabled ? 'On' : 'Off'}
          </Button>
        </div>
      </div>

      {/* Quick Role Switcher for Testing & Demos */}
      <div className="bg-white dark:bg-neutral-800 rounded-3xl p-5 border border-stone-200/80 dark:border-neutral-700/80 shadow-subtle space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-neutral-400">
            Switch Test Role (Mock Data Mode)
          </h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-50 text-brand-800 dark:bg-brand-950 dark:text-brand-300">
            Demo Tool
          </span>
        </div>
        <p className="text-xs text-ink-500 dark:text-neutral-400">
          Instantly switch between retail roles to test customer shopping, staff exit scans, or admin catalog controls.
        </p>

        <div className="grid grid-cols-3 gap-2 pt-1">
          <button
            onClick={() => handleSwitchAccount('customer@scancart.store')}
            className={`p-2.5 rounded-xl border text-xs font-medium text-center transition-all ${
              user.email === 'customer@scancart.store'
                ? 'border-brand-500 bg-brand-50 text-brand-800 dark:bg-brand-950/60 dark:text-brand-300 ring-2 ring-brand-500/20'
                : 'border-stone-200 dark:border-neutral-700 bg-stone-50 dark:bg-neutral-900 text-ink-700 dark:text-neutral-300 hover:bg-stone-100'
            }`}
          >
            <UserIcon className="w-4 h-4 mx-auto mb-1 text-brand-600" />
            <span>Customer</span>
          </button>

          <button
            onClick={() => handleSwitchAccount('staff@scancart.store')}
            className={`p-2.5 rounded-xl border text-xs font-medium text-center transition-all ${
              user.email === 'staff@scancart.store'
                ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                : 'border-stone-200 dark:border-neutral-700 bg-stone-50 dark:bg-neutral-900 text-ink-700 dark:text-neutral-300 hover:bg-stone-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
            <span>Staff Guard</span>
          </button>

          <button
            onClick={() => handleSwitchAccount('admin@scancart.store')}
            className={`p-2.5 rounded-xl border text-xs font-medium text-center transition-all ${
              user.email === 'admin@scancart.store'
                ? 'border-amber-500 bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 ring-2 ring-amber-500/20'
                : 'border-stone-200 dark:border-neutral-700 bg-stone-50 dark:bg-neutral-900 text-ink-700 dark:text-neutral-300 hover:bg-stone-100'
            }`}
          >
            <Sparkles className="w-4 h-4 mx-auto mb-1 text-amber-600" />
            <span>Admin</span>
          </button>
        </div>
      </div>

      {/* Store Location & Sign Out */}
      <div className="bg-white dark:bg-neutral-800 rounded-3xl p-5 border border-stone-200/80 dark:border-neutral-700/80 shadow-subtle space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-stone-100 dark:bg-neutral-700 text-ink-700 dark:text-neutral-300">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-ink-900 dark:text-neutral-100">
              ScanCart Express Store #104
            </h4>
            <p className="text-xs text-ink-500 font-mono">
              Bengaluru Central • Lane 04 Self-Checkout Active
            </p>
          </div>
        </div>

        <div className="pt-2 border-t border-stone-100 dark:border-neutral-700/60">
          <Button
            variant="danger"
            size="md"
            className="w-full text-xs font-semibold"
            leftIcon={<LogOut className="w-4 h-4" />}
            onClick={handleSignOut}
          >
            Sign Out of ScanCart
          </Button>
        </div>
      </div>

      <div className="text-center text-[11px] text-ink-400 dark:text-neutral-500 font-mono pb-6">
        ScanCart Production Build v1.2.0 • Secured with HMAC-SHA256
      </div>
    </div>
  );
};
