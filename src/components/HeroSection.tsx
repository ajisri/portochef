'use client';

import React, { useRef, useEffect, useState, useMemo } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useApp } from '../context/AppContext';
import Magnetic from './Magnetic';

// Lazy-load R3F components to avoid SSR issues
import dynamic from 'next/dynamic';
const HeroCanvas = dynamic(() => import('./landing/HeroCanvas'), { ssr: false });
const ImageRipple = dynamic(() => import('./landing/ImageRipple'), { ssr: false });

const contentMap = {
  id: {
    label: 'Forbes 30 Under 30 Asia · Gastronomi · 2017 · Surabaya–Sydney',
    heading1: 'Dari satu dapur di Surabaya —',
    heading2: 'ke ekosistem kuliner yang bisa',
    heading3: 'direplikasi ribuan kali.',
    p1Label: 'Dari Mana Semua Ini Dimulai',
    p1Desc: (
      <>
        Usia 14 tahun, saya berdiri untuk pertama kali di dapur profesional. Bukan sebagai pilihan — tapi sebagai keharusan.<br />
        Dua puluh tahun kemudian, realitas itulah yang membentuk cara saya membangun bisnis: presisi tanpa kompromi, sistem tanpa birokrasi.
      </>
    ),
    ctaJourney: 'Lihat Perjalanan',
    ctaCollaborate: 'Ajak Berkolaborasi',
    explore: 'Ikuti Perjalanannya',
  },
  en: {
    label: 'Forbes 30 Under 30 Asia · Gastronomy · 2017 · Surabaya–Sydney',
    heading1: 'From one kitchen in Surabaya —',
    heading2: 'to a culinary ecosystem that',
    heading3: 'can be replicated thousands of times.',
    p1Label: 'Where It All Began',
    p1Desc: (
      <>
        At 14, I stood in a professional kitchen for the first time. Not as a choice — but as a necessity.<br />
        Twenty years later, that very reality shapes how I build businesses: precision without compromise, systems without bureaucracy.
      </>
    ),
    ctaJourney: 'View Journey',
    ctaCollaborate: 'Collaborate',
    explore: 'Follow the Journey',
  }
};

/**
 * @component WaterRippleFilter
 * @description
 * Renders a hidden SVG <defs> containing the animated water ripple filter.
 * Controlled dynamically via JS so it stops animating when cursor stops.
 */
