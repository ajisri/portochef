'use client';

import React, { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useApp } from '../context/AppContext';
import Magnetic from './Magnetic';

const contentMap = {
  id: {
    precision: 'Technique',
    label: 'Fundamental / 2026',
    heading1: 'Sederhana,',
    heading2: 'Terstruktur,',
    heading3: 'Konsisten.',
    p1Label: '01 / The Origin',
    p1Desc: (
      <>
        Surabaya—Sydney.<br />
        Ditempa oleh realitas, dipahat oleh kedisiplinan sejak usia 14 tahun.
      </>
    ),
    p2Label: '02 / The Process',
    p2Desc: 'Memulai dari bawah di dapur komersial. Mempelajari alur kerja, efisiensi, dan pentingnya menjaga konsistensi setiap hari.',
    p3Label: '03 / The Ethos',
    p3Desc: 'Makanan yang baik tidak membutuhkan narasi berlebihan. Biarkan kualitas bahan dan eksekusi yang berbicara.',
  },
  en: {
    precision: 'Technique',
    label: 'Fundamental / 2026',
    heading1: 'Simple,',
    heading2: 'Structured,',
    heading3: 'Consistent.',
    p1Label: '01 / The Origin',
    p1Desc: (
      <>
        Surabaya—Sydney.<br />
        Forged by reality, sculpted by discipline since the age of 14.
      </>
    ),
    p2Label: '02 / The Process',
    p2Desc: 'Starting from the bottom in commercial kitchens. Understanding workflow, efficiency, and the importance of daily consistency.',
    p3Label: '03 / The Ethos',
    p3Desc: 'Good food requires no excessive narrative. Let the quality of ingredients and clean execution speak for themselves.',
  }
};

/**
 * @component HeroSection
 * @description 
 * Advanced Hero Section with Oliver Larose's signature asymmetrical layout.
 * Features:
 * - Dynamic Background Display Typography.
 * - Scattered grid-based element positioning for high-end editorial feel.
 * - Deep layered parallax and magnetic interactions.
 * - Liquid-style typographic entrance.
 */
