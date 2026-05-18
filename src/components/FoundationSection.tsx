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
                Memulai karir di usia muda berarti belajar memahami ekosistem dapur dari tugas paling dasar. 
                Membersihkan area kerja, menyiapkan bahan baku, dan mengamati bagaimana sebuah dapur komersial 
                beroperasi di bawah tekanan tinggi.
              </p>
              <p className="narrative-line text-fluid-p leading-relaxed">
                Tidak ada rahasia besar dalam memasak, yang ada hanyalah repetisi dan ketelitian. 
                Mempelajari teknik dasar potongan, pengenalan suhu, dan bagaimana konsistensi kecil 
                berdampak besar pada hasil akhir sebuah hidangan.
              </p>
              <p className="narrative-line text-fluid-p leading-relaxed">
                Setelah dua dekade, prinsip kerja ini tidak berubah. Memasak tetap tentang menghormati 
                bahan baku, menjalankan prosedur dengan bersih, dan menyajikan hidangan yang jujur 
                tanpa perlu dibalut narasi yang berlebihan.
              </p>
            </>
          ) : (
            <>
              <p className="narrative-line text-fluid-p leading-relaxed">
                Starting a career at a young age meant understanding the kitchen ecosystem from the most fundamental tasks. 
                Maintaining clean prep areas, organizing ingredients, and observing how a commercial kitchen 
                operates under intense pressure.
              </p>
              <p className="narrative-line text-fluid-p leading-relaxed">
                There are no grand secrets in cooking, only repetition and rigorous attention to detail. 
                Mastering knife work, understanding thermal control, and realizing how minor consistencies 
                compound into the final dish.
              </p>
              <p className="narrative-line text-fluid-p leading-relaxed">
                After two decades, the core principles remain unchanged. Cooking is about respecting ingredients, 
                executing clean procedures, and presenting honest dishes without the need for excessive narrative.
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
