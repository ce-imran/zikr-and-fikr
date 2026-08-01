import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle, MessageCircle } from 'lucide-react';
import AskFatwaModal from './AskFatwaModal';

export default function FloatingActionGroup() {
  // Mobile 2-click state: null | 'whatsapp' | 'fatwa'
  const [expandedButton, setExpandedButton] = useState(null);
  const [fatwaModalOpen, setFatwaModalOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setExpandedButton(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Action triggers
  const handleOpenWhatsAppChannel = () => {
    window.open('https://whatsapp.com/channel/0029Vb5BVksFi8xVcvLmiL33', '_blank');
  };

  const handleOpenFatwaModal = () => {
    setFatwaModalOpen(true);
  };

  // Mobile WhatsApp button 2-click handler
  const handleMobileWhatsAppClick = (e) => {
    e.stopPropagation();
    if (expandedButton === 'whatsapp') {
      // Click 2: Trigger action
      setExpandedButton(null);
      handleOpenWhatsAppChannel();
    } else {
      // Click 1: Expand leftward to reveal text
      setExpandedButton('whatsapp');
    }
  };

  // Mobile Fatwa button 2-click handler
  const handleMobileFatwaClick = (e) => {
    e.stopPropagation();
    if (expandedButton === 'fatwa') {
      // Click 2: Trigger action
      setExpandedButton(null);
      handleOpenFatwaModal();
    } else {
      // Click 1: Expand leftward to reveal text
      setExpandedButton('fatwa');
    }
  };

  return (
    <>
      {/* 1. PC / DESKTOP LAYOUT (`hidden md:flex`) — Two separate, fully expanded buttons */}
      <div className="hidden md:flex flex-col items-end space-y-3 fixed right-8 bottom-8 z-50 pointer-events-auto">
        {/* WhatsApp Channel Button */}
        <button
          onClick={handleOpenWhatsAppChannel}
          className="group flex items-center space-x-2.5 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-3 rounded-full shadow-xl hover:scale-105 transition-all duration-200 border border-emerald-400/40 font-bold text-xs"
          title="Join Dhikr & Fikr WhatsApp Channel"
        >
          <MessageCircle className="w-5 h-5 fill-white group-hover:rotate-12 transition-transform" />
          <span>WhatsApp Channel</span>
        </button>

        {/* Ask Fatwa Button */}
        <button
          onClick={handleOpenFatwaModal}
          className="group flex items-center space-x-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 px-4 py-3 rounded-full shadow-xl hover:shadow-[0_0_20px_rgba(245,158,11,0.6)] hover:scale-110 hover:-translate-y-1 transition-all duration-300 border border-amber-400/60 font-bold text-xs animate-pulse-gold"
          title="Ask a Fatwa / Islamic Question"
        >
          <HelpCircle className="w-5 h-5 text-stone-950" />
          <span>Ask Fatwa</span>
        </button>
      </div>

      {/* 2. MOBILE LAYOUT (`md:hidden`) — Leftward expansion using flex-row-reverse so icon stays right and text grows left */}
      <div
        ref={containerRef}
        className="md:hidden fixed right-4 bottom-4 z-50 flex flex-col items-end space-y-2.5 pointer-events-auto max-w-[calc(100vw-2rem)]"
      >
        {/* Mobile WhatsApp Button */}
        <button
          onClick={handleMobileWhatsAppClick}
          className={`flex flex-row-reverse items-center bg-emerald-600 text-white rounded-full shadow-xl border border-emerald-400/40 text-xs font-bold transition-all duration-300 ${
            expandedButton === 'whatsapp' ? 'pl-4 pr-3 py-2.5' : 'p-3'
          }`}
          title="WhatsApp Channel"
        >
          <MessageCircle className="w-5 h-5 fill-white shrink-0" />
          {expandedButton === 'whatsapp' && (
            <span className="mr-2.5 whitespace-nowrap animate-in fade-in slide-in-from-right-2 duration-200">
              Join WhatsApp Channel
            </span>
          )}
        </button>

        {/* Mobile Fatwa Button */}
        <button
          onClick={handleMobileFatwaClick}
          className={`flex flex-row-reverse items-center bg-amber-500 text-stone-950 rounded-full shadow-xl border border-amber-400/60 text-xs font-bold transition-all duration-300 ${
            expandedButton === 'fatwa' ? 'pl-4 pr-3 py-2.5' : 'p-3'
          }`}
          title="Ask Fatwa"
        >
          <HelpCircle className="w-5 h-5 text-stone-950 shrink-0" />
          {expandedButton === 'fatwa' && (
            <span className="ml-0 mr-2.5 whitespace-nowrap animate-in fade-in slide-in-from-right-2 duration-200">
              Ask Fatwa / Question
            </span>
          )}
        </button>
      </div>

      {/* Ask Fatwa Modal */}
      <AskFatwaModal
        isOpen={fatwaModalOpen}
        onClose={() => setFatwaModalOpen(false)}
      />
    </>
  );
}
