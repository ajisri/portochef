'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Preload } from '@react-three/drei';
import * as THREE from 'three';
import RippleShader from './RippleShader';
import ElectricStrings from './ElectricStrings';
import { useMouseRipples } from './useMouseRipples';

/**
 * @component HeroCanvas
 * @description
 * R3F Canvas overlay for the hero section, hosting:
 * 1. RippleShader — Full-screen homunculus.jp-style cosine wave ripple effect
 * 2. ElectricStrings — Futuristic glowing cables connecting hero elements to the photo
 *
 * Handles:
 * - Theme detection via MutationObserver on <html> class
 * - Mouse position tracking (normalized [-1, 1]) for shader interaction
 * - Connection data pass-through for electric string positioning
 */

interface ConnectionRefData {
  id: string;
  ref: React.RefObject<HTMLElement | null>;
}

interface HeroCanvasProps {
  connectionRefs: ConnectionRefData[];
  targetRef: React.RefObject<HTMLElement | null>;
  headings: { h1: string; h2: string; h3: string };
}

// Sub-component to access R3F hooks
function SceneContent({ isDarkMode, mousePos, connectionRefs, targetRef, headings }: any) {
  const rippleUniforms = useMouseRipples(mousePos);

  return (
    <>
      <RippleShader isDarkMode={isDarkMode} rippleUniforms={rippleUniforms} />

      {/* <ElectricStrings connectionRefs={connectionRefs} targetRef={targetRef} isDarkMode={isDarkMode} /> */}
      <Preload all />
    </>
  );
}

export default function HeroCanvas({ connectionRefs, targetRef, headings }: HeroCanvasProps) {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Track theme changes via MutationObserver
  useEffect(() => {
    const checkTheme = () => setIsDarkMode(document.documentElement.classList.contains('dark'));
    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  // Mouse tracking via window event (container is pointer-events:none)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = -(e.clientY / window.innerHeight) * 2 + 1;
      setMousePos({ x: nx, y: ny });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-0"
      style={{ width: '100vw', height: '100vh', overflow: 'hidden', pointerEvents: 'none' }}
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 0, 500], fov: 50, near: 0.1, far: 2000 }}
        dpr={[1, 2]}
        gl={{ alpha: true, antialias: true }}
        style={{ pointerEvents: 'none' }}
      >
        <SceneContent 
          isDarkMode={isDarkMode} 
          mousePos={mousePos} 
          connectionRefs={connectionRefs} 
          targetRef={targetRef}
          headings={headings}
        />
      </Canvas>
    </div>
  );
}
