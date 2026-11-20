import { ReactNode, useRef } from 'react';

interface Card3DProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  as?: 'article' | 'div';
}

export function Card3D({ children, className = '', onClick, as: Tag = 'article' }: Card3DProps) {
  const cardRef = useRef<HTMLElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const shimmerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const card = cardRef.current;
    const glow = glowRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rotX = ((y - cy) / cy) * -10;
    const rotY = ((x - cx) / cx) * 10;

    card.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(10px)`;
    card.style.boxShadow = `
      ${-rotY * 1.2}px ${rotX * 1.2}px 40px rgba(0,0,0,0.6),
      0 0 60px rgba(245,184,0,0.08),
      inset 0 1px 0 rgba(255,255,255,0.12)
    `;

    if (glow) {
      glow.style.opacity = '1';
      glow.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(245,184,0,0.14) 0%, transparent 65%)`;
    }
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    const glow = glowRef.current;
    if (card) {
      card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
      card.style.boxShadow = '';
    }
    if (glow) glow.style.opacity = '0';
  };

  return (
    <Tag
      // @ts-expect-error ref polymorphism
      ref={cardRef}
      className={`card card-hover flex flex-col justify-between relative overflow-hidden cursor-pointer ${className}`}
      style={{
        transition: 'transform 0.18s ease, box-shadow 0.18s ease',
        transformStyle: 'preserve-3d',
        willChange: 'transform',
      }}
      onMouseMove={handleMouseMove as never}
      onMouseLeave={handleMouseLeave as never}
      onClick={onClick}
    >
      {/* Dynamic mouse-follow glow */}
      <div
        ref={glowRef}
        aria-hidden="true"
        style={{ opacity: 0, transition: 'opacity 0.3s ease', pointerEvents: 'none' }}
        className="absolute inset-0 z-0 rounded-2xl"
      />
      {/* Top shimmer edge */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(245,184,0,0.5), transparent)' }}
      />
      {/* Left shimmer edge */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 bottom-0 w-px"
        style={{ background: 'linear-gradient(180deg, rgba(245,184,0,0.3), transparent, transparent)' }}
      />
      <div ref={shimmerRef} className="relative z-10 h-full">{children}</div>
    </Tag>
  );
}
