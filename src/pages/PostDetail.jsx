import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchJson } from '../services/api';
import SeoHead from '../components/SeoHead';
import { ArrowLeft, Share2, Check, Heart, Eye, Calendar, MessageSquare } from 'lucide-react';
import DOMPurify from 'dompurify';

export default function PostDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // REQUIREMENT #3 & #4: Like Button UI, Count State & Spam Lock
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  const hasFetched = React.useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    async function loadPost() {
      setLoading(true);
      try {
        const data = await fetchJson(`/posts/slug/${slug}`);
        if (data.success) {
          setPost(data.post);
          setLikes(data.post.likes || 0);

          // Check localStorage for previously liked post ID
          const likedPosts = JSON.parse(localStorage.getItem('dhikr_fikr_liked_posts') || '[]');
          if (likedPosts.includes(data.post._id)) {
            setHasLiked(true);
          }
        }
      } catch (err) {
        console.error('Failed to load post detail:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPost();
  }, [slug]);

  // Handle Like Button Click (Optimistic update & spam protection lock)
  const handleLike = async () => {
    if (hasLiked || isLiking || !post) return;

    setIsLiking(true);
    // 1. Optimistic UI update
    setLikes(prev => prev + 1);
    setHasLiked(true);

    // 2. Persist in localStorage to prevent multi-like spam per device
    const likedPosts = JSON.parse(localStorage.getItem('dhikr_fikr_liked_posts') || '[]');
    if (!likedPosts.includes(post._id)) {
      likedPosts.push(post._id);
      localStorage.setItem('dhikr_fikr_liked_posts', JSON.stringify(likedPosts));
    }

    // 3. Send backend request to increment likes
    try {
      const res = await fetchJson(`/posts/${post._id}/like`, { method: 'POST' });
      if (res.success && res.likes !== undefined) {
        setLikes(res.likes);
      }
    } catch (err) {
      console.warn('Failed to sync like count with server:', err);
    } finally {
      setIsLiking(false);
    }
  };

  const currentUrl = window.location.href;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const shareOnWhatsApp = () => {
    const text = `📖 *${post?.title}*\n\n${post?.summary}\n\nRead full reflection on Dhikr & Fikr: ${currentUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareOnTwitter = () => {
    const text = `📖 Read "${post?.title}" — Daily Reflection on Dhikr & Fikr`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(currentUrl)}`, '_blank');
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6 animate-pulse">
        <div className="h-8 bg-[#d0d7de] dark:bg-[#30363d] rounded w-1/3 mx-auto"></div>
        <div className="h-64 bg-[#d0d7de] dark:bg-[#30363d] rounded-2xl"></div>
        <div className="h-4 bg-[#d0d7de] dark:bg-[#30363d] rounded w-full"></div>
        <div className="h-4 bg-[#d0d7de] dark:bg-[#30363d] rounded w-5/6"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center text-[#24292f] dark:text-[#c9d1d9]">
        <h2 className="font-amiri text-3xl font-bold text-[#24292f] dark:text-[#f0f6fc] mb-4">
          Article Not Found
        </h2>
        <p className="text-[#57606a] dark:text-[#8b949e] mb-6">
          The requested daily reflection could not be located or has been archived.
        </p>
        <Link
          to="/"
          className="inline-flex items-center space-x-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold px-6 py-2.5 rounded-xl shadow transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Feed</span>
        </Link>
      </div>
    );
  }

  const rawDate = post.created_at || post.createdAt || post.published_at || post.publishedAt || Date.now();
  const formattedDate = new Date(rawDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const authorDisplayName = post.author?.display_name || post.author?.name || '';
  const authorSubtitle = post.author?.title || post.author?.role || post.author?.bio || '';
  const authorAvatarUrl = post.author?.avatar_url || post.author?.avatar || null;

  return (
    <article className="min-h-screen bg-[#f6f8fa] dark:bg-[#0d1117] pb-16 text-[#24292f] dark:text-[#c9d1d9] transition-colors">
      <SeoHead
        title={`${post.seoTitle || post.title} — Zikr & Fikr`}
        description={post.seoDescription || post.summary}
        image={post.coverImage || post.cover_image}
        url={currentUrl}
      />

      {/* Navigation Sub-Bar */}
      <div className="bg-white dark:bg-[#161b22] border-b border-[#d0d7de] dark:border-[#30363d] py-3.5 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link
            to="/reflections"
            className="inline-flex items-center space-x-2 text-xs font-semibold text-[#57606a] dark:text-[#8b949e] hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Reflections</span>
          </Link>
          <div className="flex items-center space-x-2">
            <button
              onClick={shareOnWhatsApp}
              className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs px-3 py-1.5 rounded-lg flex items-center space-x-1 shadow-sm"
              title="Share on WhatsApp"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>
            <button
              onClick={handleCopyLink}
              className="bg-[#f6f8fa] dark:bg-[#21262d] hover:bg-[#e9ecef] dark:hover:bg-[#30363d] text-[#24292f] dark:text-[#c9d1d9] text-xs px-3 py-1.5 rounded-lg border border-[#d0d7de] dark:border-[#30363d] flex items-center space-x-1"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Share'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Centered Readable Container (max-w-3xl) */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12">

        <div className="bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] p-6 sm:p-10 rounded-3xl shadow-md space-y-8 overflow-hidden break-words max-w-full">

          {/* Header Info */}
          <div className="space-y-4 border-b border-[#d0d7de] dark:border-[#30363d] pb-6">
            <div className="inline-block bg-amber-500/10 border border-amber-500/40 text-amber-700 dark:text-amber-400 font-semibold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
              {post.category}
            </div>

            {post.title && (
              <h1 className="font-nastaleeq-title text-3xl sm:text-4xl font-bold text-[#24292f] dark:text-[#f0f6fc] leading-tight pb-2">
                {post.title}
              </h1>
            )}

            {/* Excerpt */}
            {post.summary && post.summary.trim() !== '...' && post.postType !== 'image_only' && (
              <p className="text-base sm:text-lg text-[#57606a] dark:text-[#c9d1d9] font-sans italic leading-relaxed border-l-4 border-amber-500 pl-4 bg-[#f6f8fa] dark:bg-[#0d1117] py-2.5 pr-3 rounded-r-xl">
                "{post.summary}"
              </p>
            )}

            {/* Author & Meta */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 text-xs text-[#57606a] dark:text-[#8b949e]">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-[#24292f] dark:bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
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
                    className="font-amiri text-base font-bold text-amber-500"
                    style={{ display: post.author?.avatar_url ? 'none' : 'inline' }}
                  >
                    {post.author?.display_name ? post.author.display_name.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <Link 
                        to={`/author/${(post.author?.display_name || "unknown").toLowerCase().replace(/\s+/g, '-')}`}
                        className="font-bold text-[#24292f] dark:text-[#f0f6fc] text-sm hover:text-amber-500 transition-colors"
                      >
                        {post.author?.display_name ? post.author.display_name : "Unknown Author"}
                      </Link>
                    {post.author?.role ? (
                      <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                        {post.author.role}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <span className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4 text-amber-500" />
                  <span>{formattedDate}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Eye className="w-4 h-4 text-amber-500" />
                  <span>{post.views || 0} views</span>
                </span>
              </div>
            </div>
          </div>

          {/* Cover Image if present */}
          {(post.coverImage || post.cover_image) && (
            <div className="rounded-2xl overflow-hidden shadow border border-[#d0d7de] dark:border-[#30363d] max-h-[440px]">
              <img
                src={post.coverImage || post.cover_image}
                alt={post.title || 'Islamic Reflection Image'}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = '/assets/default-cover.svg'; }}
              />
            </div>
          )}

          {/* Article Body Content */}
          {post.content && (
            <div
              dir="auto"
              className="font-sans text-lg leading-loose text-[#24292f] dark:text-[#c9d1d9] space-y-6 prose-reading whitespace-pre-wrap break-words"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content.replace(/&nbsp;/g, ' ')) }}
            />
          )}

          {/* Like Button */}
          <div className="pt-6 border-t border-[#d0d7de] dark:border-[#30363d] flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={handleLike}
                disabled={hasLiked || isLiking}
                className={`inline-flex items-center space-x-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-sm ${hasLiked
                  ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 cursor-default'
                  : 'bg-[#f6f8fa] dark:bg-[#0d1117] hover:bg-rose-50 dark:hover:bg-rose-950/30 text-[#24292f] dark:text-[#c9d1d9] hover:text-rose-600 border border-[#d0d7de] dark:border-[#30363d] hover:border-rose-300'
                  }`}
              >
                <Heart className={`w-4 h-4 transition-transform ${hasLiked ? 'fill-rose-500 text-rose-500 scale-110' : 'text-rose-500'}`} />
                <span>Like</span>
                <span className="ml-1 bg-white dark:bg-[#161b22] px-2 py-0.5 rounded-full border border-[#d0d7de] dark:border-[#30363d] text-[11px]">
                  {likes}
                </span>
              </button>
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {post.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-[#f6f8fa] dark:bg-[#0d1117] text-[#24292f] dark:text-[#c9d1d9] font-semibold px-3 py-1 rounded-full border border-[#d0d7de] dark:border-[#30363d]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Social Share Footer */}
          <div className="bg-[#f6f8fa] dark:bg-[#0d1117] rounded-2xl p-6 border border-[#d0d7de] dark:border-[#30363d] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-amiri text-lg font-bold text-[#24292f] dark:text-[#f0f6fc]">
                Share this reflection
              </h3>
              <p className="text-xs text-[#57606a] dark:text-[#8b949e]">
                Spread beneficial knowledge with family and friends.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={shareOnWhatsApp}
                className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-sm transition-colors"
              >
                WhatsApp
              </button>
              <button
                onClick={shareOnTwitter}
                className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-sm transition-colors"
              >
                Twitter / X
              </button>
              <button
                onClick={handleCopyLink}
                className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs px-3.5 py-2 rounded-xl shadow-sm transition-colors"
              >
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
          </div>

        </div>

      </div>
    </article>
  );
}
