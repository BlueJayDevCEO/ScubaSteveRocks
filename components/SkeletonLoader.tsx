
import React from 'react';

interface SkeletonLoaderProps {
  className?: string;
  type?: 'line' | 'block' | 'circle';
  width?: string;
  height?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  className = '',
  type = 'line',
  width,
  height,
}) => {
  const baseClasses = 'bg-light-bg dark:bg-dark-bg animate-pulse';
  const typeClasses = {
    line: 'h-4 rounded',
    block: 'rounded-lg',
    circle: 'rounded-full',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = width;
  if (height) style.height = height;

  return (
    <div
      className={`${baseClasses} ${typeClasses[type]} ${className}`}
      style={style}
    />
  );
};
