import React, { useMemo, useRef, useState } from 'react';
import {
  INDIAN_TAX_RULES,
  type FinancialYearId,
  type TaxRegimeId,
} from '../../data/taxRules';
import {
  calculateIndianIncomeTax,
  type TaxAgeCategory,
} from '../../logic/calculators';
import { NumberInput } from '../ui/NumberInput';
import { AnimatedNumber } from '../ui/AnimatedNumber';
import { TiltCard3D } from '../ui/TiltCard3D';
import { FormulaAccordion } from '../ui/FormulaAccordion';
import { CalcActionBar } from '../ui/CalcActionBar';
import { ResultActionsBar, ResultEmptyState } from '../ui/ResultStateHeader';
import { formatINR } from '../../utils/formatters';
import { downloadCsvFile } from '../../utils/exportUtils';
import type { CalculationHistoryItem } from '../../utils/storage';

interface TaxErrors {
  salaryIncome?: string;
  otherIncome?: string;
  eligibleDeductions?: string;
  tdsAndCredits?: string;
}

const AGE_CATEGORY_LABELS: { id: TaxAgeCategory; label: string }[] = [
  { id: 'below-60', label: 'Below 60 yrs' },
  { id: 'senior-60-79', label: 'Senior (60–79)' },
  { id: 'super-senior-80', label: '80+ yrs' },
];

interface IncomeTaxCalcProps {
  onSaveHistory?: (entry: Omit<CalculationHistoryItem, 'id' | 'timestamp'>) => void;
}

