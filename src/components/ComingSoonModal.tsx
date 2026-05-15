'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useApp } from '../context/AppContext';
import Image from 'next/image';

interface ComingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: { name: string; tag: string; image: string } | null;
}

/**
 * @component ComingSoonModal
 * @description
 * A premium fullscreen GSAP animated modal for "Coming Soon" projects.
 * Designed with editorial layouts, liquid transitions, and deep parallax.
 * Solves the issue of boring default browser alerts.
 */
export default function ComingSoonModal({ isOpen, onClose, project }: ComingSoonModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const { language } = useApp();

  useEffect(() => {
    if (isOpen && project) {
      document.body.style.overflow = 'hidden';
      const tl = gsap.timeline();
      
      // Ensure we start from bottom
      gsap.set(overlayRef.current, { yPercent: 100, display: 'flex' });
      
      tl.to(overlayRef.current, {
        yPercent: 0,
        duration: 1.2,
        ease: 'expo.inOut'
      })
      .fromTo(imageRef.current, 
        { scale: 1.4, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1.5, ease: 'power3.out' },
        "-=0.5"
      )
      .fromTo(contentRef.current?.children || [],
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, stagger: 0.1, ease: 'expo.out' },
        "-=1"
      );
    } else if (!isOpen && overlayRef.current) {
      gsap.to(overlayRef.current, {
        yPercent: -100, // slide up to exit
        duration: 1,
        ease: 'expo.inOut',
        onComplete: () => {
          gsap.set(overlayRef.current, { yPercent: 100, display: 'none' }); // reset to bottom and hide
          document.body.style.overflow = '';
        }
      });
    } else {
      // Ensure it is hidden on mount
      gsap.set(overlayRef.current, { yPercent: 100, display: 'none' });
    }
  }, [isOpen, project]);

  return (
    <div 
      ref={overlayRef}
      className="fixed inset-0 z-[9999] w-full h-[100dvh] bg-foreground text-background flex-col md:flex-row overflow-hidden"
      style={{ display: 'none' }}
    >
      {/* Background grain for texture */}
      <div className="absolute inset-0 opacity-[0.03] mix-blend-difference pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>

      {project && (
        <>
          {/* Split Layout: Image Left / Bottom */}
          <div className="w-full md:w-1/2 h-1/2 md:h-full relative overflow-hidden flex items-center justify-center bg-background/5">
            <div ref={imageRef} className="relative w-full h-full grayscale hover:grayscale-0 transition-all duration-1000">
              <Image 
                src={project.image} 
                alt={project.name} 
                fill 
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            
            {/* Absolute close button on Mobile */}
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 md:hidden z-50 text-background bg-foreground/20 backdrop-blur-md rounded-full px-4 py-2 font-bold text-[10px] tracking-widest uppercase"
            >
              Close
            </button>
          </div>

          {/* Split Layout: Content Right / Top */}
          <div className="w-full md:w-1/2 h-1/2 md:h-full flex flex-col justify-center px-8 md:px-24 relative z-10">
            <div ref={contentRef} className="flex flex-col gap-6">
              <span className="text-[10px] tracking-[0.4em] uppercase text-background/50 font-bold block">
                {language === 'id' ? 'Studi Kasus' : 'Case Study'} / {project.tag}
              </span>
              
              <h2 className="text-[12vw] md:text-[6vw] font-serif leading-none tracking-tighter text-background mb-4 md:-ml-2">
                {project.name}
              </h2>
              
              <div className="h-[1px] w-full bg-background/20 my-4 md:my-8"></div>
              
              <p className="text-[16px] md:text-[24px] text-background/80 leading-relaxed font-medium">
                {language === 'id' 
                  ? 'Pengalaman interaktif sedang dalam tahap penyempurnaan di dapur kreatif kami. Silakan kembali lagi nanti untuk presentasi selengkapnya.' 
                  : 'The interactive experience is currently simmering in our creative kitchen. Please return later for the full presentation.'}
              </p>

              <div className="mt-8 md:mt-12">
                <button 
                  onClick={onClose}
                  className="group flex items-center gap-4 text-[11px] tracking-[0.3em] uppercase font-bold text-background transition-colors hover:text-background/70"
                >
                  <div className="w-8 h-[1px] bg-background transition-all duration-500 group-hover:w-16"></div>
                  {language === 'id' ? 'Kembali' : 'Return'}
                </button>
              </div>
            </div>
          </div>
          
          {/* Desktop Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-12 right-16 hidden md:block z-50 text-[10px] tracking-[0.3em] uppercase font-bold text-background hover:opacity-50 transition-opacity"
          >
            {language === 'id' ? 'Tutup [X]' : 'Close [X]'}
          </button>
        </>
      )}
    </div>
  );
}
