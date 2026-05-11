'use client';

import React, { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

const projects = [
  {
    id: '01',
    name: 'Mangkokku',
    tag: 'Culinary / Modern Concept',
    description: 'Modern rice bowl concept redefining Indonesian comfort food through technical precision and scalable excellence.',
    image: '/portfolio-1.png',
    layout: 'md:col-start-2 md:col-span-5',
    parallaxSpeed: 0.1,
  },
  {
    id: '02',
    name: 'KOI Thé',
    tag: 'Partnership / Artisanal',
    description: 'Premium beverage experience bringing artisanal craftsmanship to a global lifestyle audience.',
    image: '/portfolio-2.png',
    layout: 'md:col-start-8 md:col-span-4 mt-24 md:mt-48',
    parallaxSpeed: 0.2,
  },
  {
    id: '03',
    name: 'Gaaram',
    tag: 'Innovation / Street Food',
    description: 'The art of street food, elevated through technical rigor, dark aesthetics, and bold flavor chemistry.',
    image: '/portfolio-3.png',
    layout: 'md:col-start-1 md:col-span-4 -mt-12 md:-mt-24',
    parallaxSpeed: 0.15,
  },
  {
    id: '04',
    name: 'Kitchen Lab',
    tag: 'Gastronomy / Research',
    description: 'A private sanctuary for culinary innovation and experimental gastronomy where technique transcends taste.',
    image: '/portfolio-4.png',
    layout: 'md:col-start-6 md:col-span-6 mt-12 md:mt-32',
    parallaxSpeed: 0.25,
  },
];

/**
 * @component BusinessPortfolio
 * @description 
 * An editorial-style project showcase inspired by Oliver Larose.
 * Employs a 12-column Swiss grid with asymmetrical element placement
 * and independent scroll-based parallax speeds for each card.
 */
export default function BusinessPortfolio() {
  const containerRef = useRef<HTMLElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useGSAP(() => {
    if (!mounted) return;
    gsap.registerPlugin(ScrollTrigger);

    // 1. Title Reveal
    gsap.fromTo('.portfolio-header', 
      { y: 100, opacity: 0 },
      { 
        y: 0, 
        opacity: 1, 
        duration: 1.5, 
        ease: 'expo.out',
        scrollTrigger: {
          trigger: '.portfolio-header',
          start: 'top 90%',
        }
      }
    );

    // 2. Individual Card Scroll Animations (Parallax & Reveal)
    const cards = gsap.utils.toArray<HTMLElement>('.portfolio-card');
    cards.forEach((card, i) => {
      const speed = projects[i].parallaxSpeed;
      
      // Vertical Parallax
      gsap.to(card, {
        y: (i % 2 === 0 ? -100 : 100) * speed,
        scrollTrigger: {
          trigger: card,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        }
      });

      // Entrance Skew & Scale
      gsap.fromTo(card.querySelector('.card-image-wrapper'),
        { clipPath: 'inset(20% 10% 20% 10%)', scale: 1.1 },
        { 
          clipPath: 'inset(0% 0% 0% 0%)', 
          scale: 1, 
          duration: 1.8, 
          ease: 'expo.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
          }
        }
      );
    });

  }, { scope: containerRef, dependencies: [mounted] });

  return (
    <section 
      ref={containerRef}
      className="relative w-full py-32 md:py-64 bg-[#FDFDFD] text-[#111111] px-6 md:px-16"
      aria-label="Business Ecosystem"
    >
      <div className="grain-overlay opacity-[0.015]" aria-hidden="true"></div>

      {/* Editorial Header Section */}
      <div className="max-w-[1400px] mx-auto mb-24 md:mb-48 grid grid-cols-1 md:grid-cols-12 gap-0 items-end">
        <div className="md:col-start-2 md:col-span-10">
          <div className="portfolio-header flex flex-col gap-6">
            <span className="text-[10px] tracking-[0.4em] uppercase text-[#737373] font-bold block">
              Global Ecosystem / Business
            </span>
            <h2 className="text-[14vw] md:text-[8vw] font-serif leading-[0.85] tracking-tighter text-[#111111] md:-ml-2">
              Ekosistem.
            </h2>
          </div>
        </div>
      </div>

      {/* Asymmetrical Project Grid */}
      <div className="max-w-[1500px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-y-24 md:gap-y-48 gap-x-0 relative">
        
        {/* Background Vertical Lines (Swiss Consistency) */}
        <div className="absolute inset-y-0 left-0 w-full flex pointer-events-none opacity-[0.05] z-0">
          <div className="h-full border-l border-[#111111] w-[8.333333%]"></div>
          <div className="h-full border-l border-[#111111] w-[25%]"></div>
          <div className="h-full border-l border-[#111111] w-[33.333333%]"></div>
          <div className="h-full border-l border-r border-[#111111] w-[33.333333%]"></div>
        </div>

        {projects.map((project, index) => (
          <div 
            key={project.id} 
            className={`portfolio-card flex flex-col z-10 ${project.layout}`}
          >
            {/* Project Frame */}
            <div className="group cursor-pointer">
              <div className="card-image-wrapper relative w-full aspect-[4/5] overflow-hidden grayscale hover:grayscale-0 transition-all duration-[1.5s] ease-expo-out bg-[#F8F8F8] shadow-lg mb-8 md:mb-12">
                <Image
                  src={project.image}
                  alt={project.name}
                  fill
                  className="object-cover transition-transform duration-[2s] group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 800px"
                />
                
                {/* Magnetic-like label on hover (Larose Interaction) */}
                <div className="absolute top-6 left-6 z-20 overflow-hidden">
                   <span className="text-[9px] tracking-[0.3em] uppercase text-white font-bold bg-[#111111] px-3 py-1 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-700">
                      View Project
                   </span>
                </div>
              </div>

              {/* Narrative Content */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                   <span className="text-[10px] font-bold text-[#111111]/30">{project.id}</span>
                   <div className="h-[1px] w-8 bg-[#111111]/10"></div>
                   <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-[#737373]">{project.tag}</span>
                </div>
                <h3 className="text-[8vw] md:text-[3vw] font-serif leading-none tracking-tight text-[#111111] group-hover:translate-x-2 transition-transform duration-700">
                  {project.name}
                </h3>
                <p className="text-[14px] md:text-[16px] text-[#555555] leading-relaxed max-w-[320px] font-medium opacity-80">
                  {project.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Large Decorative Vertical Text (Editorial Flair) */}
      <div className="absolute right-0 top-1/4 h-full pointer-events-none select-none z-0 hidden lg:block">
         <span className="text-[12vw] font-sans font-black text-[#111111]/[0.012] leading-none uppercase tracking-tighter origin-bottom-right rotate-90 whitespace-nowrap">
            Portfolio Excellence
         </span>
      </div>
    </section>
  );
}
