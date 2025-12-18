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
    if (onPrimaryClick) {
      e.preventDefault();
      onPrimaryClick();
    }
  };

  const handleSecondary = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onSecondaryClick) onSecondaryClick();
    else scrollToDemo();
  };

  return (
    <section className="relative w-full overflow-hidden">
      {/* Background overlay (keeps your existing ocean / image setup safe) */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-black/85 z-0" />

      {/* Subtle glow */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full bg-blue-500/10 blur-3xl z-0" />

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 pt-16 sm:pt-20 pb-16 sm:pb-20 text-white">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* LEFT: Copy */}
          <div className="lg:col-span-6 text-center lg:text-left">
            {/* Trust Badge */}
            <div className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/15 text-xs sm:text-sm font-semibold shadow-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              {t('hero.badge', 'Live Demo • Built by Divers • Powered by AI')}
            </div>

            {/* Headline */}
            <h1 className="font-heading font-bold text-5xl sm:text-6xl lg:text-7xl leading-[1.05] drop-shadow-[0_4px_6px_rgba(0,0,0,0.6)]">
              {t('hero.title', 'Meet Scuba Steve')}
              <span className="block text-white/90">
                {t('hero.subtitleStrong', 'your AI Dive Buddy.')}
              </span>
            </h1>

            {/* Subheadline */}
            <p className="mt-6 max-w-2xl mx-auto lg:mx-0 text-lg sm:text-xl text-white/85">
              {t(
                'hero.subheadline',
                'Identify marine life from photos, plan safer dives, and fix underwater colors — instantly.'
              )}
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
              <a
                href="#try"
                onClick={handlePrimary}
                className="group inline-flex items-center justify-center px-7 py-4 rounded-xl bg-white text-black hover:bg-white/90 transition font-semibold shadow-2xl"
              >
                {t('hero.ctaPrimary', 'Try Free')}
                <span className="ml-2 opacity-70 group-hover:opacity-100 transition">→</span>
              </a>

              <a
                href="#demo"
                onClick={handleSecondary}
                className="inline-flex items-center justify-center px-7 py-4 rounded-xl bg-black/40 hover:bg-black/55 transition font-semibold border border-white/15 backdrop-blur-md"
              >
                {t('hero.ctaSecondary', 'Watch Demo')}
              </a>
            </div>

            {/* Micro trust line */}
            <p className="mt-5 text-xs sm:text-sm text-white/60">
              {t('hero.microcopy', 'No credit card • Built for recreational divers & snorkelers')}
            </p>

            {/* Feature pills */}
            <div className="mt-7 flex flex-wrap gap-2 justify-center lg:justify-start">
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

          {/* RIGHT: Product / Demo Card */}
          <div className="lg:col-span-6">
            <div className="relative rounded-3xl overflow-hidden border border-white/15 bg-black/40 backdrop-blur-md shadow-[0_30px_80px_rgba(0,0,0,0.6)]">
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

              {/* “Preview” area (no real video here; your #demo section has the real one) */}
              <div className="p-6 sm:p-7">
                <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-6">
                  <div className="text-sm text-white/70">
                    {t('hero.cardLine1', 'Upload a photo → get an ID + fun facts')}
                  </div>
                  <div className="mt-2 text-sm text-white/70">
                    {t('hero.cardLine2', 'One-click color correction for underwater shots')}
                  </div>
                  <div className="mt-2 text-sm text-white/70">
                    {t('hero.cardLine3', 'Ask anything: dive safety, sites, gear, planning')}
                  </div>

                  <div className="mt-6 flex items-center gap-3">
                    <button
                      onClick={() => scrollToDemo()}
                      className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 transition font-semibold shadow-xl"
                      type="button"
                    >
                      {t('hero.cardButton', 'Play the Demo')}
                    </button>
                    <div className="text-xs text-white/55">
                      {t('hero.cardHint', 'Takes ~45 seconds')}
                    </div>
                  </div>
                </div>

                {/* Tiny “reviewer friendly” note */}
                <p className="mt-4 text-xs text-white/55">
                  {t(
                    'hero.reviewerNote',
                    'Designed to be fast, simple, and friendly — like a real dive buddy.'
                  )}
                </p>
              </div>
            </div>

            {/* credibility strip */}
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
      </div>
    </section>
  );
};
