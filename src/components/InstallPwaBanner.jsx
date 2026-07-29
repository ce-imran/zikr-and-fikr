import React from 'react';
import { Download, Smartphone, X } from 'lucide-react';

export default function InstallPwaBanner({ deferredPrompt, onInstall, onDismiss }) {
  if (!deferredPrompt) return null;

  return (
    <div className="bg-gradient-to-r from-islamic-dark via-emerald-950 to-islamic-dark border-b border-islamic-amber/40 text-white px-4 py-3 shadow-lg relative z-30">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-3 text-center sm:text-left">
          <div className="p-2 bg-islamic-amber text-islamic-dark rounded-xl font-bold hidden sm:block">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-islamic-amber">
              Install Nur &amp; Hikmah App
            </p>
            <p className="text-xs text-emerald-100/90">
              Add to your home screen for quick offline access to daily reflections.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onInstall}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-islamic-amber to-yellow-500 text-islamic-dark font-bold text-xs px-4 py-2 rounded-lg shadow hover:opacity-90 transition-opacity"
          >
            <Download className="w-4 h-4" />
            <span>Add to Home Screen</span>
          </button>
          <button
            onClick={onDismiss}
            className="text-emerald-300 hover:text-white p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