function WaterRippleFilter({ filterRef }: { filterRef: React.RefObject<SVGFEDisplacementMapElement | null> }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      style={{
        position: 'absolute',
        width: 0,
        height: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      <defs>
        <filter
          id="water-ripple"
          x="-30%"
          y="-30%"
          width="160%"
          height="160%"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="linearRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.012 0.009"
            numOctaves="4"
            seed="3"
            result="noise1"
          >
            <animate
              attributeName="baseFrequency"
              values="0.012 0.009; 0.020 0.015; 0.012 0.009"
              dur="8s"
              repeatCount="indefinite"
              calcMode="spline"
              keySplines="0.45 0.05 0.55 0.95; 0.45 0.05 0.55 0.95"
            />
          </feTurbulence>

          <feTurbulence
            type="turbulence"
            baseFrequency="0.035 0.025"
            numOctaves="2"
            seed="7"
            result="noise2"
          >
            <animate
              attributeName="baseFrequency"
              values="0.035 0.025; 0.055 0.040; 0.035 0.025"
              dur="5s"
              repeatCount="indefinite"
              calcMode="spline"
              keySplines="0.4 0.0 0.6 1.0; 0.4 0.0 0.6 1.0"
            />
          </feTurbulence>

          <feMerge result="combinedNoise">
            <feMergeNode in="noise1" />
            <feMergeNode in="noise2" />
          </feMerge>

          <feComposite
            in="combinedNoise"
            in2="combinedNoise"
            operator="arithmetic"
            k1="0"
            k2="0.7"
            k3="0.5"
            k4="0"
            result="displacementMap"
          />

          <feDisplacementMap
            ref={filterRef}
            in="SourceGraphic"
            in2="displacementMap"
            scale="0"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  );
}

/**
 * @component HeroSection
 */
export default function HeroSection() {
  const containerRef = useRef<HTMLElement>(null);
  const filterRef = useRef<SVGFEDisplacementMapElement>(null);
  const lastMoveMs = useRef(0);
  const currentScale = useRef(0);
  const [mounted, setMounted] = useState(false);

  let language: 'id' | 'en' = 'id';
  try {
    const appCtx = useApp();
    language = appCtx.language;
  } catch (e) {
    // Ignore error if context not available
  }
  const t = contentMap[language];

  // Interaction refs
  const headingRef = useRef<HTMLDivElement>(null);
  const imageInnerRef = useRef<HTMLDivElement>(null);
  const magneticDotRef = useRef<HTMLDivElement>(null);

  // Layout refs
  const bio1Ref = useRef<HTMLElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);

  const connectionRefs = useMemo(() => ([
    { id: 'heading', ref: headingRef },
    { id: 'bio1',    ref: bio1Ref },
    { id: 'scroll',  ref: scrollIndicatorRef },
    { id: 'cta',     ref: ctaRef },
  ]), []);

  useEffect(() => { setMounted(true); }, []);

  // -------------------------------------------------------------------------
  // GSAP entrance + floating animations (GPU Accelerated)
  // -------------------------------------------------------------------------
  useGSAP(() => {
    if (!mounted) return;

    // We use a timeline to safely mount the SVG filter ONLY after animation promise completes
    // to prevent main-thread layout thrashing.
    const tl = gsap.timeline();

    // Grid lines entrance
    tl.fromTo('.vertical-grid-line',
      { scaleY: 0, transformOrigin: 'top' },
      { scaleY: 1, duration: 2.8, ease: 'expo.inOut', stagger: 0.1 },
      2.5
    );

    // Heading liquid entrance
    tl.fromTo('.main-heading-line',
      { y: '125%', opacity: 0 },
      { y: '0%', opacity: 1, duration: 2, ease: 'expo.out', stagger: 0.15 },
      3.2
    );

    // Bio principle reveal
    tl.fromTo('.bio-principle',
      { opacity: 0, y: 60 },
      { opacity: 1, y: 0, duration: 1.8, ease: 'power4.out' },
      3.6
    );

    // Primary CTA reveal
    tl.fromTo('.hero-cta',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1.5, ease: 'power3.out' },
      3.8
    );

    // Image mask reveal (using clipPath briefly, then cleared)
    tl.fromTo('.hero-image-mask',
      { clipPath: 'inset(100% 0% 0% 0%)' },
      { 
        clipPath: 'inset(0% 0% 0% 0%)', 
        duration: 2.6, 
        ease: 'expo.inOut', 
        onComplete: () => gsap.set('.hero-image-mask', { clearProps: 'clipPath' })
      },
      3.0
    );
    tl.fromTo('.hero-image-inner',
      { scale: 1.4, yPercent: 20 },
      { scale: 1, yPercent: 0, duration: 3, ease: 'expo.inOut' },
      3.0
    );
    tl.fromTo('.hero-image-inner',
      { filter: 'blur(24px)' },
      { filter: 'blur(0px)', duration: 1.5, ease: 'power2.out' },
      5.2
    );

    // Gentle floating loop
    gsap.to(['.main-heading-line', '.bio-principle', '.hero-image-mask', '.scroll-indicator', '.hero-cta'], {
      y: '-=15',
      duration: 3,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut',
      stagger: { each: 0.2, from: 'random' },
      delay: 5.5,
    });

  }, { scope: containerRef, dependencies: [mounted] });

  // -------------------------------------------------------------------------
  // Parallax + magnetic cursor tracking + Filter ripple control
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!mounted) return;

    let ticking = false;
    let cachedEvent: MouseEvent | null = null;

    const updateParallax = () => {
      if (!cachedEvent) {
        ticking = false;
        return;
      }
      const { clientX, clientY } = cachedEvent;
      const { innerWidth, innerHeight } = window;
      const nx = (clientX / innerWidth) * 2 - 1;
      const ny = (clientY / innerHeight) * 2 - 1;

      if (headingRef.current) {
        gsap.to(headingRef.current, { x: nx * -25, y: ny * -15, duration: 1.6, ease: 'power3.out' });
      }
      if (imageInnerRef.current) {
        gsap.to(imageInnerRef.current, { x: nx * 40, y: ny * 30, rotationY: nx * 4, duration: 2, ease: 'power3.out' });
      }
      if (magneticDotRef.current) {
        const dot = magneticDotRef.current;
        const rect = dot.getBoundingClientRect();
        const dx = clientX - (rect.left + rect.width / 2);
        const dy = clientY - (rect.top + rect.height / 2);
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          gsap.to(dot, { x: dx * 0.5, y: dy * 0.5, scale: 2.5, duration: 0.6, ease: 'power2.out' });
        } else {
          gsap.to(dot, { x: 0, y: 0, scale: 1, duration: 1.2, ease: 'elastic.out(1, 0.3)' });
        }
      }
      ticking = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      lastMoveMs.current = performance.now();
      cachedEvent = e;
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    };

    let animationFrameId: number;
    const loop = () => {
      const timeSinceMove = performance.now() - lastMoveMs.current;
      const isMoving = timeSinceMove < 150;
      
      const timeSec = performance.now() / 1000;
      const breathingScale = 10 + Math.sin(timeSec * 1.5) * 4; 
      const targetScale = isMoving ? breathingScale : 0;

      currentScale.current += (targetScale - currentScale.current) * 0.1;

      if (filterRef.current) {
        if (Math.abs(targetScale - currentScale.current) > 0.01 || currentScale.current > 0.01) {
          filterRef.current.setAttribute('scale', currentScale.current.toString());
        }
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    loop();
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [mounted]);

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <section
      id="hero"
      ref={containerRef}
      className="relative w-full min-h-screen bg-background text-foreground transition-colors duration-500 overflow-hidden antialiased flex flex-col pt-24 pb-20 md:pt-28 md:pb-28 px-6 md:px-16"
      aria-label="Hero Introduction"
    >

      {/* SVG filter definition */}
      {mounted && <WaterRippleFilter filterRef={filterRef} />}

      {/* WebGL ripple shader — background caustic layer */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <HeroCanvas 
          connectionRefs={connectionRefs} 
          targetRef={imageContainerRef} 
          headings={{ h1: t.heading1, h2: t.heading2, h3: t.heading3 }}
        />
      </div>

      <div className="grain-overlay" aria-hidden="true"></div>

      <div className="absolute inset-0 z-20 pointer-events-none" style={{ mixBlendMode: 'overlay', opacity: 0.6 }}>
      </div>

      {/* Swiss Precision Grid */}
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

      {/* ------------------------------------------------------------------ */}
      {/* Content grid                                                       */}
      {/* ------------------------------------------------------------------ */}
      <div className="w-full h-full grid grid-cols-1 md:grid-cols-12 gap-0 relative z-10 flex-grow">

        {/* LEFT COLUMN: Heading + Principle 01 + CTA                        */}
        <div
          className="md:col-start-2 md:col-span-5 flex flex-col justify-center pt-12 md:pt-0 z-20 h-full"
        >
          <div className="overflow-hidden mb-6 md:mb-8">
            <span className="overline-reveal block text-[11px] md:text-[12px] tracking-[0.05em] text-ink-theme transition-colors duration-500 font-semibold">
              {t.label}
            </span>
          </div>

          {/* Identity Anchor */}
          <div className="flex flex-col gap-1 mb-8">
            <span className="text-[20px] md:text-[24px] font-serif font-bold text-foreground transition-colors duration-500">
              Chef Arnold Poernomo
            </span>
            <span className="text-[10px] tracking-[0.2em] uppercase text-foreground/50 font-bold transition-colors duration-500">
              {language === 'id' ? 'Arsitek Rasa, Pembangun Ekosistem' : 'Taste Architect, Ecosystem Builder'}
            </span>
          </div>

          <div ref={headingRef} className="transition-all duration-700">
            {/* HTML heading exposed permanently. will-change optimizes GPU paint */}
            <h1 className="font-sans font-medium text-foreground transition-colors duration-500 leading-[1.0] tracking-[-0.04em] text-[8vw] md:text-[3.8vw] md:-ml-[0.05em]">
              <div className="overflow-hidden pb-3 w-max"><div className="main-heading-line pr-6 origin-bottom-left will-change-[transform,opacity]">{t.heading1}</div></div>
              <div className="overflow-hidden pb-3 w-max"><div className="main-heading-line pr-6 origin-bottom-left will-change-[transform,opacity]">{t.heading2}</div></div>
              <div className="overflow-hidden pb-3 w-max"><div className="main-heading-line pr-6 origin-bottom-left will-change-[transform,opacity]">{t.heading3}</div></div>
            </h1>
          </div>

          {/* Quiet Luxury: Only one powerful micro-narrative kept above the fold */}
          <article ref={bio1Ref} className="bio-principle mt-10 md:mt-16 flex flex-col gap-3 max-w-[340px] will-change-[transform,opacity]">
            <h3 className="text-[10px] tracking-[0.2em] uppercase text-foreground transition-colors duration-500 font-bold">{t.p1Label}</h3>
            <p className="text-[14px] text-foreground/70 transition-colors duration-500 leading-relaxed font-medium">
              {t.p1Desc}
            </p>
          </article>

          {/* Primary Call To Actions */}
          <div className="hero-cta mt-10 flex flex-wrap gap-4 items-center will-change-[transform,opacity]">
            <Magnetic strength={0.2}>
              <a
                ref={ctaRef}
                href="#about"
                onClick={(e) => {
                  e.preventDefault();
                  const lenis = (window as any).lenis;
                  if (lenis) lenis.scrollTo('#about');
                  else document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center justify-center px-6 py-3.5 text-[11px] tracking-[0.2em] uppercase font-bold text-background bg-foreground rounded-full transition-transform duration-500 hover:scale-105 active:scale-95 shadow-lg group"
              >
                {t.ctaJourney}
              </a>
            </Magnetic>
            <Magnetic strength={0.2}>
              <a
                href="#contact"
                onClick={(e) => {
                  e.preventDefault();
                  const lenis = (window as any).lenis;
                  if (lenis) lenis.scrollTo('#contact');
                  else document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center justify-center px-6 py-3.5 text-[11px] tracking-[0.2em] uppercase font-bold text-foreground bg-transparent border border-foreground/30 rounded-full transition-all duration-500 hover:bg-foreground/5 hover:border-foreground active:scale-95 group"
              >
                {t.ctaCollaborate}
              </a>
            </Magnetic>
          </div>
        </div>

        {/* RIGHT COLUMN: Image with -scale-x-100 (Horizontal Flip)            */}
        <div className="md:col-start-8 md:col-span-4 relative flex flex-col justify-center items-end h-full pt-24 md:pt-0 pb-12 md:pb-0 z-10">
          <div ref={imageContainerRef} className="w-full max-w-[280px] sm:max-w-[340px] md:max-w-[380px] xl:max-w-[400px]">
            {/* Aspect ratio changed to 2/3 for editorial look. -scale-x-100 to flip gaze leftward */}
            <figure className="hero-image-mask w-full aspect-[2/3] max-h-[60vh] ml-auto relative overflow-hidden rounded-2xl border border-foreground/5 shadow-md -scale-x-100">
              <div ref={imageInnerRef} className="hero-image-inner absolute inset-0 w-full h-full will-change-[transform,filter]">
                <ImageRipple
                  src="/chef_portrait.png"
                  alt="Chef Portrait"
                />
              </div>
            </figure>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div
          ref={scrollIndicatorRef}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 z-50 scroll-indicator"
        >
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
                {t.explore}
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
