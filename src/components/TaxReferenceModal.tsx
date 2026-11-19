import { useEffect } from 'react';
import { X } from '@phosphor-icons/react';
import { CONFIGURABLE_TAX_RULES, FinancialYearKey } from '../data/taxRules';
import { formatINR } from '../utils/formatters';

interface TaxReferenceModalProps {
  open: boolean;
  onClose: () => void;
  selectedFY: FinancialYearKey;
}

export function TaxReferenceModal({
  open,
  onClose,
  selectedFY,
}: TaxReferenceModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const rules = CONFIGURABLE_TAX_RULES[selectedFY];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ref-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-[#272727] bg-[#181818] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#272727] pb-4">
          <div>
            <h2 id="ref-modal-title" className="heading-6 text-white">
              CA Quick Reference: Formulas &amp; Tax Slabs
            </h2>
            <p className="caption-5 mt-1 text-zinc-400">
              Active tax rule profile: {rules.financialYear} ({rules.assessmentYear})
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close reference guide"
            className="rounded-lg border border-[#272727] bg-[#1F1F1F] p-2 text-zinc-400 hover:border-[#313131] hover:text-white"
          >
            <X size={16} weight="bold" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-5 space-y-6 text-xs">
          {/* Core Financial Formulas */}
          <div>
            <h3 className="title-4 mb-2.5 text-[#D4AF37]">
              Core Financial Formulas
            </h3>
            <div className="divide-y divide-[#272727] rounded-xl border border-[#272727] bg-[#000000]">
              <div className="flex flex-wrap justify-between gap-2 px-4 py-2.5">
                <span className="font-medium text-zinc-200">Simple Interest</span>
                <code className="font-mono-num text-[#E5C158]">SI = (P × R × T) ÷ 100</code>
              </div>
              <div className="flex flex-wrap justify-between gap-2 px-4 py-2.5">
                <span className="font-medium text-zinc-200">Compound Interest</span>
                <code className="font-mono-num text-[#E5C158]">
                  A = P × (1 + r/n)^(n×t), CI = A − P
                </code>
              </div>
              <div className="flex flex-wrap justify-between gap-2 px-4 py-2.5">
                <span className="font-medium text-zinc-200">Effective Annual Rate</span>
                <code className="font-mono-num text-[#E5C158]">
                  EAR = (1 + r/n)^n − 1
                </code>
              </div>
              <div className="flex flex-wrap justify-between gap-2 px-4 py-2.5">
                <span className="font-medium text-zinc-200">Reducing Balance EMI</span>
                <code className="font-mono-num text-[#E5C158]">
                  EMI = [P × i × (1+i)^N] ÷ [(1+i)^N − 1]
                </code>
              </div>
              <div className="flex flex-wrap justify-between gap-2 px-4 py-2.5">
                <span className="font-medium text-zinc-200">Rupee &amp; Percent Ratio</span>
                <code className="font-mono-num text-[#E5C158]">
                  % = ₹ × 12  |  ₹ = % ÷ 12
                </code>
              </div>
            </div>
          </div>

          {/* Selected FY Slabs */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-[#272727] bg-[#000000] p-4">
              <h4 className="title-4 mb-2 text-white">
                New Regime Slabs ({rules.financialYear})
              </h4>
              <ul className="space-y-1.5 text-zinc-300">
                {rules.newRegime.slabs.map((s) => (
                  <li key={s.label} className="flex justify-between">
                    <span>{s.label}</span>
                    <span className="font-mono-num font-semibold text-[#E5C158]">{s.rate}%</span>
                  </li>
                ))}
              </ul>
              <p className="caption-5 mt-3 border-t border-[#272727] pt-2 text-zinc-400">
                Std. Deduction: {formatINR(rules.newRegime.standardDeductionSalaried, 0)} · Sec 87A
                up to {formatINR(rules.newRegime.rebate87A.maxTaxableIncome, 0)} taxable income.
              </p>
            </div>

            <div className="rounded-xl border border-[#272727] bg-[#000000] p-4">
              <h4 className="title-4 mb-2 text-white">
                Old Regime Slabs (&lt;60 Yrs)
              </h4>
              <ul className="space-y-1.5 text-zinc-300">
                {rules.oldRegime.slabsByAge.below60.map((s) => (
                  <li key={s.label} className="flex justify-between">
                    <span>{s.label}</span>
                    <span className="font-mono-num font-semibold text-zinc-200">{s.rate}%</span>
                  </li>
                ))}
              </ul>
              <p className="caption-5 mt-3 border-t border-[#272727] pt-2 text-zinc-400">
                Std. Deduction: {formatINR(rules.oldRegime.standardDeductionSalaried, 0)} · Sec 87A
                up to {formatINR(rules.oldRegime.rebate87A.maxTaxableIncome, 0)} taxable income.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
