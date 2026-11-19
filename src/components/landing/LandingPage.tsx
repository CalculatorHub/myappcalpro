import { useState } from 'react';
import {
  BookOpen,
  CaretDown,
  CheckCircle,
  DownloadSimple,
  FileCsv,
  ListChecks,
  Scales,
  ShieldCheck,
  WarningCircle,
} from '@phosphor-icons/react';
import { CalculatorId } from '../Header';
import { HeroPreview } from './HeroPreview';
import { ScrollReveal } from './ScrollReveal';
import { TaglineReveal } from './TaglineReveal';

interface LandingPageProps {
  onDownloadKit: () => void;
  downloadStatus: string | null;
  onOpenCalculator: (id: CalculatorId) => void;
}

const BENEFITS = [
  {
    icon: Scales,
    title: 'Slab by slab tax clarity',
    detail:
      'Inspect taxable income slices across FY 2024 to 2027, Section 87A rebates, marginal relief, and surcharge brackets without manual table lookups.',
  },
  {
    icon: ListChecks,
    title: 'Zero drift loan amortization',
    detail:
      'Follow every monthly installment from month 1 to closure, including home price, down payment, and upfront processing fee totals.',
  },
  {
    icon: FileCsv,
    title: 'Indian numbering and CSV export',
    detail:
      'Read every rupee figure in lakh and crore grouping, copy exact step derivations, and export full schedules to CSV.',
  },
  {
    icon: BookOpen,
    title: 'Offline CA formula reference',
    detail:
      'Keep interest equations, compounding periods, custom rupee ratio formulas, and tax slab rules saved locally on your device.',
  },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Download the free CA formula kit',
    description:
      'Save the complete Indian finance and tax reference sheet to your phone or laptop with zero email gate.',
  },
  {
    step: '02',
    title: 'Enter rupee amounts in the calculator',
    description:
      'Open any of the five calculators in your browser, pick a worked preset or type your own numbers, and inspect live validation.',
  },
  {
    step: '03',
    title: 'Verify steps and export schedules',
    description:
      'Review the formula substitution, check New versus Old tax regime savings, and copy results or export CSV tables.',
  },
];

const FAQS = [
  {
    question: 'What is inside the free FinCalc Pro CA formula kit?',
    answer:
      'The kit includes Simple Interest day count rules, Compound Interest and Effective Annual Rate formulas, reducing balance EMI equations, the ₹1 = 12% two way ratio formulas, and Indian Income Tax slabs for FY 2024 to 2027.',
  },
  {
    question: 'Do I need to create an account or enter an email?',
    answer:
      'No. FinCalc Pro is free to use with no signup required. Both the downloadable formula kit and all five browser calculators work immediately.',
  },
  {
    question: 'Which financial years are covered in the income tax estimator?',
    answer:
      'The estimator covers FY 2024 to 2025, FY 2025 to 2026, and FY 2026 to 2027 for both the New Tax Regime under Section 115BAC and the Old Tax Regime across all three age categories.',
  },
  {
    question: 'Does it calculate Section 87A marginal relief and surcharge?',
    answer:
      'Yes. When net taxable income crosses the Section 87A threshold or surcharge thresholds of ₹50 lakh, ₹1 crore, or ₹2 crore, marginal relief is computed automatically.',
  },
  {
    question: 'How does the rupee and percentage ratio converter work?',
    answer:
      'It uses a fixed ₹1 = 12% custom conversion ratio with a direction switch. Entering ₹5 converts to 60%, and switching direction converts 60% back to ₹5.',
  },
  {
    question: 'Are the calculations suitable for official tax filing?',
    answer:
      'FinCalc Pro is an educational study and planning resource for CA students and Indian users. Always confirm final return filings against official Income Tax India notifications.',
  },
];

