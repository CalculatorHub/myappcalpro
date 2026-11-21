import React, { useEffect, useRef, useState } from 'react';

interface AnimatedNumberProps {
  value: number;
  format: (n: number) => string;
  durationMs?: number;
  className?: string;
}

/**
 * Smoothly interpolates displayed numeric results with tabular alignment.
 * Respects prefers-reduced-motion by snapping immediately.
 */
export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  format,
  durationMs = 340,
  className = '',
}) => {
  const safeTarget = Number.isFinite(value) ? value : 0;
  const [displayValue, setDisplayValue] = useState<number>(safeTarget);
  const currentRef = useRef<number>(safeTarget);

  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced || durationMs <= 0) {
      currentRef.current = safeTarget;
      setDisplayValue(safeTarget);
      return;
    }

    const startVal = currentRef.current;
    const delta = safeTarget - startVal;
    if (Math.abs(delta) < 0.0001) {
      currentRef.current = safeTarget;
      setDisplayValue(safeTarget);
      return;
    }

    let rafId = 0;
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / durationMs);
      // Apple-style cubic ease-out
      const eased = 1 - Math.pow(1 - t, 3);
      const next = startVal + delta * eased;
      currentRef.current = next;
      setDisplayValue(next);
      if (t < 1) {
        rafId = requestAnimationFrame(step);
      } else {
        currentRef.current = safeTarget;
        setDisplayValue(safeTarget);
      }
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [safeTarget, durationMs]);

  return <span className={`tabular-nums ${className}`}>{format(displayValue)}</span>;
};
