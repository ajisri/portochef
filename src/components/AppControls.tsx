'use client';

import React from 'react';
import { useApp } from '../context/AppContext';
import Magnetic from './Magnetic';

/**
 * @component AppControls
 * @description Floating controls for Theme and Language switching.
 * Designed with a minimal, premium aesthetic to match the portfolio.
 */
export default function AppControls() {
  const { theme, language, toggleTheme, setLanguage } = useApp();

  return (
    <div className="fixed top-6 right-6 md:top-12 md:right-16 z-[100] flex items-center gap-4">
      {/* Language Switcher */}
      <Magnetic strength={0.2}>
        <div className="flex items-center bg-[#FFFFFF]/80 dark:bg-[#111111]/80 backdrop-blur-md border border-[#E5E5E5] dark:border-[#333333] rounded-full px-4 py-2 gap-3 shadow-sm transition-all hover:shadow-md cursor-pointer">
          <button 
            onClick={() => setLanguage('id')}
            className={`text-[10px] tracking-[0.2em] font-bold uppercase transition-colors ${language === 'id' ? 'text-[#111111] dark:text-[#FAFAFA]' : 'text-[#737373] dark:text-[#A3A3A3] hover:text-[#111111] dark:hover:text-[#FAFAFA]'}`}
          >
            ID
          </button>
          <div className="w-[1px] h-3 bg-[#E5E5E5] dark:bg-[#333333]"></div>
          <button 
            onClick={() => setLanguage('en')}
            className={`text-[10px] tracking-[0.2em] font-bold uppercase transition-colors ${language === 'en' ? 'text-[#111111] dark:text-[#FAFAFA]' : 'text-[#737373] dark:text-[#A3A3A3] hover:text-[#111111] dark:hover:text-[#FAFAFA]'}`}
          >
            EN
          </button>
        </div>
      </Magnetic>

      {/* Theme Switcher */}
      <Magnetic strength={0.3}>
        <button 
          onClick={toggleTheme}
          className="flex items-center justify-center w-10 h-10 bg-[#FFFFFF]/80 dark:bg-[#111111]/80 backdrop-blur-md border border-[#E5E5E5] dark:border-[#333333] rounded-full shadow-sm transition-all hover:shadow-md text-[#111111] dark:text-[#FAFAFA]"
          aria-label="Toggle Theme"
        >
          {theme === 'light' ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
          )}
        </button>
      </Magnetic>
    </div>
  );
}
