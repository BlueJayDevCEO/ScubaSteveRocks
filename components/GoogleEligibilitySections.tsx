import React from "react";

export const GoogleEligibilitySections: React.FC = () => {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <section id="business" className="mt-10 glass-panel rounded-2xl p-6 sm:p-8 border border-white/20">
        <h2 className="text-2xl sm:text-3xl font-heading font-bold mb-3">Business Description</h2>
        <p className="text-base sm:text-lg opacity-90">
          <strong>Scuba Steve AI</strong> is a digital-native web application for scuba divers and snorkelers.
          It uses AI to help divers identify marine life from photos, improve underwater images, plan safer dives,
          and learn about the ocean in real time.
        </p>

        <h3 className="text-lg sm:text-xl font-semibold mt-6 mb-2">The Problem</h3>
        <ul className="list-disc pl-6 space-y-1 opacity-90">
          <li>Divers often can’t identify marine species after a dive</li>
          <li>Underwater photos lose color and clarity</li>
          <li>New divers lack accessible dive planning and safety guidance</li>
          <li>Ocean education tools are fragmented or outdated</li>
        </ul>

        <h3 className="text-lg sm:text-xl font-semibold mt-6 mb-2">Our Solution</h3>
        <p className="opacity-90">
          Scuba Steve combines AI vision, conversational AI, and dive knowledge into one platform — accessible from any browser,
          anywhere in the world.
        </p>

        <h3 className="text-lg sm:text-xl font-semibold mt-6 mb-2">Target Users</h3>
        <ul className="list-disc pl-6 space-y-1 opacity-90">
          <li>Recreational scuba divers &amp; snorkelers</li>
          <li>Dive instructors &amp; dive centers</li>
          <li>Ocean enthusiasts and citizen scientists</li>
        </ul>
      </section>

      <section id="product" className="mt-6 glass-panel rounded-2xl p-6 sm:p-8 border border-white/20">
        <h2 className="text-2xl sm:text-3xl font-heading font-bold mb-3">Product</h2>
        <p className="opacity-90">
          <strong>Scuba Steve AI — Web App (Live MVP / Early Access)</strong>
        </p>

        <h3 className="text-lg sm:text-xl font-semibold mt-6 mb-2">Core Features</h3>
        <ul className="list-disc pl-6 space-y-1 opacity-90">
          <li>🐟 Marine Life Identification from photos</li>
          <li>📸 Underwater Photo Color Correction</li>
          <li>🤿 Dive Safety &amp; Planning Assistance</li>
          <li>📚 Ocean Education &amp; Species Knowledge</li>
          <li>🌍 Global marine awareness &amp; conservation focus</li>
        </ul>

        <p className="mt-4">
          <span className="font-semibold">Live app:</span>{" "}
          <a className="underline hover:opacity-80" href="https://www.scubasteve.rocks">
            https://www.scubasteve.rocks
          </a>
        </p>

        <p className="mt-2 text-sm opacity-70">
          Tip: Add 3–6 screenshots or a 30–60 sec demo video below this section.
        </p>
      </section>

      <section id="team" className="mt-6 mb-10 glass-panel rounded-2xl p-6 sm:p-8 border border-white/20">
        <h2 className="text-2xl sm:text-3xl font-heading font-bold mb-3">Team</h2>
        <p className="opacity-90">
          <strong>Jarryd-Leigh van der Colff</strong> — Founder &amp; Product Builder
        </p>
        <ul className="list-disc pl-6 space-y-1 opacity-90 mt-3">
          <li>Professional scuba diving instructor (10+ years experience)</li>
          <li>Background in marine education and dive operations</li>
          <li>Building Scuba Steve AI as a global digital dive platform</li>
        </ul>

        <p className="mt-4 opacity-85">
          Scuba Steve AI is currently built and operated by a solo founder, with plans to expand the team as the platform scales.
        </p>

        <p className="mt-3">
          <span className="font-semibold">Contact:</span>{" "}
          <a className="underline hover:opacity-80" href="mailto:steve@scubasteve.rocks">
            steve@scubasteve.rocks
          </a>
        </p>
      </section>
    </div>
  );
};
