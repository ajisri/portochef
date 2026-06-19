'use client';

import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useApp } from '../context/AppContext';

const getTestimonials = (lang: 'id' | 'en') => [
  {
    quote: lang === 'id' 
      ? "Arnold memiliki kedisiplinan luar biasa. Dia tidak hanya memasak hidangan lezat, tetapi dia memahami bahwa masa depan kuliner Nusantara ada pada standarisasi dan skalabilitas bisnis yang sistematis."
      : "Arnold possesses incredible discipline. He doesn't just cook delicious dishes, he understands that the future of Indonesian cuisine lies in standardization and systematic business scalability.",
    author: "William Wongso",
    role: lang === 'id' ? "Pakar Kuliner legendaris Indonesia & Penulis Buku" : "Legendary Indonesian Culinary Expert & Author"
  },
  {
    quote: lang === 'id'
      ? "Bekerja sama dengan Arnold di Mangkokku membuka mata saya tentang pentingnya sistem operasi dapur. Dia berhasil mendemokratisasi rasa restoran mewah menjadi rice bowl yang cepat dan disukai ribuan orang."
      : "Partnering with Arnold on Mangkokku opened my eyes to the importance of kitchen operating systems. He succeeded in democratizing fine dining flavors into a fast rice bowl loved by thousands.",
    author: "Kaesang Pangarep",
    role: "Co-Founder, Mangkokku"
  },
  {
    quote: lang === 'id'
      ? "Di balik sosoknya yang ekspresif, Arnold adalah seorang pragmatis yang sangat percaya pada kekuatan proses dan konsistensi. Itulah mengapa setiap piring yang dikerjakannya selalu memiliki presisi rasa yang sama."
      : "Behind his expressive persona, Arnold is a pragmatist who deeply believes in the power of process and consistency. That is why every single plate he produces always maintains the same precision of flavor.",
    author: "Renatta Moeloek",
    role: lang === 'id' ? "Juru Masak Profesional & Rekan Juri" : "Professional Chef & Co-Judge"
  }
];

export default function Testimonials() {
  const containerRef = useRef<HTMLElement>(null);
  const [mounted, setMounted] = useState(false);

  let language: 'id' | 'en' = 'id';
  try {
    const appCtx = useApp();
    language = appCtx.language;
  } catch (e) {
    // Ignore error
  }

  const testimonials = getTestimonials(language);

  useEffect(() => {
    setMounted(true);
  }, []);

  useGSAP(() => {
    if (!mounted) return;
    gsap.registerPlugin(ScrollTrigger);

    gsap.fromTo('.testimonial-header',
      { y: 50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1.4,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 80%',
        }
      }
    );

    gsap.fromTo('.testimonial-card',
      { y: 80, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1.6,
        ease: 'power4.out',
        stagger: 0.15,
        scrollTrigger: {
          trigger: '.testimonial-grid',
          start: 'top 80%',
        }
      }
    );
  }, { scope: containerRef, dependencies: [mounted] });

  return (
    <section
      ref={containerRef}
      id="testimonials"
      className="relative w-full py-24 md:py-40 bg-background text-foreground transition-colors duration-500 overflow-hidden px-6 md:px-16"
      aria-label="Testimonials"
    >
      <div className="grain-overlay opacity-[0.01]" aria-hidden="true"></div>

      <div className="max-w-[1400px] mx-auto w-full flex flex-col gap-16 md:gap-24 relative z-10">
        
        {/* Header */}
        <div className="testimonial-header flex flex-col gap-4 max-w-xl">
          <span className="text-[10px] tracking-[0.4em] uppercase text-ink-theme font-bold block transition-colors duration-500">
            {language === 'id' ? 'Kolaborasi & Kemitraan' : 'Collaboration & Partnership'}
          </span>
          <h2 className="text-[10vw] md:text-[6vw] font-serif leading-[0.85] tracking-tighter text-foreground transition-colors duration-500">
            {language === 'id' ? 'Apa Kata Mereka.' : 'What They Say.'}
          </h2>
        </div>

        {/* Grid Cards */}
        <div className="testimonial-grid grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 w-full">
          {testimonials.map((item, index) => (
            <div
              key={index}
              className="testimonial-card group relative flex flex-col justify-between p-8 md:p-10 rounded-2xl bg-foreground/[0.02] border border-foreground/5 backdrop-blur-md transition-all duration-500 hover:bg-foreground/[0.04] hover:border-foreground/10 hover:-translate-y-2 hover:shadow-lg"
            >
              {/* Quote icon / mark */}
              <span className="text-[5rem] font-serif leading-none absolute top-4 left-6 text-foreground/[0.04] select-none group-hover:text-foreground/[0.07] transition-colors duration-500">
                “
              </span>
              
              <div className="relative z-10 flex-grow pt-8">
                <p className="text-[15px] md:text-[16px] text-foreground/80 leading-relaxed font-medium transition-colors duration-500">
                  {item.quote}
                </p>
              </div>

              <div className="relative z-10 flex flex-col gap-1 border-t border-foreground/5 mt-10 pt-6">
                <span className="text-[16px] font-bold font-serif text-foreground transition-colors duration-500">
                  {item.author}
                </span>
                <span className="text-[11px] font-medium tracking-wide text-foreground/50 transition-colors duration-500">
                  {item.role}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Structural Anchor Point (Swiss Consistency) */}
      <div className="absolute top-0 left-[8.333333%] h-full border-l border-foreground/5 transition-colors duration-500 z-0 hidden md:block"></div>
    </section>
  );
}
