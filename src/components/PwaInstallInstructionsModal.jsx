import React from 'react';
import { X, Smartphone, Share, MoreVertical, PlusSquare, Compass } from 'lucide-react';

export default function PwaInstallInstructionsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] text-[#24292f] dark:text-[#c9d1d9] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative space-y-6">
        
        {/* Top Decorative Accent Line */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 rounded-t-3xl"></div>

        {/* Modal Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold shadow">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-amiri text-2xl font-bold text-[#24292f] dark:text-[#f0f6fc]">
                Install Dhikr &amp; Fikr
              </h3>
              <p className="text-xs text-[#57606a] dark:text-[#8b949e]">
                Add to Home Screen for fast, offline-ready access.
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="text-[#8b949e] hover:text-[#24292f] dark:hover:text-white p-1.5 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Instructions Container */}
        <div className="space-y-4 text-xs sm:text-sm font-sans leading-relaxed">
          
          <div className="p-4 rounded-2xl bg-[#f6f8fa] dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                1
              </div>
              <p className="text-[#24292f] dark:text-[#c9d1d9]">
                Open your browser options menu (tap <MoreVertical className="w-4 h-4 inline text-amber-500" /> on Android or <Share className="w-4 h-4 inline text-amber-500" /> on iOS Safari).
              </p>
            </div>

            <div className="flex items-start space-x-3 pt-2 border-t border-[#d0d7de]/60 dark:border-[#30363d]/60">
              <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                2
              </div>
              <p className="text-[#24292f] dark:text-[#c9d1d9]">
                Select <span className="font-bold text-amber-600 dark:text-amber-400">"Add to Home Screen"</span> or <span className="font-bold text-amber-600 dark:text-amber-400">"Install App"</span> <PlusSquare className="w-4 h-4 inline text-amber-500" />.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs text-[#57606a] dark:text-[#8b949e] px-1">
            <Compass className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Enjoy instant startup, daily push alerts, and offline readings.</span>
          </div>

        </div>

        {/* Modal Action Button */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs py-3 rounded-xl shadow transition-colors"
          >
            Got it, Understood
          </button>
        </div>

      </div>
    </div>
  );
}
