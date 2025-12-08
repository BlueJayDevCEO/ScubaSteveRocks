
import React, { useState, useEffect } from 'react';

interface ScubaSteveLogoProps {
  className?: string;
  src?: string;
}

// Friendly Robot Diver Mascot (Default Fallback)
export const SCUBA_STEVE_AVATAR = 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f93f/512.png';

export const ScubaSteveLogo: React.FC<ScubaSteveLogoProps> = ({ className = "", src }) => {
  const [imgSrc, setImgSrc] = useState(src || SCUBA_STEVE_AVATAR);
  const [hasError, setHasError] = useState(false);

  // Update internal state if the prop changes (e.g. config loads later)
  useEffect(() => {
    if (src) {
      setImgSrc(src);
      setHasError(false);
    }
  }, [src]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(SCUBA_STEVE_AVATAR);
    }
  };

  // Ensure we handle class names for sizing properly
  const combinedClassName = `${className} object-contain transition-transform hover:scale-105`.trim();
  
  return (
    <img
      src={imgSrc}
      alt="Scuba Steve – AI Dive Buddy"
      className={combinedClassName}
      onError={handleError}
      // Prevent dragging the logo
      draggable={false}
    />
  );
};
