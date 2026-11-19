import { CONFIGURABLE_TAX_RULES, FinancialYearKey } from '../data/taxRules';
import { AppRoute } from './landing/FloatingNav';

interface FooterProps {
  selectedFY: FinancialYearKey;
  onNavigate: (route: AppRoute) => void;
}

export function Footer({ selectedFY, onNavigate }: FooterProps) {
  const rules = CONFIGURABLE_TAX_RULES[selectedFY];

  return (
    <footer className="mt-14 border-t border-[#272727] bg-[#000000]">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-xs text-zinc-400 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="title-4 text-white">
              FinCalc <span className="text-[#D4AF37]">Pro</span>
            </span>
            <span aria-hidden="true">·</span>
            <span>
              Active Tax Rule Set: {rules.financialYear} ({rules.assessmentYear})
            </span>
          </div>
          <p className="caption-5 text-zinc-500">
            Educational and CA study resource only. Not certified financial or tax advice.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={() => onNavigate('landing')}
            className="caption-4 text-zinc-400 transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:text-white"
          >
            Overview
          </button>
          <button
            type="button"
            onClick={() => onNavigate('calculators')}
            className="caption-4 text-zinc-400 transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:text-white"
          >
            Calculators
          </button>
          <button
            type="button"
            onClick={() => onNavigate('privacy')}
            className="caption-4 text-zinc-400 transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:text-white"
          >
            Privacy policy
          </button>
          <button
            type="button"
            onClick={() => onNavigate('terms')}
            className="caption-4 text-zinc-400 transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:text-white"
          >
            Terms of use
          </button>
        </div>
      </div>
    </footer>
  );
}
