import { Logo3D } from './landing/Logo3D';

export type CalculatorId =
  | 'simple-interest'
  | 'compound-interest'
  | 'loan-emi'
  | 'percentage-rupee'
  | 'income-tax';

export interface CalculatorMeta {
  id: CalculatorId;
  shortNavLabel: string;
  title: string;
  categoryLabel: string;
  summary: string;
  formulaHint: string;
  keywords: string[];
}

export const CALCULATORS: CalculatorMeta[] = [
  {
    id: 'simple-interest',
    shortNavLabel: 'Simple Interest',
    title: 'Simple Interest',
    categoryLabel: 'Deposits · Short-Term',
    summary: 'Interest and maturity across years, months, or exact days.',
    formulaHint: 'SI = (P × R × T) ÷ 100',
    keywords: ['simple', 'interest', 'fd', 'days', 'months', 'bill', 'discounting'],
  },
  {
    id: 'compound-interest',
    shortNavLabel: 'Compound',
    title: 'Compound Interest',
    categoryLabel: 'Wealth · Effective Rate',
    summary: 'Annual to daily compounding with EAR and year-by-year growth.',
    formulaHint: 'A = P(1 + r/n)^(nt)',
    keywords: ['compound', 'interest', 'ear', 'quarterly', 'monthly', 'daily', 'growth'],
  },
  {
    id: 'loan-emi',
    shortNavLabel: 'Loan & EMI',
    title: 'Bank, Home Loan & EMI',
    categoryLabel: 'Credit · Amortization',
    summary: 'Monthly EMI, fee impact, down payment estimator, and schedule.',
    formulaHint: 'EMI = Pr(1+r)^n ÷ ((1+r)^n−1)',
    keywords: ['loan', 'home', 'emi', 'amortization', 'mortgage', 'down payment', 'bank', 'fee'],
  },
  {
    id: 'percentage-rupee',
    shortNavLabel: 'Percent & ₹',
    title: 'Percentage & Rupee Ratio',
    categoryLabel: 'Ratio · ₹ ↔ %',
    summary: 'Two-way ₹ to % and % to ₹ converter using the ₹1 = 12% ratio.',
    formulaHint: '% = ₹ × 12  |  ₹ = % ÷ 12',
    keywords: ['percentage', 'rupee', 'ratio', 'conversion', 'rs', 'percent', '12%'],
  },
  {
    id: 'income-tax',
    shortNavLabel: 'Income Tax',
    title: 'Indian Income Tax',
    categoryLabel: 'Direct Tax · CA Study',
    summary: 'Old vs. New regime slabs, Sec 87A, marginal relief, cess & TDS.',
    formulaHint: 'Slab Tax − 87A + 4% Cess',
    keywords: ['income', 'tax', 'india', 'ca', 'slab', '87a', 'regime', 'tds', 'cess', 'surcharge'],
  },
];

interface HeaderProps {
  activeCalc: CalculatorId;
  onSelectCalc: (id: CalculatorId) => void;
  onOpenReference: () => void;
}

export function Header({ activeCalc, onSelectCalc, onOpenReference }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-[#09090B]/95 backdrop-blur-md" style={{ overflow: 'visible' }}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8" style={{ overflow: 'visible' }}>
        {/* Zone 1: Brand Zone with 3D Logo */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            onSelectCalc('simple-interest');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="inline-flex items-center gap-2.5 font-display text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
        >
          <Logo3D />
          FinCalc <span className="text-[#D4AF37]">Pro</span>
        </a>

        {/* Zone 2: 5 concise single-line nav links */}
        <nav
          aria-label="Primary calculators"
          className="hidden lg:flex items-center gap-6 text-sm font-medium"
        >
          {CALCULATORS.map((calc) => {
            const isActive = activeCalc === calc.id;
            return (
              <button
                key={calc.id}
                type="button"
                onClick={() => onSelectCalc(calc.id)}
                className={`relative py-1 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] ${
                  isActive
                    ? 'text-[#E5C158]'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {calc.shortNavLabel}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute right-0 -bottom-[21px] left-0 h-0.5 bg-[#D4AF37]"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onOpenReference}
            className="min-h-[40px] rounded-lg border border-[#D4AF37]/40 bg-[#D4AF37]/10 px-4 py-2 text-xs font-semibold text-[#E5C158] transition-colors hover:bg-[#D4AF37] hover:text-[#09090B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] whitespace-nowrap shrink-0"
          >
            Formula Guide
          </button>
        </div>
      </div>
    </header>
  );
}
