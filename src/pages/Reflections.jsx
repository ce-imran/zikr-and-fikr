import React, { useState, useEffect } from 'react';
import { fetchJson } from '../services/api';
import PostCard from '../components/PostCard';
import SeoHead from '../components/SeoHead';
import { BookOpen, Search, Compass, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Reflections() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All Topics');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // EXACT CATEGORIES REQUIREMENT ORDER:
  const categoriesList = [
    'All Topics',
    'Daily Reflection',
    'Quranic Insights',
    'Hadith Commentary',
    'Islamic History',
    'Fiqh & Character'
  ];

  const loadPosts = async () => {
    setLoading(true);
    try {
      let endpoint = `/posts?page=${page}&limit=12`;
      if (searchQuery) endpoint += `&q=${encodeURIComponent(searchQuery)}`;
      if (activeCategory && activeCategory !== 'All Topics') {
        endpoint += `&category=${encodeURIComponent(activeCategory)}`;
      }

      const data = await fetchJson(endpoint);
      if (data.success) {
        setPosts(data.posts || []);
        setTotalPages(data.pagination?.pages || 1);
      }
    } catch (err) {
      console.error('Failed to load reflections archive:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [activeCategory, searchQuery]);

  useEffect(() => {
    loadPosts();
  }, [activeCategory, searchQuery, page]);

  return (
    <div className="min-h-screen bg-[#f6f8fa] dark:bg-[#0d1117] text-[#24292f] dark:text-[#c9d1d9] transition-colors pb-16">
      <SeoHead
        title="All Reflections — Zikr & Fikr Archive"
        description="Browse all daily reflections, Quranic commentary, Hadith insights, and Islamic history articles."
      />

      {/* Header Banner */}
      <div className="bg-white dark:bg-[#161b22] border-b border-[#d0d7de] dark:border-[#30363d] py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center space-x-2 bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
            <BookOpen className="w-4 h-4" />
            <span>Complete Archive</span>
          </div>

          <h1 className="font-amiri text-3xl sm:text-5xl font-bold text-[#24292f] dark:text-[#f0f6fc]">
            All Spiritual Reflections &amp; Hikmah
          </h1>
          <p className="text-sm sm:text-base text-[#57606a] dark:text-[#8b949e] max-w-2xl mx-auto leading-relaxed">
            Explore our full collection of reflections, structured by topics for easy reading and contemplation.
          </p>

          {/* Search Input */}
          <div className="max-w-md mx-auto pt-2 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reflections by keyword..."
              className="w-full pl-11 pr-4 py-3 bg-[#f6f8fa] dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-[#24292f] dark:text-[#c9d1d9]"
            />
            <Search className="w-5 h-5 text-[#8b949e] absolute left-4 top-1/2 -translate-y-1/2" />
          </div>
        </div>
      </div>

      {/* Main Archive Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* REQUIREMENT #4: Horizontal Category Filter Menu with Exact Order */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-4 scrollbar-none mb-8 border-b border-[#d0d7de] dark:border-[#30363d]">
          {categoriesList.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-amber-500 text-stone-950 shadow-sm'
                    : 'bg-white dark:bg-[#161b22] text-[#24292f] dark:text-[#c9d1d9] border border-[#d0d7de] dark:border-[#30363d] hover:border-amber-500'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Posts Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((n) => (
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
              We couldn't find any published reflections under "{activeCategory}".
            </p>
            <button
              onClick={() => { setActiveCategory('All Topics'); setSearchQuery(''); }}
              className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs px-5 py-2.5 rounded-xl shadow-sm transition-colors"
            >
              Show All Topics
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-3 mt-12">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="p-2.5 rounded-xl border border-[#d0d7de] dark:border-[#30363d] text-[#24292f] dark:text-[#c9d1d9] disabled:opacity-40 hover:bg-[#f6f8fa] dark:hover:bg-[#21262d]"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
              <button
                key={pNum}
                onClick={() => setPage(pNum)}
                className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${
                  page === pNum
                    ? 'bg-amber-500 text-stone-950 shadow-sm'
                    : 'bg-white dark:bg-[#161b22] text-[#24292f] dark:text-[#c9d1d9] border border-[#d0d7de] dark:border-[#30363d] hover:border-amber-500'
                }`}
              >
                {pNum}
              </button>
            ))}

            <button
              disabled={page === totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="p-2.5 rounded-xl border border-[#d0d7de] dark:border-[#30363d] text-[#24292f] dark:text-[#c9d1d9] disabled:opacity-40 hover:bg-[#f6f8fa] dark:hover:bg-[#21262d]"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

      </main>
    </div>
  );
}
