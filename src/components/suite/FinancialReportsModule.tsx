import React, { useMemo, useState } from 'react';
import { Download, FileSpreadsheet, Printer } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  calculateRetirementProjection,
  computeWorkspaceAnalytics,
} from '../../logic/suiteCalculators';
import { downloadCsvFile, triggerPrintPdf } from '../../utils/exportUtils';
import { formatINR } from '../../utils/formatters';
import { VaultPromptBanner } from '../ui/VaultPromptBanner';

export const FinancialReportsModule: React.FC = () => {
  const { user, workspace } = useAuth();
  const [includeCashflow, setIncludeCashflow] = useState(true);
  const [includePortfolio, setIncludePortfolio] = useState(true);
  const [includeLoansGoals, setIncludeLoansGoals] = useState(true);
  const [includeTaxRetire, setIncludeTaxRetire] = useState(true);

  const report = useMemo(() => {
    const analytics = computeWorkspaceAnalytics(workspace);
    const retireRows = workspace.retirementPlans.map((rp) => ({
      rp,
      proj: calculateRetirementProjection({
        currentAge: rp.current_age,
        retirementAge: rp.retirement_age,
        lifeExpectancy: rp.life_expectancy,
        currentMonthlyExpense: rp.current_monthly_expense,
        inflationRate: rp.inflation_rate,
        currentCorpus: rp.current_corpus,
        monthlySip: rp.monthly_sip,
        preRetireReturn: rp.pre_retire_return,
        postRetireReturn: rp.post_retire_return,
      }),
    }));

    return {
      investmentRows: analytics.investmentRows,
      loanRows: analytics.loanRows,
      goalRows: analytics.goalRows,
      totalAssets: analytics.totalAssets,
      totalDebt: analytics.totalDebtRemaining,
      netWorth: analytics.netWorth,
      totalIncome: analytics.monthlyIncome,
      totalExpense: analytics.monthlyExpense,
      taxRows: analytics.taxRows,
      retireRows,
    };
  }, [workspace]);

  const handleExportMasterCsv = () => {
    const rows: Array<Array<string | number>> = [
      ['Executive Summary', 'Total Assets', report.totalAssets.toFixed(2), 'INR'],
      ['Executive Summary', 'Total Liabilities', report.totalDebt.toFixed(2), 'INR'],
      ['Executive Summary', 'Net Worth', report.netWorth.toFixed(2), 'INR'],
      ['Cashflow', 'Logged Income', report.totalIncome.toFixed(2), 'INR'],
      ['Cashflow', 'Logged Expenses', report.totalExpense.toFixed(2), 'INR'],
    ];

    if (includePortfolio) {
      for (const { item, proj } of report.investmentRows) {
        rows.push([
          'Investment',
          `${item.name} (${item.category})`,
          proj.futureValue.toFixed(2),
          `SIP ${item.monthly_contribution}/mo @ ${item.annual_return}% for ${item.tenure_years}y`,
        ]);
      }
    }

    if (includeLoansGoals) {
      for (const { loan, sim } of report.loanRows) {
        rows.push([
          'Loan Liability',
          `${loan.lender_name} (${loan.loan_type})`,
          sim.remainingBalance.toFixed(2),
          `EMI ${sim.monthlyEmi.toFixed(0)}/mo @ ${loan.annual_rate}%`,
        ]);
      }
      for (const { goal, calc } of report.goalRows) {
        rows.push([
          'Savings Goal',
          goal.title,
          goal.saved_amount.toFixed(2),
          `${calc.progressPercent.toFixed(1)}% of ${goal.target_amount}`,
        ]);
      }
    }

    if (includeTaxRetire) {
      for (const { tp, newRes, oldRes } of report.taxRows) {
        rows.push([
          'Tax Plan',
          `${tp.plan_name} (${tp.financial_year})`,
          Math.min(newRes.totalTaxLiability, oldRes.totalTaxLiability).toFixed(2),
          `New ${newRes.totalTaxLiability} vs Old ${oldRes.totalTaxLiability}`,
        ]);
      }
      for (const { rp, proj } of report.retireRows) {
        rows.push([
          'Retirement Plan',
          rp.plan_name,
          proj.projectedCorpus.toFixed(2),
          `Required ${proj.requiredCorpus.toFixed(0)} at age ${rp.retirement_age}`,
        ]);
      }
    }

    downloadCsvFile(
      `calhub-financial-report-${new Date().toISOString().slice(0, 10)}.csv`,
      ['Section', 'Item', 'Amount (INR)', 'Notes'],
      rows
    );
  };

  return (
    <div className="space-y-6">
      <div className="no-print">
        <VaultPromptBanner moduleLabel="Financial Reports" />
      </div>

      {/* Controls Bar */}
      <div className="aurora-card p-5 flex flex-wrap items-center justify-between gap-4 no-print">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="font-semibold text-[#38BDF8]">Report Sections:</span>
          {[
            { label: 'Cashflow', checked: includeCashflow, set: setIncludeCashflow },
            { label: 'Investments', checked: includePortfolio, set: setIncludePortfolio },
            { label: 'Loans & Goals', checked: includeLoansGoals, set: setIncludeLoansGoals },
            { label: 'Tax & Retirement', checked: includeTaxRetire, set: setIncludeTaxRetire },
          ].map((sec) => (
            <label key={sec.label} className="inline-flex items-center gap-1.5 text-[#E2E8F0] cursor-pointer">
              <input
                type="checkbox"
                checked={sec.checked}
                onChange={(e) => sec.set(e.target.checked)}
                className="accent-[#06B6D4] cursor-pointer"
              />
              <span>{sec.label}</span>
            </label>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportMasterCsv}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#06B6D4]/40 bg-[#0B1020] px-3.5 py-2 text-xs font-semibold text-[#38BDF8] hover:border-[#06B6D4] cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Export Consolidated CSV</span>
          </button>
          <button
            type="button"
            onClick={triggerPrintPdf}
            className="aurora-btn-primary inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold cursor-pointer"
          >
            <Printer className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Print / Save PDF Report</span>
          </button>
        </div>
      </div>

      {/* Printable Report Sheet */}
      <div className="aurora-card-accent p-6 sm:p-8 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#6366F1]/25 pb-4">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="h-6 w-6 text-[#38BDF8]" aria-hidden="true" />
            <div>
              <h3 className="text-xl font-bold text-[#F8FAFC]">
                Personal Financial Statement &amp; Plan Summary
              </h3>
              <p className="text-xs text-[#94A3B8]">
                {user ? `Prepared for ${user.name} (${user.email})` : 'Preview Mode'} · Generated{' '}
                {new Date().toLocaleDateString('en-IN', { dateStyle: 'medium' })}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-[#94A3B8]">Net Worth</p>
            <p className="font-mono text-2xl font-bold text-[#10B981]">
              {formatINR(report.netWorth)}
            </p>
          </div>
        </div>

        {/* Balance Sheet Summary */}
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
          <div className="aurora-subcard p-3.5 min-w-0">
            <p className="text-xs text-[#94A3B8]">Total Assets</p>
            <p className="mt-1 font-mono text-base font-bold text-[#F8FAFC] break-words">
              {formatINR(report.totalAssets)}
            </p>
          </div>
          <div className="aurora-subcard p-3.5 min-w-0">
            <p className="text-xs text-[#94A3B8]">Remaining Debt</p>
            <p className="mt-1 font-mono text-base font-bold text-[#E879F9] break-words">
              {formatINR(report.totalDebt)}
            </p>
          </div>
          {includeCashflow && (
            <>
              <div className="aurora-subcard p-3.5 min-w-0">
                <p className="text-xs text-[#94A3B8]">Logged Income</p>
                <p className="mt-1 font-mono text-base font-bold text-[#10B981] break-words">
                  {formatINR(report.totalIncome)}
                </p>
              </div>
              <div className="aurora-subcard p-3.5 min-w-0">
                <p className="text-xs text-[#94A3B8]">Logged Expenses</p>
                <p className="mt-1 font-mono text-base font-bold text-[#F8FAFC] break-words">
                  {formatINR(report.totalExpense)}
                </p>
              </div>
            </>
          )}
        </div>

        {includePortfolio && (
          <div className="space-y-2.5">
            <h4 className="text-sm font-semibold text-[#38BDF8]">Investment Projections</h4>
            {report.investmentRows.length === 0 ? (
              <p className="text-xs text-[#94A3B8]">No investments saved.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0B1020] text-[#94A3B8]">
                    <tr>
                      <th className="px-3 py-2.5">Instrument</th>
                      <th className="px-3 py-2.5">Category</th>
                      <th className="px-3 py-2.5 text-right">Monthly SIP</th>
                      <th className="px-3 py-2.5 text-right">Base Principal</th>
                      <th className="px-3 py-2.5 text-right">Projected Maturity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#6366F1]/15 font-mono tabular-nums">
                    {report.investmentRows.map(({ item, proj }) => (
                      <tr key={item.id}>
                        <td className="px-3 py-2.5 font-sans text-[#F8FAFC]">{item.name}</td>
                        <td className="px-3 py-2.5 font-sans text-[#94A3B8]">{item.category}</td>
                        <td className="px-3 py-2.5 text-right">{formatINR(item.monthly_contribution)}</td>
                        <td className="px-3 py-2.5 text-right">{formatINR(item.principal_amount)}</td>
                        <td className="px-3 py-2.5 text-right text-[#10B981] font-semibold">
                          {formatINR(proj.futureValue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {includeLoansGoals && (
          <div className="grid gap-5 md:grid-cols-2">
            <div className="aurora-subcard p-4 space-y-2">
              <h4 className="text-sm font-semibold text-[#C084FC]">Loans &amp; EMI Schedule</h4>
              {report.loanRows.length === 0 ? (
                <p className="text-xs text-[#94A3B8]">No loans saved.</p>
              ) : (
                <ul className="space-y-1.5 text-xs">
                  {report.loanRows.map(({ loan, sim }) => (
                    <li key={loan.id} className="flex justify-between gap-2">
                      <span className="text-[#E2E8F0]">{loan.lender_name}</span>
                      <span className="font-mono text-[#F8FAFC]">
                        {formatINR(sim.remainingBalance)} ({formatINR(sim.monthlyEmi)}/mo)
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="aurora-subcard p-4 space-y-2">
              <h4 className="text-sm font-semibold text-[#10B981]">Savings Goal Progress</h4>
              {report.goalRows.length === 0 ? (
                <p className="text-xs text-[#94A3B8]">No goals saved.</p>
              ) : (
                <ul className="space-y-1.5 text-xs">
                  {report.goalRows.map(({ goal, calc }) => (
                    <li key={goal.id} className="flex justify-between gap-2">
                      <span className="text-[#E2E8F0]">{goal.title}</span>
                      <span className="font-mono text-[#38BDF8]">
                        {formatINR(goal.saved_amount)} / {formatINR(goal.target_amount)} (
                        {calc.progressPercent.toFixed(0)}%)
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {includeTaxRetire && (report.taxRows.length > 0 || report.retireRows.length > 0) && (
          <div className="grid gap-5 md:grid-cols-2">
            <div className="aurora-subcard p-4 space-y-2">
              <h4 className="text-sm font-semibold text-[#38BDF8]">Saved Tax Plans</h4>
              {report.taxRows.map(({ tp, newRes, oldRes }) => (
                <div key={tp.id} className="flex justify-between text-xs">
                  <span className="text-[#E2E8F0]">
                    {tp.plan_name} ({tp.financial_year})
                  </span>
                  <span className="font-mono text-[#10B981]">
                    Best Tax: {formatINR(Math.min(newRes.totalTaxLiability, oldRes.totalTaxLiability))}
                  </span>
                </div>
              ))}
            </div>

            <div className="aurora-subcard p-4 space-y-2">
              <h4 className="text-sm font-semibold text-[#C084FC]">Retirement Readiness</h4>
              {report.retireRows.map(({ rp, proj }) => (
                <div key={rp.id} className="flex justify-between text-xs">
                  <span className="text-[#E2E8F0]">{rp.plan_name}</span>
                  <span className="font-mono text-[#F8FAFC]">
                    {formatINR(proj.projectedCorpus)} / Req {formatINR(proj.requiredCorpus)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
