import React from 'react';
import { useTranslation } from 'react-i18next';

type HeroProps = {
  onPrimaryClick?: () => void;   // optional: open login or setActiveView('identify')
  onSecondaryClick?: () => void; // optional: scroll to demo
};

export const Hero: React.FC<HeroProps> = ({ onPrimaryClick, onSecondaryClick }) => {
  const { t } = useTranslation();

  const scrollToDemo = () => {
    const el = document.getElementById('demo');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handlePrimary = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onPrimaryClick) onPrimaryClick();
    // If no handler is provided, do nothing (keeps behavior consistent)
  };

  const handleSecondary = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onSecondaryClick) onSecondaryClick();
    else scrollToDemo();
  };

  return (
    <section className="relative w-full overflow-hidden">
      {/* Background overlay (keeps your existing ocean/image setup safe) */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/90 z-0" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-28 sm:pt-32 pb-16 sm:pb-20 text-white">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* LEFT: Copy */}
          <div className="lg:col-span-6 text-center lg:text-left">
            {/* Trust Badge (cleaner, less noisy) */}
            <div className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/45 backdrop-blur-md border border-white/15 text-xs sm:text-sm font-semibold shadow-md">
              <span className="inline-flex h-2 w-2 rounded-full bg-green-400" />
              {t('hero.badge', 'Live Demo • Built by Divers • Powered by AI')}
            </div>

            {/* HEADLINE HIERARCHY (SEO + conversion) */}
            <h1 className="font-heading font-extrabold text-5xl sm:text-6xl lg:text-7xl leading-[1.05] tracking-tight drop-shadow-[0_10px_28px_rgba(0,0,0,0.75)]">
              {t('hero.subtitleStrong', 'Your AI Dive Buddy')}
            </h1>

            <p className="mt-3 text-white/85 text-lg sm:text-xl font-semibold">
              {t('hero.title', 'Meet Scuba Steve')}
            </p>

            {/* Subheadline */}
            <p className="mt-5 max-w-2xl mx-auto lg:mx-0 text-base sm:text-lg lg:text-xl text-white/80">
              {t(
                'hero.subheadline',
                'Identify marine life from photos, plan safer dives, and fix underwater colors — instantly.'
              )}
            </p>

            {/* CTAs (clear hierarchy, less confusion) */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
              <a
                href="#try"
                onClick={handlePrimary}
                className="group inline-flex items-center justify-center px-7 py-4 rounded-2xl bg-white text-black hover:bg-white/90 transition font-semibold shadow-2xl shadow-black/30"
              >
                {t('hero.ctaPrimary', 'Try Free')}
                <span className="ml-2 opacity-70 group-hover:opacity-100 transition">→</span>
              </a>

              <a
                href="#demo"
                onClick={handleSecondary}
                className="inline-flex items-center justify-center px-7 py-4 rounded-2xl bg-black/35 hover:bg-black/55 transition font-semibold border border-white/15 backdrop-blur-md"
              >
                {t('hero.ctaSecondary', 'Watch Demo')}
              </a>
            </div>

            {/* Micro trust line */}
            <p className="mt-5 text-xs sm:text-sm text-white/60">
              {t('hero.microcopy', 'No credit card • Built for recreational divers & snorkelers')}
            </p>

            {/* Feature pills (kept, but slightly tighter) */}
            <div className="mt-6 flex flex-wrap gap-2 justify-center lg:justify-start">
              {[
                t('hero.pill1', '🐟 Marine ID'),
                t('hero.pill2', '📸 Photo Fix'),
                t('hero.pill3', '🤿 Dive Planning'),
                t('hero.pill4', '🌍 World Map'),
                t('hero.pill5', '♻️ Conservation'),
              ].map((label) => (
                <span
                  key={label}
                  className="px-3 py-1.5 rounded-full text-xs bg-white/10 border border-white/10 backdrop-blur-md"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* RIGHT: Demo Card (more “real product” feel) */}
          <div className="lg:col-span-6">
            <div className="relative rounded-3xl overflow-hidden border border-white/15 bg-black/35 backdrop-blur-md shadow-[0_30px_90px_rgba(0,0,0,0.65)]">
              {/* Top bar */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-yellow-300/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-green-400/80" />
                </div>
                <div className="text-xs text-white/60">
                  {t('hero.cardTitle', 'Scuba Steve — Live Product Demo')}
                </div>
              </div>

              {/* Preview area */}
              <div className="p-6 sm:p-7">
                <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-6">
                  <div className="text-xl sm:text-2xl font-extrabold text-white">
                    {t('hero.cardHeadline', 'Try Scuba Steve live')}
                  </div>

                  <p className="mt-2 text-sm sm:text-base text-white/70">
                    {t(
                      'hero.cardSub',
                      'Upload a photo, ask a dive question, or fix an underwater shot — instantly.'
                    )}
                  </p>

                  <div className="mt-6 flex items-center gap-3">
                    <button
                      onClick={scrollToDemo}
                      className="inline-flex items-center justify-center px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 transition font-semibold shadow-xl shadow-black/30"
                      type="button"
                    >
                      {t('hero.cardButton', 'Scroll to Demo ↓')}
                    </button>

                    <div className="text-xs text-white/55">
                      {t('hero.cardHint', 'Takes ~45 seconds')}
                    </div>
                  </div>
                </div>

                <p className="mt-4 text-xs text-white/55">
                  {t(
                    'hero.reviewerNote',
                    'Designed to be fast, simple, and friendly — like a real dive buddy.'
                  )}
                </p>
              </div>
            </div>

            {/* Credibility strip (kept, slightly more premium) */}
            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-2xl bg-white/5 border border-white/10 p-3">
                <div className="text-lg font-bold">AI</div>
                <div className="text-xs text-white/60">Assist</div>
              </div>
              <div className="rounded-2xl bg-white/5 border border-white/10 p-3">
                <div className="text-lg font-bold">Photo</div>
                <div className="text-xs text-white/60">Fix</div>
              </div>
              <div className="rounded-2xl bg-white/5 border border-white/10 p-3">
                <div className="text-lg font-bold">Dive</div>
                <div className="text-xs text-white/60">Safer</div>
              </div>
            </div>
          </div>
        </div>

        {/* SEO-friendly hidden keywords (optional, very light; safe to remove if you prefer) */}
        <p className="sr-only">
          Scuba Steve AI helps scuba divers and snorkelers identify marine life, plan safer dives, and improve underwater photos.
        </p>
      </div>
    </section>
  );
};
