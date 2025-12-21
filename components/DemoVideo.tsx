import React from "react";

const DEMO_VIDEO_URL =
  "https://firebasestorage.googleapis.com/v0/b/scubasteverocks-1b9a9.firebasestorage.app/o/public%2Fvideo%2Fdemo.mp4?alt=media&token=30cad5f0-2efd-4d4b-b39e-f2cf4cf1d986";

export const DemoVideo: React.FC = () => {
  return (
    <section id="video-demo" className="relative z-[60] w-full bg-black">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 bg-light-card dark:bg-dark-card shadow-soft dark:shadow-soft-dark">
          <div className="p-5 sm:p-6">
            <h2 className="font-heading font-bold text-2xl sm:text-3xl text-center">
              Product Demo Video
            </h2>
            <p className="mt-2 text-center text-sm sm:text-base text-light-text/80 dark:text-dark-text/80">
              A quick walkthrough of Marine ID, color correction, and core features.
            </p>
          </div>

          <video
            src={DEMO_VIDEO_URL}
            controls
            playsInline
            preload="metadata"
            className="w-full h-auto"
          />
        </div>
      </div>
    </section>
  );
};
