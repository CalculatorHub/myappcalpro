import React, { useMemo } from 'react';
import {
  Activity,
  ArrowRight,
  Landmark,
  PiggyBank,
  ShieldCheck,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { computeWorkspaceAnalytics } from '../../logic/suiteCalculators';
import { formatINR, formatINRCompact } from '../../utils/formatters';
import { VaultPromptBanner } from '../ui/VaultPromptBanner';
import { TiltCard3D } from '../ui/TiltCard3D';

export type SuiteModuleId =
  | 'insights'
  | 'investments'
  | 'loans'
  | 'goals'
  | 'expenses'
  | 'reports'
  | 'tax-planner'
  | 'retirement'
  | 'glossary'
  | 'education';

interface InsightsDashboardModuleProps {
  onOpenModule: (moduleId: SuiteModuleId) => void;
}

export const InsightsDashboardModule: React.FC<InsightsDashboardModuleProps> = ({
  onOpenModule,
}) => {
  const { workspace } = useAuth();

  const analytics = useMemo(() => computeWorkspaceAnalytics(workspace), [workspace]);

  const assetTotalForBar = Math.max(1, analytics.totalAssets + analytics.totalDebtRemaining);
  const assetPct = (analytics.totalAssets / assetTotalForBar) * 100;
  const debtPct = (analytics.totalDebtRemaining / assetTotalForBar) * 100;

  return (
    <div className="space-y-6">
      <VaultPromptBanner moduleLabel="Financial Insights Dashboard" />

      {/* Top Executive KPI Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <TiltCard3D className="aurora-card-accent p-5 space-y-2" maxTiltDeg={2.5}>
          <div className="flex items-center justify-between text-xs text-[#38BDF8]">
            <span className="font-semibold">Estimated Net Worth</span>
            <Wallet className="h-4 w-4 text-[#06B6D4]" aria-hidden="true" />
          </div>
          <p className="font-mono text-2xl font-bold text-[#F8FAFC] tabular-nums">
            {formatINRCompact(analytics.netWorth)}
          </p>
          <p className="text-[11px] text-[#94A3B8]">
            Assets {formatINRCompact(analytics.totalAssets)} − Debt {formatINRCompact(analytics.totalDebtRemaining)}
          </p>
        </TiltCard3D>

        <TiltCard3D className="aurora-card p-5 space-y-2" maxTiltDeg={2.5}>
          <div className="flex items-center justify-between text-xs text-[#C084FC]">
            <span className="font-semibold">Projected Wealth</span>
            <TrendingUp className="h-4 w-4 text-[#A855F7]" aria-hidden="true" />
          </div>
          <p className="font-mono text-2xl font-bold text-[#F8FAFC] tabular-nums">
            {formatINRCompact(analytics.investmentProjectedTotal)}
          </p>
          <p className="text-[11px] text-[#94A3B8]">
            {workspace.investments.length} plans · {formatINR(analytics.totalMonthlySip)}/mo SIP
          </p>
        </TiltCard3D>

        <TiltCard3D className="aurora-card p-5 space-y-2" maxTiltDeg={2.5}>
          <div className="flex items-center justify-between text-xs text-[#10B981]">
            <span className="font-semibold">Cashflow &amp; Savings Rate</span>
            <Activity className="h-4 w-4 text-[#10B981]" aria-hidden="true" />
          </div>
          <p className="font-mono text-2xl font-bold text-[#F8FAFC] tabular-nums">
            {analytics.monthlyIncome > 0 ? `${analytics.savingsRate.toFixed(1)}%` : '—'}
          </p>
          <p className="text-[11px] text-[#94A3B8]">
            Net Cashflow: {formatINR(analytics.netCashflow)}
          </p>
        </TiltCard3D>

        <TiltCard3D className="aurora-card p-5 space-y-2" maxTiltDeg={2.5}>
          <div className="flex items-center justify-between text-xs text-[#38BDF8]">
            <span className="font-semibold">Financial Health Score</span>
            <ShieldCheck className="h-4 w-4 text-[#6366F1]" aria-hidden="true" />
          </div>
          <p className="font-mono text-2xl font-bold aurora-text-gradient tabular-nums">
            {analytics.healthScore} / 100
          </p>
          <p className="text-[11px] text-[#94A3B8]">
            Goal Progress: {analytics.goalsCompletion.toFixed(0)}% · {workspace.loans.length} loans
          </p>
        </TiltCard3D>
      </div>

      {/* Interactive Breakdown Row */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Assets vs Liabilities Visual Bar + Actionable Insights */}
        <div className="aurora-card p-6 space-y-5 lg:col-span-7">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-semibold text-[#F8FAFC]">
                Balance Sheet &amp; Cashflow Pulse
              </h3>
              <p className="text-xs text-[#94A3B8]">
                Live aggregation from your SQLite Investments, Goals, Loans, and Transactions
              </p>
            </div>
            <button
              type="button"
              onClick={() => onOpenModule('reports')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#38BDF8] hover:text-[#F8FAFC] cursor-pointer"
            >
              <span>Generate Report</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-[#10B981] font-medium">
                Assets ({assetPct.toFixed(0)}%): {formatINR(analytics.totalAssets)}
              </span>
              <span className="text-[#D946EF] font-medium">
                Debt ({debtPct.toFixed(0)}%): {formatINR(analytics.totalDebtRemaining)}
              </span>
            </div>
            <div className="h-3.5 w-full overflow-hidden rounded-full bg-[#080D1B] border border-[#6366F1]/25 flex">
              <div
                style={{ width: `${assetPct}%` }}
                className="h-full bg-gradient-to-r from-[#10B981] to-[#06B6D4] transition-all duration-500"
              />
              <div
                style={{ width: `${debtPct}%` }}
                className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#D946EF] transition-all duration-500"
              />
            </div>
          </div>

          {/* Key Ratio Meters */}
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="aurora-subcard p-3.5 space-y-1">
              <p className="text-[11px] text-[#94A3B8]">Monthly EMI Obligation</p>
              <p className="font-mono text-base font-bold text-[#F8FAFC]">
                {formatINR(analytics.totalMonthlyEmi)}
              </p>
              <p className="text-[11px] text-[#C084FC]">
                {analytics.monthlyIncome > 0
                  ? `DTI: ${analytics.dtiRatio.toFixed(1)}% (target <35%)`
                  : 'Log income to measure DTI'}
              </p>
            </div>

            <div className="aurora-subcard p-3.5 space-y-1">
              <p className="text-[11px] text-[#94A3B8]">Savings Goals Pool</p>
              <p className="font-mono text-base font-bold text-[#38BDF8]">
                {formatINR(analytics.goalsSaved)}
              </p>
              <p className="text-[11px] text-[#94A3B8]">
                of {formatINR(analytics.goalsTarget)} target
              </p>
            </div>

            <div className="aurora-subcard p-3.5 space-y-1">
              <p className="text-[11px] text-[#94A3B8]">Tax Regime Optimization</p>
              <p className="font-mono text-base font-bold text-[#10B981]">
                {analytics.taxRecommendedSavings > 0
                  ? `Save ${formatINR(analytics.taxRecommendedSavings)}`
                  : '—'}
              </p>
              <p className="text-[11px] text-[#94A3B8]">
                {workspace.taxPlans.length > 0
                  ? `${workspace.taxPlans.length} saved tax plan(s)`
                  : 'Create a tax plan'}
              </p>
            </div>
          </div>

          {/* Deterministic Actionable Recommendations */}
          <div className="aurora-subcard p-4 space-y-2.5">
            <p className="text-xs font-semibold text-[#38BDF8]">Actionable Financial Signals</p>
            <ul className="space-y-1.5 text-xs text-[#E2E8F0]">
              {workspace.investments.length === 0 && (
                <li className="flex items-center justify-between gap-2">
                  <span>• Add your SIP or lump sum holdings in Investment Planner to forecast compounding.</span>
                  <button
                    type="button"
                    onClick={() => onOpenModule('investments')}
                    className="text-[#38BDF8] font-semibold shrink-0 cursor-pointer"
                  >
                    Open →
                  </button>
                </li>
              )}
              {workspace.loans.length > 0 && analytics.dtiRatio > 35 && (
                <li className="flex items-center justify-between gap-2">
                  <span>• Monthly EMIs exceed 35% of logged income. Test extra prepayments in Loan Management.</span>
                  <button
                    type="button"
                    onClick={() => onOpenModule('loans')}
                    className="text-[#C084FC] font-semibold shrink-0 cursor-pointer"
                  >
                    Simulate →
                  </button>
                </li>
              )}
              {workspace.goals.length === 0 && (
                <li className="flex items-center justify-between gap-2">
                  <span>• Set up an Emergency Fund (6× monthly spend) in Savings Goal Tracker.</span>
                  <button
                    type="button"
                    onClick={() => onOpenModule('goals')}
                    className="text-[#10B981] font-semibold shrink-0 cursor-pointer"
                  >
                    Track →
                  </button>
                </li>
              )}
              {workspace.retirementPlans.length === 0 && (
                <li className="flex items-center justify-between gap-2">
                  <span>• Model your inflation-adjusted retirement corpus &amp; monthly SIP gap.</span>
                  <button
                    type="button"
                    onClick={() => onOpenModule('retirement')}
                    className="text-[#38BDF8] font-semibold shrink-0 cursor-pointer"
                  >
                    Plan →
                  </button>
                </li>
              )}
              {workspace.investments.length > 0 &&
                workspace.goals.length > 0 &&
                workspace.retirementPlans.length > 0 && (
                  <li className="text-[#34D399]">
                    • Great portfolio coverage across Investments, Goals, and Retirement! Export a PDF/CSV snapshot anytime in Financial Reports.
                  </li>
                )}
            </ul>
          </div>
        </div>

        {/* Category Spend Snapshot + Quick Launch */}
        <div className="aurora-card p-6 space-y-5 lg:col-span-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-[#F8FAFC]">Top Expense Categories</h3>
            <button
              type="button"
              onClick={() => onOpenModule('expenses')}
              className="text-xs font-semibold text-[#38BDF8] hover:text-[#F8FAFC] cursor-pointer"
            >
              Manage →
            </button>
          </div>

          {analytics.topCategories.length === 0 ? (
            <div className="aurora-subcard p-5 text-center space-y-2">
              <p className="text-xs text-[#94A3B8]">
                No expense entries recorded yet. Log income and expenses to unlock live spend bars.
              </p>
              <button
                type="button"
                onClick={() => onOpenModule('expenses')}
                className="aurora-btn-primary rounded-xl px-3.5 py-1.5 text-xs font-semibold cursor-pointer"
              >
                Open Expense &amp; Budget Manager
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {analytics.topCategories.map(([cat, amt], idx) => {
                const pct =
                  analytics.monthlyExpense > 0
                    ? Math.min(100, (amt / analytics.monthlyExpense) * 100)
                    : 0;
                const gradients = [
                  'from-[#06B6D4] to-[#2563EB]',
                  'from-[#6366F1] to-[#8B5CF6]',
                  'from-[#A855F7] to-[#D946EF]',
                  'from-[#10B981] to-[#06B6D4]',
                  'from-[#2563EB] to-[#A855F7]',
                ];
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#E2E8F0] font-medium">{cat}</span>
                      <span className="font-mono text-[#F8FAFC] tabular-nums">
                        {formatINR(amt)} ({pct.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-[#080D1B] overflow-hidden">
                      <div
                        style={{ width: `${pct}%` }}
                        className={`h-full rounded-full bg-gradient-to-r ${gradients[idx % gradients.length]}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Quick Jump Module Shortcuts */}
          <div className="grid grid-cols-2 gap-2.5 pt-2">
            {[
              { id: 'investments' as const, label: 'Investments', icon: TrendingUp },
              { id: 'loans' as const, label: 'Loan Manager', icon: Landmark },
              { id: 'goals' as const, label: 'Savings Goals', icon: PiggyBank },
              { id: 'tax-planner' as const, label: 'Tax Planner', icon: ShieldCheck },
            ].map((q) => {
              const Icon = q.icon;
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => onOpenModule(q.id)}
                  className="aurora-subcard flex items-center gap-2 px-3 py-2.5 text-xs font-medium text-[#E2E8F0] hover:border-[#06B6D4]/55 hover:text-[#38BDF8] transition-colors cursor-pointer"
                >
                  <Icon className="h-3.5 w-3.5 text-[#38BDF8]" aria-hidden="true" />
                  <span>{q.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
