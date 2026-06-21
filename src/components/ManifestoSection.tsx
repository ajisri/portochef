'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

export default function ManifestoSection() {
  const { language } = useApp();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Hydration safety: use server-rendered defaults during first client-side pass (hydration)
  const activeLanguage = mounted ? language : 'id';

  return (
    <section
      id="manifesto"
      className="relative w-full min-h-screen flex flex-col justify-start md:justify-center bg-background text-foreground transition-colors duration-500 overflow-hidden pt-48 md:pt-40 pb-24 px-6 md:px-16"
      aria-label="Manifesto"
    >
      {/* Subtle Grain Overlay if present globally, matching other sections */}
      <div className="grain-overlay opacity-[0.015]" aria-hidden="true"></div>

      <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-0 relative z-10">
        <div className="col-span-12 md:col-start-2 md:col-span-7 flex flex-col items-start">

          {/* Group 1: Eyebrow + Pernyataan + Divider + Body */}
          <div className="flex flex-col items-start w-full">
            {/* Eyebrow */}
            <span className="text-[12px] uppercase tracking-[0.25em] text-neutral-500 dark:text-neutral-400 mb-8 font-bold block">
              {activeLanguage === 'id' ? 'Sebuah Keyakinan' : 'A Conviction'}
            </span>

            {/* Pernyataan Utama */}
            <h2 className="text-[32px] md:text-[44px] lg:text-[48px] font-serif font-bold leading-tight mb-8 text-foreground tracking-tight">
              {activeLanguage === 'id' ? (
                <>
                  Masa depan kuliner Nusantara bukan tentang mengubah bentuk.{' '}
                  <span className="italic font-normal block md:inline mt-2 md:mt-0 text-neutral-500 dark:text-neutral-400">
                    Tapi tentang presisi yang belum pernah diterapkan.
                  </span>
                </>
              ) : (
                <>
                  The future of Nusantara culinary is not about changing form.{' '}
                  <span className="italic font-normal block md:inline mt-2 md:mt-0 text-neutral-500 dark:text-neutral-400">
                    But about precision that has never been applied before.
                  </span>
                </>
              )}
            </h2>

            {/* Divider Line */}
            <div className="w-10 h-px bg-foreground/30 mb-8" aria-hidden="true" />

            {/* Body Paragraf */}
            <p className="text-[16px] font-sans leading-relaxed max-w-[520px] text-foreground/80">
              {activeLanguage === 'id'
                ? 'Semua orang berbicara tentang fusion dan plating bergaya Eropa. Saya berbicara tentang hal yang berbeda: kedisiplinan absolut pada bahan yang paling sederhana. Telur yang sempurna lebih sulit dari truffle yang mahal.'
                : 'Everyone speaks of fusion and European-style plating. i am speaks of something else: absolute discipline on the simplest ingredients. A perfect egg is harder than expensive truffles.'}
            </p>
          </div>

          {/* Group 2: Dua Prinsip */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 w-full mt-10 md:mt-12 mb-10 md:mb-12">
            {/* Prinsip 01 */}
            <div
              className="-ml-4 pl-4 flex flex-col gap-3"
              style={{ borderLeft: '1.5px solid currentColor' }}
            >
              <span className="text-[10px] uppercase tracking-wider text-foreground font-bold">
                {activeLanguage === 'id' ? 'Prinsip 01' : 'Principle 01'}
              </span>
              <p className="text-[14px] font-sans leading-relaxed text-foreground/80">
                {activeLanguage === 'id'
                  ? 'Kesempurnaan dalam kesederhanaan — bukan penambahan bahan, tapi penguasaan teknik pada yang sudah ada.'
                  : 'Perfection in simplicity — not the addition of ingredients, but the mastery of technique on what is already there.'}
              </p>
            </div>

            {/* Prinsip 02 */}
            <div
              className="-ml-4 pl-4 flex flex-col gap-3"
              style={{ borderLeft: '1.5px solid currentColor' }}
            >
              <span className="text-[10px] uppercase tracking-wider text-foreground font-bold">
                {activeLanguage === 'id' ? 'Prinsip 02' : 'Principle 02'}
              </span>
              <p className="text-[14px] font-sans leading-relaxed text-foreground/80">
                {activeLanguage === 'id'
                  ? "Sistem menggantikan intuisi — 'secukupnya' diganti dengan presisi yang bisa direplikasi siapapun."
                  : "System replaces intuition — 'to taste' is replaced with precision that can be replicated by anyone."}
              </p>
            </div>
          </div>

          {/* Group 3: CTA Link Naratif */}
          <div className="w-full">
            <a
              href="#product"
              className="group inline-flex items-center gap-4 text-[12px] uppercase tracking-wider font-medium hover:text-foreground/75 transition-colors focus:outline-none focus:ring-1 focus:ring-foreground/50 py-1"
            >
              <span className="w-10 h-px bg-foreground transition-all duration-300 group-hover:w-16" aria-hidden="true" />
              <span>
                {activeLanguage === 'id' ? 'Lihat bagaimana ini diterapkan' : 'See how this is applied'}
              </span>
            </a>
          </div>

        </div>
      </div>
    </section>
  );
}
