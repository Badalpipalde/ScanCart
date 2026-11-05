import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`animate-pulse bg-stone-200/70 dark:bg-neutral-800 rounded-xl ${className}`}
    />
  );
};
