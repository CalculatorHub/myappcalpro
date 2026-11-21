import React, { useId } from 'react';

interface GoldCrestMarkProps {
  size?: number;
  animate3D?: boolean;
  className?: string;
}

/**
 * Interactive 3D Metallic Gold Rupee Crest honoring CalHub FinCalc's beveled emblem identity.
 * Hardware-accelerated CSS 3D depth with metallic champagne specular gradients.
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
        className="drop-shadow-[0_4px_12px_rgba(212,175,55,0.42)]"
      >
        <defs>
          <linearGradient id={rimGrad} x1="6" y1="6" x2="58" y2="58" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFF1B8" />
            <stop offset="35%" stopColor="#F5D76E" />
            <stop offset="70%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#8C6A16" />
          </linearGradient>
          <radialGradient id={faceGrad} cx="35%" cy="28%" r="72%">
            <stop offset="0%" stopColor="#262218" />
            <stop offset="55%" stopColor="#121214" />
            <stop offset="100%" stopColor="#050505" />
          </radialGradient>
          <linearGradient id={symbolGrad} x1="18" y1="16" x2="46" y2="50" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFF5C8" />
            <stop offset="45%" stopColor="#F5D76E" />
            <stop offset="100%" stopColor="#C49622" />
          </linearGradient>
        </defs>

        {/* Outer metallic beveled medallion */}
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
          stroke="#D4AF37"
          strokeOpacity="0.32"
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
