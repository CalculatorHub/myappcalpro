import { CONFIGURABLE_TAX_RULES, FinancialYearKey } from '../data/taxRules';
import { AppRoute } from './landing/FloatingNav';

interface FooterProps {
  selectedFY: FinancialYearKey;
  onNavigate: (route: AppRoute) => void;
  onOpenInstallHelp?: () => void;
}

export function Footer({ selectedFY, onNavigate, onOpenInstallHelp }: FooterProps) {
  const rules = CONFIGURABLE_TAX_RULES[selectedFY];

  return (
    <footer className="mt-14 border-t border-border-2 bg-bg-0">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-xs text-text-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="title-4 text-text-0">
              FinCalc <span className="text-gold">Pro</span>
            </span>
            <span aria-hidden="true">·</span>
            <span>
              Active Tax Rule Set: {rules.financialYear} ({rules.assessmentYear})
            </span>
          </div>
          <p className="caption-5 text-text-5">
            Educational and CA study resource only. Not certified financial or tax advice.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={() => onNavigate('landing')}
            className="caption-4 text-text-4 transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:text-text-0"
          >
            Overview
          </button>
          <button
            type="button"
            onClick={() => onNavigate('calculators')}
            className="caption-4 text-text-4 transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:text-text-0"
          >
            Calculators
          </button>
          <button
            type="button"
            onClick={() => onNavigate('privacy')}
            className="caption-4 text-text-4 transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:text-text-0"
          >
            Privacy policy
          </button>
          <button
            type="button"
            onClick={() => onNavigate('terms')}
            className="caption-4 text-text-4 transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:text-text-0"
          >
            Terms of use
          </button>
          {onOpenInstallHelp && (
            <button
              type="button"
              onClick={onOpenInstallHelp}
              className="caption-4 text-accent-gold transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:underline"
            >
              Install App
            </button>
          )}
        </div>
      </div>
    </footer>
  );
}
