import React, { Suspense, lazy } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Activity,
  BookOpen,
  Compass,
  FileSpreadsheet,
  GraduationCap,
  Landmark,
  Scale,
  Target,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import type { SuiteModuleId } from './InsightsDashboardModule';

const InsightsDashboardModule = lazy(() =>
  import('./InsightsDashboardModule').then((m) => ({ default: m.InsightsDashboardModule }))
);
const InvestmentPlannerModule = lazy(() =>
  import('./InvestmentPlannerModule').then((m) => ({ default: m.InvestmentPlannerModule }))
);
const LoanManagementModule = lazy(() =>
  import('./LoanManagementModule').then((m) => ({ default: m.LoanManagementModule }))
);
const SavingsGoalModule = lazy(() =>
  import('./SavingsGoalModule').then((m) => ({ default: m.SavingsGoalModule }))
);
const ExpenseBudgetModule = lazy(() =>
  import('./ExpenseBudgetModule').then((m) => ({ default: m.ExpenseBudgetModule }))
);
const FinancialReportsModule = lazy(() =>
  import('./FinancialReportsModule').then((m) => ({ default: m.FinancialReportsModule }))
);
const TaxPlannerModule = lazy(() =>
  import('./TaxPlannerModule').then((m) => ({ default: m.TaxPlannerModule }))
);
const RetirementPlannerModule = lazy(() =>
  import('./RetirementPlannerModule').then((m) => ({ default: m.RetirementPlannerModule }))
);
const GlossaryModule = lazy(() =>
  import('./GlossaryModule').then((m) => ({ default: m.GlossaryModule }))
);
const EducationCenterModule = lazy(() =>
  import('./EducationCenterModule').then((m) => ({ default: m.EducationCenterModule }))
);

export type SuiteGroup = 'insights' | 'planners' | 'reports' | 'learn';

export interface SuiteModuleMeta {
  id: SuiteModuleId;
  title: string;
  shortLabel: string;
  group: SuiteGroup;
  description: string;
  accentGradient: string;
  icon: React.ComponentType<{ className?: string }>;
  keywords: string[];
}

export const SUITE_MODULE_ITEMS: SuiteModuleMeta[] = [
  {
    id: 'insights',
    title: 'Financial Insights Dashboard',
    shortLabel: 'Insights',
    group: 'insights',
    description: 'Live net worth, savings rate, health score & asset-vs-debt signals.',
    accentGradient: 'from-[#2563EB] via-[#6366F1] to-[#06B6D4]',
    icon: Activity,
    keywords: ['insights', 'dashboard', 'net worth', 'health score', 'analytics'],
  },
  {
    id: 'investments',
    title: 'Investment Planner',
    shortLabel: 'Investments',
    group: 'planners',
    description: 'Step-up SIP & lump-sum wealth projection with inflation adjustment.',
    accentGradient: 'from-[#2563EB] via-[#6366F1] to-[#8B5CF6]',
    icon: TrendingUp,
    keywords: ['investment', 'sip', 'mutual fund', 'equity', 'ppf', 'portfolio'],
  },
  {
    id: 'loans',
    title: 'Loan Management',
    shortLabel: 'Loans',
    group: 'planners',
    description: 'Prepayment savings simulator with Avalanche & Snowball payoff strategy.',
    accentGradient: 'from-[#06B6D4] via-[#2563EB] to-[#6366F1]',
    icon: Landmark,
    keywords: ['loan', 'debt', 'prepayment', 'avalanche', 'snowball', 'mortgage'],
  },
  {
    id: 'goals',
    title: 'Savings Goal Tracker',
    shortLabel: 'Goals',
    group: 'planners',
    description: 'Track target milestones, monthly SIP pace & instant progress top-ups.',
    accentGradient: 'from-[#10B981] via-[#06B6D4] to-[#2563EB]',
    icon: Target,
    keywords: ['goal', 'savings', 'emergency fund', 'target', 'milestone'],
  },
  {
    id: 'expenses',
    title: 'Expense & Budget Manager',
    shortLabel: 'Expenses',
    group: 'planners',
    description: 'Monthly income & expense ledger with category budget caps.',
    accentGradient: 'from-[#8B5CF6] via-[#A855F7] to-[#D946EF]',
    icon: Wallet,
    keywords: ['expense', 'budget', 'ledger', 'cashflow', 'spending', 'category'],
  },
  {
    id: 'reports',
    title: 'Financial Reports',
    shortLabel: 'Reports',
    group: 'reports',
    description: 'Consolidated personal balance sheet with CSV & printable PDF export.',
    accentGradient: 'from-[#06B6D4] via-[#6366F1] to-[#A855F7]',
    icon: FileSpreadsheet,
    keywords: ['report', 'pdf', 'csv', 'export', 'balance sheet', 'statement'],
  },
  {
    id: 'tax-planner',
    title: 'Tax Planner',
    shortLabel: 'Tax Planner',
    group: 'planners',
    description: 'Optimize 80C, 80D, NPS 80CCD(1B), HRA & Old vs New Regime savings.',
    accentGradient: 'from-[#10B981] via-[#06B6D4] to-[#6366F1]',
    icon: Scale,
    keywords: ['tax planner', '80c', '80d', 'nps', 'hra', 'tds', 'deductions'],
  },
  {
    id: 'retirement',
    title: 'Retirement Planner',
    shortLabel: 'Retirement',
    group: 'planners',
    description: 'Inflation-adjusted corpus target & post-retirement SWP drawdown curve.',
    accentGradient: 'from-[#A855F7] via-[#8B5CF6] to-[#2563EB]',
    icon: Compass,
    keywords: ['retirement', 'corpus', 'fire', 'pension', 'swp', 'annuity'],
  },
  {
    id: 'glossary',
    title: 'Financial Glossary',
    shortLabel: 'Glossary',
    group: 'learn',
    description: '30+ Indian finance & tax definitions synced from SQLite (+ Admin CRUD).',
    accentGradient: 'from-[#2563EB] via-[#06B6D4] to-[#10B981]',
    icon: BookOpen,
    keywords: ['glossary', 'terms', 'definitions', 'cagr', 'xirr', 'section 87a'],
  },
  {
    id: 'education',
    title: 'Financial Education Center',
    shortLabel: 'Education',
    group: 'learn',
    description: 'Structured learning modules with interactive quizzes & mastery tracking.',
    accentGradient: 'from-[#8B5CF6] via-[#D946EF] to-[#06B6D4]',
    icon: GraduationCap,
    keywords: ['education', 'learn', 'courses', 'quiz', 'lessons', 'ca study'],
  },
];

