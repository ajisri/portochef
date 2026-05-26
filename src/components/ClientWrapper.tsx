'use client';

import { useEffect, ReactNode } from 'react';
import Lenis from 'lenis';

// Suppress Three.js deprecation warnings for THREE.Clock (caused by React Three Fiber v9 internal usage)
if (typeof window !== 'undefined') {
  const originalWarn = console.warn;
  console.warn = (...args: any[]) => {
    if (
      args[0] &&
      typeof args[0] === 'string' &&
      args[0].includes('THREE.Clock: This module has been deprecated')
    ) {
      return;
    }
    originalWarn(...args);
  };
}

export default function ClientWrapper({ children }: { children: ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.5,
      lerp: 0.05,
      infinite: false,
    });
    
    // Expose lenis globally for anchor navigation
    (window as any).lenis = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