export const IncomeTaxCalc: React.FC<IncomeTaxCalcProps> = ({ onSaveHistory }) => {
  const [financialYear, setFinancialYear] = useState<FinancialYearId>('fy-2025-26');
  const [regime, setRegime] = useState<TaxRegimeId>('new');
  const [ageCategory, setAgeCategory] = useState<TaxAgeCategory>('below-60');
  const [salaryStr, setSalaryStr] = useState<string>('0');
  const [otherStr, setOtherStr] = useState<string>('0');
  const [deductionsStr, setDeductionsStr] = useState<string>('0');
  const [tdsStr, setTdsStr] = useState<string>('0');
  const [touched, setTouched] = useState<Partial<Record<keyof TaxErrors, boolean>>>({});
  const [submitted, setSubmitted] = useState<boolean>(false);
  const resultsRef = useRef<HTMLDivElement | null>(null);

  const fyConfig = INDIAN_TAX_RULES[financialYear];
  const regimeConfig = fyConfig.regimes[regime];

  const salaryNum = salaryStr.trim() === '' ? NaN : Number(salaryStr);
  const otherNum = otherStr.trim() === '' ? 0 : Number(otherStr);
  const deductionsNum = deductionsStr.trim() === '' ? 0 : Number(deductionsStr);
  const tdsNum = tdsStr.trim() === '' ? 0 : Number(tdsStr);

  const errors = useMemo<TaxErrors>(() => {
    const next: TaxErrors = {};
    if (salaryStr.trim() === '' && otherStr.trim() === '') {
      next.salaryIncome = 'Enter gross salary or other income (₹0 or above).';
    } else if (salaryStr.trim() !== '' && (!Number.isFinite(salaryNum) || salaryNum < 0)) {
      next.salaryIncome = 'Gross salary cannot be negative.';
    }
    if (otherStr.trim() !== '' && (!Number.isFinite(otherNum) || otherNum < 0)) {
      next.otherIncome = 'Other income cannot be negative.';
    }
    if (deductionsStr.trim() !== '' && (!Number.isFinite(deductionsNum) || deductionsNum < 0)) {
      next.eligibleDeductions = 'Deductions cannot be negative.';
    }
    if (tdsStr.trim() !== '' && (!Number.isFinite(tdsNum) || tdsNum < 0)) {
      next.tdsAndCredits = 'TDS / advance tax credits cannot be negative.';
    }
    return next;
  }, [salaryStr, salaryNum, otherStr, otherNum, deductionsStr, deductionsNum, tdsStr, tdsNum]);

  const isDefaultAllZero =
    !submitted &&
    salaryStr.trim() === '0' &&
    otherStr.trim() === '0' &&
    deductionsStr.trim() === '0' &&
    tdsStr.trim() === '0';
  const isEmpty = salaryStr.trim() === '' && otherStr.trim() === '';
  const isValid = Object.keys(errors).length === 0;

  const result = useMemo(() => {
    if (!isValid || isDefaultAllZero) return null;
    return calculateIndianIncomeTax({
      financialYear,
      regime,
      ageCategory,
      salaryIncome: Number.isFinite(salaryNum) ? salaryNum : 0,
      otherIncome: Number.isFinite(otherNum) ? otherNum : 0,
      eligibleDeductions: Number.isFinite(deductionsNum) ? deductionsNum : 0,
      tdsAndCredits: Number.isFinite(tdsNum) ? tdsNum : 0,
    });
  }, [isValid, isDefaultAllZero, financialYear, regime, ageCategory, salaryNum, otherNum, deductionsNum, tdsNum]);

  const regimeComparison = useMemo(() => {
    if (!isValid || isDefaultAllZero) return null;
    const baseInput = {
      financialYear,
      ageCategory,
      salaryIncome: Number.isFinite(salaryNum) ? salaryNum : 0,
      otherIncome: Number.isFinite(otherNum) ? otherNum : 0,
      eligibleDeductions: Number.isFinite(deductionsNum) ? deductionsNum : 0,
      tdsAndCredits: Number.isFinite(tdsNum) ? tdsNum : 0,
    };
    const newRes = calculateIndianIncomeTax({ ...baseInput, regime: 'new' });
    const oldRes = calculateIndianIncomeTax({ ...baseInput, regime: 'old' });
    const diff = Math.abs(newRes.totalTaxLiability - oldRes.totalTaxLiability);
    const suggestedRegime: TaxRegimeId | 'tie' =
      newRes.totalTaxLiability === oldRes.totalTaxLiability
        ? 'tie'
        : newRes.totalTaxLiability < oldRes.totalTaxLiability
        ? 'new'
        : 'old';
    return { newRes, oldRes, diff, suggestedRegime };
  }, [isValid, isDefaultAllZero, financialYear, ageCategory, salaryNum, otherNum, deductionsNum, tdsNum]);

  const handleLoadExample = (
    fy: FinancialYearId,
    reg: TaxRegimeId,
    sal: string,
    oth: string,
    ded: string,
    tds: string,
    age: TaxAgeCategory = 'below-60'
  ) => {
    setFinancialYear(fy);
    setRegime(reg);
    setAgeCategory(age);
    setSalaryStr(sal);
    setOtherStr(oth);
    setDeductionsStr(ded);
    setTdsStr(tds);
    setTouched({});
    setSubmitted(false);
  };

  const handleCalculate = () => {
    setSubmitted(true);
    if (isValid) {
      const computed = calculateIndianIncomeTax({
        financialYear,
        regime,
        ageCategory,
        salaryIncome: Number.isFinite(salaryNum) ? salaryNum : 0,
        otherIncome: Number.isFinite(otherNum) ? otherNum : 0,
        eligibleDeductions: Number.isFinite(deductionsNum) ? deductionsNum : 0,
        tdsAndCredits: Number.isFinite(tdsNum) ? tdsNum : 0,
      });
      if (onSaveHistory) {
        const refund = computed.balancePayableOrRefund < 0;
        const postTax = Math.max(0, computed.grossTotalIncome - computed.totalTaxLiability);
        onSaveHistory({
          calculatorId: 'income-tax',
          calculatorTitle: 'Income Tax',
          primaryMetricLabel: refund ? 'Estimated Tax Refund' : 'Estimated Net Tax Payable',
          primaryMetricValue: formatINR(Math.abs(computed.balancePayableOrRefund)),
          summaryLine: `${fyConfig.label} · ${regime === 'new' ? 'New Regime' : 'Old Regime'} · Gross ${formatINR(computed.grossTotalIncome)} · Tax ${formatINR(computed.totalTaxLiability)}`,
          details: [
            `Financial Year & Regime: ${fyConfig.label} (${regime === 'new' ? 'New Regime 115BAC' : 'Old Regime'})`,
            `Gross Total Income: ${formatINR(computed.grossTotalIncome)}`,
            `Deductions (Std + VI-A): ${formatINR(computed.standardDeduction + computed.eligibleDeductionsApplied)}`,
            `Taxable Income: ${formatINR(computed.taxableIncome)}`,
            `Total Tax + Cess: ${formatINR(computed.totalTaxLiability)} · Monthly Take-Home: ${formatINR(postTax / 12)}`,
          ],
        });
      }
    }
    if (isValid && resultsRef.current && window.innerWidth < 1024) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleReset = () => {
    setSalaryStr('0');
    setOtherStr('0');
    setDeductionsStr('0');
    setTdsStr('0');
    setTouched({});
    setSubmitted(false);
  };

  const handleExportCsv = () => {
    if (!result) return;
    downloadCsvFile(
      `calhub-income-tax-${financialYear}-${regime}.csv`,
      ['Income Slab', 'Rate (%)', 'Taxable Slice (INR)', 'Slab Tax (INR)'],
      [
        ...result.slabBreakdown.map((row) => [
          row.label,
          `${row.rate}%`,
          row.taxableSlice.toFixed(2),
          row.taxAmount.toFixed(2),
        ]),
        ['Slab Tax Before Rebate', '', '', result.taxBeforeRebate.toFixed(2)],
        ['Section 87A Rebate', '', '', (-result.rebate87A).toFixed(2)],
        ['87A Marginal Relief', '', '', (-result.marginalRelief).toFixed(2)],
        ['Surcharge', '', '', result.surcharge.toFixed(2)],
        ['Health & Education Cess (4%)', '', '', result.cessAmount.toFixed(2)],
        ['Total Estimated Tax Liability', '', '', result.totalTaxLiability.toFixed(2)],
        ['TDS / Advance Tax Credits', '', '', (-result.tdsAndCredits).toFixed(2)],
        [
          result.balancePayableOrRefund < 0 ? 'Estimated Refund' : 'Net Tax Payable',
          '',
          '',
          Math.abs(result.balancePayableOrRefund).toFixed(2),
        ],
      ]
    );
  };

  const isRefund = result ? result.balancePayableOrRefund < 0 : false;
  const postTaxIncome = result
    ? Math.max(0, result.grossTotalIncome - result.totalTaxLiability)
    : 0;
  const monthlyTakeHome = postTaxIncome / 12;

  const copySummary = result
    ? [
        `Indian Income Tax Estimate (${fyConfig.label}, ${regimeConfig.label}) — CalHub FinCalc Pro`,
        `Gross Total Income: ${formatINR(result.grossTotalIncome)}`,
        `Standard Deduction: ${formatINR(result.standardDeduction)}`,
        `Chapter VI-A Deductions Applied: ${formatINR(result.eligibleDeductionsApplied)}`,
        `Taxable Income: ${formatINR(result.taxableIncome)}`,
        `Slab Tax Before Rebate: ${formatINR(result.taxBeforeRebate)}`,
        result.rebate87A > 0 ? `Section 87A Rebate: -${formatINR(result.rebate87A)}` : null,
        result.marginalRelief > 0 ? `87A Marginal Relief: -${formatINR(result.marginalRelief)}` : null,
        result.surcharge > 0 ? `Surcharge: ${formatINR(result.surcharge)}` : null,
        `Health & Education Cess (4%): ${formatINR(result.cessAmount)}`,
        `Estimated Total Tax Liability: ${formatINR(result.totalTaxLiability)}`,
        `Estimated Post-Tax Income: ${formatINR(postTaxIncome)} (${formatINR(monthlyTakeHome)} / month)`,
        `Less TDS / Credits: ${formatINR(result.tdsAndCredits)}`,
        `${isRefund ? 'Estimated Refund' : 'Estimated Balance Payable'}: ${formatINR(Math.abs(result.balancePayableOrRefund))}`,
        'Note: Educational estimate only.',
      ]
        .filter(Boolean)
        .join('\n')
    : '';

  const formulaSteps = result
    ? [
        `Gross Total Income = Salary (${formatINR(result.salaryIncome)}) + Other Income (${formatINR(result.otherIncome)}) = ${formatINR(result.grossTotalIncome)}.`,
        `Subtract Standard Deduction (${formatINR(result.standardDeduction)}) and Eligible Deductions (${formatINR(result.eligibleDeductionsApplied)}) → Taxable Income = ${formatINR(result.taxableIncome)}.`,
        `Compute progressive slab tax (${regimeConfig.sectionReference}): ${formatINR(result.taxBeforeRebate)}.`,
        result.rebate87A > 0 || result.marginalRelief > 0
          ? `Apply Section 87A Rebate (${formatINR(result.rebate87A)}) and Marginal Relief (${formatINR(result.marginalRelief)}).`
          : `Section 87A Rebate: ₹0 (taxable income above ₹${regimeConfig.rebate87ALimit.toLocaleString('en-IN')} threshold or tax is nil).`,
        `Add Surcharge (${formatINR(result.surcharge)}) and 4% Health & Education Cess (${formatINR(result.cessAmount)}) = ${formatINR(result.totalTaxLiability)}.`,
        `Subtract TDS / Advance Tax (${formatINR(result.tdsAndCredits)}) = ${isRefund ? 'Estimated Refund ' : 'Balance Payable '}${formatINR(Math.abs(result.balancePayableOrRefund))}.`,
      ]
    : [];

  return (
    <div className="grid gap-6 lg:grid-cols-12 items-start">
      <div className="luxury-card p-6 space-y-5 lg:col-span-5">
        <div>
          <h3 className="text-lg font-semibold text-white">Income Tax Inputs</h3>
          <p className="mt-1 text-sm text-[#A1A1AA]">
            Educational slab estimator across New &amp; Old regimes with 87A &amp; 4% cess.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b border-[#D4AF37]/15 pb-4">
          <span className="text-xs font-medium text-[#A1A1AA]">Examples:</span>
          <button
            type="button"
            onClick={() => handleLoadExample('fy-2025-26', 'new', '1350000', '50000', '150000', '40000')}
            className="rounded-xl border border-[#D4AF37]/25 bg-white/[0.03] px-2.5 py-1 text-xs font-medium text-[#E4E4E7] transition-colors hover:border-[#F5D76E] hover:text-[#F5D76E] cursor-pointer"
          >
            Salaried ₹14L
          </button>
          <button
            type="button"
            onClick={() => handleLoadExample('fy-2025-26', 'new', '1275000', '0', '0', '0')}
            className="rounded-xl border border-[#D4AF37]/25 bg-white/[0.03] px-2.5 py-1 text-xs font-medium text-[#E4E4E7] transition-colors hover:border-[#F5D76E] hover:text-[#F5D76E] cursor-pointer"
          >
            87A Edge ₹12.75L
          </button>
          <button
            type="button"
            onClick={() =>
              handleLoadExample('fy-2025-26', 'old', '1800000', '120000', '350000', '180000', 'senior-60-79')
            }
            className="rounded-xl border border-[#D4AF37]/25 bg-white/[0.03] px-2.5 py-1 text-xs font-medium text-[#E4E4E7] transition-colors hover:border-[#F5D76E] hover:text-[#F5D76E] cursor-pointer"
          >
            Old Regime Senior
          </button>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="tax-fy" className="block text-sm font-medium text-white">
            Financial Year
          </label>
          <select
            id="tax-fy"
            value={financialYear}
            onChange={(e) => setFinancialYear(e.target.value as FinancialYearId)}
            className="luxury-input w-full px-3.5 py-2.5 text-sm font-medium text-white focus:outline-none cursor-pointer"
          >
            {(Object.keys(INDIAN_TAX_RULES) as FinancialYearId[]).map((fyKey) => (
              <option key={fyKey} value={fyKey} className="bg-[#111111] text-white">
                {INDIAN_TAX_RULES[fyKey].label} ({INDIAN_TAX_RULES[fyKey].assessmentYearLabel})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <span className="block text-sm font-medium text-white">Tax Regime</span>
          <div
            role="group"
            aria-label="Tax regime selection"
            className="flex rounded-xl border border-[#D4AF37]/20 bg-[#0B0B0D] p-1"
          >
            {(['new', 'old'] as TaxRegimeId[]).map((rKey) => (
              <button
                key={rKey}
                type="button"
                onClick={() => setRegime(rKey)}
                className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors cursor-pointer ${
                  regime === rKey
                    ? 'bg-[#D4AF37] text-[#050505] font-semibold'
                    : 'text-[#A1A1AA] hover:text-white'
                }`}
              >
                {rKey === 'new' ? 'New Regime (115BAC)' : 'Old Regime'}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-white">Age Bracket</span>
            {regime === 'new' && (
              <span className="text-[11px] text-[#A1A1AA]">Uniform slabs under 115BAC</span>
            )}
          </div>
          <div
            role="group"
            aria-label="Taxpayer age bracket"
            className="grid grid-cols-3 gap-1 rounded-xl border border-[#D4AF37]/20 bg-[#0B0B0D] p-1"
          >
            {AGE_CATEGORY_LABELS.map((item) => {
              const selected = (regime === 'new' ? 'below-60' : ageCategory) === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  disabled={regime === 'new'}
                  onClick={() => setAgeCategory(item.id)}
                  className={`rounded-lg px-2 py-1.5 text-xs font-medium transition-colors ${
                    regime === 'new'
                      ? 'opacity-45 cursor-not-allowed text-[#A1A1AA]'
                      : selected
                      ? 'bg-[#D4AF37] text-[#050505] font-semibold cursor-pointer'
                      : 'text-[#A1A1AA] hover:text-white cursor-pointer'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        <NumberInput
          id="tax-salary"
          label="Gross Salary Income"
          prefix="₹"
          min={0}
          placeholder="0"
          value={salaryStr}
          onChange={(val) => {
            setSalaryStr(val);
            setTouched((prev) => ({ ...prev, salaryIncome: true }));
          }}
          error={submitted || touched.salaryIncome ? errors.salaryIncome : undefined}
          helperText={
            result
              ? `Standard deduction applied automatically: ${formatINR(result.standardDeduction)}`
              : `Standard deduction for salaried: ${formatINR(regimeConfig.standardDeductionSalaried)}`
          }
        />

        <NumberInput
          id="tax-other"
          label="Other Income (Interest, Freelance)"
          prefix="₹"
          min={0}
          placeholder="0"
          value={otherStr}
          onChange={(val) => {
            setOtherStr(val);
            setTouched((prev) => ({ ...prev, otherIncome: true }));
          }}
          error={submitted || touched.otherIncome ? errors.otherIncome : undefined}
        />

        <NumberInput
          id="tax-deductions"
          label="Chapter VI-A Deductions (80C, 80D, HRA)"
          prefix="₹"
          min={0}
          placeholder="0"
          disabled={!regimeConfig.allowsChapterVIADeductions}
          value={deductionsStr}
          onChange={(val) => {
            setDeductionsStr(val);
            setTouched((prev) => ({ ...prev, eligibleDeductions: true }));
          }}
          error={
            submitted || touched.eligibleDeductions ? errors.eligibleDeductions : undefined
          }
          helperText={
            regimeConfig.allowsChapterVIADeductions
              ? 'Deducted from Gross Total Income under Old Regime.'
              : 'Excluded under New Regime Section 115BAC.'
          }
        />

        <NumberInput
          id="tax-tds"
          label="TDS / Advance Tax Credits Paid"
          prefix="₹"
          min={0}
          placeholder="0"
          value={tdsStr}
          onChange={(val) => {
            setTdsStr(val);
            setTouched((prev) => ({ ...prev, tdsAndCredits: true }));
          }}
          error={submitted || touched.tdsAndCredits ? errors.tdsAndCredits : undefined}
        />

        <CalcActionBar onCalculate={handleCalculate} onReset={handleReset} />
      </div>

      <div ref={resultsRef} className="space-y-5 lg:col-span-7">
        {!result ? (
          <ResultEmptyState
            hasErrors={
              !isEmpty &&
              !isValid &&
              (submitted ||
                Boolean(
                  touched.salaryIncome ||
                    touched.otherIncome ||
                    touched.eligibleDeductions ||
                    touched.tdsAndCredits
                ))
            }
            onLoadExample={() =>
              handleLoadExample('fy-2025-26', 'new', '1350000', '50000', '150000', '40000')
            }
          />
        ) : (
          <>
            <div className="luxury-card px-5 py-4 text-xs leading-relaxed text-[#A1A1AA]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold text-white">
                  {fyConfig.label} ({fyConfig.assessmentYearLabel}) · {regimeConfig.label}
                </span>
                <span className="font-mono font-semibold text-[#F5D76E]">
                  Educational Estimate ({fyConfig.regimeScopeNote})
                </span>
              </div>
              <p className="mt-1.5">{fyConfig.statusNote}</p>
            </div>

            <TiltCard3D className="luxury-card-accent p-6 space-y-5" maxTiltDeg={2.5}>
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#D4AF37]/20 pb-4">
                <div className="flex flex-wrap gap-x-8 gap-y-3">
                  <div>
                    <p className="text-xs font-semibold text-[#F5D76E]">
                      {isRefund ? 'Estimated Tax Refund' : 'Estimated Net Tax Payable'}
                    </p>
                    <p className="mt-1 font-mono text-3xl font-bold text-white tabular-nums sm:text-4xl">
                      <AnimatedNumber
                        value={Math.abs(result.balancePayableOrRefund)}
                        format={(n) => formatINR(n)}
                      />
                    </p>
                    <p className="mt-1 font-mono text-xs text-[#A1A1AA] tabular-nums">
                      Effective Rate on Gross Income: {result.effectiveTaxRate.toFixed(2)}%
                    </p>
                  </div>

                  <div className="sm:border-l sm:border-[#D4AF37]/20 sm:pl-6">
                    <p className="text-xs font-semibold text-[#A1A1AA]">
                      Estimated Monthly Take-Home
                    </p>
                    <p className="mt-1 font-mono text-2xl font-bold text-[#F5D76E] tabular-nums sm:text-3xl">
                      <AnimatedNumber value={monthlyTakeHome} format={(n) => `${formatINR(n)}/mo`} />
                    </p>
                    <p className="mt-1 font-mono text-xs text-[#A1A1AA] tabular-nums">
                      Annual Post-Tax: {formatINR(postTaxIncome)}
                    </p>
                  </div>
                </div>

                <ResultActionsBar
                  shareTitle="Income Tax Estimate — CalHub FinCalc Pro"
                  summaryText={copySummary}
                  onExportCsv={handleExportCsv}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="luxury-subcard p-3.5">
                  <p className="text-xs text-[#A1A1AA]">Gross Total Income</p>
                  <p className="mt-1 font-mono text-base font-semibold text-white tabular-nums">
                    {formatINR(result.grossTotalIncome)}
                  </p>
                </div>
                <div className="luxury-subcard p-3.5">
                  <p className="text-xs text-[#A1A1AA]">Eligible Deductions</p>
                  <p className="mt-1 font-mono text-base font-semibold text-white tabular-nums">
                    {formatINR(result.standardDeduction + result.eligibleDeductionsApplied)}
                  </p>
                </div>
                <div className="luxury-subcard p-3.5">
                  <p className="text-xs text-[#A1A1AA]">Taxable Income</p>
                  <p className="mt-1 font-mono text-base font-semibold text-white tabular-nums">
                    {formatINR(result.taxableIncome)}
                  </p>
                </div>
                <div className="luxury-subcard p-3.5">
                  <p className="text-xs font-medium text-[#F5D76E]">Total Tax Liability</p>
                  <p className="mt-1 font-mono text-base font-semibold text-white tabular-nums">
                    {formatINR(result.totalTaxLiability)}
                  </p>
                </div>
              </div>
            </TiltCard3D>

            {regimeComparison && (
              <div className="luxury-card p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-semibold text-white">
                      New vs Old Regime Comparison ({fyConfig.label})
                    </h4>
                    <p className="text-xs text-[#A1A1AA]">
                      {regimeComparison.suggestedRegime === 'tie'
                        ? 'Both regimes yield equal estimated tax liability for your current inputs.'
                        : regimeComparison.suggestedRegime === 'new'
                        ? `New Regime saves ${formatINR(regimeComparison.diff)} compared to Old Regime.`
                        : `Old Regime saves ${formatINR(regimeComparison.diff)} compared to New Regime with entered deductions.`}
                    </p>
                  </div>

                  {regimeComparison.suggestedRegime !== 'tie' &&
                    regimeComparison.suggestedRegime !== regime && (
                      <button
                        type="button"
                        onClick={() => setRegime(regimeComparison.suggestedRegime as TaxRegimeId)}
                        className="rounded-xl border border-[#D4AF37]/40 bg-[#D4AF37]/14 px-3 py-1.5 text-xs font-semibold text-[#F5D76E] transition-colors hover:bg-[#D4AF37]/24 cursor-pointer whitespace-nowrap"
                      >
                        Switch to {regimeComparison.suggestedRegime === 'new' ? 'New Regime' : 'Old Regime'}
                      </button>
                    )}
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div
                    className={`luxury-subcard p-3.5 ${
                      regimeComparison.suggestedRegime === 'new'
                        ? 'border-[#F5D76E]/55 bg-[#D4AF37]/10'
                        : ''
                    }`}
                  >
                    <p className="text-xs text-[#A1A1AA]">
                      New Regime (115BAC)
                      {regimeComparison.suggestedRegime === 'new' && (
                        <span className="ml-1.5 font-semibold text-[#F5D76E]">· Lower Tax</span>
                      )}
                    </p>
                    <p className="mt-1 font-mono text-lg font-bold text-white tabular-nums">
                      {formatINR(regimeComparison.newRes.totalTaxLiability)}
                    </p>
                  </div>

                  <div
                    className={`luxury-subcard p-3.5 ${
                      regimeComparison.suggestedRegime === 'old'
                        ? 'border-[#F5D76E]/55 bg-[#D4AF37]/10'
                        : ''
                    }`}
                  >
                    <p className="text-xs text-[#A1A1AA]">
                      Old Regime
                      {regimeComparison.suggestedRegime === 'old' && (
                        <span className="ml-1.5 font-semibold text-[#F5D76E]">· Lower Tax</span>
                      )}
                    </p>
                    <p className="mt-1 font-mono text-lg font-bold text-white tabular-nums">
                      {formatINR(regimeComparison.oldRes.totalTaxLiability)}
                    </p>
                  </div>

                  <div className="luxury-subcard p-3.5">
                    <p className="text-xs text-[#A1A1AA]">Tax Difference</p>
                    <p className="mt-1 font-mono text-lg font-bold text-[#F5D76E] tabular-nums">
                      {formatINR(regimeComparison.diff)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="luxury-card overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#D4AF37]/15 px-5 py-4">
                <h4 className="text-sm font-semibold text-white">
                  Estimated Slab-by-Slab Computation
                </h4>
                <span className="font-mono text-xs text-[#A1A1AA]">
                  {regimeConfig.sectionReference}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#141416] text-[#A1A1AA]">
                    <tr>
                      <th className="px-4 py-3 font-medium">Income Slab</th>
                      <th className="px-4 py-3 font-medium text-right">Rate</th>
                      <th className="px-4 py-3 font-medium text-right">Taxable Slice</th>
                      <th className="px-4 py-3 font-medium text-right">Slab Tax</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D4AF37]/12 font-mono tabular-nums">
                    {result.slabBreakdown.map((row) => (
                      <tr key={row.label} className="hover:bg-white/[0.025]">
                        <td className="px-4 py-3 font-sans text-[#E4E4E7]">{row.label}</td>
                        <td className="px-4 py-3 text-right text-[#A1A1AA]">{row.rate}%</td>
                        <td className="px-4 py-3 text-right text-white">
                          {formatINR(row.taxableSlice)}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-[#F5D76E]">
                          {formatINR(row.taxAmount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-2 border-t border-[#D4AF37]/18 bg-white/[0.02] px-5 py-4 text-xs font-mono tabular-nums">
                <div className="flex justify-between text-[#A1A1AA]">
                  <span className="font-sans">Slab Tax Before Rebate</span>
                  <span>{formatINR(result.taxBeforeRebate)}</span>
                </div>
                {(result.rebate87A > 0 || result.marginalRelief > 0) ? (
                  <>
                    {result.rebate87A > 0 && (
                      <div className="flex justify-between text-emerald-400">
                        <span className="font-sans">Less: Section 87A Rebate</span>
                        <span>-{formatINR(result.rebate87A)}</span>
                      </div>
                    )}
                    {result.marginalRelief > 0 && (
                      <div className="flex justify-between text-emerald-400">
                        <span className="font-sans">Less: Section 87A Marginal Relief</span>
                        <span>-{formatINR(result.marginalRelief)}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex justify-between text-[#A1A1AA]">
                    <span className="font-sans">Section 87A Rebate / Marginal Relief</span>
                    <span>{formatINR(0)}</span>
                  </div>
                )}
                {result.surcharge > 0 && (
                  <div className="flex justify-between text-[#A1A1AA]">
                    <span className="font-sans">Add: Surcharge</span>
                    <span>{formatINR(result.surcharge)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#A1A1AA]">
                  <span className="font-sans">Add: Health &amp; Education Cess (4%)</span>
                  <span>{formatINR(result.cessAmount)}</span>
                </div>
                <div className="flex justify-between text-[#A1A1AA]">
                  <span className="font-sans">Less: TDS / Advance Tax Paid</span>
                  <span>-{formatINR(result.tdsAndCredits)}</span>
                </div>
                <div className="flex justify-between border-t border-[#D4AF37]/18 pt-2 text-sm font-semibold text-white">
                  <span className="font-sans">Estimated Total Tax Liability</span>
                  <span className="text-[#F5D76E]">{formatINR(result.totalTaxLiability)}</span>
                </div>
              </div>
            </div>

            <FormulaAccordion
              formula="Total Tax = max(0, Slab Tax − 87A Rebate − Marginal Relief) + Surcharge + 4% Cess"
              steps={formulaSteps}
            />

            <div className="luxury-card p-5 space-y-2">
              <h4 className="text-xs font-semibold text-white">
                Key Assumptions ({fyConfig.label} · {regimeConfig.label})
              </h4>
              <ul className="space-y-1 text-xs text-[#A1A1AA]">
                {regime === 'old' && ageCategory !== 'below-60' ? (
                  <li>
                    · Using resident{' '}
                    {ageCategory === 'senior-60-79'
                      ? 'Senior Citizen (60–79 years, basic exemption ₹3,00,000)'
                      : 'Super Senior Citizen (80+ years, basic exemption ₹5,00,000)'}{' '}
                    Old Regime slabs.
                  </li>
                ) : null}
                {regimeConfig.assumptions.map((note, idx) => (
                  <li key={idx}>· {note}</li>
                ))}
              </ul>
              <p className="border-t border-[#D4AF37]/15 pt-2 text-xs text-[#A1A1AA]">
                Educational Estimate Notice: Figures shown are educational estimates for CA exam
                practice and planning, not formal tax or legal advice.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default IncomeTaxCalc;
