'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useApp } from '../context/AppContext';

export default function DialogueSection() {
  const containerRef = useRef<HTMLElement>(null);
  
  let language: 'id' | 'en' = 'id';
  try {
    const appCtx = useApp();
    language = appCtx.language;
  } catch (e) {
    // Ignore error
  }

  return (
    <section 
      ref={containerRef}
      className="relative min-h-[80vh] bg-background text-foreground transition-colors duration-500 flex flex-col items-center justify-center text-center px-8 overflow-hidden"
    >
      <div className="max-w-4xl">
        <span className="text-fluid-label text-foreground/20 mb-8 block transition-colors duration-500">
          {language === 'id' ? 'Filosofi Endog' : 'The Egg Philosophy'}
        </span>
        <blockquote className="text-fluid-h2 text-foreground font-serif leading-tight italic transition-colors duration-500">
          {language === 'id' ? (
            <>
              "Bagi sebagian orang, telur hanyalah bahan dasar. <br />
              Bagi kami, ia adalah semesta yang menunggu untuk menetas menjadi mahakarya."
            </>
          ) : (
            <>
              "To some, an egg is just a basic ingredient. <br />
              To us, it is a universe waiting to hatch into a masterpiece."
            </>
          )}
        </blockquote>
        <div className="mt-12 h-px w-24 bg-foreground/10 mx-auto transition-colors duration-500" />
      </div>
    </section>
  );
}
