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
        className="max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-border-2 bg-bg-2 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border-2 pb-4">
          <div>
            <h2 id="ref-modal-title" className="heading-6 text-text-0">
              CA Quick Reference: Formulas &amp; Tax Slabs
            </h2>
            <p className="caption-5 mt-1 text-text-4">
              Active tax rule profile: {rules.financialYear} ({rules.assessmentYear})
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close reference guide"
            className="rounded-lg border border-border-2 bg-bg-3 p-2 text-text-4 hover:border-border-3 hover:text-text-0"
          >
            <X size={16} weight="bold" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-5 space-y-6 text-xs">
          {/* Core Financial Formulas */}
          <div>
            <h3 className="title-4 mb-2.5 text-gold">
              Core Financial Formulas
            </h3>
            <div className="divide-y divide-border-2 rounded-xl border border-border-2 bg-bg-0">
              <div className="flex flex-wrap justify-between gap-2 px-4 py-2.5">
                <span className="font-medium text-text-2">Simple Interest</span>
                <code className="font-mono-num text-gold-hover">SI = (P × R × T) ÷ 100</code>
              </div>
              <div className="flex flex-wrap justify-between gap-2 px-4 py-2.5">
                <span className="font-medium text-text-2">Compound Interest</span>
                <code className="font-mono-num text-gold-hover">
                  A = P × (1 + r/n)^(n×t), CI = A − P
                </code>
              </div>
              <div className="flex flex-wrap justify-between gap-2 px-4 py-2.5">
                <span className="font-medium text-text-2">Effective Annual Rate</span>
                <code className="font-mono-num text-gold-hover">
                  EAR = (1 + r/n)^n − 1
                </code>
              </div>
              <div className="flex flex-wrap justify-between gap-2 px-4 py-2.5">
                <span className="font-medium text-text-2">Reducing Balance EMI</span>
                <code className="font-mono-num text-gold-hover">
                  EMI = [P × i × (1+i)^N] ÷ [(1+i)^N − 1]
                </code>
              </div>
              <div className="flex flex-wrap justify-between gap-2 px-4 py-2.5">
                <span className="font-medium text-text-2">Rupee &amp; Percent Ratio</span>
                <code className="font-mono-num text-gold-hover">
                  % = ₹ × 12  |  ₹ = % ÷ 12
                </code>
              </div>
            </div>
          </div>

          {/* Selected FY Slabs */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-border-2 bg-bg-0 p-4">
              <h4 className="title-4 mb-2 text-text-0">
                New Regime Slabs ({rules.financialYear})
              </h4>
              <ul className="space-y-1.5 text-text-2">
                {rules.newRegime.slabs.map((s) => (
                  <li key={s.label} className="flex justify-between">
                    <span>{s.label}</span>
                    <span className="font-mono-num font-semibold text-gold-hover">{s.rate}%</span>
                  </li>
                ))}
              </ul>
              <p className="caption-5 mt-3 border-t border-border-2 pt-2 text-text-4">
                Std. Deduction: {formatINR(rules.newRegime.standardDeductionSalaried, 0)} · Sec 87A
                up to {formatINR(rules.newRegime.rebate87A.maxTaxableIncome, 0)} taxable income.
              </p>
            </div>

            <div className="rounded-xl border border-border-2 bg-bg-0 p-4">
              <h4 className="title-4 mb-2 text-text-0">
                Old Regime Slabs (&lt;60 Yrs)
              </h4>
              <ul className="space-y-1.5 text-text-2">
                {rules.oldRegime.slabsByAge.below60.map((s) => (
                  <li key={s.label} className="flex justify-between">
                    <span>{s.label}</span>
                    <span className="font-mono-num font-semibold text-text-2">{s.rate}%</span>
                  </li>
                ))}
              </ul>
              <p className="caption-5 mt-3 border-t border-border-2 pt-2 text-text-4">
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
