import React from "react";
import { useTranslation } from "react-i18next";

type HeroProps = {
  onPrimaryClick?: () => void; // open login / start free
};

export const Hero: React.FC<HeroProps> = ({ onPrimaryClick }) => {
  const { t } = useTranslation();

  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    else window.location.hash = `#${id}`;
  };

  const handlePrimary = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onPrimaryClick) onPrimaryClick();
    else scrollToId("try");
  };

  return (
    <section className="relative w-full overflow-hidden">
      {/* Background overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-black/85 z-0" />
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full bg-cyan-400/10 blur-3xl z-0" />
      <div className="absolute -bottom-40 right-[-140px] w-[520px] h-[520px] rounded-full bg-blue-500/10 blur-3xl z-0" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 pt-14 sm:pt-20 pb-12 sm:pb-16 text-white">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* LEFT */}
          <div className="lg:col-span-6 text-center lg:text-left">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/45 backdrop-blur-md border border-white/15 text-xs sm:text-sm font-semibold shadow-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              {t("hero.badge", "Free demo • Works on mobile • Built by divers")}
            </div>

            {/* Headline */}
            <h1 className="font-heading font-extrabold text-5xl sm:text-6xl lg:text-7xl leading-[1.02] tracking-tight drop-shadow-[0_8px_20px_rgba(0,0,0,0.55)]">
              {t("hero.titleA", "Your AI")}
              <span className="block text-white">
                {t("hero.titleB", "Dive Buddy")}
              </span>
            </h1>

            <p className="mt-6 max-w-2xl mx-auto lg:mx-0 text-lg sm:text-xl text-white/85">
              {t(
                "hero.subheadline",
                "Identify marine life, plan safer dives, and fix underwater colors — instantly."
              )}
            </p>

            {/* SINGLE CTA */}
            <div className="mt-8 flex justify-center lg:justify-start">
              <a
                href="#try"
                onClick={handlePrimary}
                className="group inline-flex items-center justify-center px-8 py-4 rounded-2xl bg-white text-black hover:bg-white/90 transition font-bold shadow-[0_25px_60px_rgba(0,0,0,0.55)]"
              >
                {t("hero.ctaPrimary", "Try Scuba Steve")}
                <span className="ml-2 opacity-70 group-hover:opacity-100 transition">
                  →
                </span>
              </a>
            </div>

            <p className="mt-4 text-xs sm:text-sm text-white/60">
              {t(
                "hero.microcopy",
                "No credit card • Built for recreational divers & snorkelers"
              )}
            </p>

            {/* Pills */}
            <div className="mt-6 flex flex-wrap gap-2 justify-center lg:justify-start">
              {[
                t("hero.p1", "🐟 Marine ID"),
                t("hero.p2", "📸 Photo Fix"),
                t("hero.p3", "🤿 Dive Planning"),
                t("hero.p4", "🌍 Sightings Map"),
                t("hero.p5", "♻️ Conservation-first"),
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

          {/* RIGHT: Static Demo Card (non-clickable) */}
          <div className="lg:col-span-6">
            <div className="relative rounded-3xl overflow-hidden border border-white/15 bg-black/35 backdrop-blur-md shadow-[0_35px_90px_rgba(0,0,0,0.65)]">
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-yellow-300/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-green-400/80" />
                </div>
                <div className="text-xs text-white/60">
                  {t("hero.cardTitle", "Product Preview")}
                </div>
              </div>

              <div className="p-5 sm:p-6">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6">
                  <div className="text-sm text-white/80 font-semibold">
                    {t("hero.cardLine1", "Marine ID + Photo Fix")}
                  </div>
                  <div className="mt-1 text-xs text-white/55">
                    {t(
                      "hero.cardLine2",
                      "See a real walkthrough in the demo video below."
                    )}
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                    <div className="rounded-2xl bg-white/5 border border-white/10 p-3">
                      <div className="text-lg font-extrabold">AI</div>
                      <div className="text-xs text-white/60">Dive Buddy</div>
                    </div>
                    <div className="rounded-2xl bg-white/5 border border-white/10 p-3">
                      <div className="text-lg font-extrabold">ID</div>
                      <div className="text-xs text-white/60">Marine Life</div>
                    </div>
                    <div className="rounded-2xl bg-white/5 border border-white/10 p-3">
                      <div className="text-lg font-extrabold">Fix</div>
                      <div className="text-xs text-white/60">Photos</div>
                    </div>
                  </div>
                </div>

                <p className="mt-4 text-xs text-white/55">
                  {t(
                    "hero.note",
                    "Watch the full demo in the footer — no signup required."
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 sm:mt-14 h-px w-full bg-white/10" />
      </div>
    </section>
  );
};
