import React from 'react';
import { useUIStore } from '../../store/uiStore';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useUIStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-start gap-3 p-3.5 bg-white dark:bg-neutral-800 border border-stone-200 dark:border-neutral-700 rounded-xl shadow-lg transition-all animate-in fade-in slide-in-from-top-2"
          >
            {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />}
            {isError && <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />}
            {!isSuccess && !isError && <Info className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />}

            <div className="flex-1 min-w-0">
              {toast.title && (
                <h4 className="text-sm font-semibold text-ink-900 dark:text-neutral-100">
                  {toast.title}
                </h4>
              )}
              <p className="text-xs text-ink-700 dark:text-neutral-300 break-words">
                {toast.message}
              </p>
            </div>

            <button
              onClick={() => dismissToast(toast.id)}
              className="text-ink-400 hover:text-ink-600 dark:hover:text-neutral-200 p-1"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
