import React, { useMemo, useRef, useState } from 'react';
import { NumberInput } from '../ui/NumberInput';
import { AnimatedNumber } from '../ui/AnimatedNumber';
import { TiltCard3D } from '../ui/TiltCard3D';
import { GrowthChart, type GrowthChartDatum } from '../ui/GrowthChart';
import { MonthlyScheduleTable } from '../ui/MonthlyScheduleTable';
import { FormulaAccordion } from '../ui/FormulaAccordion';
import { CalcActionBar } from '../ui/CalcActionBar';
import { ResultActionsBar, ResultEmptyState } from '../ui/ResultStateHeader';
import {
  COMPOUNDING_PERIODS,
  calculateCompoundInterest,
  type CompoundingFrequency,
} from '../../logic/calculators';
import { formatINR } from '../../utils/formatters';
import { downloadCsvFile } from '../../utils/exportUtils';
import type { CalculationHistoryItem } from '../../utils/storage';

interface CompoundErrors {
  principal?: string;
  rate?: string;
  years?: string;
}

interface CompoundInterestCalcProps {
  onSaveHistory?: (entry: Omit<CalculationHistoryItem, 'id' | 'timestamp'>) => void;
}

export const CompoundInterestCalc: React.FC<CompoundInterestCalcProps> = ({ onSaveHistory }) => {
  const [principalStr, setPrincipalStr] = useState<string>('0');
  const [rateStr, setRateStr] = useState<string>('0');
  const [yearsStr, setYearsStr] = useState<string>('0');
  const [frequency, setFrequency] = useState<CompoundingFrequency>('quarterly');
  const [touched, setTouched] = useState<Partial<Record<keyof CompoundErrors, boolean>>>({});
  const [submitted, setSubmitted] = useState<boolean>(false);
  const resultsRef = useRef<HTMLDivElement | null>(null);

  const principalNum = principalStr.trim() === '' ? NaN : Number(principalStr);
  const rateNum = rateStr.trim() === '' ? NaN : Number(rateStr);
  const yearsNum = yearsStr.trim() === '' ? NaN : Number(yearsStr);
  const monthlyRupeePerHundred =
    rateStr.trim() !== '' && Number.isFinite(rateNum) && rateNum >= 0 ? rateNum / 12 : 0;

  const errors = useMemo<CompoundErrors>(() => {
    const next: CompoundErrors = {};
    if (principalStr.trim() === '' || !Number.isFinite(principalNum) || principalNum < 0) {
      next.principal = 'Enter a principal amount of ₹0 or greater.';
    }
    if (rateStr.trim() === '' || !Number.isFinite(rateNum) || rateNum < 0 || rateNum > 100) {
      next.rate = 'Enter an annual rate between 0% and 100%.';
    }
    if (yearsStr.trim() === '' || !Number.isFinite(yearsNum) || yearsNum <= 0 || yearsNum > 50) {
      next.years = 'Enter a tenure between 0.1 and 50 years.';
    }
    return next;
  }, [principalStr, principalNum, rateStr, rateNum, yearsStr, yearsNum]);

  const isEmpty =
    principalStr.trim() === '' && rateStr.trim() === '' && yearsStr.trim() === '';
  const isDefaultAllZero =
    !submitted &&
    principalStr.trim() === '0' &&
    rateStr.trim() === '0' &&
    yearsStr.trim() === '0';
  const isValid = Object.keys(errors).length === 0;

  const result = useMemo(() => {
    if (!isValid || isDefaultAllZero) return null;
    return calculateCompoundInterest(principalNum, rateNum, yearsNum, frequency);
  }, [isValid, isDefaultAllZero, principalNum, rateNum, yearsNum, frequency]);

  const chartData = useMemo<GrowthChartDatum[]>(() => {
    if (!result) return [];
    return result.monthlySchedule.map((row) => ({
      label: row.label,
      period: row.month,
      principal: result.principal,
      monthlyInterest: row.monthlyInterest,
      interestEarned: row.accumulatedInterest,
      totalAmount: row.closingBalance,
    }));
  }, [result]);

  const handleLoadExample = (
    p: string,
    r: string,
    y: string,
    freq: CompoundingFrequency
  ) => {
    setPrincipalStr(p);
    setRateStr(r);
    setYearsStr(y);
    setFrequency(freq);
    setTouched({});
    setSubmitted(false);
  };

  const handleCalculate = () => {
    setSubmitted(true);
    if (isValid) {
      const computed = calculateCompoundInterest(principalNum, rateNum, yearsNum, frequency);
      if (onSaveHistory) {
        onSaveHistory({
          calculatorId: 'compound-interest',
          calculatorTitle: 'Compound Interest',
          primaryMetricLabel: 'Maturity Value',
          primaryMetricValue: formatINR(computed.totalAmount, 2),
          summaryLine: `${formatINR(computed.principal)} @ ${computed.rate}% (${computed.frequency}) for ${computed.years} yrs · EAR ${computed.effectiveAnnualRate.toFixed(2)}%`,
          details: [
            `Principal: ${formatINR(computed.principal)}`,
            `Interest Rate: ${computed.rate}% p.a. (${COMPOUNDING_PERIODS[computed.frequency].label})`,
            `Tenure: ${computed.years} years`,
            `Compound Interest: ${formatINR(computed.compoundInterest, 2)}`,
            `Maturity Value: ${formatINR(computed.totalAmount, 2)} (EAR ${computed.effectiveAnnualRate.toFixed(2)}%)`,
          ],
        });
      }
    }
    if (isValid && resultsRef.current && window.innerWidth < 1024) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleReset = () => {
    setPrincipalStr('0');
    setRateStr('0');
    setYearsStr('0');
    setTouched({});
    setSubmitted(false);
  };

  const handleExportCsv = () => {
    if (!result) return;
    downloadCsvFile(
      'calhub-compound-interest-monthly.csv',
      [
        'Month',
        'Opening Balance (INR)',
        'Monthly Interest (INR)',
        'Accumulated Interest (INR)',
        'Closing Balance (INR)',
      ],
      result.monthlySchedule.map((row) => [
        row.label,
        row.openingBalance.toFixed(2),
        row.monthlyInterest.toFixed(2),
        row.accumulatedInterest.toFixed(2),
        row.closingBalance.toFixed(2),
      ])
    );
  };

  const copySummary = result
    ? [
        'Compound Interest Summary — CalHub FinCalc Pro',
        `Principal: ${formatINR(result.principal)}`,
        `Annual Rate: ${result.rate}% p.a. (${COMPOUNDING_PERIODS[result.frequency].label})`,
        `Tenure: ${result.years} years`,
        `Compound Interest: ${formatINR(result.compoundInterest, 2)}`,
        `Compounding Gain vs Simple Interest: +${formatINR(result.compoundingAdvantage, 2)}`,
        `Maturity Value: ${formatINR(result.totalAmount, 2)}`,
        `Effective Annual Rate (EAR): ${result.effectiveAnnualRate.toFixed(2)}%`,
      ].join('\n')
    : '';

  const formulaSteps = result
    ? [
        `Convert nominal rate to decimal: r = ${result.rate}% / 100 = ${(result.rate / 100).toFixed(4)}.`,
        `Compounding frequency (${COMPOUNDING_PERIODS[result.frequency].label}): n = ${result.compoundingPeriodsPerYear} periods/year.`,
        `Total compounding intervals: n × t = ${result.compoundingPeriodsPerYear} × ${result.years} = ${(result.compoundingPeriodsPerYear * result.years).toFixed(2)}.`,
        `Substitute A = ${formatINR(result.principal)} × (1 + ${(result.rate / 100).toFixed(4)} / ${result.compoundingPeriodsPerYear})^${(result.compoundingPeriodsPerYear * result.years).toFixed(2)} = ${formatINR(result.totalAmount, 2)}.`,
        `Compound Interest CI = ${formatINR(result.totalAmount, 2)} − ${formatINR(result.principal)} = ${formatINR(result.compoundInterest, 2)} (+${formatINR(result.compoundingAdvantage, 2)} extra over Simple Interest).`,
      ]
    : [];

  const showFieldError = (key: keyof CompoundErrors) =>
    submitted || touched[key] ? errors[key] : undefined;

  const hasVisibleErrors =
    !isEmpty &&
    !isValid &&
    (submitted || Boolean(touched.principal || touched.rate || touched.years));

  return (
    <div className="grid gap-6 lg:grid-cols-12 items-start">
      <div className="aurora-card p-6 space-y-5 lg:col-span-5">
        <div>
          <h3 className="text-lg font-semibold text-[#F8FAFC]">Compound Interest Inputs</h3>
          <p className="mt-1 text-sm text-[#94A3B8]">
            Compare annual, half-yearly, quarterly, monthly, and daily compounding.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b border-[#6366F1]/18 pb-4">
          <span className="text-xs font-medium text-[#94A3B8]">Examples:</span>
          <button
            type="button"
            onClick={() => handleLoadExample('200000', '10', '5', 'quarterly')}
            className="rounded-xl border border-[#6366F1]/28 bg-[#0F172A]/60 px-2.5 py-1 text-xs font-medium text-[#E2E8F0] transition-colors hover:border-[#06B6D4] hover:text-[#38BDF8] cursor-pointer"
          >
            ₹2L @ 10% · 5 yrs
          </button>
          <button
            type="button"
            onClick={() => handleLoadExample('500000', '12', '10', 'monthly')}
            className="rounded-xl border border-[#6366F1]/28 bg-[#0F172A]/60 px-2.5 py-1 text-xs font-medium text-[#E2E8F0] transition-colors hover:border-[#06B6D4] hover:text-[#38BDF8] cursor-pointer"
          >
            ₹5L @ 12% · 10 yrs
          </button>
        </div>

        <NumberInput
          id="ci-principal"
          label="Principal Amount"
          prefix="₹"
          min={0}
          placeholder="0"
          value={principalStr}
          onChange={(val) => {
            setPrincipalStr(val);
            setTouched((prev) => ({ ...prev, principal: true }));
          }}
          error={showFieldError('principal')}
          tooltip="Initial invested lump sum before compounding."
        />

        <NumberInput
          id="ci-rate"
          label="Annual Interest Rate (%)"
          suffix={
            <span
              title="Monthly interest per ₹100 principal (Annual Rate ÷ 12)"
              className="font-mono text-xs font-semibold text-[#38BDF8] tabular-nums"
            >
              ₹{monthlyRupeePerHundred.toFixed(2)}/month
            </span>
          }
          min={0}
          max={100}
          step={0.1}
          placeholder="0"
          value={rateStr}
          onChange={(val) => {
            setRateStr(val);
            setTouched((prev) => ({ ...prev, rate: true }));
          }}
          error={showFieldError('rate')}
          tooltip="Yearly nominal percentage rate. Monthly equivalent per ₹100 = Annual Rate ÷ 12."
        />

        <NumberInput
          id="ci-years"
          label="Investment Tenure"
          suffix="years"
          min={0}
          max={50}
          step="any"
          placeholder="0"
          value={yearsStr}
          onChange={(val) => {
            setYearsStr(val);
            setTouched((prev) => ({ ...prev, years: true }));
          }}
          error={showFieldError('years')}
        />

        <div className="space-y-1.5">
          <label htmlFor="ci-frequency" className="block text-sm font-medium text-[#F8FAFC]">
            Compounding Frequency
          </label>
          <select
            id="ci-frequency"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as CompoundingFrequency)}
            className="aurora-input w-full px-3.5 py-2.5 text-sm font-medium text-[#F8FAFC] focus:outline-none cursor-pointer"
          >
            {(Object.keys(COMPOUNDING_PERIODS) as CompoundingFrequency[]).map((key) => (
              <option key={key} value={key} className="bg-[#0B1020] text-[#F8FAFC]">
                {COMPOUNDING_PERIODS[key].label}
              </option>
            ))}
          </select>
        </div>

        <CalcActionBar onCalculate={handleCalculate} onReset={handleReset} />
      </div>

      <div ref={resultsRef} className="space-y-5 lg:col-span-7">
        {!result ? (
          <ResultEmptyState
            hasErrors={hasVisibleErrors}
            onLoadExample={() => handleLoadExample('200000', '10', '5', 'quarterly')}
          />
        ) : (
          <>
            <TiltCard3D className="aurora-card-accent p-6 space-y-5" maxTiltDeg={2.5}>
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#6366F1]/22 pb-4">
                <div>
                  <p className="text-xs font-semibold text-[#A855F7]">Maturity Value</p>
                  <p className="mt-1 font-mono text-3xl font-bold text-[#F8FAFC] tabular-nums sm:text-4xl">
                    <AnimatedNumber value={result.totalAmount} format={(n) => formatINR(n, 2)} />
                  </p>
                  <p className="mt-1 text-xs text-[#10B981] tabular-nums">
                    Compounding gain over Simple Interest: +{formatINR(result.compoundingAdvantage, 2)}
                  </p>
                </div>
                <ResultActionsBar
                  shareTitle="Compound Interest Result — CalHub FinCalc Pro"
                  summaryText={copySummary}
                  onExportCsv={handleExportCsv}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="aurora-subcard p-4">
                  <p className="text-xs text-[#94A3B8]">Principal Invested</p>
                  <p className="mt-1.5 font-mono text-base font-semibold text-[#F8FAFC] tabular-nums">
                    {formatINR(result.principal)}
                  </p>
                </div>
                <div className="aurora-subcard p-4">
                  <p className="text-xs text-[#94A3B8]">Interest Rate</p>
                  <p className="mt-1.5 font-mono text-base font-semibold text-[#F8FAFC] tabular-nums">
                    {result.rate}% p.a.
                  </p>
                  <p className="mt-0.5 font-mono text-[11px] text-[#38BDF8] tabular-nums">
                    ₹{(result.rate / 12).toFixed(2)}/mo per ₹100
                  </p>
                </div>
                <div className="aurora-subcard p-4">
                  <p className="text-xs font-medium text-[#10B981]">Compound Interest</p>
                  <p className="mt-1.5 font-mono text-base font-semibold text-[#F8FAFC] tabular-nums">
                    {formatINR(result.compoundInterest, 2)}
                  </p>
                </div>
                <div className="aurora-subcard p-4">
                  <p className="text-xs text-[#94A3B8]">Effective Annual Rate</p>
                  <p className="mt-1.5 font-mono text-base font-semibold text-[#C084FC] tabular-nums">
                    {result.effectiveAnnualRate.toFixed(2)}%
                  </p>
                </div>
              </div>
            </TiltCard3D>

            <GrowthChart
              title="Monthly Compound Growth Progression"
              xAxisLabel="Months"
              data={chartData}
            />

            <MonthlyScheduleTable
              title="Monthly Compound Interest Breakdown"
              subtitle={`Compounded ${COMPOUNDING_PERIODS[result.frequency].label.toLowerCase()} across ${result.totalMonths} ${result.totalMonths === 1 ? 'month' : 'months'}`}
              rows={result.monthlySchedule}
            />

            <FormulaAccordion formula={result.formula} steps={formulaSteps} />
          </>
        )}
      </div>
    </div>
  );
};

export default CompoundInterestCalc;