export function LandingPage({
  onDownloadKit,
  downloadStatus,
  onOpenCalculator,
}: LandingPageProps) {
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);

  return (
    <div className="space-y-16 pb-20 sm:space-y-24">
      {/* 1. HERO SECTION */}
      <section
        aria-label="FinCalc Pro overview"
        className="mx-auto max-w-6xl px-4 pt-28 sm:px-6 sm:pt-32 lg:px-8"
      >
        <div className="space-y-6">
          <p className="caption-1 text-[#D4AF37]">
            Indian finance workspace and CA study kit
          </p>

          <h1 className="heading-1 max-w-[680px] bg-gradient-to-r from-[#FFFFFF] to-[#9B9B9B] bg-clip-text text-transparent">
            Accurate Indian finance math
            <br />
            for CA students
          </h1>

          <p className="body-2 max-w-[680px] text-zinc-300">
            Download the free FinCalc Pro formula reference kit and verify Indian income tax slabs, home loan EMI schedules, and compound interest with transparent calculation steps.
          </p>

          {/* Single Primary CTA + Risk Reversal */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              type="button"
              onClick={onDownloadKit}
              className="button-md inline-flex items-center gap-2 rounded-lg bg-[#D4AF37] px-3 py-2 text-[#000000] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-[#E5C158] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white whitespace-nowrap"
            >
              <DownloadSimple size={18} weight="bold" aria-hidden="true" />
              <span>Download free CA formula kit</span>
            </button>

            <span className="caption-1 inline-flex items-center gap-2 text-zinc-400">
              <ShieldCheck size={16} weight="fill" className="text-[#D4AF37]" aria-hidden="true" />
              <span>Free to use with no signup required</span>
            </span>
          </div>

          {downloadStatus && (
            <p
              role="status"
              className="caption-1 inline-flex items-center gap-2 rounded-lg border border-[#272727] bg-[#131209] px-3 py-2 text-zinc-200"
            >
              <CheckCircle size={16} weight="fill" className="text-[#D4AF37]" aria-hidden="true" />
              <span>{downloadStatus}</span>
            </p>
          )}

          {/* Proof Signal */}
          <p className="caption-2 text-zinc-400">
            Includes 5 verified calculators, 3 Indian financial years, and Section 87A marginal relief tables.
          </p>
        </div>

        {/* Hero Visual */}
        <div className="mt-10">
          <HeroPreview onOpenCalculator={onOpenCalculator} />
        </div>
      </section>

      {/* 2. MANDATORY TAGLINE REVEAL SECTION (B11) */}
      <TaglineReveal />

      {/* 3. PROBLEM TO SOLUTION */}
      <section
        id="problem-solution"
        aria-label="Problem and solution"
        className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8"
      >
        <ScrollReveal>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <article className="rounded-2xl border border-[#272727] bg-[#181818] p-6 sm:p-8">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#313131] bg-[#1F1F1F] text-zinc-400">
                <WarningCircle size={20} weight="regular" aria-hidden="true" />
              </div>
              <span className="caption-4 block text-zinc-400">The friction today</span>
              <h2 className="heading-5 mt-2 text-white">
                Scattered PDFs and hidden spreadsheet formulas slow down study sessions
              </h2>
              <p className="body-6 mt-3 text-zinc-400">
                Generic calculators use million and billion formatting, skip Section 87A marginal relief, and hide how monthly EMI interest splits over 240 installments. Cross checking a single CA problem takes multiple tabs and manual rounding.
              </p>
            </article>

            <article className="rounded-2xl border border-[#272727] bg-[#131209] p-6 sm:p-8">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#313131] bg-[#181818] text-[#D4AF37]">
                <CheckCircle size={20} weight="fill" aria-hidden="true" />
              </div>
              <span className="caption-4 block text-[#D4AF37]">The FinCalc Pro approach</span>
              <h2 className="heading-5 mt-2 text-white">
                Every equation, slab threshold, and schedule step in plain sight
              </h2>
              <p className="body-6 mt-3 text-zinc-300">
                FinCalc Pro pairs a downloadable offline formula reference sheet with five Indian calculators. Every calculation displays substituted variables, Indian lakh and crore formatting, and full regime comparisons in one place.
              </p>
            </article>
          </div>
        </ScrollReveal>
      </section>

      {/* 4. BENEFITS SECTION */}
      <section
        id="benefits"
        aria-label="Key benefits"
        className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8"
      >
        <ScrollReveal>
          <div className="max-w-[680px]">
            <p className="caption-1 text-[#D4AF37]">Built for Indian accuracy</p>
            <h2 className="heading-3 mt-2 text-white">
              Cut manual verification from twenty minutes to seconds
            </h2>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {BENEFITS.map((item) => {
              const Icon = item.icon;
              return (
                <article
                  key={item.title}
                  className="rounded-2xl border border-[#272727] bg-[#181818] p-6 transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-[#313131] hover:bg-[#1F1F1F]"
                >
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#313131] bg-[#1F1F1F] text-[#D4AF37]">
                    <Icon size={20} weight="regular" aria-hidden="true" />
                  </div>
                  <h3 className="title-2 text-white">{item.title}</h3>
                  <p className="body-6 mt-2 text-zinc-400">{item.detail}</p>
                </article>
              );
            })}
          </div>
        </ScrollReveal>
      </section>

      {/* 5. HOW IT WORKS */}
      <section
        id="how-it-works"
        aria-label="How FinCalc Pro works"
        className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8"
      >
        <ScrollReveal>
          <div className="max-w-[680px]">
            <p className="caption-1 text-[#D4AF37]">Three simple steps</p>
            <h2 className="heading-3 mt-2 text-white">
              From formula sheet to verified answer
            </h2>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            {HOW_IT_WORKS.map((item) => (
              <article
                key={item.step}
                className="rounded-2xl border border-[#272727] bg-[#181818] p-6"
              >
                <span className="font-mono-num title-2 text-[#D4AF37]">{item.step}</span>
                <h3 className="title-2 mt-3 text-white">{item.title}</h3>
                <p className="body-6 mt-2 text-zinc-400">{item.description}</p>
              </article>
            ))}
          </div>
        </ScrollReveal>
      </section>

      {/* 6. SOCIAL PROOF & VERIFIED COVERAGE */}
      <section
        id="proof"
        aria-label="Verified coverage and feedback"
        className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8"
      >
        <ScrollReveal>
          <div className="rounded-2xl border border-[#272727] bg-[#181818] p-6 sm:p-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <p className="caption-1 text-[#D4AF37]">Verified scope</p>
                <h2 className="heading-4 mt-2 text-white">
                  Built on published Indian financial rules
                </h2>
                <p className="body-6 mt-3 text-zinc-400">
                  Every tax slab, standard deduction, and rebate rule lives in one inspectable configuration file covering FY 2024 to 2027.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-7">
                <div className="rounded-xl border border-[#272727] bg-[#1F1F1F] p-6">
                  <span className="caption-4 text-[#D4AF37]">Student feedback placeholder</span>
                  <p className="body-5 mt-2 text-zinc-200">
                    {'{{testimonial_quote_1}}'}
                  </p>
                  <p className="caption-4 mt-4 text-zinc-400">
                    {'{{student_name_1}}'} · {'{{ca_level_1}}'}
                  </p>
                </div>

                <div className="rounded-xl border border-[#272727] bg-[#1F1F1F] p-6">
                  <span className="caption-4 text-[#D4AF37]">Educator feedback placeholder</span>
                  <p className="body-5 mt-2 text-zinc-200">
                    {'{{testimonial_quote_2}}'}
                  </p>
                  <p className="caption-4 mt-4 text-zinc-400">
                    {'{{reviewer_name_2}}'} · {'{{institution_2}}'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* 7. FAQ SECTION */}
      <section
        id="faq"
        aria-label="Frequently asked questions"
        className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8"
      >
        <ScrollReveal>
          <div className="max-w-[680px]">
            <p className="caption-1 text-[#D4AF37]">Common questions</p>
            <h2 className="heading-3 mt-2 text-white">
              Everything about the kit and calculators
            </h2>
          </div>

          <div className="mt-8 space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaqIdx === idx;
              return (
                <div
                  key={faq.question}
                  className="rounded-xl border border-[#272727] bg-[#181818]"
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                    className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] rounded-xl"
                  >
                    <span className="title-3 text-white">{faq.question}</span>
                    <CaretDown
                      size={18}
                      weight="bold"
                      aria-hidden="true"
                      className={`shrink-0 text-[#D4AF37] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                        isOpen ? 'rotate-180' : 'rotate-0'
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="border-t border-[#272727] px-6 py-4">
                      <p className="body-6 text-zinc-400">{faq.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollReveal>
      </section>

      {/* 8. RISK REVERSAL & FINAL CTA */}
      <section
        aria-label="Download call to action"
        className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8"
      >
        <ScrollReveal>
          <div className="rounded-2xl border border-[#D4AF37]/40 bg-[#131209] p-8 sm:p-12">
            <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
              <div className="max-w-[680px]">
                <span className="caption-1 text-[#D4AF37]">
                  Free to use with no signup required
                </span>
                <h2 className="heading-3 mt-2 text-white">
                  Keep every Indian tax slab and finance formula within reach
                </h2>
                <p className="body-5 mt-3 text-zinc-300">
                  No email form, no credit card, and no locked calculators. Download the study kit now or launch any calculator directly in your browser.
                </p>
              </div>

              <div className="flex flex-col items-start gap-3 shrink-0">
                <button
                  type="button"
                  onClick={onDownloadKit}
                  className="button-md inline-flex items-center gap-2 rounded-lg bg-[#D4AF37] px-3 py-2 text-[#000000] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-[#E5C158] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white whitespace-nowrap"
                >
                  <DownloadSimple size={18} weight="bold" aria-hidden="true" />
                  <span>Download free CA formula kit</span>
                </button>
                <button
                  type="button"
                  onClick={() => onOpenCalculator('income-tax')}
                  className="button-sm text-zinc-300 transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:text-[#D4AF37] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
                >
                  Or open the interactive calculators
                </button>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
