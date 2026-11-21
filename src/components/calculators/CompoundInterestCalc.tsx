import React, { useMemo, useRef, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { NumberInput } from '../ui/NumberInput';
import { AnimatedNumber } from '../ui/AnimatedNumber';
import { TiltCard3D } from '../ui/TiltCard3D';
import { GrowthChart, type GrowthChartDatum } from '../ui/GrowthChart';
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
  const [showSchedule, setShowSchedule] = useState<boolean>(true);
  const [touched, setTouched] = useState<Partial<Record<keyof CompoundErrors, boolean>>>({});
  const [submitted, setSubmitted] = useState<boolean>(false);
  const resultsRef = useRef<HTMLDivElement | null>(null);

  const principalNum = principalStr.trim() === '' ? NaN : Number(principalStr);
  const rateNum = rateStr.trim() === '' ? NaN : Number(rateStr);
  const yearsNum = yearsStr.trim() === '' ? NaN : Number(yearsStr);

  const errors = useMemo<CompoundErrors>(() => {
    const next: CompoundErrors = {};
    if (principalStr.trim() === '' || !Number.isFinite(principalNum) || principalNum <= 0) {
      next.principal = 'Enter a principal amount greater than ₹0.';
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
  const isValid = Object.keys(errors).length === 0;

  const result = useMemo(() => {
    if (!isValid) return null;
    return calculateCompoundInterest(principalNum, rateNum, yearsNum, frequency);
  }, [isValid, principalNum, rateNum, yearsNum, frequency]);

  const chartData = useMemo<GrowthChartDatum[]>(() => {
    if (!result) return [];
    const points: GrowthChartDatum[] = [
      {
        label: 'Start',
        principal: result.principal,
        interestEarned: 0,
        totalAmount: result.principal,
      },
    ];
    result.yearlySchedule.forEach((row) => {
      points.push({
        label: `Yr ${row.year}`,
        principal: result.principal,
        interestEarned: row.cumulativeInterest,
        totalAmount: row.closingBalance,
      });
    });
    return points;
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
    if (result && onSaveHistory) {
      onSaveHistory({
        calculatorId: 'compound-interest',
        calculatorTitle: 'Compound Interest',
        primaryMetricLabel: 'Maturity Value',
        primaryMetricValue: formatINR(result.totalAmount, 2),
        summaryLine: `${formatINR(result.principal)} @ ${result.rate}% (${result.frequency}) for ${result.years} yrs · EAR ${result.effectiveAnnualRate.toFixed(2)}%`,
      });
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
      'calhub-compound-interest-schedule.csv',
      ['Year', 'Opening Balance (INR)', 'Interest Earned (INR)', 'Closing Balance (INR)', 'Cumulative Interest (INR)'],
      result.yearlySchedule.map((row) => [
        row.year,
        row.openingBalance.toFixed(2),
        row.interestEarned.toFixed(2),
        row.closingBalance.toFixed(2),
        row.cumulativeInterest.toFixed(2),
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
      <div className="luxury-card p-6 space-y-5 lg:col-span-5">
        <div>
          <h3 className="text-lg font-semibold text-white">Compound Interest Inputs</h3>
          <p className="mt-1 text-sm text-[#A1A1AA]">
            Compare annual, half-yearly, quarterly, monthly, and daily compounding.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b border-[#D4AF37]/15 pb-4">
          <span className="text-xs font-medium text-[#A1A1AA]">Examples:</span>
          <button
            type="button"
            onClick={() => handleLoadExample('200000', '10', '5', 'quarterly')}
            className="rounded-xl border border-[#D4AF37]/25 bg-white/[0.03] px-2.5 py-1 text-xs font-medium text-[#E4E4E7] transition-colors hover:border-[#F5D76E] hover:text-[#F5D76E] cursor-pointer"
          >
            ₹2L @ 10% · 5 yrs
          </button>
          <button
            type="button"
            onClick={() => handleLoadExample('500000', '12', '10', 'monthly')}
            className="rounded-xl border border-[#D4AF37]/25 bg-white/[0.03] px-2.5 py-1 text-xs font-medium text-[#E4E4E7] transition-colors hover:border-[#F5D76E] hover:text-[#F5D76E] cursor-pointer"
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
          label="Annual Interest Rate"
          suffix="% p.a."
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
        />

        <NumberInput
          id="ci-years"
          label="Investment Tenure"
          suffix="years"
          min={0}
          max={50}
          step={0.5}
          placeholder="0"
          value={yearsStr}
          onChange={(val) => {
            setYearsStr(val);
            setTouched((prev) => ({ ...prev, years: true }));
          }}
          error={showFieldError('years')}
        />

        <div className="space-y-1.5">
          <label htmlFor="ci-frequency" className="block text-sm font-medium text-white">
            Compounding Frequency
          </label>
          <select
            id="ci-frequency"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as CompoundingFrequency)}
            className="luxury-input w-full px-3.5 py-2.5 text-sm font-medium text-white focus:outline-none cursor-pointer"
          >
            {(Object.keys(COMPOUNDING_PERIODS) as CompoundingFrequency[]).map((key) => (
              <option key={key} value={key} className="bg-[#111111] text-white">
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
            <TiltCard3D className="luxury-card-accent p-6 space-y-5" maxTiltDeg={2.5}>
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#D4AF37]/20 pb-4">
                <div>
                  <p className="text-xs font-semibold text-[#F5D76E]">Maturity Value</p>
                  <p className="mt-1 font-mono text-3xl font-bold text-white tabular-nums sm:text-4xl">
                    <AnimatedNumber value={result.totalAmount} format={(n) => formatINR(n, 2)} />
                  </p>
                  <p className="mt-1 text-xs text-[#A1A1AA] tabular-nums">
                    Compounding gain over Simple Interest: +{formatINR(result.compoundingAdvantage, 2)}
                  </p>
                </div>
                <ResultActionsBar
                  shareTitle="Compound Interest Result — CalHub FinCalc Pro"
                  summaryText={copySummary}
                  onExportCsv={handleExportCsv}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="luxury-subcard p-4">
                  <p className="text-xs text-[#A1A1AA]">Principal Invested</p>
                  <p className="mt-1.5 font-mono text-lg font-semibold text-white tabular-nums">
                    {formatINR(result.principal)}
                  </p>
                </div>
                <div className="luxury-subcard p-4">
                  <p className="text-xs font-medium text-[#F5D76E]">Compound Interest</p>
                  <p className="mt-1.5 font-mono text-lg font-semibold text-white tabular-nums">
                    {formatINR(result.compoundInterest, 2)}
                  </p>
                </div>
                <div className="luxury-subcard p-4">
                  <p className="text-xs text-[#A1A1AA]">Effective Annual Rate</p>
                  <p className="mt-1.5 font-mono text-lg font-semibold text-white tabular-nums">
                    {result.effectiveAnnualRate.toFixed(2)}%
                  </p>
                </div>
              </div>
            </TiltCard3D>

            <GrowthChart
              title="Compound Growth Over Time"
              xAxisLabel="Tenure (Years)"
              data={chartData}
            />

            {result.yearlySchedule.length > 0 && (
              <div className="luxury-card overflow-hidden">
                <button
                  type="button"
                  aria-expanded={showSchedule}
                  onClick={() => setShowSchedule((prev) => !prev)}
                  className="flex w-full items-center justify-between border-b border-[#D4AF37]/15 px-5 py-4 text-left hover:bg-white/[0.03] cursor-pointer"
                >
                  <span className="text-sm font-semibold text-white">
                    Year-by-Year Schedule ({result.yearlySchedule.length} periods)
                  </span>
                  {showSchedule ? (
                    <ChevronUp className="h-4 w-4 text-[#F5D76E]" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-[#A1A1AA]" aria-hidden="true" />
                  )}
                </button>

                {showSchedule && (
                  <div className="max-h-72 overflow-x-auto overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="sticky top-0 bg-[#141416] text-[#A1A1AA]">
                        <tr>
                          <th className="px-4 py-3 font-medium">Period</th>
                          <th className="px-4 py-3 font-medium text-right">Opening</th>
                          <th className="px-4 py-3 font-medium text-right">Interest</th>
                          <th className="px-4 py-3 font-medium text-right">Closing</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#D4AF37]/12 font-mono tabular-nums">
                        {result.yearlySchedule.map((row) => (
                          <tr key={row.year} className="hover:bg-white/[0.025]">
                            <td className="px-4 py-3 text-[#A1A1AA]">Year {row.year}</td>
                            <td className="px-4 py-3 text-right text-[#E4E4E7]">
                              {formatINR(row.openingBalance, 0)}
                            </td>
                            <td className="px-4 py-3 text-right text-[#F5D76E]">
                              +{formatINR(row.interestEarned, 0)}
                            </td>
                            <td className="px-4 py-3 text-right font-semibold text-white">
                              {formatINR(row.closingBalance, 0)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            <FormulaAccordion formula={result.formula} steps={formulaSteps} />
          </>
        )}
      </div>
    </div>
  );
};

export default CompoundInterestCalc;
