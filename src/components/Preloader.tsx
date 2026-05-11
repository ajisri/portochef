'use client';

import React, { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export default function Preloader() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isComplete, setIsComplete] = useState(false);

  useGSAP(() => {
    document.body.style.overflow = 'hidden';

    const tl = gsap.timeline({
      onComplete: () => {
        document.body.style.overflow = '';
        setIsComplete(true);
      }
    });

    tl.fromTo(['.the-egg', '.the-name'],
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 1.5, stagger: 0.2, ease: 'power3.out' }
    )
    .to({}, { duration: 0.8 })
    .to('.the-cut', {
      width: '100vw',
      duration: 0.5,
      ease: 'expo.in'
    })
    .to(['.the-egg', '.the-name'], {
      opacity: 0,
      duration: 0.1
    }, "-=0.1")
    .to('.panel-top', { yPercent: -100, duration: 1.2, ease: 'expo.inOut' }, "+=0.1")
    .to('.panel-bottom', { yPercent: 100, duration: 1.2, ease: 'expo.inOut' }, "<")
    .to('.the-cut', { opacity: 0, duration: 0.3 }, "<");

  }, { scope: containerRef });

  if (isComplete) return null;

  return (
    <div ref={containerRef} className="fixed inset-0 z-[9999] pointer-events-none">
      {/* Panel Latar Belakang */}
      <div className="panel-top absolute top-0 left-0 w-full h-1/2 bg-white pointer-events-auto border-b border-transparent"></div>
      <div className="panel-bottom absolute bottom-0 left-0 w-full h-1/2 bg-white pointer-events-auto border-t border-transparent"></div>
      
      {/* Garis Sayatan (Pisau) berada di titik tengah absolut */}
      <div className="the-cut absolute top-1/2 left-1/2 h-[1px] w-0 bg-[#111111] -translate-x-1/2 -translate-y-1/2 z-20"></div>

      {/* Konten Tengah */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        {/* Teks menjadi jangkar utama di tengah */}
        <div className="relative flex justify-center">
          {/* Telur diposisikan absolute terhadap div teks agar tidak merusak posisi vertikal tengah layar */}
          <div className="the-egg absolute -top-10 w-1.5 h-1.5 bg-[#E5E5E5] rounded-full"></div>
          <h1 className="the-name text-2xl md:text-4xl text-[#111111] font-serif font-light tracking-widest uppercase">
            Arnold Poernomo
          </h1>
        </div>
      </div>
    </div>
  );
}
