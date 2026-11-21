import React, { Suspense, lazy } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Calculator, Star } from 'lucide-react';
import {
  CALCULATOR_CARDS,
  type CalculatorId,
} from '../../data/calculatorCatalog';
import type { CalculationHistoryItem } from '../../utils/storage';
import { MAIN_NAV_ITEMS, type MainNavSection } from '../ui/Header';

const SimpleInterestCalc = lazy(() => import('./SimpleInterestCalc'));
const CompoundInterestCalc = lazy(() => import('./CompoundInterestCalc'));
const LoanEmiCalc = lazy(() => import('./LoanEmiCalc'));
const IncomeTaxCalc = lazy(() => import('./IncomeTaxCalc'));

interface CalculatorWorkspaceProps {
  activeNavSection: MainNavSection;
  activeCalc: CalculatorId;
  onSelectCalc: (id: CalculatorId) => void;
  favorites: CalculatorId[];
  onToggleFavorite: (id: CalculatorId) => void;
  onSaveHistory: (entry: Omit<CalculationHistoryItem, 'id' | 'timestamp'>) => void;
}

const CalculatorSkeleton: React.FC = () => (
  <div className="grid gap-6 lg:grid-cols-12 items-start animate-pulse" aria-hidden="true">
    <div className="luxury-card p-6 lg:col-span-5 h-[420px]" />
    <div className="lg:col-span-7 space-y-5">
      <div className="luxury-card p-6 h-[220px]" />
      <div className="luxury-card p-6 h-[180px]" />
    </div>
  </div>
);

export const CalculatorWorkspace: React.FC<CalculatorWorkspaceProps> = ({
  activeNavSection,
  activeCalc,
  onSelectCalc,
  favorites,
  onToggleFavorite,
  onSaveHistory,
}) => {
  const activeMeta =
    CALCULATOR_CARDS.find((item) => item.id === activeCalc) ?? CALCULATOR_CARDS[0];
  const isFavorited = favorites.includes(activeMeta.id);

  const sectionTitle =
    MAIN_NAV_ITEMS.find((item) => item.id === activeNavSection)?.label ?? activeMeta.title;

  return (
    <motion.section
      id="calculators"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16"
    >
      {/* Section Heading */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-[#D4AF37]">
          <Calculator className="h-4 w-4" aria-hidden="true" />
          <span>Interactive Calculator Workspace · {activeMeta.categoryLabel}</span>
        </div>
        <div className="mt-1.5 flex items-center gap-3">
          <h2 className="heading-3 text-white">{sectionTitle}</h2>
          <button
            type="button"
            onClick={() => onToggleFavorite(activeMeta.id)}
            aria-label={
              isFavorited
                ? `Remove ${activeMeta.title} from favorites`
                : `Pin ${activeMeta.title} to favorites`
            }
            aria-pressed={isFavorited}
            className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
              isFavorited
                ? 'border-[#F5D76E]/55 bg-[#D4AF37]/18 text-[#F5D76E]'
                : 'border-[#D4AF37]/25 bg-white/[0.04] text-[#A1A1AA] hover:border-[#D4AF37] hover:text-white'
            }`}
          >
            <Star
              className={`h-3.5 w-3.5 ${isFavorited ? 'fill-current' : ''}`}
              aria-hidden="true"
            />
            <span>{isFavorited ? 'Pinned' : 'Pin'}</span>
          </button>
        </div>
      </div>

      {/* Sub-Tabs Inside Interest Calculator: Simple Interest | Compound Interest */}
      {activeNavSection === 'interest' && (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <div
            role="tablist"
            aria-label="Interest calculation type"
            className="inline-flex rounded-full border border-[#D4AF37]/25 bg-[#0C0C0F]/85 backdrop-blur-md p-1"
          >
            {(
              [
                { id: 'simple-interest', label: 'Simple Interest' },
                { id: 'compound-interest', label: 'Compound Interest' },
              ] as { id: CalculatorId; label: string }[]
            ).map((tab) => {
              const selected = activeCalc === tab.id;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={selected}
                  type="button"
                  onClick={() => onSelectCalc(tab.id)}
                  className={`relative rounded-full px-4 py-1.5 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap cursor-pointer focus-visible:outline-2 focus-visible:outline-[#D4AF37] ${
                    selected
                      ? 'text-[#050505] font-semibold'
                      : 'text-[#A1A1AA] hover:text-[#F5D76E]'
                  }`}
                >
                  {selected && (
                    <motion.span
                      layoutId="interest-subtab-pill"
                      transition={{ type: 'spring', stiffness: 440, damping: 34 }}
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-[#F5D76E] to-[#D4AF37] shadow-[0_4px_16px_-3px_rgba(212,175,55,0.55)]"
                      aria-hidden="true"
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </div>

          <p className="text-xs text-[#A1A1AA]">
            {activeCalc === 'simple-interest'
              ? 'Linear interest growth across years, months, or days'
              : 'Compounded annual to daily schedules with Effective Annual Rate'}
          </p>
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={activeCalc}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="mt-7"
        >
          <Suspense fallback={<CalculatorSkeleton />}>
            {activeCalc === 'simple-interest' && (
              <SimpleInterestCalc onSaveHistory={onSaveHistory} />
            )}
            {activeCalc === 'compound-interest' && (
              <CompoundInterestCalc onSaveHistory={onSaveHistory} />
            )}
            {activeCalc === 'loan-emi' && <LoanEmiCalc onSaveHistory={onSaveHistory} />}
            {activeCalc === 'income-tax' && <IncomeTaxCalc onSaveHistory={onSaveHistory} />}
          </Suspense>
        </motion.div>
      </AnimatePresence>
    </motion.section>
  );
};
