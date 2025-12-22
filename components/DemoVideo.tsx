import React from "react";

const DEMO_VIDEO_PATH = "public/video/demo.mp4";

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
            controls
            playsInline
            preload="metadata"
            crossOrigin="anonymous"
            className="w-full h-auto bg-black"
          >
            <source
              src={`https://firebasestorage.googleapis.com/v0/b/scubasteverocks-1b9a9.firebasestorage.app/o/${encodeURIComponent(
                DEMO_VIDEO_PATH
              )}?alt=media`}
              type="video/mp4"
            />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </section>
  );
};
