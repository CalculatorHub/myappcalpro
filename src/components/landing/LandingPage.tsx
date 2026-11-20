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
import { ParticleBackground } from './ParticleBackground';
import { Card3D } from './Card3D';

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
  accent: string;
  accentDim: string;
}[] = [
  {
    id: 'simple-interest',
    title: 'Simple Interest',
    category: 'Interest & Deposits',
    description: 'Fixed deposits, short-term bills, and commercial paper with 365/360 day-count conventions.',
    icon: Percent,
    formula: 'I = (P × R × T) / 100',
    accent: '#2DD4BF',
    accentDim: 'rgba(45,212,191,0.1)',
  },
  {
    id: 'compound-interest',
    title: 'Compound Interest',
    category: 'Wealth Growth',
    description: 'Annual to daily compounding with Effective Annual Rate — with year-by-year growth breakdown.',
    icon: TrendUp,
    formula: 'A = P(1 + r/n)^(nt)',
    accent: '#4F8EF7',
    accentDim: 'rgba(79,142,247,0.1)',
  },
  {
    id: 'loan-emi',
    title: 'Home Loan EMI',
    category: 'Loans & Mortgages',
    description: 'Monthly reducing-balance EMI, total interest, processing fees & full amortization schedule.',
    icon: Bank,
    formula: 'EMI = [P·R·(1+R)^N] / [(1+R)^N−1]',
    accent: '#F5B800',
    accentDim: 'rgba(245,184,0,0.1)',
  },
  {
    id: 'percentage-rupee',
    title: 'Rupee & Percentage',
    category: 'Quick Conversions',
    description: 'Instant two-way conversion between rupee amounts and percentages using custom ratios.',
    icon: ArrowsLeftRight,
    formula: '% = ₹ Amount × Ratio',
    accent: '#A78BFA',
    accentDim: 'rgba(167,139,250,0.1)',
  },
  {
    id: 'income-tax',
    title: 'Income Tax Estimator',
    category: 'Indian Taxation',
    description: 'New vs. Old Tax Regimes for FY 2024–27 with Section 87A rebate and marginal relief.',
    icon: Scales,
    formula: 'Tax = Slab Rate − 87A Rebate + 4% Cess',
    accent: '#F87171',
    accentDim: 'rgba(248,113,113,0.1)',
  },
];

const STATS = [
  { value: '5', label: 'Calculators', icon: Calculator },
  { value: '3 FY', label: 'Tax Years', icon: ChartLine },
  { value: '100%', label: 'Free & Private', icon: Shield },
  { value: '∞', label: 'Calculations', icon: Lightning },
];

const WHY_CARDS = [
  {
    icon: Sparkle,
    title: 'Every Step Explained',
    description: 'No black-box results. Every calculation shows the full mathematical derivation so you understand the formula, not just the number.',
    accent: '#F5B800',
  },
  {
    icon: Shield,
    title: 'Fully Private & Offline',
    description: 'All calculations run directly in your browser. Zero data leaves your device. No account, no tracking, no ads — ever.',
    accent: '#2DD4BF',
  },
  {
    icon: ChartLine,
    title: 'CA-Grade Accuracy',
    description: 'Built for CA students and finance professionals. Covers FY 2024–27 tax regimes, reducing-balance EMI, and EAR calculations.',
    accent: '#4F8EF7',
  },
];

