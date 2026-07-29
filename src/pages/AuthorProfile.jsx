import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import SeoHead from '../components/SeoHead';

export default function AuthorProfile() {
  const { name } = useParams();
  
  // Later we can fetch user profile from Supabase based on username/slug
  // For now, this is a placeholder that asks for the portfolio HTML

  return (
    <div className="min-h-screen bg-[#f6f8fa] dark:bg-[#0d1117] flex flex-col items-center justify-center p-6 text-center transition-colors">
      <SeoHead title={`Author: ${name} ?" Zikr & Fikr`} />
      
      <div className="max-w-2xl bg-white dark:bg-[#161b22] p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
        <div className="w-32 h-32 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-4xl font-bold text-emerald-600 dark:text-emerald-400 mb-6 border-4 border-white dark:border-[#0d1117] shadow-lg">
          {name ? name.charAt(0).toUpperCase() : 'U'}
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 capitalize">
          {name?.replace(/-/g, ' ')}
        </h1>
        <p className="text-emerald-600 dark:text-emerald-400 font-medium mb-6">Content Admin & Author</p>
        
        <div className="p-6 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-200 dark:border-amber-800/30 mb-8">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            Assalamu alaikum! My portfolio is currently being integrated into this page. 
            Check back soon to see my full profile and all my published reflections on Zikr & Fikr.
          </p>
        </div>
        
        <Link 
          to="/"
          className="inline-flex items-center px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors shadow-sm"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}
