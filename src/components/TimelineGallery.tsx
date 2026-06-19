'use client';

import React, { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useApp } from '../context/AppContext';

const getTimelineData = (lang: 'id' | 'en') => [
  {
    year: '2004',
    title: lang === 'id' ? 'Langkah Pertama' : 'First Steps',
    subtitle: lang === 'id' ? 'Pengenalan Dapur' : 'Kitchen Introduction',
    description: lang === 'id'
      ? 'Dapur tidak pernah berbohong. Di sinilah saya belajar bahwa disiplin bukan soal aturan — tapi soal menghormati proses dan setiap bahan yang ada di tangan Anda.'
      : 'The kitchen never lies. This is where I learned that discipline is not about rules — but about respecting the process and every ingredient in your hands.',
    image: '/portfolio-1.png',
  },
  {
    year: '2014',
    title: lang === 'id' ? 'Pengembangan Teknik' : 'Technical Development',
    subtitle: lang === 'id' ? 'Eksplorasi & Struktur' : 'Exploration & Structure',
    description: lang === 'id'
      ? 'Sepuluh tahun bukan waktu yang lama untuk belajar — cukup panjang untuk tahu mana yang benar-benar bekerja. Cita rasa Nusantara yang kaya tidak perlu dimodernisasi. Ia hanya perlu sistem yang layak.'
      : 'Ten years is not a long time to learn — but long enough to know what actually works. The rich flavors of the archipelago do not need to be modernized. They just need a proper system.',
    image: '/portfolio-2.png',
  },
  {
    year: '2024',
    title: lang === 'id' ? 'Fokus & Konsistensi' : 'Focus & Consistency',
    subtitle: lang === 'id' ? 'Standar Operasional' : 'Operational Standards',
    description: lang === 'id'
      ? 'Setelah dua dekade, definisi sukses saya berubah: bukan piring terbaik yang pernah saya buat — tapi piring ke-10.000 yang rasanya sama dengan piring pertama. Itulah sistem. Itulah yang bisa diwariskan.'
      : 'After two decades, my definition of success has changed: not the best plate I\'ve ever made — but the 10,000th plate that tastes exactly like the first. That is a system. That is what can be inherited.',
    image: '/portfolio-3.png',
  },
];

/**
 * @component TimelineGallery
 * @description 
 * A cinematic horizontal scroll experience inspired by Oliver Larose's editorial layouts.
 * Features:
 * - GSAP ScrollTrigger pinning with horizontal translation.
 * - Deep image parallax within framed masks.
 * - Asymmetrical typographic hierarchy.
 * - Interactive UI progress indicators.
 */
