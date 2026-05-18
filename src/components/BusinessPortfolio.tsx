'use client';

import React, { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useApp } from '../context/AppContext';
import ComingSoonModal from './ComingSoonModal';

const getProjectsData = (lang: 'id' | 'en') => [
  {
    id: '01',
    name: 'Mangkokku',
    tag: lang === 'id' ? 'Kuliner / Konsep Modern' : 'Culinary / Modern Concept',
    description: lang === 'id'
      ? 'Konsep rice bowl modern yang menyajikan cita rasa khas masakan rumahan Indonesia dalam format yang cepat, terjangkau, dan konsisten di seluruh cabang.'
      : 'Modern rice bowl concept serving classic Indonesian comfort food flavors in a fast, accessible, and consistent format across all locations.',
    image: '/portfolio-1.png',
    baseTilt: -8,
    xOffset: -12,
    yOffset: -15,
  },
  {
    id: '02',
    name: 'KOI Thé',
    tag: lang === 'id' ? 'Kemitraan / Artisan' : 'Partnership / Artisanal',
    description: lang === 'id'
      ? 'Kemitraan strategis untuk menghadirkan minuman artisan berkualitas dengan standar penyeduhan dan konsistensi yang ketat.'
      : 'Strategic partnership delivering quality artisanal beverages with strict brewing standards and consistency.',
    image: '/portfolio-2.png',
    baseTilt: 6,
    xOffset: 15,
    yOffset: 10,
  },
  {
    id: '03',
    name: 'Gaaram',
    tag: lang === 'id' ? 'Inovasi / Makanan Jalanan' : 'Innovation / Street Food',
    description: lang === 'id'
      ? 'Inovasi jajanan pasar tradisional yang dikembangkan dengan standar kebersihan dan teknik pengolahan modern.'
      : 'Traditional street food innovation developed with modern sanitation standards and processing techniques.',
    image: '/portfolio-3.png',
    baseTilt: -6,
    xOffset: -15,
    yOffset: 15,
  },
  {
    id: '04',
    name: 'Kitchen Lab',
    tag: lang === 'id' ? 'Gastronomi / Riset' : 'Gastronomy / Research',
    description: lang === 'id'
      ? 'Fasilitas riset dan pengembangan khusus untuk menguji coba resep, efisiensi alur kerja, dan pengenalan bahan baku baru.'
      : 'Dedicated research and development facility for recipe testing, workflow efficiency, and exploring new ingredients.',
    image: '/portfolio-4.png',
    baseTilt: 10,
    xOffset: 18,
    yOffset: -10,
  },
];

/**
 * @component BusinessPortfolio
 * @description 
 * An advanced editorial project showcase featuring a stunning Quarter-Circle Arc Scroll choreography.
 * Inspired by Monks.com Client Stories, UI elements (both text titles and image cards) travel along a curved orbit
 * from bottom-left to top-right during scroll scrubbing, utilizing dynamic opacity blending to prevent visual collisions.
 */
