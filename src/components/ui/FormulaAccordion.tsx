import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FormulaAccordionProps {
  formula: string;
  steps: string[];
  defaultOpen?: boolean;
}

export const FormulaAccordion: React.FC<FormulaAccordionProps> = ({
  formula,
  steps,
  defaultOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="luxury-card overflow-hidden">
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-white/[0.03] cursor-pointer focus-visible:outline-2 focus-visible:outline-[#D4AF37]"
      >
        <div className="min-w-0">
          <span className="text-sm font-semibold text-white">How this is calculated</span>
          <span className="ml-3 hidden font-mono text-xs text-[#D4AF37] sm:inline">
            {formula}
          </span>
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-[#F5D76E]" aria-hidden="true" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-[#A1A1AA]" aria-hidden="true" />
        )}
      </button>

      {isOpen && (
        <div className="border-t border-[#D4AF37]/18 px-5 py-4 space-y-4">
          <div className="luxury-subcard px-3.5 py-2.5">
            <p className="text-[11px] font-medium text-[#A1A1AA]">Formula</p>
            <code className="mt-1 block font-mono text-xs text-[#F5D76E] sm:text-sm">
              {formula}
            </code>
          </div>

          <ol className="space-y-2.5 text-sm">
            {steps.map((step, idx) => (
              <li key={idx} className="flex gap-3">
                <span className="pt-0.5 font-mono text-xs font-semibold text-[#D4AF37] tabular-nums">
                  {String(idx + 1).padStart(2, '0')}.
                </span>
                <span className="leading-relaxed text-[#E4E4E7] tabular-nums">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
};
