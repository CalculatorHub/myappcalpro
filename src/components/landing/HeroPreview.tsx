import { useState } from 'react';
import { ArrowRight, Calculator, CheckCircle } from '@phosphor-icons/react';
import { CalculatorId } from '../Header';

interface HeroPreviewProps {
  onOpenCalculator: (id: CalculatorId) => void;
}

const PREVIEW_SAMPLES: {
  id: CalculatorId;
  tab: string;
  headline: string;
  inputLabel: string;
  outputLabel: string;
  outputValue: string;
  formula: string;
}[] = [
  {
    id: 'income-tax',
    tab: 'Income Tax',
    headline: 'FY 2026 to 2027 New Regime',
    inputLabel: 'Gross Salary ₹12,75,000',
    outputLabel: 'Estimated Tax Liability',
    outputValue: '₹0',
    formula: '₹75,000 standard deduction plus Section 87A rebate',
  },
  {
    id: 'loan-emi',
    tab: 'Home Loan EMI',
    headline: 'Reducing Balance Schedule',
    inputLabel: 'Loan ₹60,00,000 at 8.75% for 20 years',
    outputLabel: 'Monthly EMI',
    outputValue: '₹53,022.64',
    formula: '240 monthly installments with zero balance drift',
  },
  {
    id: 'compound-interest',
    tab: 'Compound Interest',
    headline: 'Quarterly Compounding Growth',
    inputLabel: 'Principal ₹5,00,000 at 7.5% for 5 years',
    outputLabel: 'Maturity Amount',
    outputValue: '₹7,24,974.08',
    formula: 'Effective Annual Rate 7.71%',
  },
  {
    id: 'percentage-rupee',
    tab: 'Rupee Ratio',
    headline: 'Two Way ₹1 = 12% Converter',
    inputLabel: 'Input ₹5 or 60%',
    outputLabel: 'Converted Output',
    outputValue: '60% / ₹5.00',
    formula: 'Percentage = Rupee Amount × 12',
  },
];

export function HeroPreview({ onOpenCalculator }: HeroPreviewProps) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const current = PREVIEW_SAMPLES[selectedIdx];

  return (
    <div className="rounded-2xl border border-border-3 bg-bg-2 p-4 sm:p-6">
      {/* Inner tab strip: outer rounded-2xl (16px) - p-2 (8px) = rounded-lg (8px) */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div
          role="tablist"
          aria-label="FinCalc Pro calculator preview tabs"
          className="flex flex-wrap gap-2 rounded-xl border border-border-3 bg-bg-0 p-1"
        >
          {PREVIEW_SAMPLES.map((sample, idx) => {
            const active = idx === selectedIdx;
            return (
              <button
                key={sample.id}
                role="tab"
                type="button"
                aria-selected={active}
                onClick={() => setSelectedIdx(idx)}
                className={`button-xsm rounded-lg px-3 py-2 transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold whitespace-nowrap ${
                  active
                    ? 'bg-gold text-bg-0'
                    : 'text-text-4 hover:text-text-0'
                }`}
              >
                {sample.tab}
              </button>
            );
          })}
        </div>

        <span className="caption-4 inline-flex items-center gap-1.5 text-text-4">
          <CheckCircle size={14} weight="fill" className="text-gold" aria-hidden="true" />
          <span>Interactive workspace preview</span>
        </span>
      </div>

      {/* Preview Readout Card */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
        <div className="rounded-xl border border-border-3 bg-bg-0 p-6 md:col-span-7">
          <p className="caption-4 text-gold">{current.headline}</p>
          <p className="body-5 mt-2 text-text-2">{current.inputLabel}</p>
          <div className="mt-6">
            <span className="caption-4 block text-text-4">{current.outputLabel}</span>
            <div className="font-mono-num heading-3 mt-1 text-white">
              {current.outputValue}
            </div>
          </div>
          <p className="caption-4 mt-4 text-text-4">{current.formula}</p>
        </div>

        <div className="flex flex-col justify-between rounded-xl border border-border-3 bg-bg-3 p-6 md:col-span-5">
          <div>
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border-3 bg-bg-2 text-gold">
              <Calculator size={20} weight="regular" aria-hidden="true" />
            </div>
            <h3 className="title-2 text-text-0">Run your own figures</h3>
            <p className="body-6 mt-2 text-text-4">
              Open the interactive workspace to test custom rupee amounts, export schedules as CSV, and inspect every formula step.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onOpenCalculator(current.id)}
            className="button-sm mt-6 inline-flex items-center justify-between gap-2 rounded-lg border border-border-3 bg-bg-3 px-3 py-2 text-text-0 transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-gold hover:text-gold active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            <span>Open {current.tab} tool</span>
            <ArrowRight size={16} weight="bold" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
