import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export default function PostCard({ post }) {
  const rawDate = post.created_at || post.createdAt || post.published_at || post.publishedAt || Date.now();
  const formattedDate = new Date(rawDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const isTextOnly = post.postType === 'text_only';
  const isImageOnly = post.postType === 'image_only';

  const authorName = post.author?.display_name || post.author?.name || '';
  const roleTag = post.author?.title || post.author?.role || post.author?.bio || '';
  const avatarUrl = post.author?.avatar_url || post.author?.avatar || null;

  return (
    <Link
      to={`/post/${post.slug}`}
      className="group block bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between cursor-pointer"
    >
      <div>

        {/* Cover Image / Category Header */}
        {!isTextOnly && post.cover_image ? (
          <div className="relative h-48 sm:h-52 overflow-hidden bg-[#f6f8fa] dark:bg-[#0d1117]">
            <img
              src={post.cover_image}
              alt={post.title || 'Islamic Reflection'}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => { e.target.src = '/assets/default-cover.svg'; }}
            />
            <div className="absolute top-3 left-3">
              <span className="bg-[#0d1117]/90 backdrop-blur-md text-amber-400 font-semibold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border border-amber-500/40">
                {post.category}
              </span>
            </div>
          </div>
        ) : (
          /* Text-Only Ornamental Header Card */
          <div className="bg-gradient-to-r from-amber-500/10 via-[#f6f8fa] to-amber-500/10 dark:from-[#161b22] dark:via-[#0d1117] dark:to-[#161b22] p-5 border-b border-[#d0d7de] dark:border-[#30363d] relative">
            <div className="flex items-center justify-between">
              <span className="bg-amber-500/20 text-amber-700 dark:text-amber-400 font-semibold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border border-amber-500/30">
                {post.category}
              </span>
            </div>
            <div className="mt-3 text-center">
              <span className="font-amiri text-lg text-amber-600 dark:text-amber-400 opacity-90 font-bold">
                ﷽
              </span>
            </div>
          </div>
        )}

        {/* Card Body */}
        <div className="p-5 sm:p-6 space-y-3">

          {/* Title */}
          {post.title && (
            <h3 className="font-nastaleeq-title text-xl sm:text-2xl font-bold text-[#24292f] dark:text-[#f0f6fc] group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors leading-snug line-clamp-2 pb-1">
              {post.title}
            </h3>
          )}

          {/* Excerpt / Summary */}
          {!isImageOnly && post.summary && (
            <p className="text-[#57606a] dark:text-[#8b949e] text-xs sm:text-sm font-sans line-clamp-3 leading-relaxed">
              {post.summary}
            </p>
          )}

        </div>

      </div>

      {/* Card Footer Meta: Author DP, Display Name, Role Tag, Date */}
      <div className="px-5 sm:px-6 pb-4 pt-3 border-t border-[#d0d7de] dark:border-[#30363d] flex items-center justify-between text-xs text-[#57606a] dark:text-[#8b949e] font-sans">

        {/* Author DP & Display Name */}
        <div className="flex items-center space-x-2.5 min-w-0 pr-2">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-amber-500/10 border border-amber-500/30 shrink-0 flex items-center justify-center">
            {post.author?.avatar_url ? (
              <img
                src={post.author.avatar_url}
                alt={post.author?.display_name ? post.author.display_name : "Unknown Author"}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  if (e.target.nextSibling) {
                    e.target.nextSibling.style.display = 'inline';
                  }
                }}
              />
            ) : null}
            <span
              className="font-amiri text-xs font-bold text-amber-600 dark:text-amber-400"
              style={{ display: post.author?.avatar_url ? 'none' : 'inline' }}
            >
              {post.author?.display_name ? post.author.display_name.charAt(0).toUpperCase() : 'U'}
            </span>
          </div>

          <div className="truncate">
            <div className="flex items-center space-x-1.5 truncate">
              <span 
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = `/author/${(post.author?.display_name || "unknown").toLowerCase().replace(/\s+/g, '-')}`;
                }}
                className="cursor-pointer text-xs font-bold text-[#24292f] dark:text-[#f0f6fc] truncate hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
              >
                {post.author?.display_name ? post.author.display_name : "Unknown Author"}
              </span>
              {post.author?.role ? (
                <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[9px] font-semibold px-1.5 py-0.5 rounded-full shrink-0">
                  {post.author.role}
                </span>
              ) : null}
            </div>
            <div className="flex items-center space-x-1.5 text-[11px] text-[#57606a] dark:text-[#8b949e]">
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>

        <span className="text-amber-600 dark:text-amber-400 font-bold text-xs group-hover:underline flex items-center space-x-1 shrink-0">
          <span>Read</span>
          <Sparkles className="w-3 h-3" />
        </span>
      </div>
    </Link>
  );
}
