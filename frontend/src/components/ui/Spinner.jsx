import React from 'react';

const sizeMap = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-10 h-10 border-4',
};

export default function Spinner({ size = 'md' }) {
  const sizeClass = sizeMap[size] || sizeMap.md;
  return (
    <span
      className={`${sizeClass} rounded-full border-primary border-t-transparent animate-spin inline-block`}
      role="status"
      aria-label="Loading"
    />
  );
}