export default function HeroSection() {
  const containerRef = useRef<HTMLElement>(null);
  const [mounted, setMounted] = useState(false);
  
  let language: 'id' | 'en' = 'id';
  try {
    const appCtx = useApp();
    language = appCtx.language;
  } catch (e) {
    // Ignore error
  }
  const t = contentMap[language];
  
  // High-fidelity interaction refs
  const headingRef = useRef<HTMLDivElement>(null);
  const imageInnerRef = useRef<HTMLDivElement>(null);
  const bgTextRef = useRef<HTMLDivElement>(null);
  const magneticDotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useGSAP(() => {
    if (!mounted) return;

    // 1. Grid Entrance
    gsap.fromTo('.vertical-grid-line',
      { scaleY: 0, transformOrigin: 'top' },
      { scaleY: 1, duration: 2.8, ease: 'expo.inOut', stagger: 0.1, delay: 2.5 }
    );

    // 2. Background Text Reveal
    gsap.fromTo('.bg-display-text',
      { opacity: 0, y: 100 },
      { opacity: 1, y: 0, duration: 2.5, ease: 'power3.out', delay: 3.0 }
    );

    // 3. Typographic Reveal - Oliver Larose Liquid entrance
    gsap.fromTo('.main-heading-line',
      { y: '125%', skewY: 10, rotationZ: 3, opacity: 0 },
      { y: '0%', skewY: 0, rotationZ: 0, opacity: 1, duration: 2, ease: 'expo.out', delay: 3.2, stagger: 0.15 }
    );

    // 4. Bio Principles - Scattered reveal
    gsap.fromTo('.bio-principle',
      { opacity: 0, y: 60, rotationX: -20 },
      { opacity: 1, y: 0, rotationX: 0, duration: 1.8, ease: 'power4.out', stagger: 0.25, delay: 3.6 }
    );

    // 5. Image Mask & Inner Content Reveal
    gsap.fromTo('.hero-image-mask',
      { clipPath: 'inset(100% 0% 0% 0%)' },
      { clipPath: 'inset(0% 0% 0% 0%)', duration: 2.6, ease: 'expo.inOut', delay: 3.0 }
    );
    
    gsap.fromTo('.hero-image-inner',
      { scale: 1.4, yPercent: 20 },
      { scale: 1, yPercent: 0, duration: 3, ease: 'expo.inOut', delay: 3.0 }
    );

    gsap.fromTo('.hero-image-inner',
      { filter: 'blur(24px)' },
      { filter: 'blur(0px)', duration: 1.5, ease: 'power2.out', delay: 5.2 }
    );

  }, { scope: containerRef, dependencies: [mounted] });

  // Deep Interaction Layer: Parallax & Magnetic Tracking
  useEffect(() => {
    if (!mounted) return;

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      const nx = (clientX / innerWidth) * 2 - 1;
      const ny = (clientY / innerHeight) * 2 - 1;

      // Parallax: Background Text (Moves very slowly for depth)
      if (bgTextRef.current) {
        gsap.to(bgTextRef.current, {
          x: nx * -40,
          y: ny * -20,
          duration: 2,
          ease: 'power2.out'
        });
      }

      // Parallax: Primary Heading
      if (headingRef.current) {
        gsap.to(headingRef.current, {
          x: nx * -25,
          y: ny * -15,
          duration: 1.6,
          ease: 'power3.out'
        });
      }

      // Parallax: Image Content
      if (imageInnerRef.current) {
        gsap.to(imageInnerRef.current, {
          x: nx * 40,
          y: ny * 30,
          rotationY: nx * 4,
          duration: 2,
          ease: 'power3.out'
        });
      }

      // Magnetic Dot
      if (magneticDotRef.current) {
        const dot = magneticDotRef.current;
        const rect = dot.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const dx = clientX - centerX;
        const dy = clientY - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 150) {
          gsap.to(dot, {
            x: dx * 0.5,
            y: dy * 0.5,
            scale: 2.5,
            duration: 0.6,
            ease: 'power2.out'
          });
        } else {
          gsap.to(dot, {
            x: 0,
            y: 0,
            scale: 1,
            duration: 1.2,
            ease: 'elastic.out(1, 0.3)'
          });
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mounted]);

  return (
    <section
      id="hero"
      ref={containerRef}
      className="relative w-full min-h-screen bg-background text-foreground transition-colors duration-500 overflow-hidden antialiased flex flex-col pt-32 pb-24 md:pb-32 px-6 md:px-16"
      aria-label="Hero Introduction"
    >
      <div className="grain-overlay" aria-hidden="true"></div>

      {/* 
        Background Typography Layer (Larose Layout signature)
      */}
      <div 
        ref={bgTextRef} 
        className="bg-display-text absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none z-0"
      >
        <h2 className="text-[28vw] font-sans font-black text-foreground opacity-5 dark:opacity-[0.03] transition-colors duration-500 leading-none select-none tracking-tighter uppercase">
          {t.precision}
        </h2>
      </div>

      {/* 
        Swiss Precision Grid (Background structural layer)
      */}
      <div className="absolute inset-0 w-full h-full pointer-events-none px-6 md:px-16 flex z-0">
        {[8.333333, 25, 33.333333, 33.333333].map((width, i) => (
          <div 
            key={i} 
            className={`vertical-grid-line relative h-full border-l border-foreground/10 transition-colors duration-500 ${i === 3 ? 'border-r' : ''}`} 
            style={{ width: `${width}%` }}
          >
            {i === 0 && (
              <div 
                ref={magneticDotRef}
                className="hidden md:block absolute bottom-12 -left-[2.5px] w-[5px] h-[5px] bg-foreground transition-colors duration-500 z-50 pointer-events-auto cursor-crosshair" 
                aria-hidden="true"
              />
            )}
          </div>
        ))}
      </div>

      {/* 
        Scattered Layout Grid (Oliver Larose Aesthetic)
      */}
      <div className="w-full h-full grid grid-cols-1 md:grid-cols-12 gap-0 relative z-10 flex-grow">
        
        {/* HEADING: Positioned at Col 2, spans across */}
        <div className="md:col-start-2 md:col-span-5 flex flex-col justify-start pt-12 md:pt-20 z-20">
          <div className="overflow-hidden mb-8 md:mb-12">
            <span className="overline-reveal block text-[10px] md:text-[11px] tracking-[0.4em] uppercase text-ink-theme transition-colors duration-500 font-semibold">
              {t.label}
            </span>
          </div>
          
          <div ref={headingRef}>
            <h1 className="font-sans font-medium text-foreground transition-colors duration-500 leading-[0.85] tracking-[-0.04em] text-[13vw] md:text-[6vw] md:-ml-[0.05em]">
              <div className="overflow-hidden pb-3 w-max"><div className="main-heading-line pr-6 origin-bottom-left">{t.heading1}</div></div>
              <div className="overflow-hidden pb-3 w-max"><div className="main-heading-line pr-6 origin-bottom-left">{t.heading2}</div></div>
              <div className="overflow-hidden pb-3 w-max"><div className="main-heading-line pr-6 origin-bottom-left">{t.heading3}</div></div>
            </h1>
          </div>
          
          {/* Principle 01: Anchored to heading */}
          <article className="bio-principle mt-12 md:mt-24 flex flex-col gap-3 max-w-[280px]">
            <h3 className="text-[10px] tracking-[0.2em] uppercase text-foreground transition-colors duration-500 font-bold">{t.p1Label}</h3>
            <p className="text-[14px] text-foreground/70 transition-colors duration-500 leading-relaxed font-medium">
              {t.p1Desc}
            </p>
          </article>
        </div>

        {/* IMAGE: Floating on the right, asymmetrical vertical alignment */}
        <div className="md:col-start-8 md:col-span-5 relative flex flex-col justify-center items-end h-full pt-24 md:pt-0">
          <div className="w-full max-w-[450px]">
            <figure className="hero-image-mask w-full aspect-[4/5] relative grayscale hover:grayscale-0 transition-all duration-[1.5s] ease-[cubic-bezier(0.19,1,0.22,1)] overflow-hidden bg-foreground/5 shadow-2xl">
              <div ref={imageInnerRef} className="hero-image-inner absolute inset-0 w-full h-full">
                <Image
                  src="/chef_portrait.png"
                  alt="Chef Arnold Poernomo"
                  fill
                  priority
                  className="object-cover scale-[1.05]"
                  sizes="(max-width: 768px) 100vw, 40vw"
                />
              </div>
            </figure>
          </div>

          {/* Principle 02: Floating near image */}
          <article className="bio-principle mt-12 md:mt-16 mr-auto md:mr-12 flex flex-col gap-3 max-w-[280px]">
            <h3 className="text-[10px] tracking-[0.2em] uppercase text-foreground transition-colors duration-500 font-bold">{t.p2Label}</h3>
            <p className="text-[14px] text-foreground/70 transition-colors duration-500 leading-relaxed font-medium">
              {t.p2Desc}
            </p>
          </article>
        </div>

        {/* Principle 03: Lone element on bottom left grid intersection */}
        <div className="md:col-start-2 md:col-span-3 flex items-end pb-12 md:pb-0">
          <article className="bio-principle flex flex-col gap-3 max-w-[280px]">
            <h3 className="text-[10px] tracking-[0.2em] uppercase text-foreground transition-colors duration-500 font-bold">{t.p3Label}</h3>
            <p className="text-[14px] text-foreground/70 transition-colors duration-500 leading-relaxed font-medium">
              {t.p3Desc}
            </p>
          </article>
        </div>

        {/* Scroll Indicator (Larose Style) */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-50">
          <Magnetic strength={0.3}>
            <a 
              href="#about"
              onClick={(e) => {
                e.preventDefault();
                const lenis = (window as any).lenis;
                if (lenis) {
                  lenis.scrollTo('#about');
                } else {
                  document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="flex flex-col items-center gap-4 group cursor-pointer"
            >
              <span className="text-[9px] tracking-[0.4em] uppercase font-bold text-foreground transition-colors duration-500 opacity-40 group-hover:opacity-100 block">
                {language === 'id' ? 'Eksplorasi' : 'Explore'}
              </span>
              <div className="w-[1px] h-12 bg-foreground/20 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-foreground scale-y-0 group-hover:scale-y-100 origin-top transition-transform duration-700 ease-[cubic-bezier(0.19,1,0.22,1)]"></div>
              </div>
            </a>
          </Magnetic>
        </div>

      </div>
    </section>
  );
}