interface SuiteWorkspaceProps {
  activeModule: SuiteModuleId;
  onSelectModule: (id: SuiteModuleId) => void;
}

const ModuleLoadingFallback: React.FC = () => (
  <div className="aurora-card p-8 flex items-center justify-center gap-3 text-sm text-[#94A3B8]">
    <span className="h-4 w-4 rounded-full border-2 border-[#06B6D4] border-t-transparent animate-spin" />
    <span>Loading financial module...</span>
  </div>
);

export const SuiteWorkspace: React.FC<SuiteWorkspaceProps> = ({
  activeModule,
  onSelectModule,
}) => {
  const activeMeta =
    SUITE_MODULE_ITEMS.find((item) => item.id === activeModule) ?? SUITE_MODULE_ITEMS[0];

  const renderActiveModule = () => {
    switch (activeModule) {
      case 'insights':
        return <InsightsDashboardModule onOpenModule={onSelectModule} />;
      case 'investments':
        return <InvestmentPlannerModule />;
      case 'loans':
        return <LoanManagementModule />;
      case 'goals':
        return <SavingsGoalModule />;
      case 'expenses':
        return <ExpenseBudgetModule />;
      case 'reports':
        return <FinancialReportsModule />;
      case 'tax-planner':
        return <TaxPlannerModule />;
      case 'retirement':
        return <RetirementPlannerModule />;
      case 'glossary':
        return <GlossaryModule />;
      case 'education':
        return <EducationCenterModule />;
      default:
        return <InsightsDashboardModule onOpenModule={onSelectModule} />;
    }
  };

  return (
    <section
      id="financial-suite"
      aria-labelledby="suite-heading"
      className="scroll-mt-24 border-t border-[#6366F1]/25 py-12 sm:py-16"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 space-y-6">
        {/* Section Heading */}
        <div className="space-y-1.5">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#38BDF8]">
            Personal Wealth · Planning · Learning Suite
          </p>
          <h2 id="suite-heading" className="heading-2 text-[#F8FAFC]">
            {activeMeta.title}
          </h2>
          <p className="text-sm text-[#94A3B8] max-w-2xl">{activeMeta.description}</p>
        </div>

        {/* 10-Module Interactive Switcher (balanced 2x5 on tablet/desktop, 5x2 on mobile) */}
        <div
          role="tablist"
          aria-label="Financial planning and education modules"
          className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 no-print"
        >
          {SUITE_MODULE_ITEMS.map((mod) => {
            const Icon = mod.icon;
            const isActive = mod.id === activeModule;
            return (
              <button
                key={mod.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => onSelectModule(mod.id)}
                className={`group flex items-center gap-2.5 rounded-2xl border px-3 py-2.5 text-left transition-all cursor-pointer min-w-0 ${
                  isActive
                    ? 'border-[#06B6D4]/70 bg-gradient-to-br from-[#2563EB]/25 via-[#6366F1]/25 to-[#A855F7]/20 shadow-[0_8px_24px_-10px_rgba(6,182,212,0.55)]'
                    : 'border-[#6366F1]/20 bg-[#0B1020]/75 hover:border-[#06B6D4]/45 hover:bg-[#0F172A]/85'
                }`}
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all ${
                    isActive
                      ? `bg-gradient-to-br ${mod.accentGradient} text-[#F8FAFC]`
                      : 'bg-[#080D1B] border border-[#6366F1]/25 text-[#94A3B8] group-hover:text-[#38BDF8]'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <span
                  className={`text-xs leading-tight font-semibold truncate ${
                    isActive ? 'text-[#F8FAFC]' : 'text-[#94A3B8] group-hover:text-[#F8FAFC]'
                  }`}
                >
                  {mod.shortLabel}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Module Workspace */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeModule}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            <Suspense fallback={<ModuleLoadingFallback />}>{renderActiveModule()}</Suspense>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};
