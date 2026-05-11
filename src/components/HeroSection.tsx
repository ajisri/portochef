'use client';

import React, { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

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
      { scaleY: 1, duration: 2.8, ease: 'expo.inOut', stagger: 0.1 }
    );

    // 2. Background Text Reveal
    gsap.fromTo('.bg-display-text',
      { opacity: 0, y: 100 },
      { opacity: 1, y: 0, duration: 2.5, ease: 'power3.out', delay: 0.5 }
    );

    // 3. Typographic Reveal - Oliver Larose Liquid entrance
    gsap.fromTo('.main-heading-line',
      { y: '125%', skewY: 10, rotationZ: 3, opacity: 0 },
      { y: '0%', skewY: 0, rotationZ: 0, opacity: 1, duration: 2, ease: 'expo.out', delay: 1.2, stagger: 0.15 }
    );

    // 4. Bio Principles - Scattered reveal
    gsap.fromTo('.bio-principle',
      { opacity: 0, y: 60, rotationX: -20 },
      { opacity: 1, y: 0, rotationX: 0, duration: 1.8, ease: 'power4.out', stagger: 0.25, delay: 1.6 }
    );

    // 5. Image Mask & Inner Content Reveal
    gsap.fromTo('.hero-image-mask',
      { clipPath: 'inset(100% 0% 0% 0%)' },
      { clipPath: 'inset(0% 0% 0% 0%)', duration: 2.6, ease: 'expo.inOut', delay: 0.8 }
    );
    
    gsap.fromTo('.hero-image-inner',
      { scale: 1.4, yPercent: 20 },
      { scale: 1, yPercent: 0, duration: 3, ease: 'expo.inOut', delay: 0.8 }
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
      ref={containerRef}
      className="relative w-full min-h-screen bg-[#FDFDFD] text-[#111111] overflow-hidden antialiased flex flex-col pt-32 pb-24 md:pb-32 px-6 md:px-16"
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
        <h2 className="text-[28vw] font-sans font-black text-[#111111]/[0.015] leading-none select-none tracking-tighter uppercase">
          Precision
        </h2>
      </div>

      {/* 
        Swiss Precision Grid (Background structural layer)
      */}
      <div className="absolute inset-0 w-full h-full pointer-events-none px-6 md:px-16 flex z-0">
        {[8.333333, 25, 33.333333, 33.333333].map((width, i) => (
          <div 
            key={i} 
            className={`vertical-grid-line relative h-full border-l border-[#111111]/10 ${i === 3 ? 'border-r' : ''}`} 
            style={{ width: `${width}%` }}
          >
            {i === 0 && (
              <div 
                ref={magneticDotRef}
                className="hidden md:block absolute bottom-12 -left-[2.5px] w-[5px] h-[5px] bg-[#111111] z-50 pointer-events-auto cursor-crosshair" 
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
            <span className="overline-reveal block text-[10px] md:text-[11px] tracking-[0.4em] uppercase text-[#737373] font-semibold">
              Fundamental / 2026
            </span>
          </div>
          
          <div ref={headingRef}>
            <h1 className="font-sans font-medium text-[#111111] leading-[0.85] tracking-[-0.04em] text-[13vw] md:text-[6vw] md:-ml-[0.05em]">
              <div className="overflow-hidden pb-3 w-max"><div className="main-heading-line pr-6 origin-bottom-left">Presisi</div></div>
              <div className="overflow-hidden pb-3 w-max"><div className="main-heading-line pr-6 origin-bottom-left">Untuk</div></div>
              <div className="overflow-hidden pb-3 w-max"><div className="main-heading-line pr-6 origin-bottom-left">Mahakarya.</div></div>
            </h1>
          </div>
          
          {/* Principle 01: Anchored to heading */}
          <article className="bio-principle mt-12 md:mt-24 flex flex-col gap-3 max-w-[280px]">
            <h3 className="text-[10px] tracking-[0.2em] uppercase text-[#111111] font-bold">01 / The Origin</h3>
            <p className="text-[14px] text-[#555555] leading-relaxed font-medium">
              Surabaya—Sydney. Ditempa oleh realitas, dipahat oleh kedisiplinan sejak usia 14 tahun.
            </p>
          </article>
        </div>

        {/* IMAGE: Floating on the right, asymmetrical vertical alignment */}
        <div className="md:col-start-8 md:col-span-5 relative flex flex-col justify-center items-end h-full pt-24 md:pt-0">
          <div className="w-full max-w-[450px]">
            <figure className="hero-image-mask w-full aspect-[4/5] relative grayscale hover:grayscale-0 transition-all duration-[1.5s] ease-[cubic-bezier(0.19,1,0.22,1)] overflow-hidden bg-[#EAEAEA] shadow-2xl">
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
            <h3 className="text-[10px] tracking-[0.2em] uppercase text-[#111111] font-bold">02 / The Grit</h3>
            <p className="text-[14px] text-[#555555] leading-relaxed font-medium">
              Insting yang diasah dari dasar paling dalam, melalui ribuan jam sebelum berdiri di puncak dapur.
            </p>
          </article>
        </div>

        {/* Principle 03: Lone element on bottom left grid intersection */}
        <div className="md:col-start-2 md:col-span-3 flex items-end pb-12 md:pb-0">
          <article className="bio-principle flex flex-col gap-3 max-w-[280px]">
            <h3 className="text-[10px] tracking-[0.2em] uppercase text-[#111111] font-bold">03 / The Ethos</h3>
            <p className="text-[14px] text-[#555555] leading-relaxed font-medium">
              Respect the ingredients. The technique. The forbearance.
            </p>
          </article>
        </div>

      </div>
    </section>
  );
}
