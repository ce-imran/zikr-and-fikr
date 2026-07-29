import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';

export default function FloatingInstallButton({ deferredPrompt, installApp }) {
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const checkStandalone = () => {
      const isStandaloneMode = 
        window.matchMedia('(display-mode: standalone)').matches ||
        window.matchMedia('(display-mode: fullscreen)').matches ||
        window.matchMedia('(display-mode: minimal-ui)').matches ||
        (window.navigator && window.navigator.standalone === true);

      setIsStandalone(isStandaloneMode);
    };

    checkStandalone();

    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleModeChange = (e) => setIsStandalone(e.matches);

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleModeChange);
    }
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleModeChange);
      }
    };
  }, []);

  // SMART HIDING LOGIC: Hidden if running in standalone PWA app
  if (isStandalone) {
    return null;
  }

  const handleClick = () => {
    if (window.deferredPrompt) {
      window.deferredPrompt.prompt();
      window.deferredPrompt.userChoice.then(() => {
        window.deferredPrompt = null;
      });
    } else if (installApp) {
      installApp();
    }
  };

  return (
    <div className="fixed right-0 top-1/2 -translate-y-1/2 z-40 transition-all duration-300">
      <button
        onClick={handleClick}
        className="group flex items-center space-x-2 bg-stone-900 dark:bg-stone-100 hover:bg-[#141a16] dark:hover:bg-white text-amber-400 dark:text-stone-950 px-3.5 py-4 rounded-l-2xl shadow-[0_0_20px_rgba(245,158,11,0.5)] border-l-2 border-t-2 border-b-2 border-amber-500/70 font-bold text-xs uppercase tracking-wider cursor-pointer transition-all hover:-translate-x-1"
        style={{
          writingMode: 'vertical-rl',
          transform: 'rotate(180deg)',
          textOrientation: 'mixed'
        }}
        title="Install Dhikr & Fikr App"
      >
        <span className="flex items-center space-x-2 py-1">
          <Download className="w-4 h-4 text-amber-400 dark:text-stone-950 rotate-90 mb-1 group-hover:scale-110 transition-transform" />
          <span className="font-sans font-extrabold tracking-widest text-[11px]">
            Install App
          </span>
        </span>
      </button>
    </div>
  );
}
