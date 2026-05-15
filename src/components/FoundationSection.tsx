'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useApp } from '../context/AppContext';

export default function FoundationSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  let language: 'id' | 'en' = 'id';
  try {
    const appCtx = useApp();
    language = appCtx.language;
  } catch (e) {
    // Ignore error
  }

  useGSAP(() => {
    gsap.registerPlugin(ScrollTrigger);

    // Fluid Text Unfolding Logic
    const lines = gsap.utils.toArray('.narrative-line');
    lines.forEach((line: any) => {
      gsap.fromTo(line, 
        { opacity: 0.2, y: 15 }, // Start with low opacity
        { 
          opacity: 1, 
          y: 0,
          scrollTrigger: {
            trigger: line,
            start: 'top 85%',
            end: 'top 60%',
            scrub: 1.5,
          }
        }
      );
    });
  }, { scope: containerRef });

  return (
    <section 
      id="about"
      ref={sectionRef} 
      className="relative min-h-screen bg-background text-foreground transition-colors duration-500 py-24 md:py-48 px-8 md:px-16 lg:px-24"
    >
      <div ref={containerRef} className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">
        {/* Left Column: Sticky Watermark */}
        <div className="relative h-fit md:h-full">
          <div className="md:sticky md:top-1/4">
            <h2 className="text-[clamp(8rem,20vw,25rem)] font-serif leading-none text-foreground opacity-[0.03] select-none transition-colors duration-500">
              2004
            </h2>
          </div>
        </div>

        {/* Right Column: Narrative Content */}
        <div className="flex flex-col space-y-12">
          {language === 'id' ? (
            <>
              <p className="narrative-line text-fluid-p leading-relaxed">
                Dimulai dari ketukan ritmis pisau di atas talenan kayu yang usang. 
                Di sebuah sudut dapur kecil, ambisi ini pertama kali dipanaskan di atas bara api 
                yang tak pernah padam, jauh sebelum nama ini dikenal di peta gastronomi.
              </p>
              <p className="narrative-line text-fluid-p leading-relaxed">
                Setiap piring yang dicuci adalah pelajaran tentang kerendahan hati. 
                Setiap bumbu yang ditumbuk adalah doa untuk warisan Nusantara yang tak lekang 
                oleh waktu. Kami percaya bahwa rasa bukan sekadar tentang lidah, 
                melainkan tentang memori yang kita panggil kembali.
              </p>
              <p className="narrative-line text-fluid-p leading-relaxed">
                Kini, dua dekade kemudian, presisi tetap menjadi hukum tertinggi. 
                Dari bahan mentah yang paling sederhana hingga kreasi yang paling kompleks, 
                setiap elemen adalah representasi dari dedikasi yang tanpa kompromi 
                terhadap keunggulan kuliner.
              </p>
            </>
          ) : (
            <>
              <p className="narrative-line text-fluid-p leading-relaxed">
                It began with the rhythmic tapping of a knife on a worn wooden cutting board.
                In a small corner of the kitchen, this ambition was first heated over embers
                that never faded, long before the name was known on the gastronomy map.
              </p>
              <p className="narrative-line text-fluid-p leading-relaxed">
                Every plate washed was a lesson in humility.
                Every spice pounded was a prayer for the archipelago's timeless heritage.
                We believe that taste is not just about the palate,
                but about the memories we call back.
              </p>
              <p className="narrative-line text-fluid-p leading-relaxed">
                Now, two decades later, precision remains the highest law.
                From the simplest raw ingredients to the most complex creations,
                every element is a representation of uncompromising dedication
                to culinary excellence.
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
