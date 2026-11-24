import React, { useId } from 'react';

interface GoldCrestMarkProps {
  size?: number;
  animate3D?: boolean;
  className?: string;
}

/**
 * Interactive 3D Aurora Rupee Crest with beveled metallic cyan-indigo-violet rim and deep navy core.
 */
export const GoldCrestMark: React.FC<GoldCrestMarkProps> = ({
  size = 36,
  animate3D = true,
  className = '',
}) => {
  const uid = useId().replace(/:/g, '');
  const rimGrad = `crest-rim-${uid}`;
  const faceGrad = `crest-face-${uid}`;
  const symbolGrad = `crest-sym-${uid}`;

  return (
    <span
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${
        animate3D ? 'crest-3d-float' : ''
      } ${className}`}
      style={{ width: size, height: size, perspective: '600px' }}
      aria-hidden="true"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        className="drop-shadow-[0_6px_16px_rgba(99,102,241,0.48)]"
      >
        <defs>
          <linearGradient id={rimGrad} x1="6" y1="6" x2="58" y2="58" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#06B6D4" />
            <stop offset="42%" stopColor="#2563EB" />
            <stop offset="76%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#D946EF" />
          </linearGradient>
          <radialGradient id={faceGrad} cx="32%" cy="28%" r="74%">
            <stop offset="0%" stopColor="#16213E" />
            <stop offset="58%" stopColor="#0B1020" />
            <stop offset="100%" stopColor="#080D1B" />
          </radialGradient>
          <linearGradient id={symbolGrad} x1="18" y1="16" x2="46" y2="50" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="48%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#D946EF" />
          </linearGradient>
        </defs>

        {/* Outer Aurora beveled medallion */}
        <rect
          x="2.5"
          y="2.5"
          width="59"
          height="59"
          rx="16"
          fill={`url(#${faceGrad})`}
          stroke={`url(#${rimGrad})`}
          strokeWidth="2.5"
        />

        {/* Inner recessed hairline ring */}
        <rect
          x="7.5"
          y="7.5"
          width="49"
          height="49"
          rx="12"
          stroke="#6366F1"
          strokeOpacity="0.36"
          strokeWidth="1"
        />

        {/* Beveled 3D Rupee monogram */}
        <path
          d="M21 19.5H43M21 27.5H43M30.5 19.5C35.8 19.5 39 22.8 39 27.5C39 32.3 35.6 35.8 28.5 35.8H22.5L38.5 47.5"
          stroke={`url(#${symbolGrad})`}
          strokeWidth="4.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
};
