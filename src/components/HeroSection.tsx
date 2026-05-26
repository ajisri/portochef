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
    explore: 'Eksplorasi',
  },
  en: {
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
    explore: 'Explore',
  }
};

/**
 * @component WaterRippleFilter
 * @description
 * Renders a hidden SVG <defs> containing the animated water ripple filter.
 *
 * Key technique: SVG SMIL <animate> is the ONLY reliable way to animate
 * feTurbulence's baseFrequency attribute. It runs entirely in the SVG
 * rendering engine — no JavaScript, no GSAP, no rAF needed.
 *
 * filterUnits="userSpaceOnUse" prevents objectBoundingBox distortion on
 * non-square elements (text columns). The large x/y/width/height region
 * prevents clipping when displacement pushes pixels outside the element bounds.
 */
function WaterRippleFilter() {
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
        {/* ------------------------------------------------------------------ */}
        {/* FILTER: water-ripple                                                */}
        {/* Applied to HTML text containers via  style={{ filter: 'url(#water-ripple)' }} */}
        {/* filterUnits="userSpaceOnUse" + large bounding box prevents clipping */}
        {/* ------------------------------------------------------------------ */}
        <filter
          id="water-ripple"
          x="-30%"
          y="-30%"
          width="160%"
          height="160%"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="linearRGB"
        >
          {/* Layer 1: Slow organic noise — forms the base water surface */}
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.012 0.009"
            numOctaves="4"
            seed="3"
            result="noise1"
          >
            {/* SMIL animate: browser-native, animates SVG attributes directly */}
            <animate
              attributeName="baseFrequency"
              values="0.012 0.009; 0.020 0.015; 0.012 0.009"
              dur="8s"
              repeatCount="indefinite"
              calcMode="spline"
              keySplines="0.45 0.05 0.55 0.95; 0.45 0.05 0.55 0.95"
            />
          </feTurbulence>

          {/* Layer 2: Faster ripple noise — adds surface chop */}
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

          {/* Blend both noise layers */}
          <feMerge result="combinedNoise">
            <feMergeNode in="noise1" />
            <feMergeNode in="noise2" />
          </feMerge>

          {/* Composite to boost contrast of the noise map */}
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

          {/* The displacement map: applies UV offset to the source pixels */}
          <feDisplacementMap
            in="SourceGraphic"
            in2="displacementMap"
            scale="10"
            xChannelSelector="R"
            yChannelSelector="G"
          >
            {/* Animate scale for breathing/pulsing intensity */}
            <animate
              attributeName="scale"
              values="6; 14; 6"
              dur="6s"
              repeatCount="indefinite"
              calcMode="spline"
              keySplines="0.45 0.05 0.55 0.95; 0.45 0.05 0.55 0.95"
            />
          </feDisplacementMap>
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

  // Electric string source refs
  const bio1Ref = useRef<HTMLElement>(null);
  const bio2Ref = useRef<HTMLElement>(null);
  const bio3Ref = useRef<HTMLElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const connectionRefs = useMemo(() => ([
    { id: 'heading', ref: headingRef },
    { id: 'bio1',    ref: bio1Ref },
    { id: 'bio2',    ref: bio2Ref },
    { id: 'bio3',    ref: bio3Ref },
    { id: 'scroll',  ref: scrollIndicatorRef },
  ]), []);

  useEffect(() => { setMounted(true); }, []);

  // -------------------------------------------------------------------------
  // GSAP entrance + floating animations
  // -------------------------------------------------------------------------
  useGSAP(() => {
    if (!mounted) return;

    // Grid lines entrance
    gsap.fromTo('.vertical-grid-line',
      { scaleY: 0, transformOrigin: 'top' },
      { scaleY: 1, duration: 2.8, ease: 'expo.inOut', stagger: 0.1, delay: 2.5 }
    );

    // Heading liquid entrance
    gsap.fromTo('.main-heading-line',
      { y: '125%', skewY: 10, rotationZ: 3, opacity: 0 },
      { y: '0%', skewY: 0, rotationZ: 0, opacity: 1, duration: 2, ease: 'expo.out', delay: 3.2, stagger: 0.15 }
    );

    // Bio principles reveal
    gsap.fromTo('.bio-principle',
      { opacity: 0, y: 60, rotationX: -20 },
      { opacity: 1, y: 0, rotationX: 0, duration: 1.8, ease: 'power4.out', stagger: 0.25, delay: 3.6 }
    );

    // Image mask reveal
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

    // Gentle floating loop
    gsap.to(['.main-heading-line', '.bio-principle', '.hero-image-mask', '.scroll-indicator'], {
      y: '-=15',
      rotationZ: () => Math.random() * 2 - 1,
      duration: 3,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut',
      stagger: { each: 0.2, from: 'random' },
      delay: 5.5,
    });

  }, { scope: containerRef, dependencies: [mounted] });

  // -------------------------------------------------------------------------
  // Parallax + magnetic cursor tracking
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!mounted) return;

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
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
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mounted]);

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <section
      id="hero"
      ref={containerRef}
      className="relative w-full min-h-screen bg-background text-foreground transition-colors duration-500 overflow-hidden antialiased flex flex-col pt-32 pb-24 md:pb-32 px-6 md:px-16"
      aria-label="Hero Introduction"
    >
      {/* ------------------------------------------------------------------ */}
      {/* SVG filter definition — rendered client-side only to avoid SSR    */}
      {/* hydration mismatch with SVG SMIL animate elements                  */}
      {/* ------------------------------------------------------------------ */}
      {mounted && <WaterRippleFilter />}

      {/* ------------------------------------------------------------------ */}
      {/* WebGL ripple shader — background caustic layer                     */}
      {/* ------------------------------------------------------------------ */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <HeroCanvas 
          connectionRefs={connectionRefs} 
          targetRef={imageContainerRef} 
          headings={{ h1: t.heading1, h2: t.heading2, h3: t.heading3 }}
        />
      </div>

      <div className="grain-overlay" aria-hidden="true"></div>

      {/* ------------------------------------------------------------------ */}
      {/* Overlay ripple layer removed - Text is now in WebGL                */}
      {/* ------------------------------------------------------------------ */}
      <div className="absolute inset-0 z-20 pointer-events-none" style={{ mixBlendMode: 'overlay', opacity: 0.6 }}>
        {/* Intentionally left empty to preserve structure but remove duplicate WebGL context */}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Swiss Precision Grid                                               */}
      {/* ------------------------------------------------------------------ */}
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

        {/* LEFT COLUMN: Heading + Principle 01                             */}
        {/*                                                                  */}
        {/* Water ripple applied here via SVG filter.                       */}
        {/* The filter distorts pixels of this entire column at the GPU     */}
        {/* level, making both heading text and bio text ripple like water. */}
        <div
          className="md:col-start-2 md:col-span-5 flex flex-col justify-start pt-12 md:pt-20 z-20 water-ripple-hover"
        >
          <div className="overflow-hidden mb-8 md:mb-12">
            <span className="overline-reveal block text-[10px] md:text-[11px] tracking-[0.4em] uppercase text-ink-theme transition-colors duration-500 font-semibold">
              {t.label}
            </span>
          </div>

          <div ref={headingRef}>
            <h1 className="font-sans font-medium text-foreground transition-colors duration-500 leading-[0.85] tracking-[-0.04em] text-[13vw] md:text-[6vw] md:-ml-[0.05em] opacity-0 select-none pointer-events-none">
              <div className="overflow-hidden pb-3 w-max"><div className="main-heading-line pr-6 origin-bottom-left">{t.heading1}</div></div>
              <div className="overflow-hidden pb-3 w-max"><div className="main-heading-line pr-6 origin-bottom-left">{t.heading2}</div></div>
              <div className="overflow-hidden pb-3 w-max"><div className="main-heading-line pr-6 origin-bottom-left">{t.heading3}</div></div>
            </h1>
          </div>

          <article ref={bio1Ref} className="bio-principle mt-12 md:mt-24 flex flex-col gap-3 max-w-[280px]">
            <h3 className="text-[10px] tracking-[0.2em] uppercase text-foreground transition-colors duration-500 font-bold">{t.p1Label}</h3>
            <p className="text-[14px] text-foreground/70 transition-colors duration-500 leading-relaxed font-medium">
              {t.p1Desc}
            </p>
          </article>
        </div>

        {/* RIGHT COLUMN: Image + Principle 02                              */}
        <div className="md:col-start-8 md:col-span-5 relative flex flex-col justify-center items-end h-full pt-24 md:pt-0">
          <div ref={imageContainerRef} className="w-full max-w-[450px]">
            <figure className="hero-image-mask w-full aspect-[4/5] relative overflow-hidden bg-foreground/5 shadow-2xl">
              <div ref={imageInnerRef} className="hero-image-inner absolute inset-0 w-full h-full">
                <ImageRipple
                  src="/chef_portrait.png"
                  alt="Chef Arnold Poernomo"
                />
              </div>
            </figure>
          </div>

          <article
            ref={bio2Ref}
            className="bio-principle mt-12 md:mt-16 mr-auto md:mr-12 flex flex-col gap-3 max-w-[280px] water-ripple-hover"
          >
            <h3 className="text-[10px] tracking-[0.2em] uppercase text-foreground transition-colors duration-500 font-bold">{t.p2Label}</h3>
            <p className="text-[14px] text-foreground/70 transition-colors duration-500 leading-relaxed font-medium">
              {t.p2Desc}
            </p>
          </article>
        </div>

        {/* BOTTOM-LEFT: Principle 03                                       */}
        <div
          className="md:col-start-2 md:col-span-3 flex items-end pb-12 md:pb-0 water-ripple-hover"
        >
          <article ref={bio3Ref} className="bio-principle flex flex-col gap-3 max-w-[280px]">
            <h3 className="text-[10px] tracking-[0.2em] uppercase text-foreground transition-colors duration-500 font-bold">{t.p3Label}</h3>
            <p className="text-[14px] text-foreground/70 transition-colors duration-500 leading-relaxed font-medium">
              {t.p3Desc}
            </p>
          </article>
        </div>

        {/* Scroll Indicator                                                */}
        <div
          ref={scrollIndicatorRef}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 z-50 water-ripple-hover"
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
