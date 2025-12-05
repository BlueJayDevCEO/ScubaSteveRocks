
import React, { useState, useRef } from 'react';

interface ImageComparatorProps {
  before: string;
  after: string;
}

export const ImageComparator: React.FC<ImageComparatorProps> = ({ before, after }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSliderPosition(Number(e.target.value));
  };
  
  return (
    <div ref={containerRef} className="relative w-full max-w-lg aspect-video rounded-lg overflow-hidden select-none group mx-auto shadow-lg border border-black/10 dark:border-white/10">
      <img
        src={after}
        alt="After"
        className="absolute inset-0 w-full h-full object-contain bg-black/5 dark:bg-white/5"
        draggable="false"
      />
      <div
        className="absolute inset-0 w-full h-full overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <img
          src={before}
          alt="Before"
          className="absolute inset-0 w-full h-full object-contain bg-black/5 dark:bg-white/5"
          draggable="false"
        />
      </div>
      <div
        className="absolute top-0 bottom-0 bg-white w-1 shadow-[0_0_10px_rgba(0,0,0,0.5)] z-10"
        style={{ left: `calc(${sliderPosition}% - 2px)` }}
      >
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-8 w-8 rounded-full bg-white border-2 border-light-accent dark:border-dark-accent flex items-center justify-center shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-light-accent dark:text-dark-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg>
        </div>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={sliderPosition}
        onChange={handleSliderChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
        aria-label="Image comparison slider"
      />
      <div className="absolute top-2 left-2 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded backdrop-blur-sm pointer-events-none z-10">BEFORE</div>
      <div className="absolute top-2 right-2 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded backdrop-blur-sm pointer-events-none z-10">AFTER</div>
    </div>
  );
};
