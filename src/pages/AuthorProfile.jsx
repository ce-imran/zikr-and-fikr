import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import SeoHead from '../components/SeoHead';
import { fetchJson } from '../services/api';
import { Mail, Calendar, MapPin, ExternalLink, PenTool, BookOpen } from 'lucide-react';
import PostCard from '../components/PostCard';

export default function AuthorProfile() {
  const { name } = useParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const iframeRef = React.useRef(null);
  
  // Normalize the name from the URL slug
  const authorName = name ? name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : 'Author';
  const isAdminAhmad = name?.toLowerCase().includes('ahmad');

  // Send posts to iframe when loaded
  useEffect(() => {
    if (isAdminAhmad && iframeRef.current && posts.length > 0) {
      // Small timeout to ensure iframe scripts are ready
      setTimeout(() => {
        if (iframeRef.current?.contentWindow) {
          iframeRef.current.contentWindow.postMessage(posts, '*');
        }
      }, 500);
    }
  }, [posts, isAdminAhmad]);

  useEffect(() => {
    // Fetch posts written by this author
    const loadAuthorPosts = async () => {
      try {
        const data = await fetchJson('/posts');
        if (data.posts) {
          // Filter by author name (case insensitive)
          const filtered = data.posts.filter(p => 
            p.author?.toLowerCase().includes(authorName.toLowerCase()) || 
            p.author_id === name
          );
          setPosts(filtered);
        }
      } catch (error) {
        console.error("Failed to load author posts:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadAuthorPosts();
  }, [authorName, name]);

  if (isAdminAhmad) {
    return (
      <div className="w-full h-screen bg-[#0a2e1f]">
        <SeoHead title={`${authorName}'s Profile - Zikr & Fikr`} />
        <iframe 
          ref={iframeRef}
          src="/assets/profile/index.html" 
          title="Ahmad Khaliquzzafar Profile"
          className="w-full h-full border-none"
          onLoad={() => {
            if (posts.length > 0 && iframeRef.current?.contentWindow) {
              iframeRef.current.contentWindow.postMessage(posts, '*');
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0d1117] transition-colors pb-20">
      <SeoHead title={`${authorName}'s Profile - Zikr & Fikr`} />
      
      {/* Profile Header/Cover */}
      <div className="relative h-64 md:h-80 w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-800 dark:from-emerald-900 dark:to-[#0f1419]" />
        <div className="absolute inset-0 bg-[url('/assets/islamic-pattern.png')] opacity-20 mix-blend-overlay bg-repeat bg-[length:100px_100px]" />
        {/* Subtle decorative glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-400/20 blur-[100px] rounded-full pointer-events-none" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
        <div className="bg-white dark:bg-[#161b22] rounded-3xl shadow-xl border border-gray-100 dark:border-[#30363d] overflow-hidden backdrop-blur-sm">
          
          <div className="p-8 sm:p-12">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              
              {/* Avatar */}
              <div className="relative">
                <div className="w-40 h-40 rounded-full ring-8 ring-white dark:ring-[#161b22] bg-gradient-to-br from-emerald-100 to-teal-50 dark:from-emerald-900/40 dark:to-teal-900/20 flex items-center justify-center overflow-hidden shadow-lg">
                  <div className="w-full h-full flex items-center justify-center text-5xl font-bold text-emerald-600 dark:text-emerald-400">
                    {authorName.charAt(0)}
                  </div>
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left mt-2 md:mt-4">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2 font-inter tracking-tight">
                  {authorName}
                </h1>
                <p className="text-lg text-emerald-600 dark:text-emerald-400 font-medium mb-4 flex items-center justify-center md:justify-start gap-2">
                  <PenTool className="w-5 h-5" />
                  Contributing Author
                </p>
                
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl text-lg mb-6">
                  Exploring the depths of faith through writing and reflection. Sharing thoughts on spirituality, daily life, and the pursuit of knowledge.
                </p>

                {/* Social & Details */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 gap-y-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-[#0d1117] px-3 py-1.5 rounded-full border border-gray-200 dark:border-[#30363d]">
                    <MapPin className="w-4 h-4" />
                    <span>India</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800/30">
                    <BookOpen className="w-4 h-4" />
                    <span>{posts.length} Publications</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
              <span className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-lg text-emerald-600 dark:text-emerald-400">
                <BookOpen className="w-6 h-6" />
              </span>
              Published Works
            </h2>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            </div>
          ) : posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map(post => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-[#161b22] rounded-2xl p-12 text-center border border-gray-100 dark:border-[#30363d] shadow-sm">
              <div className="w-16 h-16 bg-gray-50 dark:bg-[#0d1117] rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                <PenTool className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">No publications yet</h3>
              <p className="text-gray-500 dark:text-gray-400">
                {authorName} hasn't published any reflections yet. Check back later!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
