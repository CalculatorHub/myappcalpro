import {
  ArrowRight,
  ArrowsLeftRight,
  Bank,
  BookOpen,
  Calculator,
  ChartLine,
  CheckCircle,
  Lightning,
  Percent,
  Scales,
  Shield,
  Sparkle,
  TrendUp,
} from '@phosphor-icons/react';
import { CalculatorId } from '../Header';
import { ScrollReveal } from './ScrollReveal';
import { HeroPreview } from './HeroPreview';

interface LandingPageProps {
  onDownloadKit: () => void;
  downloadStatus: string | null;
  onOpenCalculator: (id: CalculatorId) => void;
  onOpenFormulaGuide: () => void;
}

const CALCULATOR_CARDS: {
  id: CalculatorId;
  title: string;
  category: string;
  description: string;
  icon: typeof Percent;
  formula: string;
}[] = [
  {
    id: 'simple-interest',
    title: 'Simple Interest',
    category: 'Interest & Deposits',
    description: 'Fixed deposits, short-term bills, and commercial paper with 365/360 day-count conventions.',
    icon: Percent,
    formula: 'I = (P × R × T) / 100',
  },
  {
    id: 'compound-interest',
    title: 'Compound Interest',
    category: 'Wealth Growth',
    description: 'Annual to daily compounding with Effective Annual Rate and year-by-year growth breakdown.',
    icon: TrendUp,
    formula: 'A = P(1 + r/n)^(nt)',
  },
  {
    id: 'loan-emi',
    title: 'Home Loan EMI',
    category: 'Loans & Mortgages',
    description: 'Monthly reducing-balance EMI, total interest, processing fees & full amortization schedule.',
    icon: Bank,
    formula: 'EMI = [P·R·(1+R)^N] / [(1+R)^N−1]',
  },
  {
    id: 'percentage-rupee',
    title: 'Rupee & Percentage',
    category: 'Quick Conversions',
    description: 'Instant two-way conversion between rupee amounts and percentages using custom ratios.',
    icon: ArrowsLeftRight,
    formula: '% = ₹ Amount × Ratio',
  },
  {
    id: 'income-tax',
    title: 'Income Tax Estimator',
    category: 'Indian Taxation',
    description: 'New vs. Old Tax Regimes for FY 2024–27 with Section 87A rebate and marginal relief.',
    icon: Scales,
    formula: 'Tax = Slab Rate − 87A Rebate + 4% Cess',
  },
];

const STATS = [
  { value: '5', label: 'Calculators', icon: Calculator },
  { value: '3 FY', label: 'Tax Years', icon: ChartLine },
  { value: 'Offline', label: 'First Design', icon: Shield },
  { value: 'Instant', label: 'Calculations', icon: Lightning },
];

const WHY_CARDS = [
  {
    icon: Sparkle,
    title: 'Every Step Explained',
    description: 'No black-box results. Every calculation shows the full mathematical derivation so you understand the formula, not just the number.',
  },
  {
    icon: Shield,
    title: 'Fully Private & Offline',
    description: 'All calculations run directly in your browser. Zero data leaves your device. No account, no tracking, no server calls.',
  },
  {
    icon: ChartLine,
    title: 'Side-by-Side Comparison',
    description: 'Built for finance students and professionals. Easily compare New vs. Old Tax Regimes and evaluating compounding frequencies.',
  },
];

