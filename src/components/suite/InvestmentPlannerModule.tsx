import React, { useMemo, useState } from 'react';
import { Download, Edit3, Plus, Trash2, TrendingUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { calculateInvestmentProjection } from '../../logic/suiteCalculators';
import { apiRequest, type InvestmentRecord } from '../../utils/api';
import { downloadCsvFile } from '../../utils/exportUtils';
import { formatINR, formatINRCompact } from '../../utils/formatters';
import { GrowthChart } from '../ui/GrowthChart';
import { NumberInput } from '../ui/NumberInput';
import { StatusBanner } from '../ui/StatusBanner';
import { VaultPromptBanner } from '../ui/VaultPromptBanner';

const CATEGORIES = ['SIP', 'Lump Sum', 'PPF', 'FD', 'ELSS', 'Gold/SGB', 'Equity'] as const;

export const InvestmentPlannerModule: React.FC = () => {
  const { user, workspace, refreshWorkspace, openAuthModal } = useAuth();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState('Nifty 50 Index SIP');
  const [category, setCategory] = useState<string>('SIP');
  const [monthlyStr, setMonthlyStr] = useState('15000');
  const [principalStr, setPrincipalStr] = useState('100000');
  const [returnStr, setReturnStr] = useState('12');
  const [tenureStr, setTenureStr] = useState('10');
  const [stepUpStr, setStepUpStr] = useState('5');
  const [inflationStr, setInflationStr] = useState('6');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const projection = useMemo(() => {
    return calculateInvestmentProjection({
      principalAmount: Math.max(0, Number(principalStr) || 0),
      monthlyContribution: Math.max(0, Number(monthlyStr) || 0),
      annualReturn: Math.min(50, Math.max(0, Number(returnStr) || 0)),
      tenureYears: Math.min(50, Math.max(0.5, Number(tenureStr) || 1)),
      stepUpPercent: Math.min(30, Math.max(0, Number(stepUpStr) || 0)),
      inflationRate: Math.min(20, Math.max(0, Number(inflationStr) || 0)),
    });
  }, [principalStr, monthlyStr, returnStr, tenureStr, stepUpStr, inflationStr]);

  const portfolioSummary = useMemo(() => {
    return workspace.investments.reduce(
      (acc, item) => {
        const res = calculateInvestmentProjection({
          principalAmount: item.principal_amount,
          monthlyContribution: item.monthly_contribution,
          annualReturn: item.annual_return,
          tenureYears: item.tenure_years,
        });
        acc.currentPrincipal += item.principal_amount;
        acc.monthlySip += item.monthly_contribution;
        acc.projectedFuture += res.futureValue;
        return acc;
      },
      { currentPrincipal: 0, monthlySip: 0, projectedFuture: 0 }
    );
  }, [workspace.investments]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setFeedback(null);

    if (!user) {
      openAuthModal('register');
      return;
    }

    const monthlyVal = Number(monthlyStr) || 0;
    const principalVal = Number(principalStr) || 0;
    const returnVal = Number(returnStr);
    const tenureVal = Number(tenureStr);

    if (
      name.trim().length < 2 ||
      !Number.isFinite(returnVal) ||
      returnVal < 0 ||
      returnVal > 50 ||
      !Number.isFinite(tenureVal) ||
      tenureVal < 0.5 ||
      tenureVal > 50 ||
      (monthlyVal <= 0 && principalVal <= 0)
    ) {
      setErrorMsg('Enter a valid name, return (0-50%), tenure (0.5-50 yrs), and positive amount.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        category,
        monthly_contribution: monthlyVal,
        principal_amount: principalVal,
        annual_return: returnVal,
        tenure_years: tenureVal,
        notes: notes.trim(),
      };
      if (editingId) {
        await apiRequest(`/api/investments/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        setFeedback('Investment plan updated in SQLite.');
      } else {
        await apiRequest('/api/investments', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        setFeedback('Investment plan saved to SQLite.');
      }
      setEditingId(null);
      await refreshWorkspace();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to save investment.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: InvestmentRecord) => {
    setEditingId(item.id);
    setName(item.name);
    setCategory(item.category);
    setMonthlyStr(String(item.monthly_contribution));
    setPrincipalStr(String(item.principal_amount));
    setReturnStr(String(item.annual_return));
    setTenureStr(String(item.tenure_years));
    setNotes(item.notes);
    setFeedback(null);
    setErrorMsg(null);
  };

  const handleDelete = async (id: number) => {
    if (!user) return;
    try {
      await apiRequest(`/api/investments/${id}`, { method: 'DELETE' });
      if (editingId === id) setEditingId(null);
      await refreshWorkspace();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Delete failed.');
    }
  };

  const handleExportCsv = () => {
    downloadCsvFile(
      'calhub-investment-projection.csv',
      ['Period', 'Cumulative Invested (INR)', 'Wealth Gain (INR)', 'Projected Value (INR)'],
      projection.schedule.map((row) => [
        row.label,
        row.principal.toFixed(2),
        row.interestEarned.toFixed(2),
        row.totalAmount.toFixed(2),
      ])
    );
  };

  return (
    <div className="space-y-6">
      <VaultPromptBanner moduleLabel="Investment Planner" />

      <div className="grid gap-6 lg:grid-cols-12 items-start">
        <form onSubmit={handleSave} className="aurora-card p-6 space-y-4 lg:col-span-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[#F8FAFC]">
                {editingId ? 'Edit Investment Plan' : 'Investment & SIP Planner'}
              </h3>
              <p className="text-xs text-[#94A3B8]">
                Simulate Step-Up SIPs, Lump Sum growth &amp; inflation-adjusted corpus.
              </p>
            </div>
            {editingId && (
              <button
                type="button"
                onClick={() => setEditingId(null)}
                className="text-xs font-semibold text-[#38BDF8] cursor-pointer"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <StatusBanner feedback={feedback} error={errorMsg} />

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <label htmlFor="inv-name" className="block text-xs font-medium text-[#F8FAFC]">
                Plan / Instrument Name
              </label>
              <input
                id="inv-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="aurora-input w-full px-3.5 py-2.5 text-sm text-[#F8FAFC] focus:outline-none"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label htmlFor="inv-cat" className="block text-xs font-medium text-[#F8FAFC]">
                Asset Category
              </label>
              <select
                id="inv-cat"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="aurora-input w-full px-3.5 py-2.5 text-sm text-[#F8FAFC] focus:outline-none cursor-pointer"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} className="bg-[#0B1020]">
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <NumberInput
              id="inv-monthly"
              label="Monthly SIP"
              prefix="₹"
              min={0}
              value={monthlyStr}
              onChange={setMonthlyStr}
            />
            <NumberInput
              id="inv-principal"
              label="Initial Lump Sum"
              prefix="₹"
              min={0}
              value={principalStr}
              onChange={setPrincipalStr}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <NumberInput
              id="inv-return"
              label="Expected Return"
              suffix="% p.a."
              min={0}
              max={50}
              step={0.5}
              value={returnStr}
              onChange={setReturnStr}
            />
            <NumberInput
              id="inv-tenure"
              label="Horizon"
              suffix="years"
              min={0.5}
              max={50}
              step={0.5}
              value={tenureStr}
              onChange={setTenureStr}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <NumberInput
              id="inv-stepup"
              label="Annual Step-Up"
              suffix="%"
              min={0}
              max={30}
              value={stepUpStr}
              onChange={setStepUpStr}
            />
            <NumberInput
              id="inv-inflation"
              label="Inflation Assumption"
              suffix="%"
              min={0}
              max={20}
              value={inflationStr}
              onChange={setInflationStr}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="inv-notes" className="block text-xs font-medium text-[#F8FAFC]">
              Notes (Optional)
            </label>
            <input
              id="inv-notes"
              type="text"
              maxLength={200}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Long-term core equity bucket"
              className="aurora-input w-full px-3.5 py-2 text-xs text-[#F8FAFC] placeholder:text-[#64748B] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="aurora-btn-primary w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold cursor-pointer disabled:opacity-60"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>
              {saving
                ? 'Saving...'
                : editingId
                ? 'Update Investment Plan'
                : 'Save Investment Plan to SQLite'}
            </span>
          </button>
        </form>

        <div className="space-y-5 lg:col-span-7">
          <div className="aurora-card-accent p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#6366F1]/22 pb-4">
              <div>
                <p className="text-xs font-semibold text-[#38BDF8]">Projected Future Value</p>
                <p className="mt-1 font-mono text-3xl font-bold text-[#F8FAFC] tabular-nums">
                  {formatINR(projection.futureValue)}
                </p>
                <p className="mt-1 text-xs text-[#10B981]">
                  Inflation-Adjusted Real Value: {formatINR(projection.inflationAdjustedValue)}
                </p>
              </div>
              <button
                type="button"
                onClick={handleExportCsv}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#06B6D4]/35 bg-[#0B1020] px-3 py-2 text-xs font-semibold text-[#38BDF8] hover:border-[#06B6D4] cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                <span>CSV Schedule</span>
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="aurora-subcard p-3.5">
                <p className="text-xs text-[#94A3B8]">Total Invested</p>
                <p className="mt-1 font-mono text-base font-semibold text-[#F8FAFC]">
                  {formatINR(projection.totalInvested)}
                </p>
              </div>
              <div className="aurora-subcard p-3.5">
                <p className="text-xs text-[#10B981]">Estimated Wealth Gain</p>
                <p className="mt-1 font-mono text-base font-semibold text-[#F8FAFC]">
                  {formatINR(projection.estimatedReturns)}
                </p>
              </div>
              <div className="aurora-subcard p-3.5">
                <p className="text-xs text-[#C084FC]">Saved Portfolio Value</p>
                <p className="mt-1 font-mono text-base font-semibold text-[#F8FAFC]">
                  {formatINRCompact(portfolioSummary.projectedFuture)}
                </p>
              </div>
            </div>
          </div>

          <GrowthChart
            title="Month-by-Month Investment Wealth Trajectory"
            xAxisLabel="Months"
            data={projection.schedule}
          />

          {/* Saved SQLite Portfolio List */}
          <div className="aurora-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[#06B6D4]" aria-hidden="true" />
                <h4 className="text-sm font-semibold text-[#F8FAFC]">
                  Saved Investment Plans ({workspace.investments.length})
                </h4>
              </div>
              <span className="font-mono text-xs text-[#94A3B8]">
                SIP Commitment: {formatINR(portfolioSummary.monthlySip)}/mo
              </span>
            </div>

            {workspace.investments.length === 0 ? (
              <p className="text-xs text-[#94A3B8]">
                {user
                  ? 'No saved investment records yet. Use the form on the left to add your first plan.'
                  : 'Sign in above to view and manage your saved SQLite investment portfolio.'}
              </p>
            ) : (
              <div className="space-y-2.5">
                {workspace.investments.map((item) => {
                  const res = calculateInvestmentProjection({
                    principalAmount: item.principal_amount,
                    monthlyContribution: item.monthly_contribution,
                    annualReturn: item.annual_return,
                    tenureYears: item.tenure_years,
                  });
                  return (
                    <div
                      key={item.id}
                      className="aurora-subcard flex flex-wrap items-center justify-between gap-3 p-3.5"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-[#F8FAFC]">{item.name}</span>
                          <span className="rounded-lg border border-[#6366F1]/35 bg-[#6366F1]/15 px-2 py-0.5 text-[10px] font-semibold text-[#C084FC]">
                            {item.category}
                          </span>
                        </div>
                        <p className="mt-1 font-mono text-xs text-[#94A3B8]">
                          SIP {formatINR(item.monthly_contribution)}/mo · Base{' '}
                          {formatINR(item.principal_amount)} @ {item.annual_return}% for{' '}
                          {item.tenure_years} yrs →{' '}
                          <strong className="text-[#10B981]">{formatINRCompact(res.futureValue)}</strong>
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleEdit(item)}
                          aria-label={`Edit ${item.name}`}
                          className="rounded-lg border border-[#6366F1]/30 p-2 text-[#38BDF8] hover:border-[#06B6D4] cursor-pointer"
                        >
                          <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDelete(item.id)}
                          aria-label={`Delete ${item.name}`}
                          className="rounded-lg border border-red-400/25 p-2 text-red-300 hover:bg-red-500/15 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
