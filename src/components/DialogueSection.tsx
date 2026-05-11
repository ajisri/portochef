'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export default function DialogueSection() {
  const containerRef = useRef<HTMLElement>(null);

  return (
    <section 
      ref={containerRef}
      className="relative min-h-[80vh] bg-alabaster flex flex-col items-center justify-center text-center px-8 overflow-hidden"
    >
      <div className="max-w-4xl">
        <span className="text-fluid-label text-obsidian/20 mb-8 block">
          Filosofi Endog
        </span>
        <blockquote className="text-fluid-h2 text-obsidian font-serif leading-tight italic">
          "Bagi sebagian orang, telur hanyalah bahan dasar. <br />
          Bagi kami, ia adalah semesta yang menunggu untuk menetas menjadi mahakarya."
        </blockquote>
        <div className="mt-12 h-px w-24 bg-obsidian/10 mx-auto" />
      </div>
    </section>
  );
}
