'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!cursorRef.current) return;

    gsap.set(cursorRef.current, { xPercent: -50, yPercent: -50 });
    
    const xSetter = gsap.quickSetter(cursorRef.current, 'x', 'px');
    const ySetter = gsap.quickSetter(cursorRef.current, 'y', 'px');

    const handleMouseMove = (e: MouseEvent) => {
      // Using quickSetter with a slight delay for "weighty" feel (60fps performance)
      gsap.to({}, {
        duration: 0.15,
        onUpdate: () => {
          xSetter(e.clientX);
          ySetter(e.clientY);
        }
      });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  });

  return (
    <div 
      ref={cursorRef}
      className="custom-cursor fixed top-0 left-0 w-4 h-4 bg-white rounded-full pointer-events-none z-[99999] hidden md:block mix-blend-difference"
    />
  );
}
