import React, { useMemo, useState } from 'react';
import { CheckCircle2, Edit3, PiggyBank, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { calculateGoalProgress } from '../../logic/suiteCalculators';
import { apiRequest, type SavingsGoalRecord } from '../../utils/api';
import { formatINR } from '../../utils/formatters';
import { NumberInput } from '../ui/NumberInput';
import { StatusBanner } from '../ui/StatusBanner';
import { VaultPromptBanner } from '../ui/VaultPromptBanner';

const GOAL_CATEGORIES = [
  'Emergency Fund',
  'Home Down Payment',
  'Retirement',
  'Education',
  'Travel',
  'Custom',
] as const;

function defaultTargetDate(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 3);
  return d.toISOString().slice(0, 10);
}

export const SavingsGoalModule: React.FC = () => {
  const { user, workspace, refreshWorkspace, openAuthModal } = useAuth();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState('Emergency Reserve (6 Months)');
  const [category, setCategory] = useState<string>('Emergency Fund');
  const [targetStr, setTargetStr] = useState('350000');
  const [savedStr, setSavedStr] = useState('120000');
  const [monthlyStr, setMonthlyStr] = useState('10000');
  const [returnStr, setReturnStr] = useState('7');
  const [targetDate, setTargetDate] = useState(defaultTargetDate());
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const liveCalc = useMemo(
    () =>
      calculateGoalProgress({
        targetAmount: Math.max(100, Number(targetStr) || 100),
        savedAmount: Math.max(0, Number(savedStr) || 0),
        monthlyContribution: Math.max(0, Number(monthlyStr) || 0),
        expectedReturn: Math.max(0, Number(returnStr) || 0),
        targetDate,
      }),
    [targetStr, savedStr, monthlyStr, returnStr, targetDate]
  );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setFeedback(null);

    if (!user) {
      openAuthModal('register');
      return;
    }

    const targetAmount = Number(targetStr);
    const savedAmount = Number(savedStr) || 0;
    const monthlyContribution = Number(monthlyStr) || 0;
    const expectedReturn = Number(returnStr) || 0;

    if (
      title.trim().length < 2 ||
      !Number.isFinite(targetAmount) ||
      targetAmount < 100 ||
      savedAmount < 0 ||
      !/^\d{4}-\d{2}-\d{2}$/.test(targetDate)
    ) {
      setErrorMsg('Enter valid goal title, target amount (>= ₹100), and valid target date.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        category,
        target_amount: targetAmount,
        saved_amount: savedAmount,
        monthly_contribution: monthlyContribution,
        expected_return: expectedReturn,
        target_date: targetDate,
      };
      if (editingId) {
        await apiRequest(`/api/goals/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        setFeedback('Savings goal updated in SQLite.');
      } else {
        await apiRequest('/api/goals', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        setFeedback('Savings goal saved to SQLite.');
      }
      setEditingId(null);
      await refreshWorkspace();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to save goal.');
    } finally {
      setSaving(false);
    }
  };

  const handleQuickTopUp = async (goal: SavingsGoalRecord, addAmount: number) => {
    if (!user) return;
    await apiRequest(`/api/goals/${goal.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        title: goal.title,
        category: goal.category,
        target_amount: goal.target_amount,
        saved_amount: goal.saved_amount + addAmount,
        monthly_contribution: goal.monthly_contribution,
        expected_return: goal.expected_return,
        target_date: goal.target_date,
      }),
    });
    await refreshWorkspace();
  };

  const handleEdit = (goal: SavingsGoalRecord) => {
    setEditingId(goal.id);
    setTitle(goal.title);
    setCategory(goal.category);
    setTargetStr(String(goal.target_amount));
    setSavedStr(String(goal.saved_amount));
    setMonthlyStr(String(goal.monthly_contribution));
    setReturnStr(String(goal.expected_return));
    setTargetDate(goal.target_date);
    setFeedback(null);
    setErrorMsg(null);
  };

  const handleDelete = async (id: number) => {
    if (!user) return;
    await apiRequest(`/api/goals/${id}`, { method: 'DELETE' });
    if (editingId === id) setEditingId(null);
    await refreshWorkspace();
  };

  return (
    <div className="space-y-6">
      <VaultPromptBanner moduleLabel="Savings Goal Tracker" />

      <div className="grid gap-6 lg:grid-cols-12 items-start">
        <form onSubmit={handleSave} className="aurora-card p-6 space-y-4 lg:col-span-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[#F8FAFC]">
                {editingId ? 'Edit Savings Goal' : 'Create Financial Goal'}
              </h3>
              <p className="text-xs text-[#94A3B8]">
                Compute required monthly SIP and track live progress toward milestones.
              </p>
            </div>
            {editingId && (
              <button
                type="button"
                onClick={() => setEditingId(null)}
                className="text-xs font-semibold text-[#38BDF8] cursor-pointer"
              >
                Cancel
              </button>
            )}
          </div>

          <StatusBanner feedback={feedback} error={errorMsg} />

          <div className="space-y-1.5">
            <label htmlFor="goal-title" className="block text-xs font-medium text-[#F8FAFC]">
              Goal Title
            </label>
            <input
              id="goal-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="aurora-input w-full px-3.5 py-2.5 text-sm text-[#F8FAFC] focus:outline-none"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="goal-cat" className="block text-xs font-medium text-[#F8FAFC]">
                Category
              </label>
              <select
                id="goal-cat"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="aurora-input w-full px-3.5 py-2.5 text-sm text-[#F8FAFC] focus:outline-none cursor-pointer"
              >
                {GOAL_CATEGORIES.map((c) => (
                  <option key={c} value={c} className="bg-[#0B1020]">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="goal-date" className="block text-xs font-medium text-[#F8FAFC]">
                Target Date
              </label>
              <input
                id="goal-date"
                type="date"
                required
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="aurora-input w-full px-3.5 py-2.5 text-sm text-[#F8FAFC] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <NumberInput
              id="goal-target"
              label="Target Amount"
              prefix="₹"
              min={100}
              value={targetStr}
              onChange={setTargetStr}
            />
            <NumberInput
              id="goal-saved"
              label="Currently Saved"
              prefix="₹"
              min={0}
              value={savedStr}
              onChange={setSavedStr}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <NumberInput
              id="goal-monthly"
              label="Planned Monthly Saving"
              prefix="₹"
              min={0}
              value={monthlyStr}
              onChange={setMonthlyStr}
            />
            <NumberInput
              id="goal-return"
              label="Expected Yield"
              suffix="% p.a."
              min={0}
              max={30}
              step={0.5}
              value={returnStr}
              onChange={setReturnStr}
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="aurora-btn-primary w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold cursor-pointer disabled:opacity-60"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>{saving ? 'Saving...' : editingId ? 'Update Goal' : 'Save Goal to SQLite'}</span>
          </button>
        </form>

        <div className="space-y-5 lg:col-span-7">
          {/* Live Calculator Preview */}
          <div className="aurora-card-accent p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#6366F1]/22 pb-4">
              <div>
                <p className="text-xs font-semibold text-[#38BDF8]">Live Goal Trajectory</p>
                <p className="mt-1 font-mono text-2xl sm:text-3xl font-bold text-[#F8FAFC] tabular-nums">
                  {liveCalc.progressPercent.toFixed(1)}% Funded
                </p>
                <p className="mt-1 text-xs text-[#94A3B8]">
                  {liveCalc.monthsUntilTarget} months remaining · Projected corpus{' '}
                  <strong className="text-[#10B981]">
                    {formatINR(liveCalc.projectedValueAtTarget)}
                  </strong>
                </p>
              </div>

              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                  liveCalc.onTrack
                    ? 'bg-[#10B981]/18 text-[#34D399] border border-[#10B981]/40'
                    : 'bg-[#A855F7]/18 text-[#E879F9] border border-[#A855F7]/40'
                }`}
              >
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                {liveCalc.onTrack ? 'On Track' : 'Boost Monthly SIP'}
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="aurora-subcard p-3.5">
                <p className="text-xs text-[#94A3B8]">Remaining Gap</p>
                <p className="mt-1 font-mono text-base font-semibold text-[#F8FAFC]">
                  {formatINR(liveCalc.remainingAmount)}
                </p>
              </div>
              <div className="aurora-subcard p-3.5">
                <p className="text-xs text-[#38BDF8]">Required Monthly SIP</p>
                <p className="mt-1 font-mono text-base font-semibold text-[#F8FAFC]">
                  {formatINR(liveCalc.requiredMonthlySip)}/mo
                </p>
              </div>
              <div className="aurora-subcard p-3.5">
                <p className="text-xs text-[#C084FC]">Your Planned SIP</p>
                <p className="mt-1 font-mono text-base font-semibold text-[#F8FAFC]">
                  {formatINR(Number(monthlyStr) || 0)}/mo
                </p>
              </div>
            </div>
          </div>

          {/* Saved Goals List */}
          <div className="aurora-card p-5 space-y-4">
            <div className="flex items-center gap-2">
              <PiggyBank className="h-4 w-4 text-[#10B981]" aria-hidden="true" />
              <h4 className="text-sm font-semibold text-[#F8FAFC]">
                Saved Goals ({workspace.goals.length})
              </h4>
            </div>

            {workspace.goals.length === 0 ? (
              <p className="text-xs text-[#94A3B8]">
                {user
                  ? 'No saved goals yet. Create one using the form on the left.'
                  : 'Sign in above to save and top up your financial milestones in SQLite.'}
              </p>
            ) : (
              <div className="space-y-3">
                {workspace.goals.map((goal) => {
                  const calc = calculateGoalProgress({
                    targetAmount: goal.target_amount,
                    savedAmount: goal.saved_amount,
                    monthlyContribution: goal.monthly_contribution,
                    expectedReturn: goal.expected_return,
                    targetDate: goal.target_date,
                  });
                  return (
                    <div key={goal.id} className="aurora-subcard p-4 space-y-3">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-[#F8FAFC]">
                              {goal.title}
                            </span>
                            <span className="rounded-lg border border-[#06B6D4]/30 bg-[#06B6D4]/12 px-2 py-0.5 text-[10px] font-semibold text-[#38BDF8]">
                              {goal.category}
                            </span>
                          </div>
                          <p className="mt-1 font-mono text-xs text-[#94A3B8]">
                            {formatINR(goal.saved_amount)} / {formatINR(goal.target_amount)} · Due{' '}
                            {goal.target_date} · SIP {formatINR(goal.monthly_contribution)}/mo
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => void handleQuickTopUp(goal, 5000)}
                            className="rounded-lg border border-[#10B981]/35 bg-[#10B981]/12 px-2.5 py-1.5 text-[11px] font-semibold text-[#34D399] hover:bg-[#10B981]/22 cursor-pointer"
                          >
                            +₹5k
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEdit(goal)}
                            aria-label={`Edit ${goal.title}`}
                            className="rounded-lg border border-[#6366F1]/30 p-2 text-[#38BDF8] hover:border-[#06B6D4] cursor-pointer"
                          >
                            <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDelete(goal.id)}
                            aria-label={`Delete ${goal.title}`}
                            className="rounded-lg border border-red-400/25 p-2 text-red-300 hover:bg-red-500/15 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-[#38BDF8] font-semibold">
                            {calc.progressPercent.toFixed(1)}% completed
                          </span>
                          <span className="text-[#94A3B8]">
                            Required: {formatINR(calc.requiredMonthlySip)}/mo
                          </span>
                        </div>
                        <div className="h-2.5 w-full rounded-full bg-[#080D1B] overflow-hidden">
                          <div
                            style={{ width: `${calc.progressPercent}%` }}
                            className="h-full rounded-full bg-gradient-to-r from-[#10B981] via-[#06B6D4] to-[#6366F1] transition-all duration-500"
                          />
                        </div>
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
