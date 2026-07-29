import React, { useState } from 'react';
import { Compass, BookOpen, ShieldCheck, MessageCircle, HelpCircle, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';
import AskFatwaModal from './AskFatwaModal';

export default function Footer() {
  const [fatwaModalOpen, setFatwaModalOpen] = useState(false);

  return (
    <>
      <footer className="bg-[#161b22] text-[#c9d1d9] border-t border-amber-600/30 relative overflow-hidden pt-12 pb-8">
        {/* Golden Accent Top Line */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-600/40 via-amber-500 to-amber-600/40"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            
            {/* Brand Info */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-stone-950 font-amiri font-bold text-2xl shadow-md">
                  ذ
                </div>
                <span className="font-amiri text-2xl font-bold tracking-wide text-amber-400">
                  Zikr &amp; Fikr
                </span>
              </div>
              <p className="text-[#8b949e] text-sm max-w-md leading-relaxed">
                A serene daily blogging platform for spiritual growth, Quranic reflection, and Prophetic guidance. Handcrafted with care and sincerity.
              </p>
              <div className="flex items-center space-x-3 pt-2 text-xs text-[#8b949e]">
                <span className="inline-flex items-center space-x-1 bg-[#0d1117] px-2.5 py-1 rounded-full border border-[#30363d]">
                  <Compass className="w-3.5 h-3.5 text-amber-400" />
                  <span>PWA Enabled</span>
                </span>
                <span className="inline-flex items-center space-x-1 bg-[#0d1117] px-2.5 py-1 rounded-full border border-[#30363d]">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Secure CMS</span>
                </span>
              </div>
            </div>

            {/* Navigation (REQUIREMENT #3: Added All Reflections right below Home & Reflections) */}
            <div>
              <h4 className="font-amiri text-lg font-bold text-amber-400 mb-4 border-b border-[#30363d] pb-2">
                Navigation
              </h4>
              <ul className="space-y-2.5 text-sm text-[#8b949e]">
                <li>
                  <Link to="/" className="hover:text-amber-400 transition-colors flex items-center space-x-2">
                    <BookOpen className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>Home &amp; Reflections</span>
                  </Link>
                </li>
                <li>
                  <Link to="/reflections" className="hover:text-amber-400 transition-colors flex items-center space-x-2">
                    <Layers className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>All Reflections</span>
                  </Link>
                </li>
                <li>
                  <a
                    href="https://whatsapp.com/channel/0029Vb5BVksFi8xVcvLmiL33"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-amber-400 transition-colors flex items-center space-x-2"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>WhatsApp Channel</span>
                  </a>
                </li>
                <li>
                  <button
                    onClick={() => setFatwaModalOpen(true)}
                    className="hover:text-amber-400 transition-colors flex items-center space-x-2 text-left w-full"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>Ask Fatwa</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Topics */}
            <div>
              <h4 className="font-amiri text-lg font-bold text-amber-400 mb-4 border-b border-[#30363d] pb-2">
                Topics
              </h4>
              <ul className="space-y-2 text-sm text-[#8b949e]">
                <li><span className="hover:text-amber-400 transition-colors cursor-pointer">Daily Reflections</span></li>
                <li><span className="hover:text-amber-400 transition-colors cursor-pointer">Quranic Insights</span></li>
                <li><span className="hover:text-amber-400 transition-colors cursor-pointer">Hadith Commentary</span></li>
                <li><span className="hover:text-amber-400 transition-colors cursor-pointer">Fiqh &amp; Ethics</span></li>
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-[#30363d] my-6"></div>

          {/* Mandatory Credit Footer Line */}
          <div className="flex flex-col sm:flex-row items-center justify-between text-sm text-[#8b949e] gap-4">
            <p className="text-center sm:text-left text-xs">
              © {new Date().getFullYear()} Zikr &amp; Fikr. All rights reserved.
            </p>

            {/* MANDATORY CREDIT LINE REQUIREMENT */}
            <div className="text-center sm:text-right font-medium text-base">
              Made with <span className="text-red-500 animate-pulse inline-block mx-0.5">❤️</span> by{' '}
              <a
                href="https://ceimran.in"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-4 decoration-amber-500/60 hover:decoration-amber-300 transition-colors px-1"
                title="Visit Imran Ahmad's Website"
              >
                Imran Ahmad
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Ask Fatwa Modal */}
      <AskFatwaModal
        isOpen={fatwaModalOpen}
        onClose={() => setFatwaModalOpen(false)}
      />
    </>
  );
}
