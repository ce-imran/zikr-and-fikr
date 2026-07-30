import React, { useState, useRef, useEffect } from 'react';
import { Clock } from 'lucide-react';

export default function FloatingLeftActionGroup() {
  const [expandedButton, setExpandedButton] = useState(null);
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

  const handleOpenQaza = () => {
    window.location.href = '/qaza-tracker';
  };

  const handleMobileClick = (e) => {
    e.stopPropagation();
    if (expandedButton === 'qaza') {
      setExpandedButton(null);
      handleOpenQaza();
    } else {
      setExpandedButton('qaza');
    }
  };

  return (
    <>
      {/* PC / DESKTOP LAYOUT - Left fixed button */}
      <div className="hidden md:flex flex-col items-start space-y-3 fixed left-8 bottom-8 z-50 pointer-events-auto">
        <button
          onClick={handleOpenQaza}
          className="group flex items-center space-x-2.5 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-3 rounded-full shadow-xl hover:scale-105 transition-all duration-200 border border-emerald-400/40 font-bold text-xs"
          title="Qaza Namaz Tracker"
        >
          <Clock className="w-5 h-5 text-white group-hover:-rotate-12 transition-transform" />
          <span>Qaza Namaz Tracker</span>
        </button>
      </div>

      {/* MOBILE LAYOUT - Expands rightward from bottom left */}
      <div
        ref={containerRef}
        className="md:hidden fixed left-4 bottom-4 z-50 flex flex-col items-start pointer-events-auto max-w-[calc(100vw-2rem)]"
      >
        <button
          onClick={handleMobileClick}
          className={`flex flex-row items-center bg-emerald-600 text-white rounded-full shadow-xl border border-emerald-400/40 text-xs font-bold transition-all duration-300 ${
            expandedButton === 'qaza' ? 'pr-4 pl-3 py-2.5' : 'p-3'
          }`}
          title="Qaza Namaz Tracker"
        >
          <Clock className="w-5 h-5 text-white shrink-0" />
          {expandedButton === 'qaza' && (
            <span className="ml-2.5 whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-200">
              Qaza Tracker
            </span>
          )}
        </button>
      </div>
    </>
  );
}