export function LandingPage({
  onDownloadKit,
  onOpenCalculator,
  onOpenFormulaGuide,
}: LandingPageProps) {
  const scrollToCalculators = () => {
    const el = document.getElementById('calculators');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      onOpenCalculator('simple-interest');
    }
  };

  return (
    <div className="pb-24">
      {/* ── HERO ── */}
      <section
        aria-label="FinCalc Pro introduction"
        className="relative min-h-[85vh] flex flex-col items-center justify-center px-4 pt-20"
      >
        {/* Subtle static ambient glow */}
        <div
          aria-hidden="true"
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] rounded-full pointer-events-none opacity-20"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(245,184,0,0.15) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />

        {/* Hero content */}
        <div className="relative z-10 mx-auto max-w-4xl text-center space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide border border-accent-gold/20 bg-accent-gold/10 text-accent-gold">
            <Sparkle size={12} weight="fill" aria-hidden="true" />
            Professional Financial Tools · FY 2026-27 Ready
          </div>

          {/* Headline */}
          <h1 className="heading-1 leading-[1.08] text-gradient-hero max-w-[680px] mx-auto">
            Indian finance and tax calculators, with every step explained.
          </h1>

          {/* Subtext */}
          <p className="body-2 max-w-[680px] mx-auto text-secondary">
            Practical calculators for finance, taxation and CA studies, with clear step-by-step solutions.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              type="button"
              onClick={scrollToCalculators}
              className="button-md inline-flex items-center gap-2.5 rounded-xl px-6 py-3 bg-accent-gold text-bg-main font-semibold hover:bg-accent-gold-hover transition-colors active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold"
            >
              <Calculator size={18} weight="bold" aria-hidden="true" />
              Explore calculators
            </button>

            <button
              type="button"
              onClick={onOpenFormulaGuide}
              className="button-md inline-flex items-center gap-2.5 rounded-xl px-6 py-3 font-semibold border border-border-default bg-bg-raised text-primary hover:border-accent-gold/40 hover:text-accent-gold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold"
            >
              <BookOpen size={18} weight="regular" aria-hidden="true" />
              Formula Guide
            </button>
          </div>
        </div>

        {/* Interactive Workspace Preview */}
        <div className="relative z-10 mt-12 w-full max-w-4xl px-4">
          <HeroPreview onOpenCalculator={onOpenCalculator} />
        </div>

        {/* Stats strip */}
        <div className="relative z-10 mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 mx-auto w-full max-w-3xl px-4">
          {STATS.map(({ value, label, icon: Icon }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-1 rounded-2xl py-4 px-3 card"
            >
              <Icon size={18} weight="duotone" className="text-accent-gold mb-0.5" aria-hidden="true" />
              <span className="font-mono-num text-xl font-bold text-accent-gold">{value}</span>
              <span className="caption-5 text-secondary">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── CALCULATORS ── */}
      <section
        id="calculators"
        aria-label="Calculator directory"
        className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-24"
      >
        <ScrollReveal>
          <div className="mb-12 text-center">
            <span className="inline-block caption-3 tracking-widest uppercase mb-3 px-3 py-1 rounded-full border border-accent-gold/20 bg-accent-gold/10 text-accent-gold">
              Interactive Suite
            </span>
            <h2 className="heading-3 text-gradient-hero">Five powerful calculators</h2>
            <p className="body-6 mt-3 max-w-xl mx-auto text-secondary">
              Select any calculator to enter custom figures, view step-by-step derivations, and export schedules.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CALCULATOR_CARDS.map((calc) => {
              const Icon = calc.icon;
              return (
                <article
                  key={calc.id}
                  onClick={() => onOpenCalculator(calc.id)}
                  className="card card-hover p-6 cursor-pointer flex flex-col justify-between"
                >
                  <div className="flex flex-col h-full">
                    <div className="mb-5 flex items-start justify-between">
                      {/* Icon */}
                      <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-accent-gold/30 bg-accent-gold/10 text-accent-gold">
                        <Icon size={22} weight="duotone" aria-hidden="true" />
                      </span>
                      <span className="caption-5 rounded-full px-2.5 py-1 border border-border-subtle bg-bg-raised text-secondary">
                        {calc.category}
                      </span>
                    </div>

                    <h3 className="title-2 mb-2 text-primary">{calc.title}</h3>
                    <p className="body-6 flex-1 text-secondary">{calc.description}</p>

                    <div className="mt-5 pt-4 space-y-3 border-t border-border-subtle">
                      <code className="font-mono-num caption-5 block truncate text-accent-gold opacity-90">
                        {calc.formula}
                      </code>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenCalculator(calc.id);
                        }}
                        className="button-sm w-full rounded-xl py-2.5 inline-flex items-center justify-center gap-1.5 border border-accent-gold/30 bg-accent-gold/10 text-accent-gold hover:bg-accent-gold/20 hover:border-accent-gold/50 transition-colors"
                      >
                        Open calculator
                        <ArrowRight size={13} weight="bold" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </ScrollReveal>
      </section>

      {/* ── WHY FINCALC PRO ── */}
      <section
        aria-label="Why FinCalc Pro"
        className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-28"
      >
        <ScrollReveal>
          <div className="mb-12 text-center">
            <span className="inline-block caption-3 tracking-widest uppercase mb-3 px-3 py-1 rounded-full border border-accent-gold/20 bg-accent-gold/10 text-accent-gold">
              Why FinCalc Pro
            </span>
            <h2 className="heading-3 text-gradient-hero">
              Built for professionals.<br className="hidden sm:block" /> Transparent by design.
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {WHY_CARDS.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="card card-hover p-6 relative overflow-hidden"
              >
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl mb-4 border border-accent-gold/30 bg-accent-gold/10 text-accent-gold">
                  <Icon size={24} weight="duotone" aria-hidden="true" />
                </div>
                <h3 className="title-2 mb-2 text-primary">{title}</h3>
                <p className="body-6 text-secondary">{description}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </section>

      {/* ── TRUST / CHECKMARKS ── */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-20">
        <ScrollReveal>
          <div className="card p-8 sm:p-10 relative overflow-hidden">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                'FY 2024-25, 2025-26 & 2026-27 tax slabs',
                'Section 87A rebate + marginal relief',
                'New vs Old regime comparison',
                'Reducing-balance EMI amortization',
                'Simple & compound interest with EAR',
                '₹ ↔ % two-way ratio converter',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle size={18} weight="fill" className="text-accent-gold shrink-0" aria-hidden="true" />
                  <span className="body-6 text-secondary">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ── FORMULA KIT CTA ── */}
      <section
        id="formula-kit"
        aria-label="Formula Reference Kit"
        className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-20"
      >
        <ScrollReveal>
          <div className="card p-10 sm:p-14 text-center relative overflow-hidden border-accent-gold/20">
            <div className="relative z-10">
              <span className="inline-flex items-center gap-1.5 caption-3 tracking-widest uppercase mb-4 px-3 py-1 rounded-full border border-accent-gold/25 bg-accent-gold/10 text-accent-gold">
                <Sparkle size={11} weight="fill" aria-hidden="true" />
                Offline Study Reference
              </span>

              <h2 className="heading-4 mb-3 text-gradient-hero">
                CA Formula Reference Kit
              </h2>
              <p className="body-5 mb-8 max-w-lg mx-auto text-secondary">
                A comprehensive offline reference containing Interest, EMI, Rupee Ratio, and Tax Slab formulas — download once, study anywhere.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={onDownloadKit}
                  className="button-md inline-flex items-center gap-2.5 rounded-xl px-7 py-3 font-bold bg-accent-gold text-bg-main hover:bg-accent-gold-hover transition-colors shadow-lg shadow-accent-gold/20 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold"
                >
                  Download free formula kit
                </button>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
