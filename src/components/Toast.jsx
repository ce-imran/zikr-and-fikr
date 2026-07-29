import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ message, type = 'info', onClose }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />,
    info: <Info className="w-4 h-4 text-amber-500 shrink-0" />
  };

  return (
    <div className="fixed top-20 right-4 sm:right-6 z-50 animate-in fade-in slide-in-from-top-3 duration-300 pointer-events-auto">
      <div className="flex items-center space-x-3 bg-white dark:bg-[#161b22] text-[#24292f] dark:text-[#c9d1d9] shadow-xl border border-[#d0d7de] dark:border-[#30363d] rounded-xl px-4 py-3 text-xs sm:text-sm font-semibold max-w-md">
        {icons[type] || icons.info}
        <span className="flex-1">{message}</span>
        <button
          onClick={onClose}
          className="text-[#8b949e] hover:text-[#24292f] dark:hover:text-white p-0.5 rounded transition-colors"
          aria-label="Close notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