export function LandingPage({
  onDownloadKit,
  onOpenCalculator,
  onOpenFormulaGuide,
}: LandingPageProps) {
  return (
    <div className="pb-24">

      {/* ── HERO ── */}
      <section
        aria-label="FinCalc Pro introduction"
        className="relative min-h-[92vh] flex flex-col items-center justify-center overflow-hidden px-4 pt-20"
      >
        {/* Ambient orbs */}
        <div
          aria-hidden="true"
          className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(79,142,247,0.12) 0%, transparent 70%)',
            animation: 'orbFloat 18s ease-in-out infinite',
            filter: 'blur(60px)',
          }}
        />
        <div
          aria-hidden="true"
          className="absolute bottom-[-5%] right-[-5%] w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(245,184,0,0.09) 0%, transparent 70%)',
            animation: 'orbFloat 22s ease-in-out infinite reverse',
            filter: 'blur(60px)',
          }}
        />

        {/* 3D Particle canvas */}
        <div className="absolute inset-0 pointer-events-none">
          <ParticleBackground />
        </div>

        {/* Vignette */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 85% 70% at 50% 50%, transparent 30%, #07090F 90%)' }}
        />

        {/* Hero content */}
        <div className="relative z-10 mx-auto max-w-4xl text-center space-y-6" style={{ animation: 'fadeUp 0.8s ease both' }}>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide"
            style={{
              background: 'rgba(245,184,0,0.08)',
              border: '1px solid rgba(245,184,0,0.25)',
              backdropFilter: 'blur(12px)',
              color: '#F5B800',
              boxShadow: '0 0 20px rgba(245,184,0,0.12)',
            }}
          >
            <Sparkle size={12} weight="fill" aria-hidden="true" />
            Professional Financial Tools · FY 2026-27 Ready
          </div>

          {/* Headline — left-to-right gradient per B5 */}
          <h1
            className="heading-1 leading-[1.08]"
            style={{
              background: 'linear-gradient(90deg, #FFFFFF 0%, #A0A8C8 60%, #9B9B9B 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Indian finance and tax<br className="hidden sm:block" /> calculators, with every<br className="hidden sm:block" /> step explained.
          </h1>

          {/* Subtext */}
          <p className="body-2 max-w-2xl mx-auto" style={{ color: '#8894C0' }}>
            Practical calculators for finance, taxation and CA studies, with clear step-by-step solutions.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              type="button"
              onClick={() => onOpenCalculator('income-tax')}
              className="button-md inline-flex items-center gap-2.5 rounded-xl px-6 py-3 text-black font-bold"
              style={{
                background: 'linear-gradient(135deg, #F5B800, #FFD04D)',
                boxShadow: '0 8px 32px rgba(245,184,0,0.4), 0 2px 8px rgba(0,0,0,0.3)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
              onMouseEnter={e => {
                const b = e.currentTarget as HTMLButtonElement;
                b.style.transform = 'translateY(-2px) scale(1.03)';
                b.style.boxShadow = '0 14px 40px rgba(245,184,0,0.5), 0 4px 16px rgba(0,0,0,0.4)';
              }}
              onMouseLeave={e => {
                const b = e.currentTarget as HTMLButtonElement;
                b.style.transform = '';
                b.style.boxShadow = '0 8px 32px rgba(245,184,0,0.4), 0 2px 8px rgba(0,0,0,0.3)';
              }}
            >
              <Calculator size={18} weight="bold" aria-hidden="true" />
              Open Calculators
              <ArrowRight size={16} weight="bold" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={onOpenFormulaGuide}
              className="button-md inline-flex items-center gap-2.5 rounded-xl px-6 py-3 font-semibold"
              style={{
                background: 'rgba(255,255,255,0.06)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#EEF0FF',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                transition: 'transform 0.2s ease, background 0.2s ease, border-color 0.2s ease',
              }}
              onMouseEnter={e => {
                const b = e.currentTarget as HTMLButtonElement;
                b.style.transform = 'translateY(-2px)';
                b.style.background = 'rgba(255,255,255,0.1)';
                b.style.borderColor = 'rgba(245,184,0,0.3)';
              }}
              onMouseLeave={e => {
                const b = e.currentTarget as HTMLButtonElement;
                b.style.transform = '';
                b.style.background = 'rgba(255,255,255,0.06)';
                b.style.borderColor = 'rgba(255,255,255,0.12)';
              }}
            >
              <BookOpen size={18} weight="regular" aria-hidden="true" />
              Formula Guide
            </button>
          </div>
        </div>

        {/* Stats strip */}
        <div
          className="relative z-10 mt-16 grid grid-cols-2 md:grid-cols-4 gap-3 mx-auto w-full max-w-3xl px-4"
          style={{ animation: 'fadeUp 0.8s 0.2s ease both', opacity: 0, animationFillMode: 'both' }}
        >
          {STATS.map(({ value, label, icon: Icon }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-1 rounded-2xl py-4 px-3"
              style={{
                background: 'rgba(255,255,255,0.04)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <Icon size={18} weight="duotone" className="gold-accent mb-0.5" aria-hidden="true" />
              <span className="font-mono-num text-xl font-bold" style={{ color: '#F5B800' }}>{value}</span>
              <span className="caption-5" style={{ color: '#8894C0' }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Scroll indicator */}
        <div
          aria-hidden="true"
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 opacity-40"
          style={{ animation: 'pulseGold 2.5s ease-in-out infinite' }}
        >
          <span className="caption-5" style={{ color: '#8894C0', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Explore</span>
          <div className="w-px h-8" style={{ background: 'linear-gradient(to bottom, rgba(245,184,0,0.6), transparent)' }} />
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
            <span
              className="inline-block caption-3 tracking-widest uppercase mb-3 px-3 py-1 rounded-full"
              style={{ color: '#F5B800', background: 'rgba(245,184,0,0.08)', border: '1px solid rgba(245,184,0,0.2)' }}
            >
              Interactive Suite
            </span>
            <h2 className="heading-3 text-gradient-hero">Five powerful calculators</h2>
            <p className="body-6 mt-3 max-w-xl mx-auto" style={{ color: '#8894C0' }}>
              Select any calculator to enter custom figures, view step-by-step derivations, and export schedules.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CALCULATOR_CARDS.map((calc) => {
              const Icon = calc.icon;
              return (
                <Card3D
                  key={calc.id}
                  as="article"
                  className="p-6"
                  onClick={() => onOpenCalculator(calc.id)}
                >
                  <div className="flex flex-col h-full">
                    <div className="mb-5 flex items-start justify-between">
                      {/* Icon */}
                      <span
                        className="inline-flex h-11 w-11 items-center justify-center rounded-xl"
                        style={{
                          background: calc.accentDim,
                          border: `1px solid ${calc.accent}30`,
                          color: calc.accent,
                          boxShadow: `0 4px 16px ${calc.accent}20`,
                        }}
                      >
                        <Icon size={22} weight="duotone" aria-hidden="true" />
                      </span>
                      <span
                        className="caption-5 rounded-full px-2.5 py-1"
                        style={{
                          background: 'rgba(255,255,255,0.05)',
                          color: '#8894C0',
                          border: '1px solid rgba(255,255,255,0.08)',
                        }}
                      >
                        {calc.category}
                      </span>
                    </div>

                    <h3 className="title-2 mb-2" style={{ color: '#EEF0FF' }}>{calc.title}</h3>
                    <p className="body-6 flex-1" style={{ color: '#8894C0' }}>{calc.description}</p>

                    <div
                      className="mt-5 pt-4 space-y-3"
                      style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
                    >
                      <code
                        className="font-mono-num caption-5 block truncate"
                        style={{ color: calc.accent, opacity: 0.8 }}
                      >
                        {calc.formula}
                      </code>

                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onOpenCalculator(calc.id); }}
                        className="button-sm w-full rounded-xl py-2.5 inline-flex items-center justify-center gap-1.5 transition-all"
                        style={{
                          background: `${calc.accent}12`,
                          border: `1px solid ${calc.accent}25`,
                          color: calc.accent,
                        }}
                        onMouseEnter={e => {
                          const b = e.currentTarget;
                          b.style.background = `${calc.accent}22`;
                          b.style.borderColor = `${calc.accent}50`;
                        }}
                        onMouseLeave={e => {
                          const b = e.currentTarget;
                          b.style.background = `${calc.accent}12`;
                          b.style.borderColor = `${calc.accent}25`;
                        }}
                      >
                        Open calculator
                        <ArrowRight size={13} weight="bold" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </Card3D>
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
            <span
              className="inline-block caption-3 tracking-widest uppercase mb-3 px-3 py-1 rounded-full"
              style={{ color: '#2DD4BF', background: 'rgba(45,212,191,0.08)', border: '1px solid rgba(45,212,191,0.2)' }}
            >
              Why FinCalc Pro
            </span>
            <h2 className="heading-3 text-gradient-hero">Built for professionals.<br className="hidden sm:block" /> Transparent by design.</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {WHY_CARDS.map(({ icon: Icon, title, description, accent }) => (
              <div
                key={title}
                className="rounded-2xl p-6 relative overflow-hidden group"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.transform = 'translateY(-4px)';
                  el.style.boxShadow = `0 20px 50px rgba(0,0,0,0.5), 0 0 0 1px ${accent}20 inset`;
                  el.style.borderColor = `${accent}30`;
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.transform = '';
                  el.style.boxShadow = '';
                  el.style.borderColor = 'rgba(255,255,255,0.07)';
                }}
              >
                {/* Glow orb */}
                <div
                  aria-hidden="true"
                  className="absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `radial-gradient(circle, ${accent}18 0%, transparent 70%)`, filter: 'blur(20px)', transform: 'translate(30%, -30%)' }}
                />
                <div
                  className="inline-flex h-12 w-12 items-center justify-center rounded-xl mb-4"
                  style={{ background: `${accent}15`, border: `1px solid ${accent}30`, color: accent }}
                >
                  <Icon size={24} weight="duotone" aria-hidden="true" />
                </div>
                <h3 className="title-2 mb-2" style={{ color: '#EEF0FF' }}>{title}</h3>
                <p className="body-6" style={{ color: '#8894C0' }}>{description}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </section>

      {/* ── TRUST / CHECKMARKS ── */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-20">
        <ScrollReveal>
          <div
            className="rounded-2xl p-8 sm:p-10 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(79,142,247,0.06) 0%, rgba(45,212,191,0.04) 50%, rgba(245,184,0,0.05) 100%)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {/* Shimmer line top */}
            <div aria-hidden="true" className="absolute top-0 left-0 right-0 h-px"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(79,142,247,0.6), rgba(45,212,191,0.6), rgba(245,184,0,0.6), transparent)' }}
            />

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
                  <CheckCircle size={18} weight="fill" style={{ color: '#2DD4BF', flexShrink: 0 }} aria-hidden="true" />
                  <span className="body-6" style={{ color: '#8894C0' }}>{item}</span>
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
          <div
            className="rounded-3xl p-10 sm:p-14 text-center relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(245,184,0,0.07) 0%, rgba(255,255,255,0.03) 50%, rgba(79,142,247,0.05) 100%)',
              backdropFilter: 'blur(30px)',
              border: '1px solid rgba(245,184,0,0.18)',
              boxShadow: '0 40px 80px rgba(0,0,0,0.4), 0 0 80px rgba(245,184,0,0.05)',
            }}
          >
            {/* Shimmer sweep */}
            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl"
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(105deg, transparent 35%, rgba(245,184,0,0.07) 50%, transparent 65%)',
                  animation: 'shimmer 4s infinite linear',
                  transform: 'translateX(-100%)',
                }}
              />
            </div>

            {/* Top glow border */}
            <div aria-hidden="true" className="absolute top-0 left-0 right-0 h-px"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(245,184,0,0.6), transparent)' }}
            />

            <div className="relative z-10">
              <span
                className="inline-flex items-center gap-1.5 caption-3 tracking-widest uppercase mb-4 px-3 py-1 rounded-full"
                style={{ color: '#F5B800', background: 'rgba(245,184,0,0.1)', border: '1px solid rgba(245,184,0,0.25)' }}
              >
                <Sparkle size={11} weight="fill" aria-hidden="true" />
                Offline Study Reference
              </span>

              <h2
                className="heading-4 mb-3"
                style={{
                  background: 'linear-gradient(135deg, #FFFFFF, #F5B800)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                CA Formula Reference Kit
              </h2>
              <p className="body-5 mb-8 max-w-lg mx-auto" style={{ color: '#8894C0' }}>
                A comprehensive offline reference containing Interest, EMI, Rupee Ratio, and Tax Slab formulas — download once, study anywhere.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={onDownloadKit}
                  className="button-md inline-flex items-center gap-2.5 rounded-xl px-7 py-3 font-bold"
                  style={{
                    background: 'linear-gradient(135deg, #F5B800, #FFD04D)',
                    color: '#000',
                    boxShadow: '0 8px 30px rgba(245,184,0,0.4)',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  }}
                  onMouseEnter={e => {
                    const b = e.currentTarget as HTMLButtonElement;
                    b.style.transform = 'translateY(-2px)';
                    b.style.boxShadow = '0 14px 40px rgba(245,184,0,0.5)';
                  }}
                  onMouseLeave={e => {
                    const b = e.currentTarget as HTMLButtonElement;
                    b.style.transform = '';
                    b.style.boxShadow = '0 8px 30px rgba(245,184,0,0.4)';
                  }}
                >
                  Download free formula kit
                </button>

                <button
                  type="button"
                  onClick={() => onOpenCalculator('income-tax')}
                  className="button-md inline-flex items-center gap-2 rounded-xl px-6 py-3"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: '#EEF0FF',
                    transition: 'background 0.2s ease, border-color 0.2s ease',
                  }}
                  onMouseEnter={e => {
                    const b = e.currentTarget as HTMLButtonElement;
                    b.style.background = 'rgba(255,255,255,0.1)';
                    b.style.borderColor = 'rgba(245,184,0,0.3)';
                  }}
                  onMouseLeave={e => {
                    const b = e.currentTarget as HTMLButtonElement;
                    b.style.background = 'rgba(255,255,255,0.06)';
                    b.style.borderColor = 'rgba(255,255,255,0.12)';
                  }}
                >
                  Try calculators instead
                </button>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
