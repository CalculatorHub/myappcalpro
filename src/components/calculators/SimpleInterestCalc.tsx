import { useMemo, useState } from 'react';
import { calculateSimpleInterest, SimpleTimeUnit } from '../../logic/simpleInterest';
import { formatINR, formatNumberIN, formatPercent } from '../../utils/formatters';
import { parseNumericInput } from '../../utils/validators';
import { InputField } from '../ui/InputField';
import { EmptyState } from '../ui/EmptyState';
import { ResultActions } from '../ui/ResultActions';

export function SimpleInterestCalc() {
  const [principalRaw, setPrincipalRaw] = useState('');
  const [rateRaw, setRateRaw] = useState('');
  const [timeRaw, setTimeRaw] = useState('');
  const [timeUnit, setTimeUnit] = useState<SimpleTimeUnit>('years');
  const [daysInYear, setDaysInYear] = useState<365 | 360>(365);

  const parsedPrincipal = parseNumericInput(principalRaw, 'Principal Amount', {
    required: true,
    exclusiveMin: 0,
  });
  const parsedRate = parseNumericInput(rateRaw, 'Annual Interest Rate', {
    required: true,
    min: 0,
    max: 1000,
  });
  const parsedTime = parseNumericInput(timeRaw, 'Time Duration', {
    required: true,
    exclusiveMin: 0,
    max: 100000,
  });

  const hasAnyError = Boolean(
    parsedPrincipal.error || parsedRate.error || parsedTime.error
  );
  const isReady =
    !hasAnyError &&
    parsedPrincipal.value !== null &&
    parsedRate.value !== null &&
    parsedTime.value !== null;

  const result = useMemo(() => {
    if (!isReady) return null;
    return calculateSimpleInterest({
      principal: parsedPrincipal.value!,
      annualRate: parsedRate.value!,
      timeValue: parsedTime.value!,
      timeUnit,
      daysInYear,
    });
  }, [isReady, parsedPrincipal.value, parsedRate.value, parsedTime.value, timeUnit, daysInYear]);

  const handleReset = () => {
    setPrincipalRaw('');
    setRateRaw('');
    setTimeRaw('');
    setTimeUnit('years');
    setDaysInYear(365);
  };

  const summaryText = result
    ? [
        'FinCalc Pro — Simple Interest Summary',
        `Principal: ${formatINR(result.principal)}`,
        `Annual Rate: ${result.annualRate}% p.a.`,
        `Duration: ${formatNumberIN(result.timeValue)} ${result.timeUnit} (${formatNumberIN(result.timeInYears, 4)} years)`,
        `Simple Interest: ${formatINR(result.simpleInterest)}`,
        `Total Maturity Amount: ${formatINR(result.totalAmount)}`,
        `Formula: ${result.formula}`,
      ].join('\n')
    : null;

  const principalSharePct = result && result.totalAmount > 0
    ? (result.principal / result.totalAmount) * 100
    : 0;
  const interestSharePct = result && result.totalAmount > 0
    ? (result.simpleInterest / result.totalAmount) * 100
    : 0;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Input Column */}
      <div className="rounded-xl card p-5 sm:p-6 lg:col-span-5">
        <div className="mb-5 border-b border-border-subtle pb-4">
          <h2 className="heading-5 text-primary">
            Simple Interest Inputs
          </h2>
          <p className="mt-1 caption-5 text-secondary">
            Supports years, months, or exact day counts for deposits and short-term bills.
          </p>
        </div>

        <div className="space-y-4">
          <InputField
            id="si-principal"
            label="Principal Amount"
            value={principalRaw}
            onChange={setPrincipalRaw}
            placeholder="e.g. 250000"
            prefix="₹"
            showIndianScale
            error={parsedPrincipal.error}
            tooltip="Initial sum invested or borrowed on which simple interest is calculated without compounding."
            quickChips={[
              { label: '₹50K', value: '50000' },
              { label: '₹1L', value: '100000' },
              { label: '₹2.5L', value: '250000' },
              { label: '₹10L', value: '1000000' },
            ]}
          />

          <InputField
            id="si-rate"
            label="Annual Interest Rate"
            value={rateRaw}
            onChange={setRateRaw}
            placeholder="e.g. 7.5"
            suffix="% p.a."
            error={parsedRate.error}
            tooltip="Nominal annual interest rate expressed as a percentage per annum."
            slider={{ min: 0, max: 24, step: 0.25 }}
            quickChips={[
              { label: '6.5%', value: '6.5' },
              { label: '7.25%', value: '7.25' },
              { label: '9%', value: '9' },
              { label: '12%', value: '12' },
            ]}
          />

          <div className="space-y-1.5">
            <InputField
              id="si-time"
              label="Time Period"
              value={timeRaw}
              onChange={setTimeRaw}
              placeholder={timeUnit === 'years' ? 'e.g. 3' : timeUnit === 'months' ? 'e.g. 18' : 'e.g. 90'}
              suffix={timeUnit}
              error={parsedTime.error}
              tooltip="Duration of the deposit or loan. Months divide by 12; days divide by 365 (standard) or 360 (commercial)."
            />

            <div className="grid grid-cols-3 gap-1.5 rounded-lg border border-border-subtle bg-bg-raised p-1">
              {(['years', 'months', 'days'] as SimpleTimeUnit[]).map((unit) => (
                <button
                  key={unit}
                  type="button"
                  onClick={() => setTimeUnit(unit)}
                  className={`min-h-[36px] rounded-md px-3 py-1.5 caption-4 capitalize transition-colors whitespace-nowrap ${
                    timeUnit === unit
                      ? 'bg-accent-gold text-bg-main font-semibold'
                      : 'text-secondary hover:text-primary'
                  }`}
                >
                  {unit}
                </button>
              ))}
            </div>
          </div>

          {timeUnit === 'days' && (
            <div className="space-y-1.5">
              <span className="block caption-4 text-primary">
                Day-Count Convention
              </span>
              <div className="grid grid-cols-2 gap-1.5 rounded-lg border border-border-subtle bg-bg-raised p-1">
                {[365, 360].map((basis) => (
                  <button
                    key={basis}
                    type="button"
                    onClick={() => setDaysInYear(basis as 365 | 360)}
                    className={`min-h-[36px] rounded-md px-3 py-1.5 caption-4 transition-colors whitespace-nowrap ${
                      daysInYear === basis
                        ? 'bg-bg-card gold-accent border border-accent-gold/40'
                        : 'text-secondary hover:text-primary'
                    }`}
                  >
                    {basis} Days / Yr
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2">
            <ResultActions onReset={handleReset} summaryText={summaryText} />
          </div>
        </div>
      </div>

      {/* Results Column */}
      <div className="space-y-5 lg:col-span-7">
        {!result ? (
          <EmptyState
            title="Enter Principal, Rate, and Time"
            description="Simple interest accrues strictly on the original principal. Enter valid positive numbers on the left or try a CA curriculum example below."
            presets={[
              {
                label: 'Fixed Deposit · 18 Months',
                description: '₹2,50,000 at 7.25% p.a. for 18 months',
                onSelect: () => {
                  setPrincipalRaw('250000');
                  setRateRaw('7.25');
                  setTimeRaw('18');
                  setTimeUnit('months');
                },
              },
              {
                label: 'Short-Term Bill · 90 Days',
                description: '₹1,00,000 at 12% p.a. for 90 days (365-day)',
                onSelect: () => {
                  setPrincipalRaw('100000');
                  setRateRaw('12');
                  setTimeRaw('90');
                  setTimeUnit('days');
                  setDaysInYear(365);
                },
              },
            ]}
          />
        ) : (
          <>
            {/* Spotlight Output + Supporting KPIs */}
            <div className="rounded-xl border border-accent-gold/40 bg-bg-card p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <span className="caption-4 gold-accent">
                    Simple Interest Earned
                  </span>
                  <div className="font-mono-num mt-1 text-3xl font-semibold tracking-tight text-primary">
                    {formatINR(result.simpleInterest)}
                  </div>
                  <p className="mt-1 caption-5 text-secondary">
                    Over {formatNumberIN(result.timeValue)} {result.timeUnit} (
                    {formatNumberIN(result.timeInYears, 4)} yrs) at {result.annualRate}% p.a.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:text-right">
                  <div>
                    <span className="caption-5 text-muted">Principal (P)</span>
                    <div className="font-mono-num mt-0.5 title-2 text-primary">
                      {formatINR(result.principal)}
                    </div>
                  </div>
                  <div>
                    <span className="caption-5 text-muted">Maturity Value (A)</span>
                    <div className="font-mono-num mt-0.5 title-2 gold-accent">
                      {formatINR(result.totalAmount)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Principal vs Interest Share Bar */}
              <div className="mt-5 border-t border-border-subtle pt-4">
                <div className="mb-1.5 flex items-center justify-between caption-5">
                  <span className="text-secondary">
                    Principal ({formatPercent(principalSharePct, 1)})
                  </span>
                  <span className="gold-accent">
                    Interest ({formatPercent(interestSharePct, 1)})
                  </span>
                </div>
                <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-bg-raised">
                  <div
                    className="h-full bg-muted transition-all duration-200"
                    style={{ width: `${principalSharePct}%` }}
                  />
                  <div
                    className="h-full bg-accent-gold transition-all duration-200"
                    style={{ width: `${interestSharePct}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Formula & Step-by-Step Breakdown */}
            <div className="card p-5 sm:p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle pb-3">
                <h3 className="title-3 text-primary">
                  Formula & Calculation Steps
                </h3>
                <code className="font-mono-num rounded bg-bg-raised px-2.5 py-1 caption-5 gold-accent">
                  {result.formula}
                </code>
              </div>

              <ol className="space-y-2.5 text-sm text-secondary">
                {result.steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="font-mono-num mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded border border-accent-gold/30 bg-accent-gold/10 caption-4 gold-accent">
                      {i + 1}
                    </span>
                    <span className="font-mono-num caption-2 leading-relaxed text-secondary">
                      {step}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
