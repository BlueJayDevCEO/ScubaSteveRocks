import React from 'react';

interface ScubaSteveLogoProps {
  className?: string;
}

// Friendly Robot Diver Mascot
// Using high-res 3D style diver icon for reliability and consistency with favicon
export const SCUBA_STEVE_AVATAR = 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f93f/512.png';

export const ScubaSteveLogo: React.FC<ScubaSteveLogoProps> = ({ className = "" }) => {
  // Ensure we handle class names for sizing properly
  const combinedClassName = `${className} object-contain transition-transform hover:scale-105`.trim();
  
  return (
    <img
      src={SCUBA_STEVE_AVATAR}
      alt="Scuba Steve – AI Dive Buddy"
      className={combinedClassName}
      // Prevent dragging the logo
      draggable={false}
      // Enable CORS in case this image is used in canvas contexts later
      crossOrigin="anonymous"
    />
  );
};