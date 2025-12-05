import React from 'react';
import { useTranslation } from 'react-i18next';

export const Hero: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className="relative text-center text-white hero-section w-full pt-8 pb-24 sm:py-16 sm:pb-32">
        {/* Content Overlay */}
        <div className="relative z-10 px-4 flex flex-col items-center">
            
            {/* Value Prop Badge */}
            <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-semibold text-cyan-100 animate-fade-in">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Free &bull; Works Offline &bull; No Sign-up Required to Try
            </div>

            <h1 className="font-heading font-bold text-5xl sm:text-7xl leading-tight mb-6 drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] text-transparent bg-clip-text bg-gradient-to-b from-white to-blue-100">
                {t('hero.title', 'Your AI Dive Buddy')}
            </h1>
            
        </div>
    </section>
  );
};