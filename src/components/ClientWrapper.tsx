'use client';

import { useEffect, ReactNode } from 'react';
import Lenis from 'lenis';

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
