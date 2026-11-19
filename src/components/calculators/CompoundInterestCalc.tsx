import { useMemo, useState } from 'react';
import { DownloadSimple } from '@phosphor-icons/react';
import {
  calculateCompoundInterest,
  COMPOUNDING_PERIODS_PER_YEAR,
  CompoundingFrequency,
  CompoundTimeUnit,
} from '../../logic/compoundInterest';
import {
  downloadCSV,
  formatINR,
  formatNumberIN,
  formatPercent,
} from '../../utils/formatters';
import { parseNumericInput } from '../../utils/validators';
import { InputField } from '../ui/InputField';
import { EmptyState } from '../ui/EmptyState';
import { ResultActions } from '../ui/ResultActions';
import { CompoundGrowthChart } from '../ui/Charts';

const FREQUENCIES: CompoundingFrequency[] = [
  'annually',
  'half-yearly',
  'quarterly',
  'monthly',
  'daily',
];

export function CompoundInterestCalc() {
  const [principalRaw, setPrincipalRaw] = useState('');
  const [rateRaw, setRateRaw] = useState('');
  const [timeRaw, setTimeRaw] = useState('');
  const [timeUnit, setTimeUnit] = useState<CompoundTimeUnit>('years');
  const [frequency, setFrequency] = useState<CompoundingFrequency>('quarterly');

  const parsedPrincipal = parseNumericInput(principalRaw, 'Principal Amount', {
    required: true,
    exclusiveMin: 0,
  });
  const parsedRate = parseNumericInput(rateRaw, 'Annual Interest Rate', {
    required: true,
    min: 0,
    max: 500,
  });
  const parsedTime = parseNumericInput(timeRaw, 'Time Duration', {
    required: true,
    exclusiveMin: 0,
    max: timeUnit === 'years' ? 100 : 1200,
  });

  const hasError = Boolean(
    parsedPrincipal.error || parsedRate.error || parsedTime.error
  );
  const isReady =
    !hasError &&
    parsedPrincipal.value !== null &&
    parsedRate.value !== null &&
    parsedTime.value !== null;

  const result = useMemo(() => {
    if (!isReady) return null;
    return calculateCompoundInterest({
      principal: parsedPrincipal.value!,
      annualRate: parsedRate.value!,
      timeValue: parsedTime.value!,
      timeUnit,
      frequency,
    });
  }, [isReady, parsedPrincipal.value, parsedRate.value, parsedTime.value, timeUnit, frequency]);

  const handleReset = () => {
    setPrincipalRaw('');
    setRateRaw('');
    setTimeRaw('');
    setTimeUnit('years');
    setFrequency('quarterly');
  };

  const handleDownloadCSV = () => {
    if (!result) return;
    downloadCSV(
      'fincalc-compound-interest-schedule.csv',
      ['Period', 'Opening Balance (INR)', 'Interest Earned (INR)', 'Cumulative Interest (INR)', 'Closing Balance (INR)'],
      result.yearlySchedule.map((r) => [
        r.periodLabel,
        r.openingBalance.toFixed(2),
        r.interestEarned.toFixed(2),
        r.cumulativeInterest.toFixed(2),
        r.closingBalance.toFixed(2),
      ])
    );
  };

  const summaryText = result
    ? [
        'FinCalc Pro — Compound Interest Summary',
        `Principal: ${formatINR(result.principal)}`,
        `Nominal Rate: ${result.annualRate}% p.a. (${COMPOUNDING_PERIODS_PER_YEAR[result.frequency].label})`,
        `Effective Annual Rate (EAR): ${formatPercent(result.effectiveAnnualRate)}`,
        `Duration: ${formatNumberIN(result.timeInYears, 4)} years`,
        `Compound Interest Earned: ${formatINR(result.compoundInterest)}`,
        `Total Maturity Amount: ${formatINR(result.totalAmount)}`,
      ].join('\n')
    : null;

  const wealthMultiplier = result ? result.totalAmount / result.principal : 1;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Inputs */}
      <div className="rounded-xl border border-white/[0.08] bg-[#111116] p-5 sm:p-6 lg:col-span-5">
        <div className="mb-5 border-b border-white/[0.08] pb-4">
          <h2 className="font-display text-lg font-semibold text-white">
            Compound Interest Inputs
          </h2>
          <p className="mt-1 text-xs text-zinc-400">
            Supports annual, half-yearly, quarterly, monthly, and daily compounding.
          </p>
        </div>

        <div className="space-y-4">
          <InputField
            id="ci-principal"
            label="Principal Amount"
            value={principalRaw}
            onChange={setPrincipalRaw}
            placeholder="e.g. 500000"
            prefix="₹"
            showIndianScale
            error={parsedPrincipal.error}
            tooltip="Initial capital invested on which interest compounds over each compounding period."
            quickChips={[
              { label: '₹1L', value: '100000' },
              { label: '₹5L', value: '500000' },
              { label: '₹10L', value: '1000000' },
              { label: '₹25L', value: '2500000' },
            ]}
          />

          <InputField
            id="ci-rate"
            label="Annual Nominal Rate"
            value={rateRaw}
            onChange={setRateRaw}
            placeholder="e.g. 8.5"
            suffix="% p.a."
            error={parsedRate.error}
            tooltip="Annual stated interest rate before adjusting for intra-year compounding frequency."
            slider={{ min: 0, max: 25, step: 0.25 }}
          />

          <div className="space-y-1.5">
            <InputField
              id="ci-time"
              label="Time Period"
              value={timeRaw}
              onChange={setTimeRaw}
              placeholder={timeUnit === 'years' ? 'e.g. 5' : 'e.g. 36'}
              suffix={timeUnit}
              error={parsedTime.error}
              tooltip="Investment duration. Up to 100 years supported."
              slider={
                timeUnit === 'years'
                  ? { min: 1, max: 30, step: 1 }
                  : { min: 3, max: 120, step: 3 }
              }
            />
            <div className="grid grid-cols-2 gap-1.5 rounded-lg border border-white/[0.08] bg-[#0B0B0E] p-1">
              {(['years', 'months'] as CompoundTimeUnit[]).map((unit) => (
                <button
                  key={unit}
                  type="button"
                  onClick={() => setTimeUnit(unit)}
                  className={`min-h-[36px] rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors whitespace-nowrap ${
                    timeUnit === unit
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
            <label
              htmlFor="ci-frequency"
              className="block text-sm font-medium text-zinc-200"
            >
              Compounding Frequency
            </label>
            <select
              id="ci-frequency"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as CompoundingFrequency)}
              className="min-h-[44px] w-full rounded-lg border border-white/10 bg-[#0E0E13] px-3 py-2.5 text-sm text-white focus:border-[#D4AF37] focus:outline-none"
            >
              {FREQUENCIES.map((freq) => (
                <option key={freq} value={freq}>
                  {COMPOUNDING_PERIODS_PER_YEAR[freq].label}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2">
            <ResultActions onReset={handleReset} summaryText={summaryText} />
          </div>
        </div>
      </div>

      {/* Outputs */}
      <div className="space-y-5 lg:col-span-7">
        {!result ? (
          <EmptyState
            title="Enter Principal, Rate, Tenure & Compounding"
            description="Analyze compound growth, Effective Annual Rate (EAR), and year-by-year accumulation tables. Enter values or load a sample scenario."
            presets={[
              {
                label: 'Bank FD · Quarterly Compounding',
                description: '₹5,00,000 at 7.5% p.a. for 5 years (Quarterly)',
                onSelect: () => {
                  setPrincipalRaw('500000');
                  setRateRaw('7.5');
                  setTimeRaw('5');
                  setTimeUnit('years');
                  setFrequency('quarterly');
                },
              },
              {
                label: 'Long-Term Corpus · 10 Years',
                description: '₹2,00,000 at 12% p.a. for 10 years (Annually)',
                onSelect: () => {
                  setPrincipalRaw('200000');
                  setRateRaw('12');
                  setTimeRaw('10');
                  setTimeUnit('years');
                  setFrequency('annually');
                },
              },
            ]}
          />
        ) : (
          <>
            {/* Spotlight Maturity Card + Supporting KPIs */}
            <div className="rounded-xl border border-[#D4AF37]/40 bg-[#131209] p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <span className="text-xs font-medium text-[#E5C158]">
                    Total Maturity Value
                  </span>
                  <div className="font-mono-num mt-1 text-3xl font-bold tracking-tight text-white">
                    {formatINR(result.totalAmount)}
                  </div>
                  <p className="mt-1 text-xs text-zinc-400">
                    {formatNumberIN(result.totalPeriods, 2)} periods ·{' '}
                    <span className="font-mono-num text-[#E5C158]">
                      {wealthMultiplier.toFixed(2)}×
                    </span>{' '}
                    initial capital
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:text-right">
                  <div>
                    <span className="text-xs text-zinc-400">Compound Interest</span>
                    <div className="font-mono-num mt-0.5 text-base font-semibold text-white">
                      {formatINR(result.compoundInterest)}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-zinc-400">Effective Rate (EAR)</span>
                    <div className="font-mono-num mt-0.5 text-base font-semibold text-[#E5C158]">
                      {formatPercent(result.effectiveAnnualRate, 2)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Chart */}
            <CompoundGrowthChart
              principal={result.principal}
              rows={result.yearlySchedule}
            />

            {/* Formula & Assumptions */}
            <div className="rounded-xl border border-white/[0.08] bg-[#111116] p-5">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.08] pb-3">
                <h3 className="font-display text-sm font-semibold text-white">
                  Formula, Steps & Assumptions
                </h3>
                <code className="font-mono-num rounded bg-[#181820] px-2.5 py-1 text-xs text-[#E5C158]">
                  {result.formula}
                </code>
              </div>

              <ol className="mb-4 space-y-2 text-xs text-zinc-300 sm:text-sm">
                {result.steps.map((step, i) => (
                  <li key={i} className="font-mono-num flex items-start gap-2.5">
                    <span className="text-[#D4AF37]">{i + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>

              <div className="border-t border-white/[0.08] pt-3">
                <p className="mb-1.5 text-xs font-medium text-zinc-400">Assumptions</p>
                <ul className="list-disc space-y-1 pl-4 text-xs text-zinc-400">
                  {result.assumptions.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Year-by-Year Growth Table */}
            <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#111116]">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.08] px-5 py-3.5">
                <h3 className="font-display text-sm font-semibold text-white">
                  Year-by-Year Growth Schedule
                </h3>
                <button
                  type="button"
                  onClick={handleDownloadCSV}
                  className="inline-flex min-h-[34px] items-center gap-1.5 rounded-lg border border-white/15 bg-[#16161D] px-3 py-1.5 text-xs font-medium text-zinc-200 transition-colors hover:border-[#D4AF37]/50 hover:text-[#E5C158] whitespace-nowrap"
                >
                  <DownloadSimple size={14} weight="bold" aria-hidden="true" />
                  <span>Download CSV</span>
                </button>
              </div>
              <div className="max-h-80 overflow-x-auto overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-[#16161D] text-zinc-400">
                    <tr className="border-b border-white/[0.08]">
                      <th className="px-4 py-2.5 font-medium">Period</th>
                      <th className="px-4 py-2.5 text-right font-medium">Opening Balance</th>
                      <th className="px-4 py-2.5 text-right font-medium">Interest Earned</th>
                      <th className="px-4 py-2.5 text-right font-medium">Cumulative Int.</th>
                      <th className="px-4 py-2.5 text-right font-medium">Closing Balance</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono-num divide-y divide-white/[0.05]">
                    {result.yearlySchedule.map((row) => (
                      <tr key={row.periodLabel} className="hover:bg-white/[0.02]">
                        <td className="px-4 py-2.5 font-sans font-medium text-zinc-200">
                          {row.periodLabel}
                        </td>
                        <td className="px-4 py-2.5 text-right text-zinc-300">
                          {formatINR(row.openingBalance)}
                        </td>
                        <td className="px-4 py-2.5 text-right text-[#E5C158]">
                          +{formatINR(row.interestEarned)}
                        </td>
                        <td className="px-4 py-2.5 text-right text-zinc-400">
                          {formatINR(row.cumulativeInterest)}
                        </td>
                        <td className="px-4 py-2.5 text-right font-semibold text-white">
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
