import { useMemo, useState } from 'react';
import { CaretDown, CaretUp, DownloadSimple, House } from '@phosphor-icons/react';
import { calculateLoanEmi, LoanTenureUnit } from '../../logic/loanEmi';
import { downloadCSV, formatINR } from '../../utils/formatters';
import { parseNumericInput } from '../../utils/validators';
import { InputField } from '../ui/InputField';
import { EmptyState } from '../ui/EmptyState';
import { ResultActions } from '../ui/ResultActions';
import { LoanBreakdownChart } from '../ui/Charts';

export function LoanEmiCalc() {
  // Optional Home Price & Down Payment Estimator
  const [showEstimator, setShowEstimator] = useState(false);
  const [homePriceRaw, setHomePriceRaw] = useState('');
  const [downPaymentRaw, setDownPaymentRaw] = useState('');

  // Core Loan Inputs
  const [loanAmountRaw, setLoanAmountRaw] = useState('');
  const [rateRaw, setRateRaw] = useState('');
  const [tenureRaw, setTenureRaw] = useState('');
  const [tenureUnit, setTenureUnit] = useState<LoanTenureUnit>('years');
  const [feeRaw, setFeeRaw] = useState('');
  const [feeMode, setFeeMode] = useState<'flat' | 'percent'>('flat');

  // Schedule display controls
  const [selectedYearFilter, setSelectedYearFilter] = useState<number | 'all'>(1);

  const parsedHomePrice = parseNumericInput(homePriceRaw, 'Home Price', {
    min: 0,
  });
  const parsedDownPayment = parseNumericInput(downPaymentRaw, 'Down Payment', {
    min: 0,
  });

  const downPaymentExceedsHome =
    showEstimator &&
    homePriceRaw.trim() !== '' &&
    downPaymentRaw.trim() !== '' &&
    parsedHomePrice.value !== null &&
    parsedDownPayment.value !== null &&
    parsedDownPayment.value >= parsedHomePrice.value;

  const ltvPercent =
    showEstimator &&
    parsedHomePrice.value &&
    parsedHomePrice.value > 0 &&
    parsedDownPayment.value !== null &&
    !downPaymentExceedsHome
      ? ((parsedHomePrice.value - parsedDownPayment.value) / parsedHomePrice.value) * 100
      : null;

  const syncEstimatorToLoan = (nextHome: string, nextDown: string) => {
    const h = Number(nextHome);
    const d = nextDown.trim() === '' ? 0 : Number(nextDown);
    if (nextHome.trim() !== '' && Number.isFinite(h) && Number.isFinite(d) && h > d && d >= 0) {
      setLoanAmountRaw(String(Math.round(h - d)));
    }
  };

  const applyDownPaymentPercent = (pct: number) => {
    const h = Number(homePriceRaw);
    if (Number.isFinite(h) && h > 0) {
      const dp = Math.round((h * pct) / 100);
      setDownPaymentRaw(String(dp));
      setLoanAmountRaw(String(Math.round(h - dp)));
    }
  };

  const parsedLoan = parseNumericInput(loanAmountRaw, 'Loan Amount', {
    required: true,
    exclusiveMin: 0,
  });
  const parsedRate = parseNumericInput(rateRaw, 'Annual Interest Rate', {
    required: true,
    min: 0,
    max: 100,
  });
  const parsedTenure = parseNumericInput(tenureRaw, 'Loan Term', {
    required: true,
    exclusiveMin: 0,
    max: tenureUnit === 'years' ? 50 : 600,
  });
  const parsedFee = parseNumericInput(feeRaw, 'Processing Fee', {
    min: 0,
    max: feeMode === 'percent' ? 50 : undefined,
  });

  const hasError = Boolean(
    parsedLoan.error ||
      parsedRate.error ||
      parsedTenure.error ||
      parsedFee.error ||
      downPaymentExceedsHome
  );
  const isReady =
    !hasError &&
    parsedLoan.value !== null &&
    parsedRate.value !== null &&
    parsedTenure.value !== null &&
    parsedFee.value !== null;

  const processingFeeAmount = useMemo(() => {
    if (!parsedLoan.value || parsedFee.value === null) return 0;
    return feeMode === 'percent'
      ? (parsedLoan.value * parsedFee.value) / 100
      : parsedFee.value;
  }, [parsedLoan.value, parsedFee.value, feeMode]);

  const result = useMemo(() => {
    if (!isReady) return null;
    return calculateLoanEmi({
      loanAmount: parsedLoan.value!,
      annualRate: parsedRate.value!,
      tenureValue: parsedTenure.value!,
      tenureUnit,
      processingFeeAmount,
    });
  }, [isReady, parsedLoan.value, parsedRate.value, parsedTenure.value, tenureUnit, processingFeeAmount]);

  const crossoverYear = useMemo(() => {
    if (!result) return null;
    const found = result.yearlySummary.find((y) => y.principalPaid > y.interestPaid);
    return found ? found.year : null;
  }, [result]);

  const visibleSchedule = useMemo(() => {
    if (!result) return [];
    if (selectedYearFilter === 'all') return result.schedule;
    const startMonth = (selectedYearFilter - 1) * 12 + 1;
    const endMonth = selectedYearFilter * 12;
    return result.schedule.filter((r) => r.month >= startMonth && r.month <= endMonth);
  }, [result, selectedYearFilter]);

  const handleReset = () => {
    setHomePriceRaw('');
    setDownPaymentRaw('');
    setLoanAmountRaw('');
    setRateRaw('');
    setTenureRaw('');
    setTenureUnit('years');
    setFeeRaw('');
    setFeeMode('flat');
    setSelectedYearFilter(1);
  };

  const handleDownloadScheduleCSV = () => {
    if (!result) return;
    downloadCSV(
      'fincalc-loan-amortization-schedule.csv',
      ['Month', 'Opening Balance (INR)', 'EMI (INR)', 'Principal Repaid (INR)', 'Interest Paid (INR)', 'Closing Balance (INR)'],
      result.schedule.map((r) => [
        r.month,
        r.openingBalance.toFixed(2),
        r.emi.toFixed(2),
        r.principalPaid.toFixed(2),
        r.interestPaid.toFixed(2),
        r.closingBalance.toFixed(2),
      ])
    );
  };

  const summaryText = result
    ? [
        'FinCalc Pro — Bank / Home Loan EMI Summary',
        `Loan Amount: ${formatINR(result.loanAmount)}`,
        `Interest Rate: ${result.annualRate}% p.a.`,
        `Tenure: ${result.totalMonths} months`,
        `Monthly EMI: ${formatINR(result.monthlyEmi)}`,
        `Total Interest Payable: ${formatINR(result.totalInterest)}`,
        `Total Repayment (Principal + Interest): ${formatINR(result.totalRepayment)}`,
        `Processing Fee: ${formatINR(result.processingFee)}`,
        `Total Cost Including Fee: ${formatINR(result.totalCostIncludingFee)}`,
      ].join('\n')
    : null;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Left Input Panel */}
      <div className="rounded-xl border border-white/[0.08] bg-[#111116] p-5 sm:p-6 lg:col-span-5">
        <div className="mb-4 border-b border-white/[0.08] pb-4">
          <h2 className="font-display text-lg font-semibold text-white">
            Loan & EMI Parameters
          </h2>
          <p className="mt-1 text-xs text-zinc-400">
            Reducing-balance monthly EMI with processing fee and amortization schedule.
          </p>
        </div>

        {/* Optional Home Price & Down Payment Estimator */}
        <div className="mb-5 rounded-lg border border-white/[0.08] bg-[#0B0B0E]">
          <button
            type="button"
            onClick={() => setShowEstimator((s) => !s)}
            className="flex min-h-[42px] w-full items-center justify-between px-3.5 py-2.5 text-left text-xs font-medium text-[#E5C158] hover:text-[#F0CE66]"
          >
            <span className="inline-flex items-center gap-2">
              <House size={14} weight="regular" aria-hidden="true" />
              <span>Estimate Loan from Home Price &amp; Down Payment</span>
            </span>
            {showEstimator ? (
              <CaretUp size={16} weight="bold" aria-hidden="true" />
            ) : (
              <CaretDown size={16} weight="bold" aria-hidden="true" />
            )}
          </button>

          {showEstimator && (
            <div className="space-y-3 border-t border-white/[0.08] p-3.5">
              <InputField
                id="emi-home-price"
                label="Home / Property Price"
                value={homePriceRaw}
                onChange={(val) => {
                  setHomePriceRaw(val);
                  syncEstimatorToLoan(val, downPaymentRaw);
                }}
                placeholder="e.g. 7500000"
                prefix="₹"
                showIndianScale
                error={parsedHomePrice.error}
              />
              <InputField
                id="emi-down-payment"
                label="Down Payment"
                value={downPaymentRaw}
                onChange={(val) => {
                  setDownPaymentRaw(val);
                  syncEstimatorToLoan(homePriceRaw, val);
                }}
                placeholder="e.g. 1500000"
                prefix="₹"
                showIndianScale
                error={
                  downPaymentExceedsHome
                    ? 'Down payment must be less than the home price.'
                    : parsedDownPayment.error
                }
              />
              {parsedHomePrice.value && parsedHomePrice.value > 0 ? (
                <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                  <div className="flex gap-1.5">
                    {[10, 20, 25].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => applyDownPaymentPercent(pct)}
                        className="rounded border border-white/10 bg-[#16161D] px-2 py-1 text-[11px] text-zinc-300 hover:border-[#D4AF37]/50 hover:text-[#E5C158]"
                      >
                        {pct}% Down
                      </button>
                    ))}
                  </div>
                  {ltvPercent !== null && (
                    <span className="font-mono-num text-[11px] text-zinc-400">
                      LTV: {ltvPercent.toFixed(1)}%
                    </span>
                  )}
                </div>
              ) : null}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <InputField
            id="emi-loan-amount"
            label="Loan Amount"
            value={loanAmountRaw}
            onChange={setLoanAmountRaw}
            placeholder="e.g. 6000000"
            prefix="₹"
            showIndianScale
            error={parsedLoan.error}
            tooltip="Total principal borrowed from the bank or housing finance institution."
            quickChips={[
              { label: '₹10L', value: '1000000' },
              { label: '₹30L', value: '3000000' },
              { label: '₹60L', value: '6000000' },
              { label: '₹1Cr', value: '10000000' },
            ]}
          />

          <InputField
            id="emi-rate"
            label="Annual Interest Rate"
            value={rateRaw}
            onChange={setRateRaw}
            placeholder="e.g. 8.75"
            suffix="% p.a."
            error={parsedRate.error}
            tooltip="Annual reducing-balance interest rate charged on the outstanding loan principal."
            slider={{ min: 5, max: 18, step: 0.1 }}
          />

          <div className="space-y-1.5">
            <InputField
              id="emi-tenure"
              label="Loan Term"
              value={tenureRaw}
              onChange={setTenureRaw}
              placeholder={tenureUnit === 'years' ? 'e.g. 20' : 'e.g. 240'}
              suffix={tenureUnit}
              error={parsedTenure.error}
              tooltip="Repayment duration. Up to 50 years (600 months) supported."
              slider={
                tenureUnit === 'years'
                  ? { min: 1, max: 30, step: 1 }
                  : { min: 12, max: 360, step: 6 }
              }
            />
            <div className="grid grid-cols-2 gap-1.5 rounded-lg border border-white/[0.08] bg-[#0B0B0E] p-1">
              {(['years', 'months'] as LoanTenureUnit[]).map((unit) => (
                <button
                  key={unit}
                  type="button"
                  onClick={() => setTenureUnit(unit)}
                  className={`min-h-[36px] rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors whitespace-nowrap ${
                    tenureUnit === unit
                      ? 'bg-[#D4AF37] text-[#09090B] font-semibold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {unit}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <InputField
              id="emi-fee"
              label="Processing Fee (Optional)"
              value={feeRaw}
              onChange={setFeeRaw}
              placeholder={feeMode === 'flat' ? 'e.g. 15000' : 'e.g. 0.5'}
              prefix={feeMode === 'flat' ? '₹' : undefined}
              suffix={feeMode === 'percent' ? '% of loan' : undefined}
              error={parsedFee.error}
              tooltip="Upfront loan origination / processing fee added to calculate total borrowing cost."
            />
            <div className="grid grid-cols-2 gap-1.5 rounded-lg border border-white/[0.08] bg-[#0B0B0E] p-1">
              <button
                type="button"
                onClick={() => setFeeMode('flat')}
                className={`min-h-[34px] rounded-md px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                  feeMode === 'flat'
                    ? 'bg-zinc-800 text-[#E5C158]'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Flat Fee (₹)
              </button>
              <button
                type="button"
                onClick={() => setFeeMode('percent')}
                className={`min-h-[34px] rounded-md px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                  feeMode === 'percent'
                    ? 'bg-zinc-800 text-[#E5C158]'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                % of Loan
              </button>
            </div>
          </div>

          <div className="pt-2">
            <ResultActions onReset={handleReset} summaryText={summaryText} />
          </div>
        </div>
      </div>

      {/* Right Results Panel */}
      <div className="space-y-5 lg:col-span-7">
        {!result ? (
          <EmptyState
            title="Enter Loan Amount, Rate & Term"
            description="Compute monthly EMI, total interest burden, total cost including upfront fees, Principal vs. Interest charts, and a month-by-month amortization schedule."
            presets={[
              {
                label: 'Home Loan · ₹60 Lakh (20 Yrs)',
                description: '₹75L home, ₹15L down payment @ 8.75% + ₹15,000 fee',
                onSelect: () => {
                  setShowEstimator(true);
                  setHomePriceRaw('7500000');
                  setDownPaymentRaw('1500000');
                  setLoanAmountRaw('6000000');
                  setRateRaw('8.75');
                  setTenureRaw('20');
                  setTenureUnit('years');
                  setFeeMode('flat');
                  setFeeRaw('15000');
                  setSelectedYearFilter(1);
                },
              },
              {
                label: 'Education / Office Loan · ₹12 Lakh',
                description: '₹12,00,000 @ 9.50% for 5 years (0.5% fee)',
                onSelect: () => {
                  setShowEstimator(false);
                  setHomePriceRaw('');
                  setDownPaymentRaw('');
                  setLoanAmountRaw('1200000');
                  setRateRaw('9.5');
                  setTenureRaw('5');
                  setTenureUnit('years');
                  setFeeMode('percent');
                  setFeeRaw('0.5');
                  setSelectedYearFilter(1);
                },
              },
            ]}
          />
        ) : (
          <>
            {/* Spotlight EMI Card + Supporting KPIs */}
            <div className="rounded-xl border border-[#D4AF37]/40 bg-[#131209] p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <span className="text-xs font-medium text-[#E5C158]">Monthly EMI</span>
                  <div className="font-mono-num mt-1 text-3xl font-bold tracking-tight text-white">
                    {formatINR(result.monthlyEmi)}
                  </div>
                  <p className="mt-1 text-xs text-zinc-400">
                    {result.totalMonths} monthly installments
                    {crossoverYear ? ` · Principal exceeds interest from Year ${crossoverYear}` : ''}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4 sm:text-right">
                  <div>
                    <span className="text-xs text-zinc-400">Total Interest</span>
                    <div className="font-mono-num mt-0.5 text-sm font-semibold text-white">
                      {formatINR(result.totalInterest, 0)}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-zinc-400">Total Repayment</span>
                    <div className="font-mono-num mt-0.5 text-sm font-semibold text-zinc-200">
                      {formatINR(result.totalRepayment, 0)}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-zinc-400">Total w/ Fee</span>
                    <div className="font-mono-num mt-0.5 text-sm font-semibold text-[#E5C158]">
                      {formatINR(result.totalCostIncludingFee, 0)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Principal vs Interest Chart */}
            <LoanBreakdownChart
              principal={result.loanAmount}
              totalInterest={result.totalInterest}
              principalPercent={result.principalPercent}
              interestPercent={result.interestPercent}
              yearlySummary={result.yearlySummary}
            />

            {/* Formula Block */}
            <div className="rounded-xl border border-white/[0.08] bg-[#111116] p-5">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.08] pb-3">
                <h3 className="font-display text-sm font-semibold text-white">
                  EMI Formula & Calculation Steps
                </h3>
                <code className="font-mono-num rounded bg-[#181820] px-2.5 py-1 text-xs text-[#E5C158]">
                  {result.formula}
                </code>
              </div>
              <ol className="space-y-1.5 text-xs text-zinc-300">
                {result.steps.map((s, i) => (
                  <li key={i} className="font-mono-num flex items-start gap-2">
                    <span className="text-[#D4AF37]">{i + 1}.</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Amortization Schedule */}
            <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#111116]">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] px-5 py-3.5">
                <div>
                  <h3 className="font-display text-sm font-semibold text-white">
                    Amortization Schedule
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Monthly principal & interest split ({result.totalMonths} installments)
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <label htmlFor="amort-year-filter" className="text-xs text-zinc-400">
                    View:
                  </label>
                  <select
                    id="amort-year-filter"
                    value={selectedYearFilter}
                    onChange={(e) =>
                      setSelectedYearFilter(
                        e.target.value === 'all' ? 'all' : Number(e.target.value)
                      )
                    }
                    className="rounded-lg border border-white/10 bg-[#0E0E13] px-2.5 py-1.5 text-xs text-white focus:border-[#D4AF37] focus:outline-none"
                  >
                    {result.yearlySummary.map((y) => (
                      <option key={y.year} value={y.year}>
                        Year {y.year} (Months {(y.year - 1) * 12 + 1}–
                        {Math.min(y.year * 12, result.totalMonths)})
                      </option>
                    ))}
                    <option value="all">All {result.totalMonths} Months</option>
                  </select>

                  <button
                    type="button"
                    onClick={handleDownloadScheduleCSV}
                    className="inline-flex min-h-[32px] items-center gap-1.5 rounded-lg border border-white/15 bg-[#16161D] px-3 py-1 text-xs font-medium text-zinc-200 transition-colors hover:border-[#D4AF37]/50 hover:text-[#E5C158] whitespace-nowrap"
                  >
                    <DownloadSimple size={14} weight="bold" aria-hidden="true" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              <div className="max-h-96 overflow-x-auto overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-[#16161D] text-zinc-400">
                    <tr className="border-b border-white/[0.08]">
                      <th className="px-3.5 py-2.5 font-medium">Month</th>
                      <th className="px-3.5 py-2.5 text-right font-medium">Opening Bal.</th>
                      <th className="px-3.5 py-2.5 text-right font-medium">EMI</th>
                      <th className="px-3.5 py-2.5 text-right font-medium">Principal Repaid</th>
                      <th className="px-3.5 py-2.5 text-right font-medium">Interest Paid</th>
                      <th className="px-3.5 py-2.5 text-right font-medium">Closing Bal.</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono-num divide-y divide-white/[0.05]">
                    {visibleSchedule.map((row) => (
                      <tr key={row.month} className="hover:bg-white/[0.02]">
                        <td className="px-3.5 py-2 text-zinc-200">{row.month}</td>
                        <td className="px-3.5 py-2 text-right text-zinc-300">
                          {formatINR(row.openingBalance)}
                        </td>
                        <td className="px-3.5 py-2 text-right text-white">
                          {formatINR(row.emi)}
                        </td>
                        <td className="px-3.5 py-2 text-right text-[#E5C158]">
                          {formatINR(row.principalPaid)}
                        </td>
                        <td className="px-3.5 py-2 text-right text-zinc-400">
                          {formatINR(row.interestPaid)}
                        </td>
                        <td className="px-3.5 py-2 text-right font-medium text-zinc-200">
                          {formatINR(row.closingBalance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
