import React from 'react';
import { useTranslation } from 'react-i18next';

export const Hero: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      {/* ================= HERO SECTION ================= */}
      <section className="relative w-full text-center text-white pt-10 pb-32 sm:pt-20 sm:pb-40 overflow-hidden">
        {/* Background overlay (keeps existing look safe) */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80 z-0" />

        {/* Content */}
        <div className="relative z-10 px-4 flex flex-col items-center">
          {/* Status Badge */}
          <div className="mb-5 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-semibold text-white shadow-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Free • Works Offline • No Sign-up Required to Try
          </div>

          {/* Headline (KEEP – Google already liked this) */}
          <h1 className="font-heading font-bold text-5xl sm:text-7xl leading-tight mb-6 drop-shadow-[0_4px_6px_rgba(0,0,0,0.6)]">
            {t('hero.title', 'Your AI Dive Buddy')}
          </h1>

          {/* Subheadline (Stitch polish) */}
          <p className="max-w-3xl mx-auto text-lg sm:text-xl text-white/85 mb-10">
            Identify marine life, plan safer dives, and learn underwater — instantly.
            Built by real divers, powered by AI.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="#demo"
              className="px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 transition font-semibold shadow-xl"
            >
              Watch the Demo
            </a>
            <a
              href="/app"
              className="px-8 py-4 rounded-xl bg-white/10 hover:bg-white/20 transition font-semibold border border-white/30"
            >
              Try Scuba Steve
            </a>
          </div>
        </div>
      </section>

      {/* ================= DEMO VIDEO (CRITICAL FOR GOOGLE) ================= */}
      <section
        id="demo"
        className="relative z-20 max-w-6xl mx-auto px-4 -mt-32 pb-24"
      >
        <div className="rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-black">
          <video
            src="https://firebasestorage.googleapis.com/v0/b/scubasteverocks-1b9a9.firebasestorage.app/o/Public%2F16.12.2025_10.48.40_REC.mp4?alt=media"
            controls
            playsInline
            preload="metadata"
            className="w-full h-auto"
          />
        </div>

        {/* Demo caption (helps reviewers) */}
        <p className="mt-4 text-center text-sm text-gray-400">
          Live product demo — AI marine identification, dive assistance, and photo correction.
        </p>
      </section>

      {/* ================= STITCH-STYLE EXPLAINER ================= */}
      <section className="max-w-6xl mx-auto px-4 pb-24 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-6">
          What Scuba Steve Can Do
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-2">🐟 Marine Life ID</h3>
            <p className="text-sm text-gray-300">
              Upload underwater photos and instantly identify fish, sharks, rays, and more.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-2">🤿 Dive Planning & Safety</h3>
            <p className="text-sm text-gray-300">
              Get AI-powered guidance on dive profiles, air usage, and safer decisions.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-2">📸 Photo Color Correction</h3>
            <p className="text-sm text-gray-300">
              Restore underwater colors instantly — no editing skills required.
            </p>
          </div>
        </div>
      </section>
    </>
  );
};
