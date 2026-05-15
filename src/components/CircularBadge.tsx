'use client';

import React, { useRef, useId } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import Magnetic from './Magnetic';

interface CircularBadgeProps {
  isHero?: boolean;
}

export default function CircularBadge({ isHero = false }: CircularBadgeProps) {
  const badgeRef = useRef<SVGSVGElement>(null);
  const id = useId();
  const pathId = `circlePath-${id.replace(/:/g, '')}`;

  useGSAP(() => {
    // Rotasi abadi yang sangat lambat (Quiet Luxury)
    gsap.to(badgeRef.current, {
      rotation: 360,
      duration: 20, 
      ease: 'none',
      repeat: -1,
      transformOrigin: '50% 50%'
    });
  }, []);

  // Use mix-blend-difference only for global badge to pop on any background
  // For Hero, we use a solid color to ensure visibility on the grid/photo
  const containerClasses = isHero 
    ? "relative w-full h-full flex items-center justify-center pointer-events-auto"
    : "fixed bottom-10 right-10 z-[60] flex items-center justify-center w-28 h-28 md:w-40 md:h-40 mix-blend-difference pointer-events-auto cursor-pointer";

  return (
    <a 
      href="#achievements" 
      onClick={(e) => {
        if (!isHero) {
          e.preventDefault();
          const lenis = (window as any).lenis;
          if (lenis) {
            lenis.scrollTo('#achievements');
          } else {
            document.getElementById('achievements')?.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }}
      className={containerClasses}
    >
      <Magnetic strength={0.2} className="w-full h-full rounded-full">
      <svg
        ref={badgeRef}
        viewBox="0 0 100 100"
        className="w-full h-full overflow-visible"
      >
        <defs>
          <path
            id={pathId}
            d="M 50, 50 m -38, 0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0"
          />
        </defs>
        {/* If Hero, use obsidian (black) to contrast against the white/gray background */}
        <text className={`text-[8px] uppercase tracking-[0.4em] font-bold ${isHero ? 'fill-[#111111]' : 'fill-white'}`}>
          <textPath href={`#${pathId}`} startOffset="0%">
            FORBES 30 UNDER 30 ASIA • GLOBAL RECOGNITION •
          </textPath>
        </text>
      </svg>
      </Magnetic>
    </a>
  );
}
