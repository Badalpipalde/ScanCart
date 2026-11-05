import React from 'react';
import logoImage from '../../images/ScanCart Dynamic QR Cart Logo.png';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  badgeText?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
  badgeText = 'Express',
}) => {
  const sizeClasses = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const textClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <div
        className={`${sizeClasses[size]} rounded-xl overflow-hidden bg-white dark:bg-neutral-800 p-0.5 border border-stone-200/80 dark:border-neutral-700/80 shadow-subtle shrink-0 flex items-center justify-center`}
      >
        <img
          src={logoImage}
          alt="ScanCart Logo"
          className="w-full h-full object-contain rounded-lg"
        />
      </div>

      {showText && (
        <div className="flex items-baseline">
          <span
            className={`font-serif ${textClasses[size]} tracking-tight font-medium text-ink-900 dark:text-neutral-100`}
          >
            ScanCart
          </span>
          {badgeText && (
            <span className="hidden sm:inline-block ml-2 text-[10px] tracking-widest uppercase font-mono px-1.5 py-0.5 rounded bg-stone-200/60 dark:bg-neutral-800 text-ink-700 dark:text-neutral-300">
              {badgeText}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

