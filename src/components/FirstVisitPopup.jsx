import React, { useState, useEffect } from 'react';
import { Download, X, Sparkles } from 'lucide-react';

export default function FirstVisitPopup({ deferredPrompt, installApp }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasVisited = localStorage.getItem('dhikr_fikr_first_visit_seen');
    if (!hasVisited) {
      // Show popup after 1 second delay
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);

      // Auto-dismiss after 6 seconds
      const autoDismissTimer = setTimeout(() => {
        handleDismiss();
      }, 7000);

      return () => {
        clearTimeout(timer);
        clearTimeout(autoDismissTimer);
      };
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('dhikr_fikr_first_visit_seen', 'true');
    setIsVisible(false);
  };

  const handleInstallClick = () => {
    handleDismiss();
    if (installApp) {
      installApp();
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-3 left-3 right-3 sm:right-auto sm:max-w-xs z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-gradient-to-br from-[#141a16] via-stone-900 to-[#141a16] text-white border border-amber-500/50 rounded-xl p-3.5 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        
        {/* Auto-Dismiss Progress Line Accent */}
        <div className="absolute top-0 inset-x-0 h-0.5 bg-amber-500 animate-pulse"></div>

        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-stone-400 hover:text-white p-1 rounded-md transition-colors"
          title="Dismiss Popup"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center space-x-3 pr-4">
          <div className="w-8 h-8 rounded-lg bg-amber-500 text-stone-950 font-amiri font-bold text-lg flex items-center justify-center shrink-0 shadow">
            ذ
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center space-x-1">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wide">
                Zikr &amp; Fikr
              </span>
              <Sparkles className="w-3 h-3 text-amber-400" />
            </div>
            <p className="text-[11px] text-stone-300 leading-tight font-sans">
              Daily reflections. Add to Home Screen for fast offline access.
            </p>
          </div>
        </div>

        <div className="mt-2.5 flex items-center justify-end space-x-2 pt-2 border-t border-stone-800">
          <button
            onClick={handleDismiss}
            className="px-2.5 py-1 rounded text-[11px] font-semibold text-stone-400 hover:text-white"
          >
            Later
          </button>
          <button
            onClick={handleInstallClick}
            className="inline-flex items-center space-x-1 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-[11px] px-3 py-1 rounded shadow"
          >
            <Download className="w-3 h-3" />
            <span>Install PWA</span>
          </button>
        </div>

      </div>
    </div>
  );
}
