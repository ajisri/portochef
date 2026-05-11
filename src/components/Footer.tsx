'use client';

import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

/**
 * @component Footer
 * @description 
 * High-fidelity footer inspired by Oliver Larose and MediaMonks editorial styles.
 * Features:
 * - Massive background display typography.
 * - Asymmetrical grid-based navigation.
 * - Magnetic interaction principles for social links and call-to-actions.
 * - Interactive "Back to Top" component.
 */
export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const [currentYear, setCurrentYear] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
    setMounted(true);
  }, []);

  useGSAP(() => {
    if (!mounted) return;
    gsap.registerPlugin(ScrollTrigger);

    // 1. Content Stagger Entrance
    gsap.fromTo('.footer-reveal',
      { y: 60, opacity: 0 },
      { 
        y: 0, 
        opacity: 1, 
        duration: 1.6, 
        ease: 'power4.out',
        stagger: 0.1,
        scrollTrigger: {
          trigger: footerRef.current,
          start: 'top 85%',
        }
      }
    );

    // 2. Background Text Parallax
    gsap.fromTo('.footer-bg-text',
      { y: 100 },
      { 
        y: -100, 
        ease: 'none',
        scrollTrigger: {
          trigger: footerRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        }
      }
    );

  }, { scope: footerRef, dependencies: [mounted] });

  return (
    <footer 
      ref={footerRef}
      className="relative w-full py-24 md:py-48 bg-[#FAFAFA] text-[#111111] overflow-hidden px-6 md:px-16"
      aria-label="Site Footer"
    >
      <div className="grain-overlay opacity-[0.015]" aria-hidden="true"></div>

      {/* Atmospheric Background Layer */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
         <span className="footer-bg-text text-[30vw] font-sans font-black text-[#111111]/[0.012] tracking-tighter uppercase leading-none select-none">
            Connect
         </span>
      </div>

      <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-y-20 md:gap-y-0 relative z-10">
        
        {/* Brand & Mission Column */}
        <div className="md:col-start-2 md:col-span-5 flex flex-col gap-10 footer-reveal">
           <h2 className="text-[12vw] md:text-[6vw] font-serif leading-none tracking-tighter text-[#111111] md:-ml-2">
              PortoChef.
           </h2>
           <p className="text-[17px] md:text-[20px] text-[#555555] leading-relaxed max-w-[400px] font-medium">
              Membangun ekosistem kuliner Nusantara melalui inovasi, dedikasi, dan presisi yang tak kenal kompromi.
           </p>
           
           <div className="flex flex-col gap-2 mt-4">
              <span className="text-[10px] tracking-[0.4em] uppercase text-[#111111]/30 font-bold">Email</span>
              <a href="mailto:hello@portochef.com" className="text-[20px] md:text-[24px] font-medium border-b border-[#111111]/10 pb-2 w-max transition-colors hover:border-[#111111]">
                 hello@portochef.com
              </a>
           </div>
        </div>

        {/* Asymmetrical Navigation Grid */}
        <div className="md:col-start-8 md:col-span-2 flex flex-col gap-12 footer-reveal">
           <span className="text-[10px] tracking-[0.4em] uppercase text-[#111111]/30 font-bold">Navigation</span>
           <ul className="flex flex-col gap-5">
              {['Tentang', 'Portofolio', 'Pencapaian', 'Kontak'].map((item) => (
                <li key={item}>
                  <a href="#" className="group flex items-center gap-3 text-[18px] md:text-[20px] font-medium text-[#111111] transition-colors hover:text-[#737373]">
                    <span className="h-[1.5px] w-0 bg-[#111111]/20 transition-all duration-500 group-hover:w-6"></span>
                    {item}
                  </a>
                </li>
              ))}
           </ul>
        </div>

        {/* Social Ecosystem Links */}
        <div className="md:col-start-10 md:col-span-2 flex flex-col gap-12 footer-reveal">
           <span className="text-[10px] tracking-[0.4em] uppercase text-[#111111]/30 font-bold">Ecosystem</span>
           <ul className="flex flex-col gap-5">
              {['Instagram', 'LinkedIn', 'Twitter', 'YouTube'].map((item) => (
                <li key={item}>
                  <a href="#" className="group flex items-center gap-3 text-[18px] md:text-[20px] font-medium text-[#111111] transition-colors hover:text-[#737373]">
                    <span className="h-[1.5px] w-0 bg-[#111111]/20 transition-all duration-500 group-hover:w-6"></span>
                    {item}
                  </a>
                </li>
              ))}
           </ul>
        </div>

      </div>

      {/* Meta Footer Bar */}
      <div className="max-w-[1400px] mx-auto mt-32 md:mt-64 pt-16 border-t border-[#111111]/5 flex flex-col md:flex-row justify-between items-center gap-12 relative z-10 footer-reveal">
        <div className="flex flex-col gap-3 items-center md:items-start order-2 md:order-1">
           <p className="text-[10px] md:text-[11px] tracking-[0.2em] uppercase font-bold text-[#111111]/40">
              &copy; {currentYear} PortoChef — Crafted with Technical Precision
           </p>
           <p className="text-[10px] md:text-[11px] tracking-[0.2em] uppercase font-bold text-[#111111]/20">
              All Rights Reserved / Global Culinary Authority
           </p>
        </div>
        
        {/* Back to Top Interactive Element */}
        <button 
           onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
           className="group flex items-center gap-6 text-[10px] md:text-[11px] tracking-[0.4em] uppercase font-black hover:text-[#737373] transition-all order-1 md:order-2"
        >
           Scroll to Top
           <div className="w-12 h-12 md:w-16 md:h-16 border border-[#111111]/10 rounded-full flex items-center justify-center group-hover:bg-[#111111] group-hover:text-white transition-all duration-700 ease-expo-out transform group-hover:scale-110">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="rotate-[-90deg]">
                 <path d="M1 7H13M13 7L8 2M13 7L8 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
           </div>
        </button>
      </div>

      {/* Structural Anchor Point (Swiss Consistency) */}
      <div className="absolute top-0 left-[8.333333%] h-full border-l border-[#111111]/5 z-0 hidden md:block"></div>
    </footer>
  );
}
