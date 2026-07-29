import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchJson } from '../services/api';
import Hero from '../components/Hero';
import PostCard from '../components/PostCard';
import SeoHead from '../components/SeoHead';
import Toast from '../components/Toast';
import { BookOpen, Bell, Compass, ArrowRight } from 'lucide-react';
import { requestFcmTokenAndSubscribe } from '../services/firebaseClient';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Custom Toast State
  const [toast, setToast] = useState({ message: '', type: 'info' });

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  // REQUIREMENT #2: Fetch ONLY 3 most recent posts for Homepage Feed
  const loadPosts = async () => {
    setLoading(true);
    try {
      let endpoint = `/posts?limit=3`;
      if (searchQuery) endpoint += `&q=${encodeURIComponent(searchQuery)}`;
      if (selectedCategory && selectedCategory !== 'All') endpoint += `&category=${encodeURIComponent(selectedCategory)}`;

      const data = await fetchJson(endpoint);
      if (data.success) {
        setPosts(data.posts || []);
      }
    } catch (err) {
      console.error('Failed to load homepage posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMetaData = async () => {
    try {
      const catRes = await fetchJson('/posts/categories');
      if (catRes.success) setCategories(catRes.categories);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  useEffect(() => {
    loadMetaData();
  }, []);

  useEffect(() => {
    loadPosts();
  }, [searchQuery, selectedCategory]);

  const handleSubscribePushBanner = () => {
    if (!('Notification' in window)) {
      showToast('Notifications are not supported by your browser.', 'error');
      return;
    }

    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        requestFcmTokenAndSubscribe()
          .then(() => {
            showToast('Push Notifications Enabled!', 'success');
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
    <div className="min-h-screen bg-[#f6f8fa] dark:bg-[#0d1117] text-[#24292f] dark:text-[#c9d1d9] transition-colors">
      <SeoHead
        title="Zikr & Fikr — Daily Reflections & Hikmah"
        description="Serene daily Islamic reflections, Quranic commentary, and Prophetic guidance."
      />

      {/* Toast Notification Container */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'info' })}
      />

      {/* Hero Section */}
      <Hero
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categories={categories}
      />

      {/* Main Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 pb-4 border-b border-[#d0d7de] dark:border-[#30363d]">
          <div>
            <h2 className="font-amiri text-2xl sm:text-3xl font-bold text-[#24292f] dark:text-[#f0f6fc] flex items-center space-x-2">
              <BookOpen className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              <span>
                {selectedCategory === 'All' ? 'Latest 3 Reflections' : selectedCategory}
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-[#57606a] dark:text-[#8b949e]">
              {searchQuery ? `Search results for "${searchQuery}"` : 'Handcrafted daily spiritual reflections.'}
            </p>
          </div>

          <Link
            to="/reflections"
            className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center space-x-1"
          >
            <span>View All Reflections</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Posts Grid (Limit 3) */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-2xl p-6 space-y-4 animate-pulse">
                <div className="h-48 bg-[#f6f8fa] dark:bg-[#21262d] rounded-xl"></div>
                <div className="h-6 bg-[#f6f8fa] dark:bg-[#21262d] rounded w-3/4"></div>
                <div className="h-4 bg-[#f6f8fa] dark:bg-[#21262d] rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-2xl p-8 max-w-lg mx-auto shadow-sm">
            <Compass className="w-12 h-12 text-amber-500 mx-auto mb-3" />
            <h3 className="font-amiri text-2xl font-bold text-[#24292f] dark:text-[#f0f6fc] mb-2">
              No Reflections Found
            </h3>
            <p className="text-sm text-[#57606a] dark:text-[#8b949e] mb-6">
              We couldn't find any published reflections matching your search.
            </p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
              className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs px-5 py-2.5 rounded-xl shadow-sm transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>

            {/* REQUIREMENT #2: Inline "View All Reflections" Button below the 3 posts */}
            <div className="text-center pt-4">
              <Link
                to="/reflections"
                className="inline-flex items-center space-x-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-sm px-6 py-3.5 rounded-2xl shadow-md transition-all hover:scale-105"
              >
                <span>View All Reflections</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {/* Web Push Banner CTA */}
        <div className="mt-16 bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-3xl p-8 text-center text-[#24292f] dark:text-[#c9d1d9] shadow-sm">
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/40 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center mx-auto">
              <Bell className="w-6 h-6" />
            </div>
            <h3 className="font-amiri text-2xl sm:text-3xl font-bold text-[#24292f] dark:text-[#f0f6fc]">
              Never Miss a Daily Reflection
            </h3>
            <p className="text-[#57606a] dark:text-[#8b949e] text-sm leading-relaxed">
              Subscribe to push notifications to receive spiritual reflections directly when published on Zikr &amp; Fikr.
            </p>
            <button
              onClick={handleSubscribePushBanner}
              className="inline-flex items-center space-x-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-sm px-6 py-3 rounded-xl shadow-md transition-transform hover:scale-105"
            >
              <Bell className="w-4 h-4 fill-stone-950" />
              <span>Enable Web Push Notifications</span>
            </button>
          </div>
        </div>

      </main>
    </div>
  );
}
