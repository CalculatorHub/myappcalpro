import React, { useEffect, useRef } from 'react';

function parseRgbTuple(cssColor: string, fallback: [number, number, number]): [number, number, number] {
  const match = cssColor.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (match) {
    return [Number(match[1]), Number(match[2]), Number(match[3])];
  }
  return fallback;
}

export const InteractiveBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const primaryGlowRef = useRef<HTMLDivElement | null>(null);
  const secondaryGlowRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas || typeof window === 'undefined') return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const coarsePointerQuery = window.matchMedia('(hover: none), (pointer: coarse)');

    const styles = getComputedStyle(document.documentElement);
    const dotSpacing = Math.max(20, parseFloat(styles.getPropertyValue('--bg-dot-spacing')) || 28);
    const glowSpeed = Math.min(0.35, Math.max(0.04, parseFloat(styles.getPropertyValue('--bg-glow-speed')) || 0.11));
    const glowSize = Math.max(260, parseFloat(styles.getPropertyValue('--bg-glow-size')) || 640);
    const glowIntensity = Math.min(1.5, Math.max(0.2, parseFloat(styles.getPropertyValue('--bg-glow-intensity')) || 1));

    const baseDotRgb = parseRgbTuple(
      styles.getPropertyValue('--bg-dot-color'),
      [99, 102, 241]
    );
    const activeDotRgb = parseRgbTuple(
      styles.getPropertyValue('--bg-dot-active-color'),
      [6, 182, 212]
    );

    const isLowPowerMobile = () =>
      coarsePointerQuery.matches ||
      (typeof navigator !== 'undefined' &&
        typeof navigator.hardwareConcurrency === 'number' &&
        navigator.hardwareConcurrency <= 2 &&
        window.innerWidth < 768);

    const isPointerEnabled = () => !reducedMotionQuery.matches && !isLowPowerMobile();

    let width = 0;
    let height = 0;
    let dpr = 1;

    // Cursor targets and smoothed current positions
    let targetX = -9999;
    let targetY = -9999;
    let currentX = -9999;
    let currentY = -9999;
    let coreX = -9999;
    let coreY = -9999;
    let targetAlpha = 0;
    let currentAlpha = 0;
    let rafId: number | null = null;

    const renderFrame = () => {
      if (width <= 0 || height <= 0) return;

      ctx.clearRect(0, 0, width, height);

      const cols = Math.ceil(width / dotSpacing) + 1;
      const rows = Math.ceil(height / dotSpacing) + 1;
      const offsetX = ((width % dotSpacing) / 2) || dotSpacing / 2;
      const offsetY = ((height % dotSpacing) / 2) || dotSpacing / 2;

      const influenceRadius = 210;
      const influenceRadiusSq = influenceRadius * influenceRadius;
      const pointerEnabled = isPointerEnabled();
      const showInteractiveDots = pointerEnabled && currentAlpha > 0.01;

      const baseFill = `rgba(${baseDotRgb[0]}, ${baseDotRgb[1]}, ${baseDotRgb[2]}, 0.16)`;

      // First pass: crisp baseline dots
      ctx.fillStyle = baseFill;
      ctx.beginPath();
      for (let r = 0; r < rows; r++) {
        const py = offsetY + r * dotSpacing;
        for (let c = 0; c < cols; c++) {
          const px = offsetX + c * dotSpacing;
          ctx.moveTo(px + 1.1, py);
          ctx.arc(px, py, 1.1, 0, Math.PI * 2);
        }
      }
      ctx.fill();

      // Second pass: only illuminate dots near the smoothed cursor
      if (showInteractiveDots) {
        const minCol = Math.max(0, Math.floor((currentX - influenceRadius - offsetX) / dotSpacing));
        const maxCol = Math.min(cols - 1, Math.ceil((currentX + influenceRadius - offsetX) / dotSpacing));
        const minRow = Math.max(0, Math.floor((currentY - influenceRadius - offsetY) / dotSpacing));
        const maxRow = Math.min(rows - 1, Math.ceil((currentY + influenceRadius - offsetY) / dotSpacing));

        for (let r = minRow; r <= maxRow; r++) {
          const py = offsetY + r * dotSpacing;
          const dy = py - currentY;
          for (let c = minCol; c <= maxCol; c++) {
            const px = offsetX + c * dotSpacing;
            const dx = px - currentX;
            const distSq = dx * dx + dy * dy;

            if (distSq >= influenceRadiusSq) continue;

            const dist = Math.sqrt(distSq);
            const falloff = 1 - dist / influenceRadius;
            const eased = falloff * falloff; // smooth quadratic radial falloff
            const intensity = eased * currentAlpha * glowIntensity;

            if (intensity <= 0.02) continue;

            // Subtle glow halo around nearby dots
            if (intensity > 0.14) {
              ctx.fillStyle = `rgba(${activeDotRgb[0]}, ${activeDotRgb[1]}, ${activeDotRgb[2]}, ${(intensity * 0.2).toFixed(3)})`;
              ctx.beginPath();
              ctx.arc(px, py, 4.2 * intensity + 1.5, 0, Math.PI * 2);
              ctx.fill();
            }

            // Brightened dot core
            const radius = 1.15 + eased * 1.15;
            const dotAlpha = Math.min(0.9, 0.18 + intensity * 0.68);
            ctx.fillStyle = `rgba(${activeDotRgb[0]}, ${activeDotRgb[1]}, ${activeDotRgb[2]}, ${dotAlpha.toFixed(3)})`;
            ctx.beginPath();
            ctx.arc(px, py, radius, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // Position GPU-composited CSS radial glow layers
      const primaryEl = primaryGlowRef.current;
      const secondaryEl = secondaryGlowRef.current;

      if (primaryEl) {
        const halfPrimary = glowSize / 2;
        primaryEl.style.transform = `translate3d(${(currentX - halfPrimary).toFixed(1)}px, ${(currentY - halfPrimary).toFixed(1)}px, 0)`;
        primaryEl.style.opacity = pointerEnabled
          ? (currentAlpha * glowIntensity).toFixed(3)
          : '0';
      }

      if (secondaryEl) {
        const halfSecondary = (glowSize * 0.52) / 2;
        secondaryEl.style.transform = `translate3d(${(coreX - halfSecondary).toFixed(1)}px, ${(coreY - halfSecondary).toFixed(1)}px, 0)`;
        secondaryEl.style.opacity = pointerEnabled
          ? (currentAlpha * glowIntensity).toFixed(3)
          : '0';
      }
    };

    const tick = () => {
      rafId = null;

      if (!isPointerEnabled()) {
        currentAlpha = 0;
        targetAlpha = 0;
        renderFrame();
        return;
      }

      const dx = targetX - currentX;
      const dy = targetY - currentY;
      const cx = targetX - coreX;
      const cy = targetY - coreY;
      const da = targetAlpha - currentAlpha;

      currentX += dx * glowSpeed;
      currentY += dy * glowSpeed;
      coreX += cx * Math.min(0.32, glowSpeed * 1.65);
      coreY += cy * Math.min(0.32, glowSpeed * 1.65);
      currentAlpha += da * 0.12;

      renderFrame();

      const stillMoving =
        Math.abs(dx) > 0.25 ||
        Math.abs(dy) > 0.25 ||
        Math.abs(cx) > 0.25 ||
        Math.abs(cy) > 0.25 ||
        Math.abs(da) > 0.005;

      if (stillMoving) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    const scheduleFrame = () => {
      if (rafId === null) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      renderFrame();
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isPointerEnabled()) return;
      if (e.pointerType && e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;

      if (targetAlpha === 0 && currentX < -1000) {
        currentX = e.clientX;
        currentY = e.clientY;
        coreX = e.clientX;
        coreY = e.clientY;
      }

      targetX = e.clientX;
      targetY = e.clientY;
      targetAlpha = 1;
      scheduleFrame();
    };

    const handlePointerLeave = () => {
      if (!isPointerEnabled()) return;
      targetAlpha = 0;
      scheduleFrame();
    };

    handleResize();

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.addEventListener('mouseleave', handlePointerLeave);
    window.addEventListener('blur', handlePointerLeave);

    const handlePreferenceChange = () => {
      if (!isPointerEnabled()) {
        targetAlpha = 0;
        currentAlpha = 0;
      }
      renderFrame();
    };
    reducedMotionQuery.addEventListener('change', handlePreferenceChange);
    coarsePointerQuery.addEventListener('change', handlePreferenceChange);

    return () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('mouseleave', handlePointerLeave);
      window.removeEventListener('blur', handlePointerLeave);
      reducedMotionQuery.removeEventListener('change', handlePreferenceChange);
      coarsePointerQuery.removeEventListener('change', handlePreferenceChange);
    };
  }, []);

  return (
    <div ref={containerRef} aria-hidden="true" className="interactive-bg no-print">
      <div className="interactive-bg-ambient" />
      <div className="interactive-bg-mobile-aura" />
      <div ref={primaryGlowRef} className="interactive-bg-glow-primary" />
      <div ref={secondaryGlowRef} className="interactive-bg-glow-secondary" />
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" />
    </div>
  );
};
