import { useEffect, useRef } from 'react';

/**
 * A spinning 3D cube logo built with 6 absolutely-positioned faces.
 * Uses inline perspective on the outer wrapper so it's self-contained.
 */
export function Logo3D() {
  const cubeRef = useRef<HTMLDivElement>(null);
  const angleRef = useRef(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const cube = cubeRef.current;
    if (!cube) return;
    const loop = () => {
      angleRef.current = (angleRef.current + 0.55) % 360;
      const a = angleRef.current;
      const tiltX = Math.sin((a * Math.PI) / 180) * 14;
      cube.style.transform = `rotateX(${tiltX}deg) rotateY(${a}deg)`;
      frameRef.current = requestAnimationFrame(loop);
    };
    frameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  const S = 26; // cube side length px
  const H = S / 2;

  const faceBase: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
    fontWeight: 900,
    color: '#1a0f00',
    borderRadius: '3px',
    border: '1px solid rgba(201,164,92,0.5)',
    userSelect: 'none',
    WebkitBackfaceVisibility: 'hidden',
    backfaceVisibility: 'hidden',
  };

  return (
    <span
      aria-hidden="true"
      style={{
        display: 'inline-block',
        width: S,
        height: S,
        flexShrink: 0,
        perspective: `${S * 3.5}px`,
        perspectiveOrigin: '50% 50%',
        // Overflow visible so rotated faces don't clip
        overflow: 'visible',
        verticalAlign: 'middle',
      }}
    >
      <span
        ref={cubeRef}
        style={{
          display: 'block',
          width: S,
          height: S,
          position: 'relative',
          transformStyle: 'preserve-3d',
          willChange: 'transform',
        }}
      >
        {/* Front */}
        <span style={{ ...faceBase, background: 'linear-gradient(135deg,#E2C44A,#A07020)', transform: `translateZ(${H}px)` }}>F</span>
        {/* Back */}
        <span style={{ ...faceBase, background: 'linear-gradient(135deg,#8B6914,#D4AF37)', transform: `rotateY(180deg) translateZ(${H}px)` }}>P</span>
        {/* Right */}
        <span style={{ ...faceBase, background: '#B08830', transform: `rotateY(90deg) translateZ(${H}px)` }} />
        {/* Left */}
        <span style={{ ...faceBase, background: '#6B5010', transform: `rotateY(-90deg) translateZ(${H}px)` }} />
        {/* Top */}
        <span style={{ ...faceBase, background: 'linear-gradient(180deg,#F0D050,#C9A45C)', transform: `rotateX(90deg) translateZ(${H}px)` }} />
        {/* Bottom */}
        <span style={{ ...faceBase, background: '#3A2606', transform: `rotateX(-90deg) translateZ(${H}px)` }} />
      </span>
    </span>
  );
}