export default function TimelineGallery() {
  const containerRef = useRef<HTMLElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  // Fallback pattern if useApp is called without provider during tests
  let language: 'id' | 'en' = 'id';
  try {
    const appCtx = useApp();
    language = appCtx.language;
  } catch (e) {
    // Ignore error
  }

  const timelineData = getTimelineData(language);

  useEffect(() => {
    setMounted(true);
  }, []);

  useGSAP(() => {
    if (!mounted) return;
    gsap.registerPlugin(ScrollTrigger);

    const cards = gsap.utils.toArray<HTMLElement>('.timeline-card');

    // Master Horizontal Scroll Timeline
    const scrollTween = gsap.to(cards, {
      xPercent: -100 * (cards.length - 1),
      ease: 'none',
      scrollTrigger: {
        trigger: containerRef.current,
        pin: true,
        scrub: 1,
        start: 'top top',
        end: () => `+=${containerRef.current?.offsetWidth || 0 * 2.5}`,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          // Sync progress bar
          gsap.to('.timeline-progress-bar', { scaleX: self.progress, duration: 0.1, overwrite: true });
        }
      }
    });

    // Individual Layered Parallax for each card
    cards.forEach((card) => {
      const imageInner = card.querySelector('.card-image-inner');
      const title = card.querySelector('.card-title');

      // Deep parallax for the image inside its frame
      gsap.fromTo(imageInner,
        { x: '-15%' },
        {
          x: '15%',
          scrollTrigger: {
            trigger: card,
            containerAnimation: scrollTween,
            start: 'left right',
            end: 'right left',
            scrub: true
          }
        }
      );

      // Magnetic feel for titles (subtle movement during card transition)
      gsap.fromTo(title,
        { x: 30, opacity: 0.8 },
        {
          x: -30,
          opacity: 1,
          scrollTrigger: {
            trigger: card,
            containerAnimation: scrollTween,
            start: 'left right',
            end: 'right left',
            scrub: true
          }
        }
      );
    });

  }, { scope: containerRef, dependencies: [mounted] });

  return (
    <section
      ref={containerRef}
      className="relative w-full h-[100dvh] overflow-hidden bg-background text-foreground transition-colors duration-500 antialiased"
      aria-label="Timeline History"
    >
      <div className="grain-overlay opacity-[0.02]" aria-hidden="true"></div>

      {/* Section Global UI Labels */}
      <div className="absolute top-20 md:top-24 left-6 md:left-16 z-50 pointer-events-none pt-[env(safe-area-inset-top)]">
        <span className="text-[9px] md:text-[10px] tracking-[0.4em] uppercase text-foreground font-bold block opacity-40 transition-colors duration-500">
          {language === 'id' ? 'Dua Dekade, Satu Prinsip' : 'Two Decades, One Principle'}
        </span>
      </div>

      {/* Navigation Progress UI (Oliver Larose Style) */}
      <div className="absolute bottom-20 md:bottom-24 left-6 md:left-16 right-6 md:right-16 flex items-center gap-6 md:gap-10 z-50 pb-[env(safe-area-inset-bottom)]">
        <div className="text-[9px] md:text-[10px] tracking-[0.2em] uppercase font-bold w-12 md:w-20 flex-shrink-0">2004</div>
        <div className="flex-grow h-[1.5px] bg-foreground/10 relative transition-colors duration-500">
          <div className="timeline-progress-bar absolute top-0 left-0 h-full w-full bg-foreground scale-x-0 origin-left transition-colors duration-500"></div>
        </div>
        <div className="text-[9px] md:text-[10px] tracking-[0.2em] uppercase font-bold w-12 md:w-20 text-right flex-shrink-0">2024</div>
      </div>

      {/* Horizontal Content Track */}
      <div ref={scrollContainerRef} className="flex h-full w-[300vw]">
        {timelineData.map((item, index) => (
          <div key={index} className="timeline-card w-screen h-full flex-shrink-0 relative flex items-center justify-center px-6 md:px-24">


            {/* Asymmetrical Content Grid */}
            <div className="relative z-10 w-full max-w-[1300px] grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16 items-center">

              {/* Image Frame: Fixed aspect with internal parallax movement */}
              <div className="md:col-start-1 md:col-span-5 relative order-2 md:order-1">
                <div className="relative w-full aspect-[4/5] md:aspect-[1/1] overflow-hidden grayscale hover:grayscale-0 transition-all duration-[1.2s] ease-in-out bg-foreground/5 shadow-xl">
                  <div className="card-image-inner absolute inset-y-0 w-[140%] left-[-20%]">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 700px"
                      priority={index === 0}
                    />
                  </div>
                </div>
              </div>

              {/* Editorial Narrative Block */}
              <div className="md:col-start-7 md:col-span-5 flex flex-col gap-6 md:gap-10 order-1 md:order-2">
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] md:text-[11px] tracking-[0.3em] uppercase text-ink-theme font-bold block transition-colors duration-500">
                    {item.subtitle}
                  </span>
                  <h2 className="card-title text-[11vw] md:text-[6vw] font-serif leading-[0.88] tracking-tighter text-foreground md:-ml-1 transition-colors duration-500">
                    {item.title}
                  </h2>
                </div>

                <p className="text-[15px] md:text-[18px] text-foreground/70 leading-relaxed max-w-[400px] font-medium transition-colors duration-500">
                  {item.description}
                </p>

                <div className="mt-2">
                  <button className="group flex items-center gap-4 text-[10px] tracking-[0.3em] uppercase font-bold border-b border-foreground/10 pb-2 transition-all hover:border-foreground/40 dark:hover:border-foreground/60 text-foreground">
                    {language === 'id' ? 'Jelajahi Detail' : 'Discover Details'}
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="transition-transform duration-500 group-hover:translate-x-2">
                      <path d="M1 7H13M13 7L8 2M13 7L8 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              </div>

            </div>

          </div>
        ))}
      </div>
    </section>
  );
}
