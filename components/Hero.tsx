import React from 'react';
import { useTranslation } from 'react-i18next';

export const Hero: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className="relative w-full overflow-hidden">
      {/* Background overlay (keeps your existing ocean / image setup safe) */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80 z-0" />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 pt-20 pb-24 text-center text-white">
        
        {/* Status / Trust Badge */}
        <div className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-semibold shadow-md">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          Live Demo • Built by Divers • Powered by AI
        </div>

        {/* Main Headline */}
        <h1 className="font-heading font-bold text-5xl sm:text-7xl leading-tight mb-6 drop-shadow-[0_4px_6px_rgba(0,0,0,0.6)]">
          {t('hero.title', 'Your AI Dive Buddy')}
        </h1>

        {/* Subheadline */}
        <p className="max-w-3xl mx-auto text-lg sm:text-xl text-white/85 mb-10">
          Identify marine life, plan safer dives, and learn underwater — instantly.
        </p>

        {/* Primary CTA */}
        <div className="flex justify-center">
          <a
            href="#demo"
            className="px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 transition font-semibold shadow-xl"
          >
            Watch the Demo
          </a>
        </div>

        {/* Micro trust line (important for reviewers) */}
        <p className="mt-6 text-xs text-white/60">
          No credit card • No signup required to try
        </p>
      </div>
    </section>
  );
};
