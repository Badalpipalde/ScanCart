import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Logo } from '../../components/common/Logo';
import { useUIStore } from '../../store/uiStore';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'customer' | 'staff'>('customer');
  const { register, isLoading, error, clearError } = useAuthStore();
  const { showToast } = useUIStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await register(name, email, password, role);
      showToast('Account registered successfully', 'success');
      navigate('/');
    } catch {}
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center max-w-sm mx-auto px-4">
      <div className="mb-6">
        <Logo size="lg" showText={false} className="mb-4" />
        <h1 className="font-serif text-3xl font-medium tracking-tight text-ink-900 dark:text-neutral-100">
          Create Account
        </h1>
        <p className="mt-1 text-xs text-ink-500 dark:text-neutral-400">
          Join ScanCart for zero-wait shopping.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300">
            {error}
          </div>
        )}

        <Input
          label="Full Name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Aria Sharma"
          required
          leftIcon={<User className="w-4 h-4" />}
        />

        <Input
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="aria@example.com"
          required
          leftIcon={<Mail className="w-4 h-4" />}
        />

        <Input
          label="Password (min. 6 characters)"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••••••"
          required
          minLength={6}
          leftIcon={<Lock className="w-4 h-4" />}
        />

        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-ink-700 dark:text-neutral-300 mb-1.5">
            Account Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRole('customer')}
              className={`p-2.5 rounded-xl border text-xs font-medium transition-colors ${
                role === 'customer'
                  ? 'border-brand-500 bg-brand-50/50 text-brand-900 dark:bg-brand-950/40 dark:text-brand-300'
                  : 'border-stone-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-ink-700 dark:text-neutral-300'
              }`}
            >
              Customer
            </button>
            <button
              type="button"
              onClick={() => setRole('staff')}
              className={`p-2.5 rounded-xl border text-xs font-medium transition-colors ${
                role === 'staff'
                  ? 'border-brand-500 bg-brand-50/50 text-brand-900 dark:bg-brand-950/40 dark:text-brand-300'
                  : 'border-stone-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-ink-700 dark:text-neutral-300'
              }`}
            >
              Exit Staff
            </button>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full text-sm font-semibold"
          isLoading={isLoading}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Sign Up
        </Button>
      </form>

      <div className="mt-6 text-center text-xs text-ink-500">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-brand-600 dark:text-brand-400 hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  );
};

