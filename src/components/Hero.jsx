import React from 'react';
import { Search } from 'lucide-react';

export default function Hero({ searchQuery, setSearchQuery, selectedCategory, setSelectedCategory, categories }) {
  return (
    <section className="relative bg-[#f6f8fa] dark:bg-[#0d1117] text-[#24292f] dark:text-[#c9d1d9] py-12 sm:py-16 px-4 sm:px-6 lg:px-8 border-b border-[#d0d7de] dark:border-[#30363d] transition-colors">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none islamic-bg-pattern"></div>
      
      <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
        
        {/* Bismillah Calligraphy Heading */}
        <div className="inline-block bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] px-6 py-2 rounded-full shadow-sm backdrop-blur-sm">
          <span className="font-amiri text-2xl sm:text-3xl text-amber-600 dark:text-amber-400 font-bold tracking-wide">
            بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
          </span>
        </div>

        {/* Main Title & Description with Zikr & Fikr */}
        <h1 className="font-amiri text-3xl sm:text-5xl font-bold tracking-tight text-[#24292f] dark:text-[#f0f6fc] leading-tight">
          Nurturing the Heart with <span className="text-amber-600 dark:text-amber-400">Zikr &amp; Fikr</span>
        </h1>
        <p className="text-[#57606a] dark:text-[#8b949e] text-sm sm:text-base max-w-2xl mx-auto font-sans leading-relaxed">
          Daily manual reflections, Quranic commentary, and Prophetic guidance curated for spiritual elevation and inner peace.
        </p>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto pt-2">
          <div className="relative flex items-center shadow-sm rounded-2xl overflow-hidden border border-[#d0d7de] dark:border-[#30363d] bg-white dark:bg-[#161b22]">
            <Search className="w-5 h-5 text-[#8b949e] ml-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search daily reflections by title or topic..."
              className="w-full py-3.5 px-4 bg-transparent text-[#24292f] dark:text-[#c9d1d9] placeholder-[#8b949e] focus:outline-none text-sm sm:text-base font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mr-4 text-xs bg-[#f6f8fa] dark:bg-[#21262d] text-[#57606a] dark:text-[#8b949e] px-2.5 py-1 rounded hover:bg-[#e9ecef] dark:hover:bg-[#30363d]"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              selectedCategory === 'All'
                ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                : 'bg-white dark:bg-[#161b22] text-[#24292f] dark:text-[#c9d1d9] border border-[#d0d7de] dark:border-[#30363d] hover:border-amber-500'
            }`}
          >
            All Topics
          </button>
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                selectedCategory === cat.name
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                  : 'bg-white dark:bg-[#161b22] text-[#24292f] dark:text-[#c9d1d9] border border-[#d0d7de] dark:border-[#30363d] hover:border-amber-500'
              }`}
            >
              {cat.name} <span className="opacity-70 text-[10px]">({cat.count})</span>
            </button>
          ))}
        </div>

      </div>
    </section>
  );
}