export default function BusinessPortfolio() {
  const containerRef = useRef<HTMLElement>(null);
  const pinWrapperRef = useRef<HTMLDivElement>(null);
  
  const [mounted, setMounted] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedProject, setSelectedProject] = useState<{name: string, tag: string, image: string} | null>(null);

  const activeIndexRef = useRef(0);
  const hoveredIndexRef = useRef<number | null>(null);
  const virtualIndexRef = useRef(0);

  let language: 'id' | 'en' = 'id';
  try {
    const appCtx = useApp();
    language = appCtx.language;
  } catch (e) {
    // Ignore error
  }

  const projects = getProjectsData(language);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Core Trigonometric & Linear Choreography Logic
  const updateChoreography = (vIndex: number, hIndex: number | null) => {
    if (!mounted) return;
    const isMobile = window.innerWidth < 768;

    // Elegant, balanced spacing distances for Image Cards to guarantee zero overlap without shifting too far
    const gapX = isMobile ? 150 : 220; // Gentle horizontal shift along the arc
    const gapY = isMobile ? 380 : 490; // Vertical spacing ensures incoming cards stay cleanly below active card

    projects.forEach((proj, i) => {
      const diff = i - vIndex;
      const isHovered = hIndex === i;

      // 1. DESCRIPTION TEXT CHOREOGRAPHY (SMOOTH HORIZONTAL FLOW FROM THE SIDE)
      // Glides in smoothly from the left (-80px) to center (0), then exits gently to the right (+80px)
      const xText = -diff * (isMobile ? 50 : 80);
      const yText = 0; // Strictly horizontal, no vertical movement
      const rotateText = 0; // Strictly horizontal, no rotation

      // Strict, sharp opacity window for text so outgoing text fades out quickly after moving just a little bit
      const baseOpacityText = Math.max(0, 1 - Math.abs(diff) * 2.2);
      const opacityText = isHovered ? 1 : baseOpacityText;
      const scaleText = isHovered ? 1 : Math.max(0.85, 1 - Math.abs(diff) * 0.15);

      // 2. IMAGE CARDS CHOREOGRAPHY (BEAUTIFUL CURVED ARC WITH BALANCED SPACING)
      // Curved arc trajectory from bottom-left (-x, +y) to top-right (+x, -y) with clean vertical clearance
      const xCard = -diff * gapX; 
      const yCard = diff * gapY + Math.pow(diff, 2) * 30; // Quadratic term adds a beautiful natural curve

      // Strict opacity window for cards to ensure zero overlap / tumpang tindih
      const baseOpacityCard = Math.max(0, 1 - Math.abs(diff) * 1.3);
      const opacityCard = isHovered ? 1 : baseOpacityCard;
      const scaleCard = isHovered ? 1 : Math.max(0.85, 1 - Math.abs(diff) * 0.15);

      const rotateCard = proj.baseTilt + diff * 10;

      const zIndex = isHovered ? 100 : Math.round(50 - Math.abs(diff) * 10);
      const pointerEventsText = opacityText > 0.1 ? 'auto' : 'none';
      const pointerEventsCard = opacityCard > 0.1 ? 'auto' : 'none';

      // GSAP Animations with smooth spring interpolation
      const titleEl = containerRef.current?.querySelector(`.portfolio-title-item-${i}`);
      if (titleEl) {
        gsap.to(titleEl, {
          x: xText,
          y: yText,
          scale: scaleText,
          opacity: opacityText,
          rotate: rotateText,
          zIndex: zIndex,
          pointerEvents: pointerEventsText,
          duration: 0.7,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      }

      const cardEl = containerRef.current?.querySelector(`.portfolio-deck-card-${i}`);
      if (cardEl) {
        gsap.to(cardEl, {
          x: xCard,
          y: yCard,
          scale: scaleCard,
          opacity: opacityCard,
          rotate: rotateCard,
          zIndex: zIndex,
          pointerEvents: pointerEventsCard,
          duration: 0.7,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      }
    });
  };

  // GSAP ScrollTrigger Pinning & Scrub Registration
  useGSAP(() => {
    if (!mounted) return;
    gsap.registerPlugin(ScrollTrigger);

    // Initial positioning on mount
    updateChoreography(0, null);

    if (pinWrapperRef.current) {
      ScrollTrigger.create({
        trigger: pinWrapperRef.current,
        pin: true,
        scrub: 1, // Smooth scrubbing
        start: 'top top',
        end: '+=3500',
        onUpdate: (self) => {
          const progress = self.progress;
          const vIndex = progress * (projects.length - 1);
          virtualIndexRef.current = vIndex;

          const newActiveIndex = Math.round(vIndex);
          if (newActiveIndex !== activeIndexRef.current) {
            activeIndexRef.current = newActiveIndex;
            setActiveIndex(newActiveIndex);
          }

          updateChoreography(vIndex, hoveredIndexRef.current);
        },
        invalidateOnRefresh: true,
      });
    }

    // Header Reveal Animation
    gsap.fromTo('.portfolio-header',
      { y: 100, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1.5,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: pinWrapperRef.current,
          start: 'top 90%',
        }
      }
    );

  }, { scope: containerRef, dependencies: [mounted] });

  return (
    <section
      id="product"
      ref={containerRef}
      className="relative w-full bg-background text-foreground transition-colors duration-500 overflow-hidden"
      aria-label="Business Ecosystem"
    >
      <div ref={pinWrapperRef} className="w-full min-h-screen flex flex-col justify-center relative overflow-hidden py-20 md:py-32 px-6 md:px-16">
        <div className="grain-overlay opacity-[0.015]" aria-hidden="true"></div>

        {/* Editorial Header Section */}
        <div className="max-w-[1400px] w-full mx-auto mb-12 md:mb-20 grid grid-cols-1 md:grid-cols-12 gap-0 items-end z-40">
          <div className="md:col-start-1 md:col-span-10">
            <div className="portfolio-header flex flex-col gap-4 md:gap-6">
              <span className="text-[10px] tracking-[0.4em] uppercase text-ink-theme font-bold block transition-colors duration-500">
                {language === 'id' ? 'Ekosistem Global / Bisnis' : 'Global Ecosystem / Business'}
              </span>
              <h2 className="text-[14vw] md:text-[8vw] font-serif leading-[0.85] tracking-tighter text-foreground md:-ml-2 transition-colors duration-500">
                {language === 'id' ? 'Ekosistem.' : 'Ecosystem.'}
              </h2>
            </div>
          </div>
        </div>

        {/* Two-Column Curved Arc Choreography Layout */}
        <div className="max-w-[1400px] w-full mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-24 relative items-center flex-1">
          
          {/* LEFT COLUMN: Project Titles & Descriptions on Curved Arc */}
          <div className="md:col-span-6 relative w-full h-[380px] md:h-[550px] flex items-center justify-start z-30 pointer-events-none">
            {projects.map((project, index) => {
              const isCurrentActive = (hoveredIndex !== null ? hoveredIndex : activeIndex) === index;
              return (
                <div
                  key={project.id}
                  className={`portfolio-title-item-${index} absolute left-0 right-0 flex flex-col gap-4 md:gap-6 cursor-pointer py-4 origin-left`}
                  onMouseEnter={() => {
                    hoveredIndexRef.current = index;
                    setHoveredIndex(index);
                    updateChoreography(virtualIndexRef.current, index);
                  }}
                  onMouseLeave={() => {
                    hoveredIndexRef.current = null;
                    setHoveredIndex(null);
                    updateChoreography(virtualIndexRef.current, null);
                  }}
                  onClick={() => setSelectedProject(project)}
                >
                  {/* Meta Header */}
                  <div className="flex items-center gap-4">
                    <span className={`text-[11px] font-bold transition-colors duration-500 ${isCurrentActive ? 'text-foreground' : 'text-foreground/40'}`}>
                      {project.id}
                    </span>
                    <div className={`h-[1px] w-12 transition-colors duration-500 ${isCurrentActive ? 'bg-ink-theme' : 'bg-foreground/20'}`}></div>
                    <span className={`text-[10px] tracking-[0.2em] uppercase font-bold transition-colors duration-500 ${isCurrentActive ? 'text-ink-theme' : 'text-foreground/40'}`}>
                      {project.tag}
                    </span>
                  </div>

                  {/* Title with Monks Arrow Reveal */}
                  <div className="flex items-center justify-between gap-4 group">
                    <h3 className={`text-[9vw] md:text-[4.5vw] font-serif leading-none tracking-tight transition-all duration-500 ${isCurrentActive ? 'text-foreground translate-x-2' : 'text-foreground/50'}`}>
                      {project.name}
                    </h3>
                    <div className={`flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full border border-foreground/20 transition-all duration-500 ${isCurrentActive ? 'opacity-100 bg-foreground text-background translate-x-0 shadow-lg' : 'opacity-0 -translate-x-8 pointer-events-none'}`}>
                      <svg width="18" height="18" viewBox="0 0 14 14" fill="none">
                        <path d="M1 7H13M13 7L8 2M13 7L8 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>

                  {/* Description */}
                  <p className={`text-[15px] md:text-[18px] leading-relaxed max-w-[420px] font-medium transition-all duration-500 ${isCurrentActive ? 'text-foreground/90 opacity-100 translate-y-0' : 'text-foreground/40 opacity-60 translate-y-2'}`}>
                    {project.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* RIGHT COLUMN: Image Cards Deck on Curved Arc */}
          <div className="md:col-span-6 relative w-full h-[400px] md:h-[600px] flex items-center justify-center z-20 pointer-events-none">
            <div className="relative w-full max-w-[350px] md:max-w-[420px] aspect-[4/5] flex items-center justify-center">
              {projects.map((project, index) => {
                const isCurrentActive = (hoveredIndex !== null ? hoveredIndex : activeIndex) === index;
                return (
                  <div
                    key={project.id}
                    className={`portfolio-deck-card-${index} absolute inset-0 w-full h-full rounded-2xl overflow-hidden shadow-2xl transition-shadow duration-500 bg-foreground/5 will-change-transform border border-foreground/10 cursor-pointer group`}
                    onMouseEnter={() => {
                      hoveredIndexRef.current = index;
                      setHoveredIndex(index);
                      updateChoreography(virtualIndexRef.current, index);
                    }}
                    onMouseLeave={() => {
                      hoveredIndexRef.current = null;
                      setHoveredIndex(null);
                      updateChoreography(virtualIndexRef.current, null);
                    }}
                    onClick={() => setSelectedProject(project)}
                  >
                    <Image
                      src={project.image}
                      alt={project.name}
                      fill
                      className={`object-cover transition-transform duration-700 ${isCurrentActive ? 'scale-105' : 'scale-100'}`}
                      sizes="(max-width: 768px) 100vw, 500px"
                      priority={index === 0}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500"></div>
                    
                    {/* Card Internal Label */}
                    <div className="absolute bottom-8 left-8 right-8 flex items-end justify-between z-20 pointer-events-none">
                      <span className="text-[24px] md:text-[28px] font-serif font-bold text-white tracking-tight drop-shadow-md">
                        {project.name}
                      </span>
                      <span className="text-[10px] tracking-[0.3em] uppercase font-bold text-white/90 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                        {project.id}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Large Decorative Vertical Text (Editorial Flair) */}
        <div className="absolute right-0 top-1/4 h-full pointer-events-none select-none z-0 hidden lg:block">
          <span className="text-[12vw] font-sans font-black text-foreground opacity-5 dark:opacity-[0.03] transition-colors duration-500 leading-none uppercase tracking-tighter origin-bottom-right rotate-90 whitespace-nowrap">
            {language === 'id' ? 'Portofolio Bisnis' : 'Business Portfolio'}
          </span>
        </div>
      </div>

      <ComingSoonModal 
        isOpen={!!selectedProject} 
        onClose={() => setSelectedProject(null)} 
        project={selectedProject} 
      />
    </section>
  );
}
