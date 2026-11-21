import React, { useEffect, useState } from 'react';
import { GoldCrestMark } from './GoldCrestMark';

export const LuxuryLoader: React.FC = () => {
  const [visible, setVisible] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (!visible) return;
    const fadeTimer = window.setTimeout(() => setFading(true), 420);
    const removeTimer = window.setTimeout(() => setVisible(false), 700);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      role="presentation"
      onClick={() => setVisible(false)}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050505] transition-opacity duration-300 ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center gap-4">
        <GoldCrestMark size={72} />
        <div className="text-center">
          <p className="text-base font-bold tracking-tight text-white">
            CalHub <span className="gold-text-gradient">FinCalc</span>
          </p>
          <p className="mt-1 text-xs text-[#A1A1AA]">Preparing calculator workspace</p>
        </div>
      </div>
    </div>
  );
};
