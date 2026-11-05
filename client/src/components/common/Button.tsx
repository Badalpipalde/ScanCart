import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium transition-colors duration-150 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none min-h-[44px]';

  const variantClasses = {
    primary:
      'bg-brand-500 text-white hover:bg-brand-600 focus:ring-brand-500 dark:focus:ring-offset-neutral-900 shadow-subtle',
    secondary:
      'bg-ink-100 text-ink-900 hover:bg-ink-200 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700 focus:ring-neutral-400',
    outline:
      'border border-ink-200 dark:border-neutral-700 bg-transparent text-ink-900 dark:text-neutral-100 hover:bg-ink-50 dark:hover:bg-neutral-800 focus:ring-neutral-400',
    danger:
      'bg-status-danger text-white hover:bg-red-700 focus:ring-status-danger shadow-subtle',
    ghost:
      'bg-transparent text-ink-700 dark:text-neutral-300 hover:bg-ink-100 dark:hover:bg-neutral-800 focus:ring-neutral-400',
  };

  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 h-9 min-h-[36px]',
    md: 'text-sm px-4 py-2.5 h-11',
    lg: 'text-base px-6 py-3.5 h-13',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : leftIcon ? (
        <span className="mr-2 inline-flex">{leftIcon}</span>
      ) : null}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="ml-2 inline-flex">{rightIcon}</span>}
    </button>
  );
};
