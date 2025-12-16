// components/StartupSection.tsx
import React from "react";

export default function StartupSection() {
  return (
    <section id="startup" className="relative z-20 max-w-5xl mx-auto px-6 py-20">
      {/* Glass panel */}
      <div
        className="
          rounded-3xl
          bg-black/40
          backdrop-blur-xl
          border border-white/20
          shadow-2xl
          p-8 sm:p-12
        "
      >
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
          Startup
        </h2>

        <p className="mt-4 text-lg text-white/95 leading-relaxed">
          <strong className="text-white">
            Scuba Steve AI is a digital-native web platform for scuba divers and
            snorkelers worldwide.
          </strong>{" "}
          It uses AI to help ocean explorers identify marine life from photos,
          learn dive safety, plan dives, and improve underwater photos — instantly,
          from any device.
        </p>

        {/* Divider */}
        <div className="my-8 h-px bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent" />

        <h3 className="mt-8 text-xl font-bold text-cyan-300">
          Business description
        </h3>
        <p className="mt-2 text-white/90 leading-relaxed">
          Scuba Steve AI helps divers and ocean explorers learn faster and dive
          smarter with AI tools built for the ocean. Our target audience is
          recreational scuba divers, snorkelers, instructors, and dive travelers
          globally.
        </p>

        <h3 className="mt-8 text-xl font-bold text-cyan-300">
          What problem we solve
        </h3>
        <p className="mt-2 text-white/90 leading-relaxed">
          Divers often struggle to identify species, improve underwater photos,
          and learn best practices without a guide. Scuba Steve brings an
          always-on “dive buddy” experience that supports safer, more educational
          diving.
        </p>

        <h3 className="mt-8 text-xl font-bold text-cyan-300">
          Product
        </h3>
        <ul className="mt-3 list-disc pl-6 space-y-2 text-white/90">
          <li>AI marine life identification (from underwater photos)</li>
          <li>Underwater photo color correction</li>
          <li>Dive planning & safety guidance</li>
          <li>Learning tools and Q&amp;A for divers</li>
          <li>Conservation-first mindset (25% of proceeds to ocean conservation)</li>
        </ul>

        <h3 className="mt-8 text-xl font-bold text-cyan-300">
          Team
        </h3>
        <p className="mt-2 text-white/90 leading-relaxed">
          <strong className="text-white">
            Founder: Jarryd-Leigh van der Colff (Blue Jay)
          </strong>{" "}
          — scuba instructor with 10+ years of experience and ocean educator.
          Building Scuba Steve AI as a scalable cloud-based product for the
          global diving community.
        </p>

        <h3 className="mt-8 text-xl font-bold text-cyan-300">
          Current stage
        </h3>
        <p className="mt-2 text-white/90 leading-relaxed">
          Scuba Steve AI is in active development with a live web demo and early
          user testing. Core features are live, and the platform is being
          expanded with additional AI tools and subscription tiers.
        </p>

        <div className="mt-10 flex flex-wrap gap-4">
          <a
            href="https://scubasteve.rocks"
            target="_blank"
            rel="noreferrer"
            className="
              px-6 py-3 rounded-xl font-semibold
              bg-cyan-500/25 hover:bg-cyan-500/40
              text-white
              border border-cyan-300/40
              transition-colors
              shadow-lg
            "
          >
            Open Live Demo
          </a>
        </div>
      </div>
    </section>
  );
}
