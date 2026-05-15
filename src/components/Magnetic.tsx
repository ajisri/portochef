'use client';

import React, { useRef } from 'react';
import gsap from 'gsap';

interface MagneticProps {
  children: React.ReactNode;
  className?: string;
  strength?: number;
}

/**
 * @component Magnetic
 * @description
 * Creates a magnetic pull effect on the wrapped element based on cursor position.
 * A staple interaction in Olivier Larose and international creative studio portfolios.
 */
export default function Magnetic({ children, className = '', strength = 0.3 }: MagneticProps) {
  const magneticRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY } = e;
    if (!magneticRef.current) return;
    
    const { height, width, left, top } = magneticRef.current.getBoundingClientRect();
    const x = clientX - (left + width / 2);
    const y = clientY - (top + height / 2);
    
    gsap.to(magneticRef.current, {
      x: x * strength,
      y: y * strength,
      duration: 1,
      ease: 'elastic.out(1, 0.3)'
    });
  };

  const handleMouseLeave = () => {
    if (!magneticRef.current) return;
    gsap.to(magneticRef.current, {
      x: 0,
      y: 0,
      duration: 1.2,
      ease: 'elastic.out(1, 0.3)'
    });
  };

  return (
    <div
      ref={magneticRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`inline-block ${className}`}
      style={{ transformOrigin: 'center center' }}
    >
      {children}
    </div>
  );
}
