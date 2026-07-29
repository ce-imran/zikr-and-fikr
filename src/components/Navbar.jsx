import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Moon, Sun, Bell, Download, BookOpen, Clock } from 'lucide-react';
import { requestFcmTokenAndSubscribe } from '../services/firebaseClient';
import Toast from './Toast';

export default function Navbar() {
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'info' });

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
      setDarkMode(true);
    } else {
      document.documentElement.classList.remove('dark');
      setDarkMode(false);
    }
  }, []);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const toggleDarkMode = () => {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    setDarkMode(isDark);
  };

  const handleInstallClick = () => {
    if (window.deferredPrompt) {
      window.deferredPrompt.prompt();
      window.deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          showToast('App installed successfully!', 'success');
        }
        window.deferredPrompt = null;
      });
    } else {
      showToast('App is already installed or direct install is blocked by browser.', 'info');
    }
  };

  const handleNotificationClick = () => {
    if (!('Notification' in window)) {
      showToast('Notifications are not supported by your browser.', 'error');
      return;
    }

    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        requestFcmTokenAndSubscribe()
          .then(() => {
            setSubscribed(true);
            showToast('Notifications Enabled!', 'success');
          })
          .catch(err => {
            showToast(err.message || 'Notification setup failed.', 'error');
          });
      } else {
        showToast('Notifications Blocked by user.', 'info');
      }
    });
  };

  return (
    <>
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'info' })}
      />

      <header className="sticky top-0 z-40 bg-white dark:bg-[#161b22] text-[#24292f] dark:text-[#c9d1d9] border-b border-[#d0d7de] dark:border-[#30363d] shadow-sm transition-colors">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            
            {/* Global Branding & Navigation Links */}
            <div className="flex items-center space-x-2 sm:space-x-6 min-w-0">
              <Link to="/" className="flex items-center group shrink-0">
                <div className="truncate">
                  <span className="font-amiri text-xl sm:text-3xl font-bold tracking-tight text-[#24292f] dark:text-[#c9d1d9] group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors whitespace-nowrap">
                    Zikr &amp; Fikr
                  </span>
                </div>
              </Link>

              {/* Desktop Header Navigation Link "All Reflections" next to Logo */}
              <nav className="hidden md:flex items-center space-x-4 pl-4 border-l border-[#d0d7de] dark:border-[#30363d]">
                <Link
                  to="/reflections"
                  className={`text-xs font-bold transition-colors flex items-center space-x-1.5 px-3 py-1.5 rounded-lg ${
                    location.pathname === '/reflections'
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                      : 'text-[#57606a] dark:text-[#8b949e] hover:text-[#24292f] dark:hover:text-white'
                  }`}
                >
                  <BookOpen className="w-4 h-4 text-amber-500" />
                  <span>All Reflections</span>
                </Link>

                <Link
                  to="/qaza-tracker"
                  className={`text-xs font-bold transition-colors flex items-center space-x-1.5 px-3 py-1.5 rounded-lg ${
                    location.pathname === '/qaza-tracker'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                      : 'text-[#57606a] dark:text-[#8b949e] hover:text-[#24292f] dark:hover:text-white'
                  }`}
                >
                  <Clock className="w-4 h-4 text-emerald-500" />
                  <span>Qaza Tracker</span>
                </Link>
              </nav>
            </div>

            {/* Header Right Controls */}
            <div className="flex items-center space-x-1.5 sm:space-x-2.5 shrink-0">
              
              {/* Mobile Navigation Button to /reflections */}
              <Link
                to="/reflections"
                className="md:hidden px-2 py-1 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline shrink-0"
                title="All Reflections"
              >
                <span>Archive</span>
              </Link>

              {/* Mobile Navigation Button to /qaza-tracker */}
              <Link
                to="/qaza-tracker"
                className="md:hidden px-2 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline shrink-0"
                title="Qaza Tracker"
              >
                <span>Qaza</span>
              </Link>

              {/* PWA 1-Click Native Install Button */}
              <button
                onClick={handleInstallClick}
                className="border border-[#d0d7de] dark:border-[#30363d] bg-transparent hover:bg-[#f6f8fa] dark:hover:bg-[#21262d] text-xs font-semibold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg transition-colors text-[#24292f] dark:text-[#c9d1d9] flex items-center space-x-1 sm:space-x-1.5 shrink-0"
                title="Install App"
                aria-label="Install App"
              >
                <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span className="hidden sm:inline">Install App</span>
              </button>

              {/* Push Notifications Toggle */}
              <button
                onClick={handleNotificationClick}
                className={`inline-flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg border text-xs font-semibold transition-all shrink-0 ${
                  subscribed
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                    : 'bg-transparent border-[#d0d7de] dark:border-[#30363d] hover:bg-[#f6f8fa] dark:hover:bg-[#21262d] text-[#24292f] dark:text-[#c9d1d9]'
                }`}
                title="Enable Notifications"
              >
                <Bell className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${subscribed ? 'fill-emerald-500 text-emerald-500' : 'text-amber-500'}`} />
                <span className="hidden sm:inline">{subscribed ? 'Alerts Active' : 'Alerts'}</span>
              </button>

              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-1 sm:p-1.5 text-[#57606a] dark:text-[#c9d1d9] hover:text-[#24292f] dark:hover:text-white rounded-lg bg-transparent border border-[#d0d7de] dark:border-[#30363d] hover:bg-[#f6f8fa] dark:hover:bg-[#21262d] transition-colors shrink-0"
                aria-label="Toggle Theme"
                title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {darkMode ? <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" /> : <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-700" />}
              </button>

            </div>

          </div>
        </div>
      </header>
    </>
  );
}
