import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  size: number;
  opacity: number;
  color: string;
}

const COLORS = ['#C9A45C', '#D4AF37', '#8B6914', '#E0C040', '#ffffff'];

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const frameRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Create particles
    const count = 80;
    particlesRef.current = Array.from({ length: count }, () => ({
      x: Math.random(),
      y: Math.random(),
      z: Math.random(),
      vx: (Math.random() - 0.5) * 0.0003,
      vy: (Math.random() - 0.5) * 0.0003,
      vz: (Math.random() - 0.5) * 0.001,
      size: Math.random() * 2.5 + 0.5,
      opacity: Math.random() * 0.6 + 0.1,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    }));

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: (e.clientX - rect.left) / canvas.width,
        y: (e.clientY - rect.top) / canvas.height,
      };
    };
    window.addEventListener('mousemove', handleMouseMove);

    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      const fov = 400;
      const mx = mouseRef.current.x - 0.5;
      const my = mouseRef.current.y - 0.5;

      particlesRef.current.forEach((p) => {
        // Update position
        p.x += p.vx + mx * 0.0001;
        p.y += p.vy + my * 0.0001;
        p.z += p.vz;

        // Wrap around
        if (p.x < 0) p.x = 1;
        if (p.x > 1) p.x = 0;
        if (p.y < 0) p.y = 1;
        if (p.y > 1) p.y = 0;
        if (p.z < 0) p.z = 1;
        if (p.z > 1) p.z = 0;

        // 3D perspective projection
        const scale = fov / (fov + (p.z - 0.5) * 400);
        const px = (p.x - 0.5) * W * scale + W / 2;
        const py = (p.y - 0.5) * H * scale + H / 2;
        const size = p.size * scale * 1.5;
        const opacity = p.opacity * scale;

        ctx.beginPath();
        ctx.arc(px, py, Math.max(0.1, size), 0, Math.PI * 2);
        ctx.fillStyle = p.color + Math.round(opacity * 255).toString(16).padStart(2, '0');
        ctx.fill();
      });

      // Draw connecting lines between nearby particles
      const pts = particlesRef.current;
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const scale1 = fov / (fov + (pts[i].z - 0.5) * 400);
          const scale2 = fov / (fov + (pts[j].z - 0.5) * 400);
          const x1 = (pts[i].x - 0.5) * W * scale1 + W / 2;
          const y1 = (pts[i].y - 0.5) * H * scale1 + H / 2;
          const x2 = (pts[j].x - 0.5) * W * scale2 + W / 2;
          const y2 = (pts[j].y - 0.5) * H * scale2 + H / 2;
          const dist = Math.hypot(x2 - x1, y2 - y1);
          if (dist < 100) {
            const alpha = (1 - dist / 100) * 0.12;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.strokeStyle = `rgba(201,164,92,${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      frameRef.current = requestAnimationFrame(draw);
    };

    frameRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    />
  );
}
