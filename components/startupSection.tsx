// components/StartupSection.tsx
import React from "react";

export default function StartupSection() {
  return (
    <section id="startup" className="max-w-5xl mx-auto px-6 py-16">
      <h2 className="text-3xl font-bold">Startup</h2>

      <p className="mt-4 text-lg">
        <strong>Scuba Steve AI is a digital-native web platform for scuba divers and snorkelers worldwide.</strong>{" "}
        It uses AI to help ocean explorers identify marine life from photos, learn dive safety, plan dives, and improve
        underwater photos—instantly, from any device.
      </p>

      <h3 className="mt-10 text-xl font-semibold">Business description</h3>
      <p className="mt-2">
        Scuba Steve AI helps divers and ocean explorers learn faster and dive smarter with AI tools built for the ocean.
        Our target audience is recreational scuba divers, snorkelers, instructors, and dive travelers globally.
      </p>

      <h3 className="mt-10 text-xl font-semibold">What problem we solve</h3>
      <p className="mt-2">
        Divers often struggle to identify species, improve underwater photos, and learn best practices without a guide.
        Scuba Steve brings an always-on “dive buddy” experience that supports safer, more educational diving.
      </p>

      <h3 className="mt-10 text-xl font-semibold">Product</h3>
      <ul className="mt-3 list-disc pl-6 space-y-2">
        <li>AI marine life identification (from underwater photos)</li>
        <li>Underwater photo color correction</li>
        <li>Dive planning + safety guidance</li>
        <li>Learning tools and Q&amp;A for divers</li>
        <li>Conservation-first mindset (25% of proceeds to ocean conservation)</li>
      </ul>

      <h3 className="mt-10 text-xl font-semibold">Team</h3>
      <p className="mt-2">
        <strong>Founder: Jarryd-Leigh van der Colff (Blue Jay)</strong> — scuba instructor with 10+ years of experience
        and ocean educator. Building Scuba Steve AI as a scalable cloud-based product for the global diving community.
      </p>

      <h3 className="mt-10 text-xl font-semibold">Current stage</h3>
      <p className="mt-2">
        Scuba Steve AI is in active development with a live web demo and early user testing. Core features are live, and
        the platform is being expanded with additional AI tools and subscription tiers.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <a
          href="https://scubasteve.rocks"
          target="_blank"
          rel="noreferrer"
          className="px-5 py-3 rounded-xl font-semibold shadow"
        >
          Open Live Demo
        </a>

        {/* Optional: add Loom/YouTube link later */}
        {/* <a href="YOUR_DEMO_VIDEO_LINK" target="_blank" rel="noreferrer" className="px-5 py-3 rounded-xl font-semibold shadow">
          Watch Demo Video
        </a> */}
      </div>
    </section>
  );
}

