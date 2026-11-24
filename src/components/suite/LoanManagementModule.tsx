import React, { useMemo, useState } from 'react';
import { Download, Edit3, Landmark, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { simulateLoanPayoff } from '../../logic/suiteCalculators';
import { apiRequest, type LoanRecord } from '../../utils/api';
import { downloadCsvFile } from '../../utils/exportUtils';
import { formatINR } from '../../utils/formatters';
import { NumberInput } from '../ui/NumberInput';
import { StatusBanner } from '../ui/StatusBanner';
import { VaultPromptBanner } from '../ui/VaultPromptBanner';

const LOAN_TYPES = ['Home', 'Car', 'Education', 'Personal', 'Business'] as const;

export const LoanManagementModule: React.FC = () => {
  const { user, workspace, refreshWorkspace, openAuthModal } = useAuth();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [lenderName, setLenderName] = useState('HDFC Home Loan');
  const [loanType, setLoanType] = useState<string>('Home');
  const [principalStr, setPrincipalStr] = useState('4500000');
  const [rateStr, setRateStr] = useState('8.75');
  const [tenureMonthsStr, setTenureMonthsStr] = useState('240');
  const [monthsPaidStr, setMonthsPaidStr] = useState('24');
  const [extraMonthlyStr, setExtraMonthlyStr] = useState('5000');
  const [strategy, setStrategy] = useState<'avalanche' | 'snowball'>('avalanche');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const liveSim = useMemo(() => {
    const tenure = Math.max(1, Math.round(Number(tenureMonthsStr) || 1));
    const paid = Math.min(tenure - 1, Math.max(0, Math.round(Number(monthsPaidStr) || 0)));
    return simulateLoanPayoff({
      principalAmount: Math.max(0, Number(principalStr) || 0),
      annualRate: Math.max(0, Number(rateStr) || 0),
      tenureMonths: tenure,
      monthsPaid: paid,
      extraMonthlyPayment: Math.max(0, Number(extraMonthlyStr) || 0),
    });
  }, [principalStr, rateStr, tenureMonthsStr, monthsPaidStr, extraMonthlyStr]);

  const enrichedLoans = useMemo(() => {
    const mapped = workspace.loans.map((loan) => ({
      loan,
      sim: simulateLoanPayoff({
        principalAmount: loan.principal_amount,
        annualRate: loan.annual_rate,
        tenureMonths: loan.tenure_months,
        monthsPaid: loan.months_paid,
        extraMonthlyPayment: loan.extra_monthly_payment,
      }),
    }));

    return mapped.sort((a, b) =>
      strategy === 'avalanche'
        ? b.loan.annual_rate - a.loan.annual_rate
        : a.sim.remainingBalance - b.sim.remainingBalance
    );
  }, [workspace.loans, strategy]);

  const totals = useMemo(() => {
    return enrichedLoans.reduce(
      (acc, item) => {
        acc.remainingPrincipal += item.sim.remainingBalance;
        acc.monthlyEmi += item.sim.monthlyEmi;
        acc.interestSaved += item.sim.interestSaved;
        return acc;
      },
      { remainingPrincipal: 0, monthlyEmi: 0, interestSaved: 0 }
    );
  }, [enrichedLoans]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setFeedback(null);

    if (!user) {
      openAuthModal('register');
      return;
    }

    const principal = Number(principalStr);
    const rate = Number(rateStr);
    const tenure = Math.round(Number(tenureMonthsStr));
    const paid = Math.round(Number(monthsPaidStr) || 0);
    const extra = Number(extraMonthlyStr) || 0;

    if (
      lenderName.trim().length < 2 ||
      !Number.isFinite(principal) ||
      principal < 1000 ||
      !Number.isFinite(rate) ||
      rate < 0 ||
      rate > 45 ||
      !Number.isFinite(tenure) ||
      tenure < 1 ||
      paid < 0 ||
      paid >= tenure
    ) {
      setErrorMsg('Ensure principal >= ₹1,000, rate 0-45%, and months paid < total tenure.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        lender_name: lenderName.trim(),
        loan_type: loanType,
        principal_amount: principal,
        annual_rate: rate,
        tenure_months: tenure,
        months_paid: paid,
        extra_monthly_payment: extra,
        notes: '',
      };

      if (editingId) {
        await apiRequest(`/api/loans/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        setFeedback('Loan updated in SQLite.');
      } else {
        await apiRequest('/api/loans', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        setFeedback('Loan saved to SQLite.');
      }
      setEditingId(null);
      await refreshWorkspace();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to save loan.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: LoanRecord) => {
    setEditingId(item.id);
    setLenderName(item.lender_name);
    setLoanType(item.loan_type);
    setPrincipalStr(String(item.principal_amount));
    setRateStr(String(item.annual_rate));
    setTenureMonthsStr(String(item.tenure_months));
    setMonthsPaidStr(String(item.months_paid));
    setExtraMonthlyStr(String(item.extra_monthly_payment));
    setFeedback(null);
    setErrorMsg(null);
  };

  const handleDelete = async (id: number) => {
    if (!user) return;
    await apiRequest(`/api/loans/${id}`, { method: 'DELETE' });
    if (editingId === id) setEditingId(null);
    await refreshWorkspace();
  };

  const handleExportCsv = () => {
    downloadCsvFile(
      'calhub-loan-portfolio.csv',
      [
        'Lender',
        'Type',
        'APR (%)',
        'Monthly EMI (INR)',
        'Remaining Principal (INR)',
        'Extra Prepayment/mo (INR)',
        'Interest Saved (INR)',
        'Months Saved',
      ],
      enrichedLoans.map(({ loan, sim }) => [
        loan.lender_name,
        loan.loan_type,
        loan.annual_rate,
        sim.monthlyEmi.toFixed(2),
        sim.remainingBalance.toFixed(2),
        loan.extra_monthly_payment.toFixed(2),
        sim.interestSaved.toFixed(2),
        sim.monthsSaved,
      ])
    );
  };

  return (
    <div className="space-y-6">
      <VaultPromptBanner moduleLabel="Loan Management" />

      <div className="grid gap-6 lg:grid-cols-12 items-start">
        <form onSubmit={handleSave} className="aurora-card p-6 space-y-4 lg:col-span-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[#F8FAFC]">
                {editingId ? 'Edit Loan Account' : 'Add Loan & Prepayment Plan'}
              </h3>
              <p className="text-xs text-[#94A3B8]">
                Track active loans, remaining principal, and monthly prepayment savings.
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
            <label htmlFor="loan-lender" className="block text-xs font-medium text-[#F8FAFC]">
              Loan Label / Lender
            </label>
            <input
              id="loan-lender"
              type="text"
              required
              value={lenderName}
              onChange={(e) => setLenderName(e.target.value)}
              className="aurora-input w-full px-3.5 py-2.5 text-sm text-[#F8FAFC] focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="loan-type" className="block text-xs font-medium text-[#F8FAFC]">
              Loan Type
            </label>
            <select
              id="loan-type"
              value={loanType}
              onChange={(e) => setLoanType(e.target.value)}
              className="aurora-input w-full px-3.5 py-2.5 text-sm text-[#F8FAFC] focus:outline-none cursor-pointer"
            >
              {LOAN_TYPES.map((t) => (
                <option key={t} value={t} className="bg-[#0B1020]">
                  {t} Loan
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <NumberInput
              id="loan-principal"
              label="Sanctioned Principal"
              prefix="₹"
              min={1000}
              value={principalStr}
              onChange={setPrincipalStr}
            />
            <NumberInput
              id="loan-rate"
              label="Interest Rate"
              suffix="% p.a."
              min={0}
              max={45}
              step={0.1}
              value={rateStr}
              onChange={setRateStr}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <NumberInput
              id="loan-tenure"
              label="Original Tenure"
              suffix="mo"
              min={1}
              max={480}
              value={tenureMonthsStr}
              onChange={setTenureMonthsStr}
            />
            <NumberInput
              id="loan-paid"
              label="EMIs Already Paid"
              suffix="mo"
              min={0}
              max={479}
              value={monthsPaidStr}
              onChange={setMonthsPaidStr}
            />
          </div>

          <NumberInput
            id="loan-extra"
            label="Extra Monthly Principal Prepayment"
            prefix="₹"
            min={0}
            value={extraMonthlyStr}
            onChange={setExtraMonthlyStr}
          />

          <button
            type="submit"
            disabled={saving}
            className="aurora-btn-primary w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold cursor-pointer disabled:opacity-60"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>{saving ? 'Saving...' : editingId ? 'Update Loan' : 'Save Loan to SQLite'}</span>
          </button>
        </form>

        <div className="space-y-5 lg:col-span-7">
          {/* Live Simulator Impact Card */}
          <div className="aurora-card-accent p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#6366F1]/22 pb-4">
              <div>
                <p className="text-xs font-semibold text-[#38BDF8]">
                  Live Prepayment Impact Preview
                </p>
                <p className="mt-1 font-mono text-2xl sm:text-3xl font-bold text-[#10B981] tabular-nums">
                  Save {formatINR(liveSim.interestSaved)}
                </p>
                <p className="mt-1 text-xs text-[#94A3B8]">
                  Debt-free {liveSim.monthsSaved} months faster ({liveSim.acceleratedMonths} vs{' '}
                  {liveSim.remainingMonthsBaseline} remaining EMIs)
                </p>
              </div>
              {enrichedLoans.length > 0 && (
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#06B6D4]/35 bg-[#0B1020] px-3 py-2 text-xs font-semibold text-[#38BDF8] hover:border-[#06B6D4] cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Export Portfolio CSV</span>
                </button>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="aurora-subcard p-3.5">
                <p className="text-xs text-[#94A3B8]">Simulated Monthly EMI</p>
                <p className="mt-1 font-mono text-base font-semibold text-[#F8FAFC]">
                  {formatINR(liveSim.monthlyEmi)}
                </p>
              </div>
              <div className="aurora-subcard p-3.5">
                <p className="text-xs text-[#94A3B8]">Current Remaining Principal</p>
                <p className="mt-1 font-mono text-base font-semibold text-[#C084FC]">
                  {formatINR(liveSim.remainingBalance)}
                </p>
              </div>
              <div className="aurora-subcard p-3.5">
                <p className="text-xs text-[#94A3B8]">All Saved Loans Balance</p>
                <p className="mt-1 font-mono text-base font-semibold text-[#38BDF8]">
                  {formatINR(totals.remainingPrincipal)}
                </p>
              </div>
            </div>
          </div>

          {/* Saved Loans & Avalanche vs Snowball Order */}
          <div className="aurora-card p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Landmark className="h-4 w-4 text-[#C084FC]" aria-hidden="true" />
                <h4 className="text-sm font-semibold text-[#F8FAFC]">
                  Active Debt Portfolio ({enrichedLoans.length})
                </h4>
              </div>

              <div className="flex rounded-xl border border-[#6366F1]/25 bg-[#080D1B] p-0.5 text-xs">
                {(['avalanche', 'snowball'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setStrategy(mode)}
                    className={`rounded-lg px-2.5 py-1 capitalize cursor-pointer transition-colors ${
                      strategy === mode
                        ? 'bg-gradient-to-r from-[#2563EB] via-[#6366F1] to-[#8B5CF6] text-[#F8FAFC] font-semibold'
                        : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {enrichedLoans.length === 0 ? (
              <p className="text-xs text-[#94A3B8]">
                {user
                  ? 'No loans tracked yet. Add a loan on the left to compare Avalanche vs Snowball payoff order.'
                  : 'Sign in above to persist your loans and track total EMI obligations in SQLite.'}
              </p>
            ) : (
              <div className="space-y-3">
                {enrichedLoans.map(({ loan, sim }, index) => (
                  <div
                    key={loan.id}
                    className="aurora-subcard p-4 space-y-2.5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="rounded-md bg-[#6366F1]/20 px-1.5 py-0.5 font-mono text-[10px] font-bold text-[#38BDF8]">
                            Priority #{index + 1}
                          </span>
                          <span className="text-sm font-semibold text-[#F8FAFC]">
                            {loan.lender_name}
                          </span>
                          <span className="text-xs text-[#94A3B8]">({loan.loan_type})</span>
                        </div>
                        <p className="mt-1 font-mono text-xs text-[#94A3B8]">
                          APR {loan.annual_rate}% · EMI {formatINR(sim.monthlyEmi)} · Remaining{' '}
                          <strong className="text-[#F8FAFC]">{formatINR(sim.remainingBalance)}</strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleEdit(loan)}
                          aria-label={`Edit ${loan.lender_name}`}
                          className="rounded-lg border border-[#6366F1]/30 p-2 text-[#38BDF8] hover:border-[#06B6D4] cursor-pointer"
                        >
                          <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDelete(loan.id)}
                          aria-label={`Delete ${loan.lender_name}`}
                          className="rounded-lg border border-red-400/25 p-2 text-red-300 hover:bg-red-500/15 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-[#94A3B8]">
                        <span>
                          Paid {loan.months_paid} / {loan.tenure_months} months
                        </span>
                        <span className="text-[#10B981]">
                          {sim.interestSaved > 0
                            ? `Prepay saves ${formatINR(sim.interestSaved)} (${sim.monthsSaved} mo)`
                            : 'No extra prepayment set'}
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-[#080D1B] overflow-hidden">
                        <div
                          style={{
                            width: `${Math.min(100, (loan.months_paid / loan.tenure_months) * 100)}%`,
                          }}
                          className="h-full rounded-full bg-gradient-to-r from-[#06B6D4] via-[#6366F1] to-[#A855F7]"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
