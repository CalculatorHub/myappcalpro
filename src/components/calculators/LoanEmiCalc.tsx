import React, { useMemo, useRef, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { NumberInput } from '../ui/NumberInput';
import { AnimatedNumber } from '../ui/AnimatedNumber';
import { TiltCard3D } from '../ui/TiltCard3D';
import { FormulaAccordion } from '../ui/FormulaAccordion';
import { CalcActionBar } from '../ui/CalcActionBar';
import { ResultActionsBar, ResultEmptyState } from '../ui/ResultStateHeader';
import { calculateLoanEmi } from '../../logic/calculators';
import { formatINR } from '../../utils/formatters';
import { downloadCsvFile } from '../../utils/exportUtils';
import type { CalculationHistoryItem } from '../../utils/storage';

type TenureUnit = 'years' | 'months';
type ScheduleView = 'monthly' | 'yearly';

interface LoanEmiErrors {
  homePrice?: string;
  downPayment?: string;
  directLoan?: string;
  annualRate?: string;
  tenure?: string;
  fee?: string;
}

interface LoanEmiCalcProps {
  onSaveHistory?: (entry: Omit<CalculationHistoryItem, 'id' | 'timestamp'>) => void;
}

export const LoanEmiCalc: React.FC<LoanEmiCalcProps> = ({ onSaveHistory }) => {
  const [useHomeEstimator, setUseHomeEstimator] = useState<boolean>(true);
  const [homePriceStr, setHomePriceStr] = useState<string>('0');
  const [downPaymentStr, setDownPaymentStr] = useState<string>('0');
  const [directLoanStr, setDirectLoanStr] = useState<string>('0');
  const [rateStr, setRateStr] = useState<string>('0');
  const [tenureUnit, setTenureUnit] = useState<TenureUnit>('years');
  const [tenureStr, setTenureStr] = useState<string>('0');
  const [feeStr, setFeeStr] = useState<string>('0');

  const [scheduleExpanded, setScheduleExpanded] = useState<boolean>(true);
  const [scheduleView, setScheduleView] = useState<ScheduleView>('yearly');
  const [visibleMonths, setVisibleMonths] = useState<number>(24);
  const [touched, setTouched] = useState<Partial<Record<keyof LoanEmiErrors, boolean>>>({});
  const [submitted, setSubmitted] = useState<boolean>(false);
  const resultsRef = useRef<HTMLDivElement | null>(null);

  const homePriceNum = homePriceStr.trim() === '' ? NaN : Number(homePriceStr);
  const downPaymentNum = downPaymentStr.trim() === '' ? 0 : Number(downPaymentStr);
  const directLoanNum = directLoanStr.trim() === '' ? NaN : Number(directLoanStr);
  const rateNum = rateStr.trim() === '' ? NaN : Number(rateStr);
  const tenureNum = tenureStr.trim() === '' ? NaN : Number(tenureStr);
  const feeNum = feeStr.trim() === '' ? 0 : Number(feeStr);

  const errors = useMemo<LoanEmiErrors>(() => {
    const next: LoanEmiErrors = {};
    if (useHomeEstimator) {
      if (homePriceStr.trim() === '' || !Number.isFinite(homePriceNum) || homePriceNum <= 0) {
        next.homePrice = 'Enter a home price greater than ₹0.';
      }
      if (!Number.isFinite(downPaymentNum) || downPaymentNum < 0) {
        next.downPayment = 'Down payment cannot be negative.';
      } else if (
        Number.isFinite(homePriceNum) &&
        ((homePriceNum > 0 && downPaymentNum >= homePriceNum) ||
          (homePriceNum <= 0 && downPaymentNum > 0))
      ) {
        next.downPayment = 'Down payment must be less than the property price.';
      }
    } else {
      if (directLoanStr.trim() === '' || !Number.isFinite(directLoanNum) || directLoanNum <= 0) {
        next.directLoan = 'Enter a loan amount greater than ₹0.';
      }
    }

    if (rateStr.trim() === '' || !Number.isFinite(rateNum) || rateNum < 0 || rateNum > 45) {
      next.annualRate = 'Enter an annual rate between 0% and 45%.';
    }

    const totalMonths =
      tenureUnit === 'years' ? Math.round(tenureNum * 12) : Math.round(tenureNum);
    if (
      tenureStr.trim() === '' ||
      !Number.isFinite(tenureNum) ||
      totalMonths < 1 ||
      totalMonths > 480
    ) {
      next.tenure =
        tenureUnit === 'years'
          ? 'Enter a loan tenure between 1 and 40 years.'
          : 'Enter a loan tenure between 1 and 480 months.';
    }

    if (!Number.isFinite(feeNum) || feeNum < 0) {
      next.fee = 'Processing fee cannot be negative.';
    }

    return next;
  }, [
    useHomeEstimator,
    homePriceStr,
    homePriceNum,
    downPaymentNum,
    directLoanStr,
    directLoanNum,
    rateStr,
    rateNum,
    tenureStr,
    tenureNum,
    tenureUnit,
    feeNum,
  ]);

  const isEmpty =
    (useHomeEstimator ? homePriceStr.trim() === '' : directLoanStr.trim() === '') &&
    rateStr.trim() === '' &&
    tenureStr.trim() === '';
  const isValid = Object.keys(errors).length === 0;

  const effectiveLoanAmount = useHomeEstimator
    ? Math.max(
        0,
        (Number.isFinite(homePriceNum) ? homePriceNum : 0) -
          (Number.isFinite(downPaymentNum) ? downPaymentNum : 0)
      )
    : Math.max(0, Number.isFinite(directLoanNum) ? directLoanNum : 0);

  const tenureMonths = useMemo(() => {
    if (!Number.isFinite(tenureNum)) return 0;
    return tenureUnit === 'years' ? Math.round(tenureNum * 12) : Math.round(tenureNum);
  }, [tenureNum, tenureUnit]);

  const result = useMemo(() => {
    if (!isValid) return null;
    return calculateLoanEmi(effectiveLoanAmount, rateNum, tenureMonths, feeNum);
  }, [isValid, effectiveLoanAmount, rateNum, tenureMonths, feeNum]);

  const handleToggleTenureUnit = (nextUnit: TenureUnit) => {
    if (nextUnit === tenureUnit) return;
    if (Number.isFinite(tenureNum) && tenureNum > 0) {
      const converted =
        nextUnit === 'months' ? Math.round(tenureNum * 12) : Number((tenureNum / 12).toFixed(1));
      setTenureStr(String(converted));
    }
    setTenureUnit(nextUnit);
  };

  const handleLoadExample = (
    homeMode: boolean,
    hp: string,
    dp: string,
    rate: string,
    yrs: string,
    fee: string
  ) => {
    setUseHomeEstimator(homeMode);
    if (homeMode) {
      setHomePriceStr(hp);
      setDownPaymentStr(dp);
    } else {
      setDirectLoanStr(hp);
    }
    setRateStr(rate);
    setTenureUnit('years');
    setTenureStr(yrs);
    setFeeStr(fee);
    setTouched({});
    setSubmitted(false);
  };

  const handleCalculate = () => {
    setSubmitted(true);
    if (result && onSaveHistory) {
      onSaveHistory({
        calculatorId: 'loan-emi',
        calculatorTitle: 'Home Loan EMI',
        primaryMetricLabel: 'Monthly EMI',
        primaryMetricValue: formatINR(result.monthlyEmi),
        summaryLine: `${formatINR(result.loanAmount)} @ ${result.annualRate}% for ${result.tenureMonths} mo · Interest ${formatINR(result.totalInterest)}`,
        details: [
          `Loan Principal: ${formatINR(result.loanAmount)}`,
          `Interest Rate: ${result.annualRate}% p.a.`,
          `Tenure: ${result.tenureMonths} months`,
          `Monthly EMI: ${formatINR(result.monthlyEmi)}`,
          `Total Interest: ${formatINR(result.totalInterest)}`,
          `Processing Fee: ${formatINR(result.processingFee)} · Total Cost: ${formatINR(result.totalCostWithFee)}`,
        ],
      });
    }
    if (isValid && resultsRef.current && window.innerWidth < 1024) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleReset = () => {
    setHomePriceStr('0');
    setDownPaymentStr('0');
    setDirectLoanStr('0');
    setRateStr('0');
    setTenureStr('0');
    setFeeStr('0');
    setTouched({});
    setSubmitted(false);
  };

  const handleExportCsv = () => {
    if (!result) return;
    if (scheduleView === 'yearly') {
      downloadCsvFile(
        'calhub-loan-emi-yearly.csv',
        ['Year', 'Opening Balance (INR)', 'Total EMI Paid (INR)', 'Principal Paid (INR)', 'Interest Paid (INR)', 'Closing Balance (INR)'],
        result.yearlySchedule.map((r) => [
          r.year,
          r.openingBalance.toFixed(2),
          r.totalEmiPaid.toFixed(2),
          r.principalPaid.toFixed(2),
          r.interestPaid.toFixed(2),
          r.closingBalance.toFixed(2),
        ])
      );
      return;
    }

    downloadCsvFile(
      'calhub-loan-emi-monthly.csv',
      ['Month', 'Opening Balance (INR)', 'EMI (INR)', 'Principal Paid (INR)', 'Interest Paid (INR)', 'Closing Balance (INR)'],
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

  const copySummary = result
    ? [
        'Home Loan EMI Summary — CalHub FinCalc Pro',
        useHomeEstimator
          ? `Home Price: ${formatINR(homePriceNum)} | Down Payment: ${formatINR(downPaymentNum)}`
          : null,
        `Loan Principal: ${formatINR(result.loanAmount)}`,
        `Interest Rate: ${result.annualRate}% p.a.`,
        `Tenure: ${result.tenureMonths} months`,
        `Monthly EMI: ${formatINR(result.monthlyEmi)}`,
        `Total Interest: ${formatINR(result.totalInterest)}`,
        `Total Repayment: ${formatINR(result.totalRepayment)}`,
        `Total Cost incl. Fee: ${formatINR(result.totalCostWithFee)}`,
      ]
        .filter(Boolean)
        .join('\n')
    : '';

  const formulaSteps = result
    ? [
        useHomeEstimator
          ? `Loan Principal P = Home Price (${formatINR(homePriceNum)}) − Down Payment (${formatINR(downPaymentNum)}) = ${formatINR(result.loanAmount)}.`
          : `Loan Principal P = ${formatINR(result.loanAmount)}.`,
        `Monthly interest rate i = ${result.annualRate}% ÷ (12 × 100) = ${(result.annualRate / 1200).toFixed(6)}.`,
        `Total monthly installments N = ${result.tenureMonths} months.`,
        `Substitute into EMI = [P × i × (1 + i)^N] ÷ [(1 + i)^N − 1] = ${formatINR(result.monthlyEmi)} / month.`,
        `Total Interest = (${formatINR(result.monthlyEmi)} × ${result.tenureMonths}) − ${formatINR(result.loanAmount)} ≈ ${formatINR(result.totalInterest)}.`,
      ]
    : [];

  const showFieldError = (key: keyof LoanEmiErrors, alwaysShow = false) =>
    submitted || alwaysShow || touched[key] ? errors[key] : undefined;

  const hasVisibleErrors =
    !isEmpty &&
    !isValid &&
    (submitted ||
      Boolean(
        touched.homePrice ||
          touched.downPayment ||
          touched.directLoan ||
          touched.annualRate ||
          touched.tenure ||
          touched.fee
      ));

  const displayedMonths = result ? result.schedule.slice(0, visibleMonths) : [];

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const principalStroke = result ? (result.principalSharePercent / 100) * circumference : 0;
  const interestStroke = result ? circumference - principalStroke : 0;

  return (
    <div className="grid gap-6 lg:grid-cols-12 items-start">
      <div className="luxury-card p-6 space-y-5 lg:col-span-5">
        <div>
          <h3 className="text-lg font-semibold text-white">Home Loan &amp; EMI Inputs</h3>
          <p className="mt-1 text-sm text-[#A1A1AA]">
            Calculate monthly EMI from property price &amp; down payment or direct loan amount.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b border-[#D4AF37]/15 pb-4">
          <span className="text-xs font-medium text-[#A1A1AA]">Examples:</span>
          <button
            type="button"
            onClick={() => handleLoadExample(true, '6500000', '1500000', '8.75', '20', '25000')}
            className="rounded-xl border border-[#D4AF37]/25 bg-white/[0.03] px-2.5 py-1 text-xs font-medium text-[#E4E4E7] transition-colors hover:border-[#F5D76E] hover:text-[#F5D76E] cursor-pointer"
          >
            ₹65L Home · 20 yrs
          </button>
          <button
            type="button"
            onClick={() => handleLoadExample(true, '10000000', '2000000', '8.5', '15', '35000')}
            className="rounded-xl border border-[#D4AF37]/25 bg-white/[0.03] px-2.5 py-1 text-xs font-medium text-[#E4E4E7] transition-colors hover:border-[#F5D76E] hover:text-[#F5D76E] cursor-pointer"
          >
            ₹1Cr Home · 15 yrs
          </button>
        </div>

        <div
          role="group"
          aria-label="Loan input mode"
          className="flex rounded-xl border border-[#D4AF37]/20 bg-[#0B0B0D] p-1"
        >
          <button
            type="button"
            onClick={() => setUseHomeEstimator(true)}
            className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors cursor-pointer ${
              useHomeEstimator
                ? 'bg-[#D4AF37] text-[#050505] font-semibold'
                : 'text-[#A1A1AA] hover:text-white'
            }`}
          >
            Home Price &amp; Down Payment
          </button>
          <button
            type="button"
            onClick={() => setUseHomeEstimator(false)}
            className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors cursor-pointer ${
              !useHomeEstimator
                ? 'bg-[#D4AF37] text-[#050505] font-semibold'
                : 'text-[#A1A1AA] hover:text-white'
            }`}
          >
            Direct Loan Amount
          </button>
        </div>

        {useHomeEstimator ? (
          <div className="space-y-4">
            <NumberInput
              id="emi-home-price"
              label="Property / Home Price"
              prefix="₹"
              min={0}
              placeholder="0"
              value={homePriceStr}
              onChange={(val) => {
                setHomePriceStr(val);
                setTouched((prev) => ({ ...prev, homePrice: true }));
              }}
              error={showFieldError('homePrice')}
            />
            <NumberInput
              id="emi-down-payment"
              label="Down Payment"
              prefix="₹"
              min={0}
              placeholder="0"
              value={downPaymentStr}
              onChange={(val) => {
                setDownPaymentStr(val);
                setTouched((prev) => ({ ...prev, downPayment: true }));
              }}
              error={showFieldError('downPayment', Boolean(errors.downPayment && downPaymentNum > 0))}
              helperText={
                !errors.homePrice && !errors.downPayment
                  ? `Derived Loan Principal: ${formatINR(effectiveLoanAmount)}`
                  : undefined
              }
            />
          </div>
        ) : (
          <NumberInput
            id="emi-loan-amount"
            label="Loan Principal Amount"
            prefix="₹"
            min={0}
            placeholder="0"
            value={directLoanStr}
            onChange={(val) => {
              setDirectLoanStr(val);
              setTouched((prev) => ({ ...prev, directLoan: true }));
            }}
            error={showFieldError('directLoan')}
          />
        )}

        <NumberInput
          id="emi-rate"
          label="Annual Interest Rate"
          suffix="% p.a."
          min={0}
          max={45}
          step={0.05}
          placeholder="0"
          value={rateStr}
          onChange={(val) => {
            setRateStr(val);
            setTouched((prev) => ({ ...prev, annualRate: true }));
          }}
          error={showFieldError('annualRate')}
        />

        <div className="space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-white">Tenure Unit</span>
            <div
              role="group"
              aria-label="Loan tenure unit"
              className="flex rounded-xl border border-[#D4AF37]/20 bg-[#0B0B0D] p-0.5"
            >
              {(['years', 'months'] as TenureUnit[]).map((unit) => (
                <button
                  key={unit}
                  type="button"
                  onClick={() => handleToggleTenureUnit(unit)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium capitalize transition-colors cursor-pointer ${
                    tenureUnit === unit
                      ? 'bg-[#D4AF37] text-[#050505] font-semibold'
                      : 'text-[#A1A1AA] hover:text-white'
                  }`}
                >
                  {unit}
                </button>
              ))}
            </div>
          </div>

          <NumberInput
            id="emi-tenure"
            label={`Loan Tenure (${tenureUnit})`}
            suffix={tenureUnit}
            min={0}
            max={tenureUnit === 'years' ? 40 : 480}
            step={1}
            placeholder="0"
            value={tenureStr}
            onChange={(val) => {
              setTenureStr(val);
              setTouched((prev) => ({ ...prev, tenure: true }));
            }}
            error={showFieldError('tenure')}
            helperText={tenureMonths > 0 ? `${tenureMonths} monthly installments` : undefined}
          />

          {tenureUnit === 'years' && (
            <input
              type="range"
              aria-label="Loan Tenure Years Slider"
              min={0}
              max={30}
              step={1}
              value={Math.min(30, Math.max(0, Number.isFinite(tenureNum) ? tenureNum : 0))}
              onChange={(e) => {
                setTenureStr(e.target.value);
                setTouched((prev) => ({ ...prev, tenure: true }));
              }}
              className="gold-slider w-full"
            />
          )}
        </div>

        <NumberInput
          id="emi-fee"
          label="Processing Fee (Optional)"
          prefix="₹"
          min={0}
          placeholder="0"
          value={feeStr}
          onChange={(val) => {
            setFeeStr(val);
            setTouched((prev) => ({ ...prev, fee: true }));
          }}
          error={showFieldError('fee')}
          tooltip="Upfront bank processing or legal charge added to total borrowing cost."
        />

        <CalcActionBar onCalculate={handleCalculate} onReset={handleReset} />
      </div>

      <div ref={resultsRef} className="space-y-5 lg:col-span-7">
        {!result ? (
          <ResultEmptyState
            hasErrors={hasVisibleErrors}
            onLoadExample={() =>
              handleLoadExample(true, '6500000', '1500000', '8.75', '20', '25000')
            }
          />
        ) : (
          <>
            <TiltCard3D className="luxury-card-accent p-6 space-y-5" maxTiltDeg={2.5}>
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#D4AF37]/20 pb-4">
                <div>
                  <p className="text-xs font-semibold text-[#F5D76E]">Estimated Monthly EMI</p>
                  <p className="mt-1 font-mono text-3xl font-bold text-white tabular-nums sm:text-4xl">
                    <AnimatedNumber value={result.monthlyEmi} format={(n) => formatINR(n)} />
                  </p>
                </div>
                <ResultActionsBar
                  shareTitle="Home Loan EMI Result — CalHub FinCalc Pro"
                  summaryText={copySummary}
                  onExportCsv={handleExportCsv}
                  csvLabel={`CSV (${scheduleView})`}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="luxury-subcard p-3.5">
                  <p className="text-xs text-[#A1A1AA]">Loan Principal</p>
                  <p className="mt-1 font-mono text-base font-semibold text-white tabular-nums">
                    {formatINR(result.loanAmount)}
                  </p>
                </div>
                <div className="luxury-subcard p-3.5">
                  <p className="text-xs font-medium text-[#F5D76E]">Total Interest</p>
                  <p className="mt-1 font-mono text-base font-semibold text-white tabular-nums">
                    {formatINR(result.totalInterest)}
                  </p>
                </div>
                <div className="luxury-subcard p-3.5">
                  <p className="text-xs text-[#A1A1AA]">Total Repayment</p>
                  <p className="mt-1 font-mono text-base font-semibold text-white tabular-nums">
                    {formatINR(result.totalRepayment)}
                  </p>
                </div>
                <div className="luxury-subcard p-3.5">
                  <p className="text-xs text-[#A1A1AA]">Cost incl. Fee</p>
                  <p className="mt-1 font-mono text-base font-semibold text-[#F5D76E] tabular-nums">
                    {formatINR(result.totalCostWithFee)}
                  </p>
                </div>
              </div>
            </TiltCard3D>

            {/* Principal vs Interest Visual Breakdown */}
            <div className="luxury-card p-5 sm:p-6">
              <h4 className="text-sm font-semibold text-white">
                Principal vs Interest Breakdown
              </h4>
              <div className="mt-4 flex flex-col items-center gap-6 sm:flex-row">
                <div className="relative flex h-36 w-36 shrink-0 items-center justify-center">
                  <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90" aria-hidden="true">
                    <circle
                      cx="70"
                      cy="70"
                      r={radius}
                      fill="none"
                      stroke="#1F1F23"
                      strokeWidth="16"
                    />
                    <circle
                      cx="70"
                      cy="70"
                      r={radius}
                      fill="none"
                      stroke="#71717A"
                      strokeWidth="16"
                      strokeDasharray={`${principalStroke} ${circumference}`}
                    />
                    <circle
                      cx="70"
                      cy="70"
                      r={radius}
                      fill="none"
                      stroke="#D4AF37"
                      strokeWidth="16"
                      strokeDasharray={`${interestStroke} ${circumference}`}
                      strokeDashoffset={-principalStroke}
                    />
                  </svg>
                  <div className="absolute text-center">
                    <span className="block font-mono text-[11px] text-[#A1A1AA]">Principal</span>
                    <span className="font-mono text-sm font-semibold text-white tabular-nums">
                      {result.principalSharePercent.toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="flex-1 space-y-3 w-full">
                  <div className="flex items-center justify-between border-b border-[#D4AF37]/14 pb-2 text-sm">
                    <span className="inline-flex items-center gap-2 text-[#E4E4E7]">
                      <span className="h-2.5 w-2.5 rounded-sm bg-zinc-500" />
                      Loan Principal
                    </span>
                    <span className="font-mono font-medium text-white tabular-nums">
                      {formatINR(result.loanAmount)} ({result.principalSharePercent.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-[#D4AF37]/14 pb-2 text-sm">
                    <span className="inline-flex items-center gap-2 text-[#E4E4E7]">
                      <span className="h-2.5 w-2.5 rounded-sm bg-[#D4AF37]" />
                      Total Interest Outflow
                    </span>
                    <span className="font-mono font-medium text-[#F5D76E] tabular-nums">
                      {formatINR(result.totalInterest)} ({result.interestSharePercent.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#E4E4E7]">Processing Fee</span>
                    <span className="font-mono font-medium text-white tabular-nums">
                      {formatINR(result.processingFee)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Expandable Amortization Schedule with Yearly / Monthly Toggle */}
            <div className="luxury-card overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#D4AF37]/15 px-5 py-4">
                <button
                  type="button"
                  aria-expanded={scheduleExpanded}
                  onClick={() => setScheduleExpanded((prev) => !prev)}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-[#F5D76E] cursor-pointer"
                >
                  <span>Amortization Schedule ({result.schedule.length} months)</span>
                  {scheduleExpanded ? (
                    <ChevronUp className="h-4 w-4 text-[#F5D76E]" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-[#A1A1AA]" aria-hidden="true" />
                  )}
                </button>

                {scheduleExpanded && (
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex rounded-lg border border-[#D4AF37]/20 bg-[#0B0B0D] p-0.5">
                      {(['yearly', 'monthly'] as ScheduleView[]).map((view) => (
                        <button
                          key={view}
                          type="button"
                          onClick={() => setScheduleView(view)}
                          className={`rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors cursor-pointer ${
                            scheduleView === view
                              ? 'bg-[#D4AF37] text-[#050505] font-semibold'
                              : 'text-[#A1A1AA] hover:text-white'
                          }`}
                        >
                          {view}
                        </button>
                      ))}
                    </div>

                    {scheduleView === 'monthly' && result.schedule.length > 24 && (
                      <button
                        type="button"
                        onClick={() =>
                          setVisibleMonths((prev) =>
                            prev < result.schedule.length ? result.schedule.length : 24
                          )
                        }
                        className="rounded-lg border border-[#D4AF37]/30 bg-[#111111] px-2.5 py-1 text-xs font-medium text-[#F5D76E] cursor-pointer"
                      >
                        {visibleMonths < result.schedule.length
                          ? `Show all ${result.schedule.length}`
                          : 'First 24'}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {scheduleExpanded && (
                <div className="max-h-80 overflow-x-auto overflow-y-auto">
                  {scheduleView === 'yearly' ? (
                    <table className="w-full text-left text-xs">
                      <thead className="sticky top-0 bg-[#141416] text-[#A1A1AA]">
                        <tr>
                          <th className="px-3 py-3 font-medium">Year</th>
                          <th className="px-3 py-3 font-medium text-right">Opening</th>
                          <th className="px-3 py-3 font-medium text-right">Principal</th>
                          <th className="px-3 py-3 font-medium text-right">Interest</th>
                          <th className="px-3 py-3 font-medium text-right">Closing</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#D4AF37]/12 font-mono tabular-nums">
                        {result.yearlySchedule.map((row) => (
                          <tr key={row.year} className="hover:bg-white/[0.025]">
                            <td className="px-3 py-2.5 text-[#A1A1AA]">Yr {row.year}</td>
                            <td className="px-3 py-2.5 text-right text-[#A1A1AA]">
                              {formatINR(row.openingBalance)}
                            </td>
                            <td className="px-3 py-2.5 text-right text-[#E4E4E7]">
                              {formatINR(row.principalPaid)}
                            </td>
                            <td className="px-3 py-2.5 text-right text-[#F5D76E]">
                              {formatINR(row.interestPaid)}
                            </td>
                            <td className="px-3 py-2.5 text-right font-semibold text-white">
                              {formatINR(row.closingBalance)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <table className="w-full text-left text-xs">
                      <thead className="sticky top-0 bg-[#141416] text-[#A1A1AA]">
                        <tr>
                          <th className="px-3 py-3 font-medium">Month</th>
                          <th className="px-3 py-3 font-medium text-right">Opening</th>
                          <th className="px-3 py-3 font-medium text-right">EMI</th>
                          <th className="px-3 py-3 font-medium text-right">Principal</th>
                          <th className="px-3 py-3 font-medium text-right">Interest</th>
                          <th className="px-3 py-3 font-medium text-right">Closing</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#D4AF37]/12 font-mono tabular-nums">
                        {displayedMonths.map((row) => (
                          <tr key={row.month} className="hover:bg-white/[0.025]">
                            <td className="px-3 py-2.5 text-[#A1A1AA]">M{row.month}</td>
                            <td className="px-3 py-2.5 text-right text-[#A1A1AA]">
                              {formatINR(row.openingBalance)}
                            </td>
                            <td className="px-3 py-2.5 text-right text-[#E4E4E7]">
                              {formatINR(row.emi)}
                            </td>
                            <td className="px-3 py-2.5 text-right text-[#E4E4E7]">
                              {formatINR(row.principalPaid)}
                            </td>
                            <td className="px-3 py-2.5 text-right text-[#F5D76E]">
                              {formatINR(row.interestPaid)}
                            </td>
                            <td className="px-3 py-2.5 text-right font-semibold text-white">
                              {formatINR(row.closingBalance)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>

            <FormulaAccordion
              formula="EMI = [P × i × (1 + i)^N] ÷ [(1 + i)^N − 1]"
              steps={formulaSteps}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default LoanEmiCalc;
