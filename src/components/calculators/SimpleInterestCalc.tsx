import React, { useMemo, useRef, useState } from 'react';
import { NumberInput } from '../ui/NumberInput';
import { AnimatedNumber } from '../ui/AnimatedNumber';
import { TiltCard3D } from '../ui/TiltCard3D';
import { GrowthChart } from '../ui/GrowthChart';
import { MonthlyScheduleTable } from '../ui/MonthlyScheduleTable';
import { FormulaAccordion } from '../ui/FormulaAccordion';
import { CalcActionBar } from '../ui/CalcActionBar';
import { ResultActionsBar, ResultEmptyState } from '../ui/ResultStateHeader';
import {
  calculateSimpleInterest,
  type SimpleInterestTimeUnit,
} from '../../logic/calculators';
import { formatINR } from '../../utils/formatters';
import { downloadCsvFile } from '../../utils/exportUtils';
import type { CalculationHistoryItem } from '../../utils/storage';

interface SimpleInterestErrors {
  principal?: string;
  rate?: string;
  timeValue?: string;
}

interface SimpleInterestCalcProps {
  onSaveHistory?: (entry: Omit<CalculationHistoryItem, 'id' | 'timestamp'>) => void;
}

export const SimpleInterestCalc: React.FC<SimpleInterestCalcProps> = ({ onSaveHistory }) => {
  const [principalStr, setPrincipalStr] = useState<string>('0');
  const [rateStr, setRateStr] = useState<string>('0');
  const [timeStr, setTimeStr] = useState<string>('0');
  const [timeUnit, setTimeUnit] = useState<SimpleInterestTimeUnit>('years');
  const [touched, setTouched] = useState<Partial<Record<keyof SimpleInterestErrors, boolean>>>({});
  const [submitted, setSubmitted] = useState<boolean>(false);
  const resultsRef = useRef<HTMLDivElement | null>(null);

  const principalNum = principalStr.trim() === '' ? NaN : Number(principalStr);
  const rateNum = rateStr.trim() === '' ? NaN : Number(rateStr);
  const timeNum = timeStr.trim() === '' ? NaN : Number(timeStr);
  const monthlyRupeePerHundred =
    rateStr.trim() !== '' && Number.isFinite(rateNum) && rateNum >= 0 ? rateNum / 12 : 0;

  const errors = useMemo<SimpleInterestErrors>(() => {
    const next: SimpleInterestErrors = {};
    if (principalStr.trim() === '' || !Number.isFinite(principalNum) || principalNum < 0) {
      next.principal = 'Enter a principal amount of ₹0 or greater.';
    }
    if (rateStr.trim() === '' || !Number.isFinite(rateNum) || rateNum < 0 || rateNum > 100) {
      next.rate = 'Enter an annual interest rate between 0% and 100%.';
    }
    if (timeStr.trim() === '' || !Number.isFinite(timeNum) || timeNum <= 0) {
      next.timeValue = `Enter a valid duration in ${timeUnit} greater than 0.`;
    }
    return next;
  }, [principalStr, principalNum, rateStr, rateNum, timeStr, timeNum, timeUnit]);

  const isEmpty =
    principalStr.trim() === '' && rateStr.trim() === '' && timeStr.trim() === '';
  const isDefaultAllZero =
    !submitted &&
    principalStr.trim() === '0' &&
    rateStr.trim() === '0' &&
    timeStr.trim() === '0';
  const isValid = Object.keys(errors).length === 0;

  const result = useMemo(() => {
    if (!isValid || isDefaultAllZero) return null;
    return calculateSimpleInterest(principalNum, rateNum, timeNum, timeUnit);
  }, [isValid, isDefaultAllZero, principalNum, rateNum, timeNum, timeUnit]);

  const handleLoadExample = (p: string, r: string, t: string, u: SimpleInterestTimeUnit) => {
    setPrincipalStr(p);
    setRateStr(r);
    setTimeStr(t);
    setTimeUnit(u);
    setTouched({});
    setSubmitted(false);
  };

  const handleCalculate = () => {
    setSubmitted(true);
    if (isValid) {
      const computed = calculateSimpleInterest(principalNum, rateNum, timeNum, timeUnit);
      if (onSaveHistory) {
        onSaveHistory({
          calculatorId: 'simple-interest',
          calculatorTitle: 'Simple Interest',
          primaryMetricLabel: 'Total Maturity Value',
          primaryMetricValue: formatINR(computed.totalAmount, 2),
          summaryLine: `${formatINR(computed.principal)} @ ${computed.rate}% for ${computed.timeValue} ${computed.timeUnit} · SI ${formatINR(computed.simpleInterest, 2)}`,
          details: [
            `Principal: ${formatINR(computed.principal)}`,
            `Interest Rate: ${computed.rate}% p.a. (₹${(computed.rate / 12).toFixed(2)}/month per ₹100)`,
            `Duration: ${computed.timeValue} ${computed.timeUnit} (${computed.timeInYears.toFixed(4)} years)`,
            `Simple Interest: ${formatINR(computed.simpleInterest, 2)}`,
            `Total Amount: ${formatINR(computed.totalAmount, 2)}`,
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
    setTimeStr('0');
    setTouched({});
    setSubmitted(false);
  };

  const handleExportCsv = () => {
    if (!result) return;
    downloadCsvFile(
      'calhub-simple-interest-monthly.csv',
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
        'Simple Interest Summary — CalHub FinCalc Pro',
        `Principal: ${formatINR(result.principal)}`,
        `Rate: ${result.rate}% p.a.`,
        `Duration: ${result.timeValue} ${result.timeUnit} (${result.timeInYears.toFixed(4)} years)`,
        `Simple Interest: ${formatINR(result.simpleInterest, 2)}`,
        `Total Maturity Value: ${formatINR(result.totalAmount, 2)}`,
      ].join('\n')
    : '';

  const showFieldError = (key: keyof SimpleInterestErrors) =>
    submitted || touched[key] ? errors[key] : undefined;

  const hasVisibleErrors =
    !isEmpty &&
    !isValid &&
    (submitted || Boolean(touched.principal || touched.rate || touched.timeValue));

  return (
    <div className="grid gap-6 lg:grid-cols-12 items-start">
      <div className="aurora-card p-6 space-y-5 lg:col-span-5">
        <div>
          <h3 className="text-lg font-semibold text-[#F8FAFC]">Simple Interest Inputs</h3>
          <p className="mt-1 text-sm text-[#94A3B8]">
            Linear interest calculation across years, months, or days.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b border-[#6366F1]/18 pb-4">
          <span className="text-xs font-medium text-[#94A3B8]">Examples:</span>
          <button
            type="button"
            onClick={() => handleLoadExample('100000', '8.5', '3', 'years')}
            className="rounded-xl border border-[#6366F1]/28 bg-[#0F172A]/60 px-2.5 py-1 text-xs font-medium text-[#E2E8F0] transition-colors hover:border-[#06B6D4] hover:text-[#38BDF8] cursor-pointer"
          >
            ₹1L @ 8.5% · 3 yrs
          </button>
          <button
            type="button"
            onClick={() => handleLoadExample('250000', '7.2', '180', 'days')}
            className="rounded-xl border border-[#6366F1]/28 bg-[#0F172A]/60 px-2.5 py-1 text-xs font-medium text-[#E2E8F0] transition-colors hover:border-[#06B6D4] hover:text-[#38BDF8] cursor-pointer"
          >
            ₹2.5L @ 7.2% · 180 days
          </button>
        </div>

        <NumberInput
          id="si-principal"
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
          tooltip="Initial deposit or loan principal on which simple interest accrues."
        />

        <NumberInput
          id="si-rate"
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
          tooltip="Yearly nominal percentage rate applied linearly. Monthly equivalent per ₹100 = Annual Rate ÷ 12."
        />

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-[#F8FAFC]">Duration Unit</span>
            <div
              role="group"
              aria-label="Simple interest time unit"
              className="flex rounded-xl border border-[#6366F1]/25 bg-[#080D1B] p-0.5"
            >
              {(['years', 'months', 'days'] as SimpleInterestTimeUnit[]).map((unit) => (
                <button
                  key={unit}
                  type="button"
                  onClick={() => setTimeUnit(unit)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium capitalize transition-colors cursor-pointer ${
                    timeUnit === unit
                      ? 'bg-gradient-to-r from-[#2563EB] via-[#6366F1] to-[#8B5CF6] text-[#F8FAFC] font-semibold shadow-sm'
                      : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                  }`}
                >
                  {unit}
                </button>
              ))}
            </div>
          </div>

          <NumberInput
            id="si-time"
            label={`Time Period (${timeUnit})`}
            suffix={timeUnit}
            min={0}
            step="any"
            placeholder="0"
            value={timeStr}
            onChange={(val) => {
              setTimeStr(val);
              setTouched((prev) => ({ ...prev, timeValue: true }));
            }}
            error={showFieldError('timeValue')}
          />
        </div>

        <CalcActionBar onCalculate={handleCalculate} onReset={handleReset} />
      </div>

      <div ref={resultsRef} className="space-y-5 lg:col-span-7">
        {!result ? (
          <ResultEmptyState
            hasErrors={hasVisibleErrors}
            onLoadExample={() => handleLoadExample('100000', '8.5', '3', 'years')}
          />
        ) : (
          <>
            <TiltCard3D className="aurora-card-accent p-6 space-y-5" maxTiltDeg={2.5}>
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#6366F1]/22 pb-4">
                <div>
                  <p className="text-xs font-semibold text-[#38BDF8]">Total Maturity Value</p>
                  <p className="mt-1 font-mono text-3xl font-bold text-[#F8FAFC] tabular-nums sm:text-4xl">
                    <AnimatedNumber value={result.totalAmount} format={(n) => formatINR(n, 2)} />
                  </p>
                </div>
                <ResultActionsBar
                  shareTitle="Simple Interest Result — CalHub FinCalc Pro"
                  summaryText={copySummary}
                  onExportCsv={handleExportCsv}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="aurora-subcard p-4">
                  <p className="text-xs text-[#94A3B8]">Principal Amount</p>
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
                  <p className="text-xs font-medium text-[#10B981]">Simple Interest</p>
                  <p className="mt-1.5 font-mono text-base font-semibold text-[#F8FAFC] tabular-nums">
                    {formatINR(result.simpleInterest, 2)}
                  </p>
                </div>
                <div className="aurora-subcard p-4">
                  <p className="text-xs text-[#94A3B8]">Monthly Duration</p>
                  <p className="mt-1.5 font-mono text-base font-semibold text-[#F8FAFC] tabular-nums">
                    {result.totalMonths} {result.totalMonths === 1 ? 'month' : 'months'}
                  </p>
                  <p className="mt-0.5 font-mono text-[11px] text-[#94A3B8] tabular-nums">
                    {result.timeInYears.toFixed(2)} yrs total
                  </p>
                </div>
              </div>
            </TiltCard3D>

            <GrowthChart
              title="Monthly Simple Interest Progression"
              xAxisLabel="Months"
              data={result.schedule}
            />

            <MonthlyScheduleTable
              title="Monthly Simple Interest Breakdown"
              subtitle="Monthly interest calculated linearly on original principal"
              rows={result.monthlySchedule}
            />

            <FormulaAccordion formula={result.formula} steps={result.steps} />
          </>
        )}
      </div>
    </div>
  );
};

export default SimpleInterestCalc;
