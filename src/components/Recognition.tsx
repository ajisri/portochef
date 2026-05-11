'use client';

import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

/**
 * @component Recognition
 * @description 
 * A high-fidelity recognition section inspired by Oliver Larose's minimalist depth.
 * Features:
 * - Liquid typographic reveals for the main achievement title.
 * - Massive background typography with scroll-linked parallax.
 * - Asymmetrical grid placement emphasizing white space and editorial hierarchy.
 */
export default function Recognition() {
  const containerRef = useRef<HTMLElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useGSAP(() => {
    if (!mounted) return;
    gsap.registerPlugin(ScrollTrigger);

    // 1. Massive Background Text Parallax (Atmospheric depth)
    gsap.fromTo('.recognition-bg-text',
      { y: 250, opacity: 0 },
      { 
        y: -150, 
        opacity: 0.02, 
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        }
      }
    );

    // 2. Liquid Title Reveal - Editorial snap
    gsap.fromTo('.recognition-title-line',
      { yPercent: 115, skewY: 12, rotationZ: 3 },
      { 
        yPercent: 0, 
        skewY: 0, 
        rotationZ: 0,
        duration: 2.2, 
        ease: 'expo.out',
        stagger: 0.18,
        scrollTrigger: {
          trigger: '.recognition-title',
          start: 'top 85%',
        }
      }
    );

    // 3. Narrative Stagger Reveal
    gsap.fromTo('.recognition-stagger',
      { opacity: 0, y: 40 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 1.8, 
        ease: 'power3.out',
        stagger: 0.15,
        scrollTrigger: {
          trigger: '.recognition-title',
          start: 'top 80%',
        }
      }
    );

  }, { scope: containerRef, dependencies: [mounted] });

  return (
    <section 
      ref={containerRef}
      className="relative w-full min-h-[120vh] bg-[#FFFFFF] text-[#111111] overflow-hidden flex flex-col justify-center py-32 md:py-64 px-6 md:px-16"
      aria-label="Global Recognition"
    >
      {/* Texture Overlay */}
      <div className="grain-overlay opacity-[0.015]" aria-hidden="true"></div>

      {/* Atmospheric Background Layer */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
         <span className="recognition-bg-text text-[38vw] font-sans font-black text-[#111111] tracking-tighter uppercase leading-none select-none opacity-0">
            Forbes
         </span>
      </div>

      {/* Structural Swiss Grid Guide */}
      <div className="absolute top-0 left-[8.333333%] h-full border-l border-[#111111]/10 z-0 hidden md:block"></div>

      <div className="max-w-[1400px] mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-0 relative z-10 items-center">
        
        {/* COLUMN 1: Editorial Narrative (Asymmetrical Placement) */}
        <div className="md:col-start-2 md:col-span-7 flex flex-col gap-12 md:gap-24">
          <div className="flex flex-col gap-6">
            <span className="recognition-stagger text-[10px] md:text-[11px] tracking-[0.4em] uppercase text-[#737373] font-bold block">
              Global Recognition / 30 Under 30
            </span>
            <h2 className="recognition-title text-[13vw] md:text-[7.5vw] font-serif leading-[0.85] tracking-tighter text-[#111111] md:-ml-3">
              <div className="overflow-hidden pb-4"><div className="recognition-title-line">Global Class</div></div>
              <div className="overflow-hidden pb-4"><div className="recognition-title-line">of Achievement.</div></div>
            </h2>
          </div>

          <div className="recognition-stagger flex flex-col gap-12 md:gap-20">
            <p className="text-[18px] md:text-[24px] text-[#444444] leading-tight max-w-[550px] font-medium tracking-tight">
              "Menghargai inovasi, kepemimpinan, dan dampak sosial yang dibawa melalui transformasi industri kuliner di kawasan Asia Pasifik."
            </p>

            <div className="flex flex-col md:flex-row items-start md:items-center gap-10 md:gap-24">
               <div className="flex flex-col gap-3">
                  <span className="text-[10px] tracking-[0.3em] uppercase text-[#111111] font-bold opacity-40">Category</span>
                  <span className="text-[15px] font-semibold text-[#111111]">The Arts (Gastronomy)</span>
               </div>
               <div className="flex flex-col gap-3">
                  <span className="text-[10px] tracking-[0.3em] uppercase text-[#111111] font-bold opacity-40">Class</span>
                  <span className="text-[15px] font-semibold text-[#111111]">Asia — 2024</span>
               </div>
               <div className="flex flex-col gap-3">
                  <span className="text-[10px] tracking-[0.3em] uppercase text-[#111111] font-bold opacity-40">Status</span>
                  <span className="text-[15px] font-semibold text-[#111111]">Honoree</span>
               </div>
            </div>
          </div>
        </div>

        {/* COLUMN 2: Large Negative Space for visual balance */}
        <div className="hidden md:block md:col-start-10 md:col-span-3"></div>

      </div>

      {/* Decorative Structural Point (Larose Minimalist Flair) */}
      <div className="absolute bottom-24 right-16 flex flex-col items-end gap-4 opacity-20">
         <div className="w-12 h-[1px] bg-[#111111]"></div>
         <span className="text-[9px] tracking-[0.4em] uppercase font-bold vertical-text">Authority</span>
      </div>
    </section>
  );
}
