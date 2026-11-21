import React from 'react';
import { Calculator, RotateCcw } from 'lucide-react';

interface CalcActionBarProps {
  onCalculate: () => void;
  onReset: () => void;
  calculateLabel?: string;
}

export const CalcActionBar: React.FC<CalcActionBarProps> = ({
  onCalculate,
  onReset,
  calculateLabel = 'Calculate',
}) => {
  return (
    <div className="flex flex-wrap items-center gap-2.5 pt-2 no-print">
      <button
        type="button"
        onClick={onCalculate}
        className="gold-shimmer-btn inline-flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold whitespace-nowrap cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F5D76E]"
      >
        <Calculator className="h-4 w-4" aria-hidden="true" />
        <span>{calculateLabel}</span>
      </button>

      <button
        type="button"
        onClick={onReset}
        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#D4AF37]/25 bg-[#111111] px-3.5 py-2.5 text-sm font-medium text-[#A1A1AA] transition-colors hover:border-[#D4AF37]/60 hover:text-white whitespace-nowrap cursor-pointer focus-visible:outline-2 focus-visible:outline-[#D4AF37]"
      >
        <RotateCcw className="h-4 w-4" aria-hidden="true" />
        <span>Reset</span>
      </button>
    </div>
  );
};
