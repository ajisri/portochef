'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

export default function ImpactSection() {
  const { language } = useApp();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeLanguage = mounted ? language : 'id';

  const stats = [
    {
      label: activeLanguage === 'id' ? 'TAHUN' : 'YEARS',
      number: '23',
      desc: activeLanguage === 'id' 
        ? 'Karir profesional kuliner global' 
        : 'Professional global culinary career',
    },
    {
      label: activeLanguage === 'id' ? 'CABANG' : 'OUTLETS',
      number: '50+',
      desc: activeLanguage === 'id' 
        ? 'Mangkokku di 10 kota Indonesia' 
        : 'Mangkokku across 10 Indonesian cities',
    },
    {
      label: activeLanguage === 'id' ? 'PORSI / TAHUN' : 'SERVINGS / YEAR',
      number: activeLanguage === 'id' ? '4 JT+' : '4M+',
      desc: activeLanguage === 'id' 
        ? 'Volume penjualan setiap tahun' 
        : 'Sales volume every year',
    },
    {
      label: activeLanguage === 'id' ? 'MUSIM' : 'SEASONS',
      number: '9',
      desc: activeLanguage === 'id' 
        ? 'Juri utama MasterChef Indonesia' 
        : 'Head judge MasterChef Indonesia',
    },
  ];

  return (
    <section
      id="impact"
      className="relative w-full bg-background text-foreground transition-colors duration-500 overflow-hidden pt-32 pb-32 px-6 md:px-16"
      aria-label="Impact Metrics"
    >
      {/* Subtle Grain Overlay */}
      <div className="grain-overlay opacity-[0.015]" aria-hidden="true"></div>

      <div className="max-w-[1400px] mx-auto w-full relative z-10">
        
        {/* Eyebrow */}
        <span className="text-[12px] uppercase tracking-[0.25em] text-neutral-500 dark:text-neutral-400 mb-16 font-bold block">
          {activeLanguage === 'id' ? 'Dalam Angka' : 'In Numbers'}
        </span>

        {/* 4-Column Grid on Desktop, 2x2 Grid on Mobile */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border-y border-border-light dark:border-neutral-800">
          {stats.map((stat, i) => {
            // Determine borders dynamically for 2x2 mobile and 4-column desktop
            let borderClasses = "border-border-light dark:border-neutral-800 ";
            if (i === 0) {
              borderClasses += "border-r border-b md:border-b-0";
            } else if (i === 1) {
              borderClasses += "border-b md:border-b-0 md:border-r";
            } else if (i === 2) {
              borderClasses += "border-r";
            } else {
              borderClasses += "border-none";
            }

            return (
              <div 
                key={i} 
                className={`flex flex-col items-start p-8 md:p-12 ${borderClasses} transition-all duration-300`}
              >
                {/* Label */}
                <span className="text-[11px] uppercase tracking-[0.1em] text-neutral-500 dark:text-neutral-400 font-bold mb-4">
                  {stat.label}
                </span>

                {/* Big Number */}
                <span className="text-[48px] md:text-[72px] lg:text-[96px] font-serif font-bold leading-none tracking-tighter mb-4 text-foreground">
                  {stat.number}
                </span>

                {/* Description */}
                <p className="text-[13px] font-sans leading-relaxed text-neutral-600 dark:text-neutral-400 max-w-[200px]">
                  {stat.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Closing scale statement */}
        <div className="mt-16 md:mt-24 text-left">
          <p className="text-[18px] md:text-[24px] font-sans font-medium leading-relaxed tracking-tight text-foreground max-w-xl">
            {activeLanguage === 'id' 
              ? '"Sistem yang dibangun untuk skala — bukan untuk satu dapur."'
              : '"A system built for scale — not for a single kitchen."'}
          </p>
        </div>

      </div>
    </section>
  );
}
