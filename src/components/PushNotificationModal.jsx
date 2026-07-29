import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { requestFcmTokenAndSubscribe } from '../services/firebaseClient';

export default function PushNotificationModal() {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // 1. Only trigger on landing page '/'
    if (location.pathname !== '/') return;

    // 2. Check 24-hour dismissal flag
    const dismissedTime = localStorage.getItem('dhikr_fikr_push_dismissed_time');
    if (dismissedTime) {
      const hoursPassed = (Date.now() - parseInt(dismissedTime, 10)) / (1000 * 60 * 60);
      if (hoursPassed < 24) return;
    }

    // 3. Check if permission already granted
    if ('Notification' in window && Notification.permission === 'granted') {
      return;
    }

    // 4. 30-Second Delay (30,000ms) before opening custom prompt modal
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 30000);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  const handleDismiss = () => {
    localStorage.setItem('dhikr_fikr_push_dismissed_time', Date.now().toString());
    setIsVisible(false);
  };

  const handleUserAccepts = () => {
    setLoading(true);
    if (!('Notification' in window)) {
      handleDismiss();
      return;
    }

    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        requestFcmTokenAndSubscribe().catch(() => {});
        setSuccess(true);
        setTimeout(() => {
          handleDismiss();
        }, 2000);
      } else {
        handleDismiss();
      }
    }).finally(() => {
      setLoading(false);
    });
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 sm:right-auto sm:max-w-sm z-50 animate-in fade-in slide-in-from-bottom-5 duration-500 font-sans">
      <div className="bg-[#161b22] text-[#c9d1d9] border border-[#30363d] rounded-2xl p-5 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        
        {/* Golden Top Line */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500"></div>

        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-[#8b949e] hover:text-white p-1 rounded-lg transition-colors"
          title="Dismiss Notification Prompt"
        >
          <X className="w-4 h-4" />
        </button>

        {success ? (
          <div className="text-center py-3 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto animate-bounce" />
            <h4 className="font-amiri text-lg font-bold text-amber-400">
              Notifications Enabled!
            </h4>
            <p className="text-xs text-[#8b949e]">
              You will now receive daily reflection alerts on this device.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-start space-x-3.5 pr-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold shrink-0 shadow">
                <Bell className="w-5 h-5 fill-stone-950" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    Daily Reflection Alerts
                  </span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <p className="text-xs text-[#c9d1d9] leading-relaxed">
                  Do you want to enable daily reflections alerts on your device?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#30363d]">
              <button
                onClick={handleDismiss}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#8b949e] hover:text-white"
              >
                No, thanks
              </button>
              <button
                onClick={handleUserAccepts}
                disabled={loading}
                className="inline-flex items-center space-x-1.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs px-4 py-2 rounded-xl shadow transition-colors disabled:opacity-50"
              >
                <Bell className="w-3.5 h-3.5 fill-stone-950" />
                <span>{loading ? 'Enabling...' : 'Yes, Enable Alerts'}</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
