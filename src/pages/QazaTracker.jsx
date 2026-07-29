import React, { useState, useEffect } from 'react';
import { fetchJson } from '../services/api';
import SeoHead from '../components/SeoHead';
import { Moon, Sunrise, Sun, Sunset, Star, Plus, Minus, CheckCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function QazaTracker({ authState }) {
  const navigate = useNavigate();
  const [tracker, setTracker] = useState({ fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0, witr: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const prayers = [
    { key: 'fajr', label: 'Fajr', icon: <Sunrise className="w-5 h-5 text-amber-500" /> },
    { key: 'dhuhr', label: 'Dhuhr', icon: <Sun className="w-5 h-5 text-amber-500" /> },
    { key: 'asr', label: 'Asr', icon: <Sun className="w-5 h-5 text-amber-600" /> },
    { key: 'maghrib', label: 'Maghrib', icon: <Sunset className="w-5 h-5 text-orange-500" /> },
    { key: 'isha', label: 'Isha', icon: <Moon className="w-5 h-5 text-emerald-500" /> },
    { key: 'witr', label: 'Witr', icon: <Star className="w-5 h-5 text-emerald-400" /> }
  ];

  useEffect(() => {
    if (!authState?.authenticated) {
      navigate('/cms-access'); // Use login page for now
      return;
    }

    loadTracker();
  }, [authState, navigate]);

  const loadTracker = async () => {
    setLoading(true);
    const res = await fetchJson('/qaza');
    if (res.success && res.tracker) {
      setTracker(res.tracker);
    }
    setLoading(false);
  };

  const saveTracker = async (newTracker) => {
    setSaving(true);
    const res = await fetchJson('/qaza', {
      method: 'POST',
      body: JSON.stringify(newTracker)
    });
    if (res.success) {
      setTracker(res.tracker);
      setMessage('Tracker saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } else {
      setMessage('Failed to save tracker. Ensure table is created.');
    }
    setSaving(false);
  };

  const updateCount = (key, delta) => {
    const newCount = Math.max(0, (tracker[key] || 0) + delta);
    const newTracker = { ...tracker, [key]: newCount };
    setTracker(newTracker);
    saveTracker(newTracker); // Auto-save on change
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f8fa] dark:bg-[#0d1117] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f8fa] dark:bg-[#0d1117] transition-colors pb-16">
      <SeoHead title="Qaza Namaz Tracker | Zikr & Fikr" />
      
      {/* Header Area */}
      <div className="bg-white dark:bg-[#161b22] border-b border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[url('/assets/islamic-pattern.png')] bg-repeat"></div>
        <div className="max-w-4xl mx-auto px-4 py-10 relative z-10 text-center">
          <Clock className="w-12 h-12 text-emerald-600 dark:text-emerald-500 mx-auto mb-4" />
          <h1 className="text-3xl md:text-4xl font-amiri font-bold text-gray-900 dark:text-gray-100 mb-2">
            Qaza Namaz Tracker
          </h1>
          <p className="text-gray-600 dark:text-gray-400 font-medium">
            Keep track of your missed prayers and fulfill your obligations.
          </p>
        </div>
      </div>

      {/* Tracker Grid */}
      <div className="max-w-4xl mx-auto px-4 mt-8">
        {message && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-100/50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-medium shadow-sm transition-all">
            <CheckCircle className="w-5 h-5 mr-2" />
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {prayers.map((prayer) => (
            <div key={prayer.key} className="bg-white dark:bg-[#161b22] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center transition-all hover:shadow-md hover:border-amber-500/30">
              <div className="p-3 bg-amber-50 dark:bg-[#0d1117] rounded-full mb-4 ring-1 ring-amber-100 dark:ring-gray-800 shadow-inner">
                {prayer.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1 capitalize">{prayer.label}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 font-medium uppercase tracking-wider">Missed Prayers</p>
              
              <div className="flex items-center space-x-6">
                <button 
                  onClick={() => updateCount(prayer.key, -1)}
                  disabled={tracker[prayer.key] === 0 || saving}
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-gray-700 dark:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <Minus className="w-5 h-5" />
                </button>
                
                <span className="text-3xl font-bold text-gray-900 dark:text-gray-100 w-12 text-center tabular-nums">
                  {tracker[prayer.key] || 0}
                </span>

                <button 
                  onClick={() => updateCount(prayer.key, 1)}
                  disabled={saving}
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-gray-700 dark:text-gray-300 disabled:opacity-30 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
