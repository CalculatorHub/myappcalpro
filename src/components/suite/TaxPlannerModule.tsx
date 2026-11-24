import React, { useMemo, useState } from 'react';
import { CheckCircle2, Edit3, Plus, Scale, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { INDIAN_TAX_RULES, type FinancialYearId } from '../../data/taxRules';
import { compareTaxRegimesWithDeductions } from '../../logic/suiteCalculators';
import { apiRequest, type TaxPlanRecord } from '../../utils/api';
import { formatINR } from '../../utils/formatters';
import { NumberInput } from '../ui/NumberInput';
import { StatusBanner } from '../ui/StatusBanner';
import { VaultPromptBanner } from '../ui/VaultPromptBanner';

export const TaxPlannerModule: React.FC = () => {
  const { user, workspace, refreshWorkspace, openAuthModal } = useAuth();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [planName, setPlanName] = useState('FY 2025-26 Tax Strategy');
  const [fy, setFy] = useState<FinancialYearId>('fy-2025-26');
  const [grossSalaryStr, setGrossSalaryStr] = useState('1600000');
  const [otherIncomeStr, setOtherIncomeStr] = useState('50000');
  const [sec80cStr, setSec80cStr] = useState('150000');
  const [sec80dStr, setSec80dStr] = useState('25000');
  const [npsStr, setNpsStr] = useState('50000');
  const [hraStr, setHraStr] = useState('120000');
  const [homeLoanIntStr, setHomeLoanIntStr] = useState('0');
  const [tdsStr, setTdsStr] = useState('90000');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const comparison = useMemo(
    () =>
      compareTaxRegimesWithDeductions({
        financialYear: fy,
        grossSalary: Number(grossSalaryStr) || 0,
        otherIncome: Number(otherIncomeStr) || 0,
        sec80c: Number(sec80cStr) || 0,
        sec80d: Number(sec80dStr) || 0,
        nps80ccd1b: Number(npsStr) || 0,
        hraExemption: Number(hraStr) || 0,
        homeLoanInterest: Number(homeLoanIntStr) || 0,
        tdsPaid: Number(tdsStr) || 0,
      }),
    [fy, grossSalaryStr, otherIncomeStr, sec80cStr, sec80dStr, npsStr, hraStr, homeLoanIntStr, tdsStr]
  );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setFeedback(null);
    if (!user) {
      openAuthModal('register');
      return;
    }
    if (planName.trim().length < 2) {
      setErrorMsg('Enter a plan name.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        plan_name: planName.trim(),
        financial_year: fy,
        gross_salary: Number(grossSalaryStr) || 0,
        other_income: Number(otherIncomeStr) || 0,
        sec_80c: Number(sec80cStr) || 0,
        sec_80d: Number(sec80dStr) || 0,
        nps_80ccd1b: Number(npsStr) || 0,
        hra_exemption: Number(hraStr) || 0,
        home_loan_interest: Number(homeLoanIntStr) || 0,
        tds_paid: Number(tdsStr) || 0,
        preferred_regime: comparison.optimalRegime,
      };
      if (editingId) {
        await apiRequest(`/api/tax-plans/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        setFeedback('Tax plan updated in SQLite.');
      } else {
        await apiRequest('/api/tax-plans', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        setFeedback('Tax plan saved to SQLite.');
      }
      setEditingId(null);
      await refreshWorkspace();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to save tax plan.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: TaxPlanRecord) => {
    setEditingId(item.id);
    setPlanName(item.plan_name);
    setFy(item.financial_year);
    setGrossSalaryStr(String(item.gross_salary));
    setOtherIncomeStr(String(item.other_income));
    setSec80cStr(String(item.sec_80c));
    setSec80dStr(String(item.sec_80d));
    setNpsStr(String(item.nps_80ccd1b));
    setHraStr(String(item.hra_exemption));
    setHomeLoanIntStr(String(item.home_loan_interest));
    setTdsStr(String(item.tds_paid));
  };

  const handleDelete = async (id: number) => {
    if (!user) return;
    await apiRequest(`/api/tax-plans/${id}`, { method: 'DELETE' });
    if (editingId === id) setEditingId(null);
    await refreshWorkspace();
  };

  return (
    <div className="space-y-6">
      <VaultPromptBanner moduleLabel="Tax Planner" />

      <div className="grid gap-6 lg:grid-cols-12 items-start">
        <form onSubmit={handleSave} className="aurora-card p-6 space-y-4 lg:col-span-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[#F8FAFC]">
                {editingId ? 'Edit Tax Strategy' : 'Indian Tax Optimization Planner'}
              </h3>
              <p className="text-xs text-[#94A3B8]">
                Plan 80C, 80D, NPS &amp; HRA deductions and compare New vs Old Regime savings.
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

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="tp-name" className="block text-xs font-medium text-[#F8FAFC]">
                Plan Name
              </label>
              <input
                id="tp-name"
                type="text"
                required
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                className="aurora-input w-full px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="tp-fy" className="block text-xs font-medium text-[#F8FAFC]">
                Financial Year
              </label>
              <select
                id="tp-fy"
                value={fy}
                onChange={(e) => setFy(e.target.value as FinancialYearId)}
                className="aurora-input w-full px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none cursor-pointer"
              >
                {(Object.keys(INDIAN_TAX_RULES) as FinancialYearId[]).map((k) => (
                  <option key={k} value={k} className="bg-[#0B1020]">
                    {INDIAN_TAX_RULES[k].label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <NumberInput
              id="tp-salary"
              label="Gross Salary"
              prefix="₹"
              min={0}
              value={grossSalaryStr}
              onChange={setGrossSalaryStr}
            />
            <NumberInput
              id="tp-other"
              label="Other Income"
              prefix="₹"
              min={0}
              value={otherIncomeStr}
              onChange={setOtherIncomeStr}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <NumberInput
              id="tp-80c"
              label="Sec 80C (max ₹1.5L)"
              prefix="₹"
              min={0}
              max={150000}
              value={sec80cStr}
              onChange={setSec80cStr}
            />
            <NumberInput
              id="tp-80d"
              label="Sec 80D Health"
              prefix="₹"
              min={0}
              max={100000}
              value={sec80dStr}
              onChange={setSec80dStr}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <NumberInput
              id="tp-nps"
              label="NPS 80CCD(1B) (₹50k)"
              prefix="₹"
              min={0}
              max={50000}
              value={npsStr}
              onChange={setNpsStr}
            />
            <NumberInput
              id="tp-hra"
              label="HRA Exemption"
              prefix="₹"
              min={0}
              value={hraStr}
              onChange={setHraStr}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <NumberInput
              id="tp-home-int"
              label="Home Loan Int (24b)"
              prefix="₹"
              min={0}
              max={200000}
              value={homeLoanIntStr}
              onChange={setHomeLoanIntStr}
            />
            <NumberInput
              id="tp-tds"
              label="TDS / Advance Tax"
              prefix="₹"
              min={0}
              value={tdsStr}
              onChange={setTdsStr}
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="aurora-btn-primary w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold cursor-pointer disabled:opacity-60"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>{saving ? 'Saving...' : editingId ? 'Update Tax Plan' : 'Save Tax Plan to SQLite'}</span>
          </button>
        </form>

        <div className="space-y-5 lg:col-span-7">
          {/* Optimal Regime Verdict */}
          <div className="aurora-card-accent p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#6366F1]/22 pb-4">
              <div>
                <p className="text-xs font-semibold text-[#10B981]">Recommended Tax Regime</p>
                <p className="mt-1 text-2xl font-bold text-[#F8FAFC]">
                  {comparison.optimalRegime === 'new' ? 'New Regime (Sec 115BAC)' : 'Old Regime'}
                </p>
                <p className="mt-1 text-xs text-[#38BDF8]">
                  Saves {formatINR(comparison.taxSavings)} annually over the alternative regime
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#10B981]/40 bg-[#10B981]/15 px-3 py-1 text-xs font-semibold text-[#34D399]">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                {INDIAN_TAX_RULES[fy].label}
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div
                className={`aurora-subcard p-4 ${
                  comparison.optimalRegime === 'new' ? 'border-[#10B981]/55 bg-[#10B981]/10' : ''
                }`}
              >
                <p className="text-xs text-[#94A3B8]">New Regime Total Tax</p>
                <p className="mt-1 font-mono text-xl font-bold text-[#F8FAFC]">
                  {formatINR(comparison.newRes.totalTaxLiability)}
                </p>
                <p className="mt-1 text-[11px] text-[#94A3B8]">
                  Taxable: {formatINR(comparison.newRes.taxableIncome)}
                </p>
              </div>
              <div
                className={`aurora-subcard p-4 ${
                  comparison.optimalRegime === 'old' ? 'border-[#10B981]/55 bg-[#10B981]/10' : ''
                }`}
              >
                <p className="text-xs text-[#94A3B8]">Old Regime Total Tax</p>
                <p className="mt-1 font-mono text-xl font-bold text-[#F8FAFC]">
                  {formatINR(comparison.oldRes.totalTaxLiability)}
                </p>
                <p className="mt-1 text-[11px] text-[#94A3B8]">
                  Taxable: {formatINR(comparison.oldRes.taxableIncome)}
                </p>
              </div>
            </div>

            {/* Deduction Headroom Meters */}
            <div className="space-y-3 pt-2">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[#E2E8F0]">Section 80C Utilization (Cap ₹1,50,000)</span>
                  <span className="font-mono text-[#38BDF8]">
                    {comparison.headroom80C > 0
                      ? `${formatINR(comparison.headroom80C)} unused`
                      : 'Maxed'}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-[#080D1B] overflow-hidden">
                  <div
                    style={{ width: `${(comparison.sec80c / 150000) * 100}%` }}
                    className="h-full bg-gradient-to-r from-[#06B6D4] to-[#6366F1]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[#E2E8F0]">NPS 80CCD(1B) Utilization (Cap ₹50,000)</span>
                  <span className="font-mono text-[#C084FC]">
                    {comparison.headroomNps > 0
                      ? `${formatINR(comparison.headroomNps)} unused`
                      : 'Maxed'}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-[#080D1B] overflow-hidden">
                  <div
                    style={{ width: `${(comparison.nps / 50000) * 100}%` }}
                    className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#D946EF]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Saved Tax Plans */}
          <div className="aurora-card p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Scale className="h-4 w-4 text-[#38BDF8]" aria-hidden="true" />
              <h4 className="text-sm font-semibold text-[#F8FAFC]">
                Saved Tax Scenarios ({workspace.taxPlans.length})
              </h4>
            </div>

            {workspace.taxPlans.length === 0 ? (
              <p className="text-xs text-[#94A3B8]">
                {user
                  ? 'No saved tax plans yet. Save your scenario from the left panel.'
                  : 'Sign in above to save and compare tax plans across financial years.'}
              </p>
            ) : (
              <div className="space-y-2.5">
                {workspace.taxPlans.map((tp) => (
                  <div
                    key={tp.id}
                    className="aurora-subcard flex flex-wrap items-center justify-between gap-2 p-3.5"
                  >
                    <div>
                      <p className="text-sm font-semibold text-[#F8FAFC]">{tp.plan_name}</p>
                      <p className="font-mono text-xs text-[#94A3B8]">
                        {INDIAN_TAX_RULES[tp.financial_year]?.label ?? tp.financial_year} · Gross{' '}
                        {formatINR(tp.gross_salary + tp.other_income)} · Optimal:{' '}
                        <strong className="text-[#10B981] uppercase">{tp.preferred_regime}</strong>
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleEdit(tp)}
                        aria-label={`Edit ${tp.plan_name}`}
                        className="rounded-lg border border-[#6366F1]/30 p-2 text-[#38BDF8] cursor-pointer"
                      >
                        <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(tp.id)}
                        aria-label={`Delete ${tp.plan_name}`}
                        className="rounded-lg border border-red-400/25 p-2 text-red-300 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
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
