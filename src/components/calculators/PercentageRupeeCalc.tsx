import { useMemo, useState } from 'react';
import { ArrowsLeftRight, Info } from '@phosphor-icons/react';
import { calcCustomRupeePercent } from '../../logic/percentageRupee';
import { formatINR, formatNumberIN } from '../../utils/formatters';
import { parseNumericInput } from '../../utils/validators';
import { InputField } from '../ui/InputField';
import { EmptyState } from '../ui/EmptyState';
import { ResultActions } from '../ui/ResultActions';

type ConversionDirection = 'rupees-to-percent' | 'percent-to-rupees';

const FIXED_RATE_RUPEES = 1;
const FIXED_RATE_PERCENT = 12;

function formatCleanNumber(val: number): string {
  if (!Number.isFinite(val)) return '';
  const rounded = Math.round(val * 1_000_000) / 1_000_000;
  return String(Object.is(rounded, -0) ? 0 : rounded);
}

export function PercentageRupeeCalc() {
  const [direction, setDirection] = useState<ConversionDirection>('rupees-to-percent');
  const [inputValueRaw, setInputValueRaw] = useState('');

  const parsedInputValue = parseNumericInput(
    inputValueRaw,
    direction === 'rupees-to-percent' ? 'Rupee Amount (₹)' : 'Percentage (%)',
    { required: true }
  );

  const isReady = !parsedInputValue.error && parsedInputValue.value !== null;

  const result = useMemo(() => {
    if (!isReady) return null;
    return calcCustomRupeePercent(
      FIXED_RATE_RUPEES,
      FIXED_RATE_PERCENT,
      parsedInputValue.value!
    );
  }, [isReady, parsedInputValue.value]);

  const handleSwitchDirection = (targetDirection?: ConversionDirection) => {
    const nextDirection =
      targetDirection ??
      (direction === 'rupees-to-percent' ? 'percent-to-rupees' : 'rupees-to-percent');
    if (nextDirection === direction) return;

    if (result) {
      const nextInput =
        direction === 'rupees-to-percent'
          ? result.rupeesToPercentValue
          : result.percentToRupeesValue;
      setInputValueRaw(formatCleanNumber(nextInput));
    }
    setDirection(nextDirection);
  };

  const handleReset = () => {
    setInputValueRaw('');
    setDirection('rupees-to-percent');
  };

  const isRupeesToPercent = direction === 'rupees-to-percent';

  const activeFormula = isRupeesToPercent
    ? 'Percentage = rupee amount × (12% ÷ ₹1)'
    : 'Rupee amount = percentage × (₹1 ÷ 12%)';

  const summaryText = result
    ? [
        `FinCalc Pro — Rupee & Percentage Converter (₹1 = 12%)`,
        isRupeesToPercent
          ? `Direction ₹ → %: ${formatINR(result.valueToConvert)} = ${formatNumberIN(result.rupeesToPercentValue, 4)}%`
          : `Direction % → ₹: ${formatNumberIN(result.valueToConvert, 4)}% = ${formatINR(result.percentToRupeesValue)}`,
        `Formula: ${activeFormula}`,
      ].join('\n')
    : null;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Left Input Column */}
      <div className="card p-5 sm:p-6 lg:col-span-5">
        <div className="mb-4 border-b border-border-subtle pb-4">
          <h2 className="heading-5 text-primary">
            Rupee ↔ Percentage Converter
          </h2>
          <p className="mt-1 caption-5 text-secondary">
            Convert between Rupees (₹) and Percentage (%) at the ₹1 = 12% ratio.
          </p>
        </div>

        <div className="space-y-4">
          {/* Ratio Note */}
          <div className="rounded-lg border border-accent-gold/25 bg-bg-raised p-3 caption-2 text-secondary">
            <span className="flex items-center gap-1.5 font-semibold gold-accent">
              <Info size={14} weight="fill" className="shrink-0" aria-hidden="true" />
              <span>Conversion Ratio: ₹1 = 12%</span>
            </span>
            <span className="mt-1 block text-muted">
              Custom conversion ratio (not a standard currency exchange rate).
            </span>
          </div>

          {/* Direction Toggle & Switch Button */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-zinc-200">
                Conversion Direction
              </span>
              <button
                type="button"
                onClick={() => handleSwitchDirection()}
                className="inline-flex items-center gap-1.5 rounded-md border border-accent-gold/40 bg-accent-gold/10 px-2.5 py-1 caption-4 gold-accent transition-colors hover:bg-accent-gold hover:text-bg-main focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold whitespace-nowrap"
              >
                <ArrowsLeftRight size={14} weight="bold" aria-hidden="true" />
                <span>Switch Direction</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-1.5 rounded-lg border border-border-subtle bg-bg-raised p-1">
              <button
                type="button"
                onClick={() => handleSwitchDirection('rupees-to-percent')}
                className={`min-h-[38px] rounded-md px-3 py-1.5 caption-4 transition-colors whitespace-nowrap ${
                  isRupeesToPercent
                    ? 'bg-accent-gold text-bg-main font-semibold'
                    : 'text-secondary hover:text-primary'
                }`}
              >
                ₹ → % (Rupees to %)
              </button>
              <button
                type="button"
                onClick={() => handleSwitchDirection('percent-to-rupees')}
                className={`min-h-[38px] rounded-md px-3 py-1.5 caption-4 transition-colors whitespace-nowrap ${
                  !isRupeesToPercent
                    ? 'bg-accent-gold text-bg-main font-semibold'
                    : 'text-secondary hover:text-primary'
                }`}
              >
                % → ₹ (% to Rupees)
              </button>
            </div>
          </div>

          {/* Value to Convert Input */}
          <InputField
            id="ratio-value-input"
            label={
              isRupeesToPercent
                ? 'Rupee Amount to Convert (₹)'
                : 'Percentage to Convert (%)'
            }
            value={inputValueRaw}
            onChange={setInputValueRaw}
            placeholder={isRupeesToPercent ? 'e.g. 1' : 'e.g. 12'}
            prefix={isRupeesToPercent ? '₹' : undefined}
            suffix={!isRupeesToPercent ? '%' : undefined}
            showIndianScale={isRupeesToPercent}
            error={parsedInputValue.error}
            helperText={
              isRupeesToPercent
                ? 'Output will be calculated in Percentage (%).'
                : 'Output will be calculated in Rupees (₹).'
            }
            quickChips={
              isRupeesToPercent
                ? [
                    { label: '₹1', value: '1' },
                    { label: '₹5', value: '5' },
                    { label: '₹10', value: '10' },
                    { label: '₹25', value: '25' },
                  ]
                : [
                    { label: '12%', value: '12' },
                    { label: '60%', value: '60' },
                    { label: '100%', value: '100' },
                    { label: '120%', value: '120' },
                  ]
            }
          />

          <div className="pt-2">
            <ResultActions onReset={handleReset} summaryText={summaryText} />
          </div>
        </div>
      </div>

      {/* Right Output Column */}
      <div className="space-y-5 lg:col-span-7">
        {!result ? (
          <EmptyState
            title={
              isRupeesToPercent
                ? 'Enter a Rupee Amount (₹) to Convert to %'
                : 'Enter a Percentage (%) to Convert to ₹'
            }
            description="With ₹1 = 12%, entering ₹1 gives 12% and entering 12% gives ₹1. Switch direction anytime."
            presets={[
              {
                label: '₹ → % · Enter ₹1 → 12%',
                description: 'Converts ₹1 to 12%',
                onSelect: () => {
                  setDirection('rupees-to-percent');
                  setInputValueRaw('1');
                },
              },
              {
                label: '₹ → % · Enter ₹5 → 60%',
                description: 'Converts ₹5 to 60%',
                onSelect: () => {
                  setDirection('rupees-to-percent');
                  setInputValueRaw('5');
                },
              },
              {
                label: '% → ₹ · Enter 12% → ₹1',
                description: 'Converts 12% back to ₹1',
                onSelect: () => {
                  setDirection('percent-to-rupees');
                  setInputValueRaw('12');
                },
              },
              {
                label: '% → ₹ · Enter 60% → ₹5',
                description: 'Converts 60% back to ₹5',
                onSelect: () => {
                  setDirection('percent-to-rupees');
                  setInputValueRaw('60');
                },
              },
            ]}
          />
        ) : (
          <>
            {/* Spotlight Conversion Result */}
            <div className="rounded-xl border border-[#D4AF37]/40 bg-[#131209] p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <span className="text-xs font-medium text-[#E5C158]">
                    {isRupeesToPercent
                      ? 'Converted Percentage (%)'
                      : 'Converted Rupee Amount (₹)'}
                  </span>
                  <div className="font-mono-num mt-1.5 text-3xl font-bold tracking-tight text-white">
                    {isRupeesToPercent
                      ? `${formatNumberIN(result.rupeesToPercentValue, 4)}%`
                      : formatINR(result.percentToRupeesValue)}
                  </div>
                  <p className="font-mono-num mt-1.5 text-xs text-zinc-300">
                    {isRupeesToPercent
                      ? `${formatINR(result.valueToConvert)} → ${formatNumberIN(
                          result.rupeesToPercentValue,
                          4
                        )}%`
                      : `${formatNumberIN(result.valueToConvert, 4)}% → ${formatINR(
                          result.percentToRupeesValue
                        )}`}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-xs text-zinc-400">Conversion Ratio</span>
                  <div className="font-mono-num mt-0.5 text-base font-semibold text-[#E5C158]">
                    ₹1 = 12%
                  </div>
                  <span className="mt-0.5 block text-[11px] text-zinc-400">
                    {isRupeesToPercent
                      ? `Input: Rupees (₹) · Output: Percentage (%)`
                      : `Input: Percentage (%) · Output: Rupees (₹)`}
                  </span>
                </div>
              </div>
            </div>

            {/* Formula & Step-by-Step Breakdown */}
            <div className="rounded-xl border border-white/[0.08] bg-[#111116] p-5 sm:p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.08] pb-3">
                <h3 className="font-display text-sm font-semibold text-white">
                  Formula & Calculation Steps
                </h3>
                <code className="font-mono-num rounded bg-[#181820] px-2.5 py-1 text-xs text-[#E5C158]">
                  {activeFormula}
                </code>
              </div>

              <ol className="space-y-2.5 text-xs text-zinc-300 sm:text-sm">
                {(isRupeesToPercent
                  ? result.rupeesToPercentSteps
                  : result.percentToRupeesSteps
                ).map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="font-mono-num mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded border border-[#D4AF37]/30 bg-[#D4AF37]/10 text-xs font-semibold text-[#E5C158]">
                      {i + 1}
                    </span>
                    <span className="font-mono-num leading-relaxed">{step}</span>
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
