import { useMemo, useState } from 'react';
import { CheckCircle, DownloadSimple, Info, Scales, Warning } from '@phosphor-icons/react';
import {
  AgeCategory,
  CONFIGURABLE_TAX_RULES,
  FINANCIAL_YEAR_OPTIONS,
  FinancialYearKey,
  TaxRegime,
} from '../../data/taxRules';
import { calculateIncomeTaxWithComparison } from '../../logic/incomeTax';
import { downloadCSV, formatINR, formatPercent } from '../../utils/formatters';
import { parseNumericInput } from '../../utils/validators';
import { InputField } from '../ui/InputField';
import { EmptyState } from '../ui/EmptyState';
import { ResultActions } from '../ui/ResultActions';
import { TaxVisualBreakdown } from '../ui/Charts';

interface IncomeTaxCalcProps {
  selectedFY: FinancialYearKey;
  onChangeFY: (fy: FinancialYearKey) => void;
}

export function IncomeTaxCalc({ selectedFY, onChangeFY }: IncomeTaxCalcProps) {
  const [regime, setRegime] = useState<TaxRegime>('new');
  const [ageCategory, setAgeCategory] = useState<AgeCategory>('below60');
  const [salaryRaw, setSalaryRaw] = useState('');
  const [otherRaw, setOtherRaw] = useState('');
  const [deductionsRaw, setDeductionsRaw] = useState('');
  const [tdsRaw, setTdsRaw] = useState('');

  const rules = CONFIGURABLE_TAX_RULES[selectedFY];

  const parsedSalary = parseNumericInput(salaryRaw, 'Salary Income', { min: 0 });
  const parsedOther = parseNumericInput(otherRaw, 'Other Income', { min: 0 });
  const parsedDeductions = parseNumericInput(deductionsRaw, 'Eligible Deductions', {
    min: 0,
  });
  const parsedTds = parseNumericInput(tdsRaw, 'Tax Credits / TDS', { min: 0 });

  const hasError = Boolean(
    parsedSalary.error ||
      parsedOther.error ||
      parsedDeductions.error ||
      parsedTds.error
  );

  // Require at least one income input to be non-empty before showing results
  const hasAnyIncomeInput = salaryRaw.trim() !== '' || otherRaw.trim() !== '';
  const isReady =
    !hasError &&
    hasAnyIncomeInput &&
    parsedSalary.value !== null &&
    parsedOther.value !== null &&
    parsedDeductions.value !== null &&
    parsedTds.value !== null;

  const comparison = useMemo(() => {
    if (!isReady) return null;
    return calculateIncomeTaxWithComparison(
      {
        salaryIncome: parsedSalary.value!,
        otherIncome: parsedOther.value!,
        eligibleDeductions: parsedDeductions.value!,
        tdsAndCredits: parsedTds.value!,
        regime,
        ageCategory,
      },
      rules
    );
  }, [
    isReady,
    parsedSalary.value,
    parsedOther.value,
    parsedDeductions.value,
    parsedTds.value,
    regime,
    ageCategory,
    rules,
  ]);

  const handleReset = () => {
    setSalaryRaw('');
    setOtherRaw('');
    setDeductionsRaw('');
    setTdsRaw('');
  };

  const result = comparison?.selected ?? null;

  const handleDownloadTaxCSV = () => {
    if (!result) return;
    downloadCSV(
      `fincalc-income-tax-${result.financialYear}-${result.regime}.csv`,
      ['Income Slab', 'Rate (%)', 'Taxable Income in Slab (INR)', 'Slab Tax (INR)'],
      result.slabBreakdown.map((s) => [
        s.label,
        s.rate,
        s.taxableInSlab.toFixed(0),
        s.taxAmount.toFixed(0),
      ])
    );
  };

  const summaryText = result
    ? [
        `FinCalc Pro — Indian Income Tax Estimate (${result.financialYear} / ${result.assessmentYear})`,
        `Regime: ${result.regimeName}`,
        `Gross Total Income: ${formatINR(result.grossTotalIncome, 0)}`,
        `Standard Deduction: ${formatINR(result.standardDeductionApplied, 0)}`,
        `Eligible Deductions Applied: ${formatINR(result.userDeductionsApplied, 0)}`,
        `Net Taxable Income: ${formatINR(result.netTaxableIncome, 0)}`,
        `Tax Before Rebate: ${formatINR(result.taxBeforeRebate, 0)}`,
        `Sec 87A Rebate: ${formatINR(result.rebate87A, 0)}`,
        result.marginalRelief87A > 0
          ? `Sec 87A Marginal Relief: ${formatINR(result.marginalRelief87A, 0)}`
          : null,
        result.surchargeApplied > 0
          ? `Surcharge (${result.surchargeRate}%): ${formatINR(result.surchargeApplied, 0)}`
          : null,
        `Health & Education Cess (4%): ${formatINR(result.healthAndEducationCess, 0)}`,
        `Total Estimated Tax Liability: ${formatINR(result.totalTaxLiability, 0)}`,
        `Less Tax Credits / TDS: ${formatINR(result.tdsAndCredits, 0)}`,
        result.balanceStatus === 'payable'
          ? `Estimated Balance Payable: ${formatINR(result.netBalance, 0)}`
          : result.balanceStatus === 'refund'
          ? `Estimated Refund Due: ${formatINR(Math.abs(result.netBalance), 0)}`
          : 'Estimated Balance Payable: ₹0',
        'Disclaimer: Educational estimate for CA students, not professional tax advice.',
      ]
        .filter(Boolean)
        .join('\n')
    : null;

  const newRegimeData =
    comparison?.selected.regime === 'new' ? comparison.selected : comparison?.alternate;
  const oldRegimeData =
    comparison?.selected.regime === 'old' ? comparison.selected : comparison?.alternate;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Left Input Column */}
      <div className="rounded-xl border border-white/[0.08] bg-bg-2 p-5 sm:p-6 lg:col-span-5">
        <div className="mb-4 border-b border-white/[0.08] pb-4">
          <h2 className="font-display text-lg font-semibold text-text-0">
            Taxpayer & Income Profile
          </h2>
          <p className="mt-1 text-xs text-text-4">
            Educational Indian income tax estimator with configurable FY slabs and regime comparison.
          </p>
        </div>

        <div className="space-y-4">
          {/* Financial Year Selector */}
          <div className="space-y-1.5">
            <label
              htmlFor="tax-fy"
              className="block text-sm font-medium text-text-2"
            >
              Financial Year (FY)
            </label>
            <select
              id="tax-fy"
              value={selectedFY}
              onChange={(e) => onChangeFY(e.target.value as FinancialYearKey)}
              className="min-h-[44px] w-full rounded-lg border border-white/10 bg-bg-0 px-3 py-2.5 text-sm text-text-0 focus:border-gold focus:outline-none"
            >
              {FINANCIAL_YEAR_OPTIONS.map((fyKey) => {
                const r = CONFIGURABLE_TAX_RULES[fyKey];
                return (
                  <option key={fyKey} value={fyKey}>
                    {r.financialYear} ({r.assessmentYear})
                    {!r.verified ? ' — Sample Estimate' : ''}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Regime Selector */}
          <div className="space-y-1.5">
            <span className="block text-sm font-medium text-text-2">Tax Regime</span>
            <div className="grid grid-cols-2 gap-1.5 rounded-lg border border-white/[0.08] bg-bg-1 p-1">
              <button
                type="button"
                onClick={() => setRegime('new')}
                className={`min-h-[38px] rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                  regime === 'new'
                    ? 'bg-gold text-bg-0 font-semibold'
                    : 'text-text-4 hover:text-text-0'
                }`}
              >
                New Regime (115BAC)
              </button>
              <button
                type="button"
                onClick={() => setRegime('old')}
                className={`min-h-[38px] rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                  regime === 'old'
                    ? 'bg-gold text-bg-0 font-semibold'
                    : 'text-text-4 hover:text-text-0'
                }`}
              >
                Old Regime
              </button>
            </div>
          </div>

          {/* Age Category (relevant for Old Regime) */}
          <div className="space-y-1.5">
            <label
              htmlFor="tax-age"
              className="block text-sm font-medium text-text-2"
            >
              Age Category{' '}
              <span className="text-xs font-normal text-text-4">
                (Old Regime exemption)
              </span>
            </label>
            <select
              id="tax-age"
              value={ageCategory}
              onChange={(e) => setAgeCategory(e.target.value as AgeCategory)}
              className="min-h-[44px] w-full rounded-lg border border-white/10 bg-bg-0 px-3 py-2.5 text-sm text-text-0 focus:border-gold focus:outline-none"
            >
              <option value="below60">Resident Below 60 Years (₹2.5L exempt)</option>
              <option value="senior60to79">Senior Citizen 60–79 Years (₹3L exempt)</option>
              <option value="superSenior80plus">Super Senior 80+ Years (₹5L exempt)</option>
            </select>
          </div>

          <InputField
            id="tax-salary"
            label="Gross Salary Income"
            value={salaryRaw}
            onChange={setSalaryRaw}
            placeholder="e.g. 1275000"
            prefix="₹"
            showIndianScale
            error={parsedSalary.error}
            tooltip={`Standard deduction of ${formatINR(
              regime === 'new'
                ? rules.newRegime.standardDeductionSalaried
                : rules.oldRegime.standardDeductionSalaried,
              0
            )} is automatically applied when gross salary > ₹0.`}
            quickChips={[
              { label: '₹7.5L', value: '750000' },
              { label: '₹12.75L', value: '1275000' },
              { label: '₹18L', value: '1800000' },
              { label: '₹25L', value: '2500000' },
            ]}
          />

          <InputField
            id="tax-other"
            label="Other Income"
            value={otherRaw}
            onChange={setOtherRaw}
            placeholder="e.g. 85000"
            prefix="₹"
            showIndianScale
            error={parsedOther.error}
            tooltip="Bank interest, freelance/consultancy receipts, or taxable rental income taxed at slab rates."
          />

          <InputField
            id="tax-deductions"
            label="Eligible Deductions (Ch. VI-A)"
            value={deductionsRaw}
            onChange={setDeductionsRaw}
            placeholder="e.g. 200000"
            prefix="₹"
            showIndianScale
            error={parsedDeductions.error}
            tooltip="Deductions like Sec 80C, 80D, 80CCD(1B), 80G. Applied under Old Regime; compared simultaneously against New Regime."
            quickChips={[
              { label: '₹1.5L (80C)', value: '150000' },
              { label: '₹2.5L', value: '250000' },
              { label: '₹3.5L', value: '350000' },
            ]}
          />

          <InputField
            id="tax-tds"
            label="Tax Credits / TDS / Advance Tax"
            value={tdsRaw}
            onChange={setTdsRaw}
            placeholder="e.g. 60000"
            prefix="₹"
            showIndianScale
            error={parsedTds.error}
            tooltip="Tax already deducted at source (Form 26AS / AIS) or paid via advance/self-assessment tax."
          />

          <div className="pt-2">
            <ResultActions onReset={handleReset} summaryText={summaryText} />
          </div>
        </div>
      </div>

      {/* Right Output Column */}
      <div className="space-y-5 lg:col-span-7">
        {!result || !comparison || !newRegimeData || !oldRegimeData ? (
          <EmptyState
            title="Enter Income Details to Compute Tax"
            description="Select Financial Year and Regime, enter Salary or Other Income, and inspect slab-by-slab computation, Section 87A rebate, marginal relief, cess, and Old vs. New comparison."
            presets={[
              {
                label: 'Salaried ₹12,75,000 (Sec 87A Sweet Spot)',
                description: 'FY 2026-27 New Regime zero-tax example after ₹75k std deduction',
                onSelect: () => {
                  onChangeFY('FY2026-27');
                  setRegime('new');
                  setAgeCategory('below60');
                  setSalaryRaw('1275000');
                  setOtherRaw('0');
                  setDeductionsRaw('0');
                  setTdsRaw('0');
                },
              },
              {
                label: 'CA Professional ₹22L + ₹3.5L Deductions',
                description: 'Compare New vs. Old Regime with ₹1,80,000 TDS credit',
                onSelect: () => {
                  onChangeFY('FY2026-27');
                  setRegime('old');
                  setAgeCategory('below60');
                  setSalaryRaw('1800000');
                  setOtherRaw('400000');
                  setDeductionsRaw('350000');
                  setTdsRaw('180000');
                },
              },
              {
                label: 'Marginal Relief Case ₹12,20,000',
                description: 'Income ₹20k above ₹12L New Regime 87A threshold',
                onSelect: () => {
                  onChangeFY('FY2026-27');
                  setRegime('new');
                  setAgeCategory('below60');
                  setSalaryRaw('0');
                  setOtherRaw('1220000');
                  setDeductionsRaw('0');
                  setTdsRaw('0');
                },
              },
            ]}
          />
        ) : (
          <>
            {/* Verification & Regime Context Banner */}
            {!result.verified && (
              <div className="flex items-start gap-3 rounded-xl border border-amber-500/40 bg-bg-card p-4 text-xs text-amber-200">
                <Warning size={16} weight="fill" className="mt-0.5 shrink-0 text-amber-400" aria-hidden="true" />
                <div>
                  <span className="font-semibold">Sample Estimate Only:</span> Tax slabs for{' '}
                  {result.financialYear} are displayed as illustrative estimates. Verify against official Income Tax Department of India notifications before filing.
                </div>
              </div>
            )}

            {result.disallowedDeductionWarning && (
              <div className="flex items-start gap-3 rounded-xl border border-gold/35 bg-bg-0 p-4 text-xs text-text-2">
                <Info size={16} weight="fill" className="mt-0.5 shrink-0 text-gold-hover" aria-hidden="true" />
                <div>
                  <span className="font-semibold text-gold-hover">New Regime Note:</span> You entered{' '}
                  <span className="font-mono-num">{formatINR(result.userDeductionsEntered, 0)}</span> in Chapter VI-A deductions. Under the New Regime (Sec 115BAC), regular deductions like 80C/80D are not deducted (only Standard Deduction applies). See the side-by-side comparison below to evaluate tax savings.
                </div>
              </div>
            )}

            {/* Primary Balance / Liability Spotlight + Key Metrics */}
            <div className="rounded-xl border border-gold/40 bg-bg-0 p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <span className="text-xs font-medium text-gold-hover">
                    {result.balanceStatus === 'refund'
                      ? 'Estimated Refund Due'
                      : result.balanceStatus === 'settled'
                      ? 'Net Tax Balance Settled'
                      : 'Estimated Balance Tax Payable'}
                  </span>
                  <div className="font-mono-num mt-1 text-3xl font-bold tracking-tight text-text-0">
                    {formatINR(Math.abs(result.netBalance), 0)}
                  </div>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-text-3">
                    <CheckCircle size={14} weight="fill" className="text-gold" aria-hidden="true" />
                    <span>
                      {result.balanceStatus === 'refund'
                        ? 'Excess TDS / credits refundable after assessment'
                        : result.balanceStatus === 'settled'
                        ? 'Tax liability fully covered by credits & TDS'
                        : `Total liability ${formatINR(result.totalTaxLiability, 0)} minus ${formatINR(result.tdsAndCredits, 0)} TDS`}
                    </span>
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4 sm:text-right">
                  <div>
                    <span className="text-xs text-text-4">Net Taxable</span>
                    <div className="font-mono-num mt-0.5 text-sm font-semibold text-text-0">
                      {formatINR(result.netTaxableIncome, 0)}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-text-4">Total Tax</span>
                    <div className="font-mono-num mt-0.5 text-sm font-semibold text-gold-hover">
                      {formatINR(result.totalTaxLiability, 0)}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-text-4">Eff. Rate</span>
                    <div className="font-mono-num mt-0.5 text-sm font-semibold text-text-2">
                      {formatPercent(result.effectiveTaxRatePercent)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Old vs New Regime Recommendation Banner */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-bg-2 px-5 py-3.5 text-xs">
              <div className="flex items-center gap-2.5 text-text-2">
                <Scales size={16} weight="regular" className="text-gold" aria-hidden="true" />
                <span>
                  {comparison.recommendedRegime === 'tie' ? (
                    'Both New and Old Regimes result in the exact same estimated tax liability.'
                  ) : (
                    <>
                      <strong className="text-gold-hover">
                        {comparison.recommendedRegime === 'new' ? 'New Regime' : 'Old Regime'}
                      </strong>{' '}
                      saves{' '}
                      <strong className="font-mono-num text-text-0">
                        {formatINR(comparison.savingsAmount, 0)}
                      </strong>{' '}
                      compared to the{' '}
                      {comparison.recommendedRegime === 'new' ? 'Old Regime' : 'New Regime'}.
                    </>
                  )}
                </span>
              </div>
              <span className="text-text-4">
                {result.financialYear} · {result.assessmentYear}
              </span>
            </div>

            {/* Visual Charts */}
            <TaxVisualBreakdown
              slabBreakdown={result.slabBreakdown}
              selectedTotalTax={result.totalTaxLiability}
              selectedLabel={result.regime === 'new' ? 'New Regime' : 'Old Regime'}
              alternateTotalTax={comparison.alternate.totalTaxLiability}
              alternateLabel={comparison.alternate.regime === 'new' ? 'New Regime' : 'Old Regime'}
            />

            {/* Side-by-Side Regime Comparison Matrix */}
            <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-bg-2">
              <div className="border-b border-white/[0.08] px-5 py-3.5">
                <h3 className="font-display text-sm font-semibold text-text-0">
                  Side-by-Side Regime Comparison ({result.financialYear})
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-bg-3 text-text-4">
                    <tr className="border-b border-white/[0.08]">
                      <th className="px-4 py-2.5 font-medium">Computation Line Item</th>
                      <th
                        className={`px-4 py-2.5 text-right font-medium ${
                          result.regime === 'new' ? 'text-gold-hover' : ''
                        }`}
                      >
                        New Regime {result.regime === 'new' ? '(Selected)' : ''}
                      </th>
                      <th
                        className={`px-4 py-2.5 text-right font-medium ${
                          result.regime === 'old' ? 'text-gold-hover' : ''
                        }`}
                      >
                        Old Regime {result.regime === 'old' ? '(Selected)' : ''}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="font-mono-num divide-y divide-white/[0.05]">
                    <tr>
                      <td className="px-4 py-2 font-sans text-text-3">Gross Total Income</td>
                      <td className="px-4 py-2 text-right text-text-2">
                        {formatINR(newRegimeData.grossTotalIncome, 0)}
                      </td>
                      <td className="px-4 py-2 text-right text-text-2">
                        {formatINR(oldRegimeData.grossTotalIncome, 0)}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-sans text-text-4">Standard Deduction</td>
                      <td className="px-4 py-2 text-right text-text-3">
                        −{formatINR(newRegimeData.standardDeductionApplied, 0)}
                      </td>
                      <td className="px-4 py-2 text-right text-text-3">
                        −{formatINR(oldRegimeData.standardDeductionApplied, 0)}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-sans text-text-4">Ch. VI-A Deductions</td>
                      <td className="px-4 py-2 text-right text-text-3">
                        −{formatINR(newRegimeData.userDeductionsApplied, 0)}
                      </td>
                      <td className="px-4 py-2 text-right text-text-3">
                        −{formatINR(oldRegimeData.userDeductionsApplied, 0)}
                      </td>
                    </tr>
                    <tr className="bg-white/[0.02] font-semibold">
                      <td className="px-4 py-2 font-sans text-text-0">Net Taxable Income</td>
                      <td className="px-4 py-2 text-right text-text-0">
                        {formatINR(newRegimeData.netTaxableIncome, 0)}
                      </td>
                      <td className="px-4 py-2 text-right text-text-0">
                        {formatINR(oldRegimeData.netTaxableIncome, 0)}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-sans text-text-4">
                        Rebate 87A + Marginal Relief
                      </td>
                      <td className="px-4 py-2 text-right text-gold-hover">
                        −{formatINR(newRegimeData.rebate87A + newRegimeData.marginalRelief87A, 0)}
                      </td>
                      <td className="px-4 py-2 text-right text-gold-hover">
                        −{formatINR(oldRegimeData.rebate87A + oldRegimeData.marginalRelief87A, 0)}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-sans text-text-4">Surcharge + 4% Cess</td>
                      <td className="px-4 py-2 text-right text-text-3">
                        +{formatINR(
                          newRegimeData.surchargeApplied + newRegimeData.healthAndEducationCess,
                          0
                        )}
                      </td>
                      <td className="px-4 py-2 text-right text-text-3">
                        +{formatINR(
                          oldRegimeData.surchargeApplied + oldRegimeData.healthAndEducationCess,
                          0
                        )}
                      </td>
                    </tr>
                    <tr className="bg-bg-0/60 font-bold">
                      <td className="px-4 py-2.5 font-sans text-text-0">Total Tax Liability</td>
                      <td className="px-4 py-2.5 text-right text-gold-hover">
                        {formatINR(newRegimeData.totalTaxLiability, 0)}
                      </td>
                      <td className="px-4 py-2.5 text-right text-gold-hover">
                        {formatINR(oldRegimeData.totalTaxLiability, 0)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Slab-by-Slab & Tax Computation Table */}
            <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-bg-2">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.08] px-5 py-3.5">
                <div>
                  <h3 className="font-display text-sm font-semibold text-text-0">
                    Slab-by-Slab Computation ({result.financialYear})
                  </h3>
                  <p className="text-xs text-text-4">{result.regimeName}</p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadTaxCSV}
                  className="inline-flex min-h-[32px] items-center gap-1.5 rounded-lg border border-white/15 bg-bg-3 px-3 py-1 text-xs font-medium text-text-2 transition-colors hover:border-gold/50 hover:text-gold-hover whitespace-nowrap"
                >
                  <DownloadSimple size={14} weight="bold" aria-hidden="true" />
                  <span>Export CSV</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-bg-3 text-text-4">
                    <tr className="border-b border-white/[0.08]">
                      <th className="px-4 py-2.5 font-medium">Income Slab</th>
                      <th className="px-4 py-2.5 text-right font-medium">Rate</th>
                      <th className="px-4 py-2.5 text-right font-medium">Taxable Income in Slab</th>
                      <th className="px-4 py-2.5 text-right font-medium">Slab Tax</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono-num divide-y divide-white/[0.05]">
                    {result.slabBreakdown.map((row) => (
                      <tr key={row.label} className="hover:bg-white/[0.02]">
                        <td className="px-4 py-2.5 font-sans text-text-2">{row.label}</td>
                        <td className="px-4 py-2.5 text-right text-text-3">{row.rate}%</td>
                        <td className="px-4 py-2.5 text-right text-text-3">
                          {formatINR(row.taxableInSlab, 0)}
                        </td>
                        <td className="px-4 py-2.5 text-right font-medium text-text-0">
                          {formatINR(row.taxAmount, 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Stepwise Summary Ledger */}
              <div className="border-t border-white/[0.08] bg-bg-0 px-5 py-4">
                <dl className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <dt className="text-text-4">Tax on Slabs (Before Rebate)</dt>
                    <dd className="font-mono-num text-text-2">
                      {formatINR(result.taxBeforeRebate, 0)}
                    </dd>
                  </div>
                  {result.rebate87A > 0 && (
                    <div className="flex justify-between">
                      <dt className="text-gold-hover">Less: Rebate u/s 87A</dt>
                      <dd className="font-mono-num text-gold-hover">
                        −{formatINR(result.rebate87A, 0)}
                      </dd>
                    </div>
                  )}
                  {result.marginalRelief87A > 0 && (
                    <div className="flex justify-between">
                      <dt className="text-gold-hover">Less: Sec 87A Marginal Relief</dt>
                      <dd className="font-mono-num text-gold-hover">
                        −{formatINR(result.marginalRelief87A, 0)}
                      </dd>
                    </div>
                  )}
                  {result.surchargeApplied > 0 && (
                    <div className="flex justify-between">
                      <dt className="text-text-4">
                        Add: Surcharge ({result.surchargeRate}%
                        {result.surchargeMarginalRelief > 0
                          ? ` after ₹${Math.round(result.surchargeMarginalRelief).toLocaleString('en-IN')} marginal relief`
                          : ''}
                        )
                      </dt>
                      <dd className="font-mono-num text-text-2">
                        +{formatINR(result.surchargeApplied, 0)}
                      </dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-text-4">
                      Add: Health & Education Cess ({result.cessRatePercent}%)
                    </dt>
                    <dd className="font-mono-num text-text-2">
                      +{formatINR(result.healthAndEducationCess, 0)}
                    </dd>
                  </div>
                  <div className="flex justify-between border-t border-white/[0.08] pt-2 text-sm font-bold">
                    <dt className="text-text-0">Total Estimated Tax Liability</dt>
                    <dd className="font-mono-num text-gold-hover">
                      {formatINR(result.totalTaxLiability, 0)}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Assumptions & Educational Disclaimer */}
            <div className="rounded-xl border border-white/[0.08] bg-bg-2 p-5 text-xs text-text-4">
              <h4 className="font-display mb-2 text-sm font-semibold text-text-0">
                Assumptions & Educational Disclaimer
              </h4>
              <p className="mb-2 text-xs text-text-5">
                Verification Basis: {result.verificationSource}
              </p>
              <ul className="list-disc space-y-1 pl-4">
                {result.assumptions.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
              <p className="mt-3 border-t border-white/[0.08] pt-3 text-text-3">
                <strong className="text-gold-hover">Educational Note:</strong> These calculations are educational estimates built for Indian CA students and conceptual illustration. They do not constitute professional tax, audit, or legal advice. Always verify against the latest Finance Act notifications on incometax.gov.in.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
