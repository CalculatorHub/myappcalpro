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
    <div className="aurora-card overflow-hidden">
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-white/[0.03] cursor-pointer focus-visible:outline-2 focus-visible:outline-[#06B6D4]"
      >
        <div className="min-w-0">
          <span className="text-sm font-semibold text-[#F8FAFC]">How this is calculated</span>
          <span className="ml-3 hidden font-mono text-xs text-[#38BDF8] sm:inline">
            {formula}
          </span>
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-[#06B6D4]" aria-hidden="true" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-[#94A3B8]" aria-hidden="true" />
        )}
      </button>

      {isOpen && (
        <div className="border-t border-[#6366F1]/20 px-5 py-4 space-y-4">
          <div className="aurora-subcard px-3.5 py-2.5">
            <p className="text-[11px] font-medium text-[#94A3B8]">Formula</p>
            <code className="mt-1 block font-mono text-xs text-[#38BDF8] sm:text-sm">
              {formula}
            </code>
          </div>

          <ol className="space-y-2.5 text-sm">
            {steps.map((step, idx) => (
              <li key={idx} className="flex gap-3">
                <span className="pt-0.5 font-mono text-xs font-semibold text-[#8B5CF6] tabular-nums">
                  {String(idx + 1).padStart(2, '0')}.
                </span>
                <span className="leading-relaxed text-[#E2E8F0] tabular-nums">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
};
