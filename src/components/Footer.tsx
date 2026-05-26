'use client';

import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useApp } from '../context/AppContext';
import Magnetic from './Magnetic';

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

  let language: 'id' | 'en' = 'id';
  try {
    const appCtx = useApp();
    language = appCtx.language;
  } catch (e) {
    // Ignore error
  }

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



  }, { scope: footerRef, dependencies: [mounted] });

  return (
    <footer
      id="contact"
      ref={footerRef}
      className="relative w-full py-24 md:py-48 bg-background text-foreground transition-colors duration-500 overflow-hidden px-6 md:px-16"
      aria-label="Site Footer"
    >
      <div className="grain-overlay opacity-[0.015]" aria-hidden="true"></div>


      <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-y-20 md:gap-y-0 relative z-10">

        {/* Brand & Mission Column */}
        <div className="md:col-start-2 md:col-span-5 flex flex-col gap-10 footer-reveal">
          <h2 className="text-[12vw] md:text-[6vw] font-serif leading-none tracking-tighter text-foreground transition-colors duration-500 md:-ml-2">
            PortoChef.
          </h2>
          <p className="text-[17px] md:text-[20px] text-foreground/70 transition-colors duration-500 leading-relaxed max-w-[400px] font-medium">
            {language === 'id'
              ? 'Membangun ekosistem kuliner Nusantara melalui inovasi, dedikasi, dan presisi yang tak kenal kompromi.'
              : 'Building the archipelago culinary ecosystem through innovation, dedication, and uncompromising precision.'}
          </p>

          <div className="flex flex-col gap-2 mt-4">
            <span className="text-[10px] tracking-[0.4em] uppercase text-foreground/30 transition-colors duration-500 font-bold">Email</span>
            <a href="mailto:hello@portochef.com" className="text-[20px] md:text-[24px] font-medium border-b border-foreground/10 pb-2 w-max transition-colors hover:border-foreground">
              hello@portochef.com
            </a>
          </div>
        </div>

        {/* Asymmetrical Navigation Grid */}
        <div className="md:col-start-8 md:col-span-2 flex flex-col gap-12 footer-reveal">
          <span className="text-[10px] tracking-[0.4em] uppercase text-foreground/30 transition-colors duration-500 font-bold">{language === 'id' ? 'Navigasi' : 'Navigation'}</span>
          <ul className="flex flex-col gap-5">
            {(language === 'id' ? ['Tentang', 'Produk', 'Pencapaian', 'Kontak'] : ['About', 'Product', 'Achievements', 'Contact']).map((item, idx) => {
              const ids = ['about', 'product', 'achievements', 'contact'];
              return (
                <li key={item}>
                  <Magnetic strength={0.15}>
                    <a
                      href={`#${ids[idx]}`}
                      onClick={(e) => {
                        e.preventDefault();
                        const lenis = (window as any).lenis;
                        if (lenis) {
                          lenis.scrollTo(`#${ids[idx]}`);
                        } else {
                          document.getElementById(ids[idx])?.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      className="group flex items-center gap-3 text-[18px] md:text-[20px] font-medium text-foreground transition-colors hover:text-ink-theme w-max"
                    >
                      <span className="h-[1.5px] w-0 bg-foreground/20 transition-all duration-500 group-hover:w-6"></span>
                      {item}
                    </a>
                  </Magnetic>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Social Ecosystem Links */}
        <div className="md:col-start-10 md:col-span-2 flex flex-col gap-12 footer-reveal">
          <span className="text-[10px] tracking-[0.4em] uppercase text-foreground/30 transition-colors duration-500 font-bold">Ecosystem</span>
          <ul className="flex flex-col gap-5">
            {['Instagram', 'LinkedIn', 'Twitter', 'YouTube'].map((item) => (
              <li key={item}>
                <Magnetic strength={0.15}>
                  <a
                    href={`https://${item.toLowerCase()}.com/portochef`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 text-[18px] md:text-[20px] font-medium text-foreground transition-colors hover:text-ink-theme w-max"
                  >
                    <span className="h-[1.5px] w-0 bg-foreground/20 transition-all duration-500 group-hover:w-6"></span>
                    {item}
                  </a>
                </Magnetic>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* Meta Footer Bar */}
      <div className="max-w-[1400px] mx-auto mt-32 md:mt-64 pt-16 border-t border-foreground/5 flex flex-col md:flex-row justify-between items-center gap-12 relative z-10 footer-reveal transition-colors duration-500">
        <div className="flex flex-col gap-3 items-center md:items-start order-2 md:order-1">
          <p className="text-[10px] md:text-[11px] tracking-[0.2em] uppercase font-bold text-foreground/40 transition-colors duration-500">
            &copy; {currentYear} PortoChef — {language === 'id' ? 'Dibuat dengan Ketelitian Teknis' : 'Crafted with Technical Precision'}
          </p>
          <p className="text-[10px] md:text-[11px] tracking-[0.2em] uppercase font-bold text-foreground/20 transition-colors duration-500">
            {language === 'id' ? 'Hak Cipta Dilindungi / Otoritas Kuliner Global' : 'All Rights Reserved / Global Culinary Authority'}
          </p>
        </div>

        {/* Back to Top Interactive Element */}
        <Magnetic strength={0.3}>
          <button
            onClick={() => {
              const lenis = (window as any).lenis;
              if (lenis) {
                lenis.scrollTo(0);
              } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="group flex items-center gap-6 text-[10px] md:text-[11px] tracking-[0.4em] uppercase font-black hover:text-ink-theme transition-all order-1 md:order-2"
          >
            {language === 'id' ? 'Kembali ke Atas' : 'Scroll to Top'}
            <div className="w-12 h-12 md:w-16 md:h-16 border border-foreground/10 rounded-full flex items-center justify-center group-hover:bg-foreground group-hover:text-background transition-all duration-700 ease-expo-out transform group-hover:scale-110">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="rotate-[-90deg]">
                <path d="M1 7H13M13 7L8 2M13 7L8 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </button>
        </Magnetic>
      </div>

      {/* Structural Anchor Point (Swiss Consistency) */}
      <div className="absolute top-0 left-[8.333333%] h-full border-l border-foreground/5 transition-colors duration-500 z-0 hidden md:block"></div>
    </footer>
  );
}
