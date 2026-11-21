import React, { useMemo, useRef, useState } from 'react';
import { ArrowLeftRight } from 'lucide-react';
import { NumberInput } from '../ui/NumberInput';
import { AnimatedNumber } from '../ui/AnimatedNumber';
import { TiltCard3D } from '../ui/TiltCard3D';
import { FormulaAccordion } from '../ui/FormulaAccordion';
import { CalcActionBar } from '../ui/CalcActionBar';
import { ResultActionsBar, ResultEmptyState } from '../ui/ResultStateHeader';
import {
  calculateCustomRupeeRatio,
  calculatePercentageTool,
  type PercentageToolMode,
  type RatioDirection,
} from '../../logic/calculators';
import { formatNumber } from '../../utils/formatters';
import { downloadCsvFile } from '../../utils/exportUtils';
import type { CalculationHistoryItem } from '../../utils/storage';

interface RatioErrors {
  inputValue?: string;
  rateRupee?: string;
  ratePercent?: string;
}

interface PctToolErrors {
  valueA?: string;
  valueB?: string;
}

interface PercentageRupeeCalcProps {
  onSaveHistory?: (entry: Omit<CalculationHistoryItem, 'id' | 'timestamp'>) => void;
}

export const PercentageRupeeCalc: React.FC<PercentageRupeeCalcProps> = ({
  onSaveHistory,
}) => {
  // Section 1: Custom Rupee <-> Percentage Ratio Converter
  const [direction, setDirection] = useState<RatioDirection>('inr-to-pct');
  const [inputStr, setInputStr] = useState<string>('0');
  const [rateRupeeStr, setRateRupeeStr] = useState<string>('0');
  const [ratePercentStr, setRatePercentStr] = useState<string>('0');
  const [ratioTouched, setRatioTouched] = useState<Partial<Record<keyof RatioErrors, boolean>>>({});
  const [ratioSubmitted, setRatioSubmitted] = useState<boolean>(false);
  const ratioResultsRef = useRef<HTMLDivElement | null>(null);

  // Section 2: Standard Percentage Tools
  const [toolMode, setToolMode] = useState<PercentageToolMode>('percent-of-amount');
  const [toolAStr, setToolAStr] = useState<string>('0');
  const [toolBStr, setToolBStr] = useState<string>('0');
  const [toolTouched, setToolTouched] = useState<Partial<Record<keyof PctToolErrors, boolean>>>({});
  const [toolSubmitted, setToolSubmitted] = useState<boolean>(false);
  const toolResultsRef = useRef<HTMLDivElement | null>(null);

  const inputNum = inputStr.trim() === '' ? NaN : Number(inputStr);
  const rateRupeeNum = rateRupeeStr.trim() === '' ? NaN : Number(rateRupeeStr);
  const ratePercentNum = ratePercentStr.trim() === '' ? NaN : Number(ratePercentStr);

  const ratioErrors = useMemo<RatioErrors>(() => {
    const next: RatioErrors = {};
    if (inputStr.trim() === '' || !Number.isFinite(inputNum) || inputNum < 0) {
      next.inputValue =
        direction === 'inr-to-pct'
          ? 'Enter a valid non-negative rupee amount.'
          : 'Enter a valid non-negative percentage value.';
    }
    if (rateRupeeStr.trim() === '' || !Number.isFinite(rateRupeeNum) || rateRupeeNum <= 0) {
      next.rateRupee = 'Rate rupee amount must be greater than 0.';
    }
    if (ratePercentStr.trim() === '' || !Number.isFinite(ratePercentNum) || ratePercentNum === 0) {
      next.ratePercent = 'Rate percentage cannot be 0.';
    }
    return next;
  }, [inputStr, inputNum, rateRupeeStr, rateRupeeNum, ratePercentStr, ratePercentNum, direction]);

  const isRatioEmpty =
    inputStr.trim() === '' && rateRupeeStr.trim() === '' && ratePercentStr.trim() === '';
  const isRatioValid = Object.keys(ratioErrors).length === 0;

  const ratioResult = useMemo(() => {
    if (!isRatioValid) return null;
    return calculateCustomRupeeRatio(inputNum, direction, rateRupeeNum, ratePercentNum);
  }, [isRatioValid, inputNum, direction, rateRupeeNum, ratePercentNum]);

  const handleSwitchDirection = () => {
    setDirection((prev) => (prev === 'inr-to-pct' ? 'pct-to-inr' : 'inr-to-pct'));
  };

  const handleLoadRatioExample = (
    dir: RatioDirection,
    val: string,
    rInr: string,
    rPct: string
  ) => {
    setDirection(dir);
    setInputStr(val);
    setRateRupeeStr(rInr);
    setRatePercentStr(rPct);
    setRatioTouched({});
    setRatioSubmitted(false);
  };

  const handleCalculateRatio = () => {
    setRatioSubmitted(true);
    if (ratioResult && onSaveHistory) {
      const inrToPct = ratioResult.direction === 'inr-to-pct';
      onSaveHistory({
        calculatorId: 'percentage-rupee',
        calculatorTitle: 'Percentage & Rupee Conversion',
        primaryMetricLabel: inrToPct ? 'Converted Result (%)' : 'Converted Result (₹)',
        primaryMetricValue: inrToPct
          ? `${formatNumber(ratioResult.outputValue, 4)}%`
          : `₹${formatNumber(ratioResult.outputValue, 4)}`,
        summaryLine: `Ratio ₹${formatNumber(ratioResult.rateRupee, 4)} = ${formatNumber(ratioResult.ratePercent, 4)}% · Input ${
          inrToPct
            ? `₹${formatNumber(ratioResult.inputValue, 4)}`
            : `${formatNumber(ratioResult.inputValue, 4)}%`
        }`,
      });
    }
    if (isRatioValid && ratioResultsRef.current && window.innerWidth < 1024) {
      ratioResultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleResetRatio = () => {
    setInputStr('0');
    setRateRupeeStr('0');
    setRatePercentStr('0');
    setRatioTouched({});
    setRatioSubmitted(false);
  };

  const handleExportRatioCsv = () => {
    if (!ratioResult) return;
    const inrToPct = ratioResult.direction === 'inr-to-pct';
    downloadCsvFile(
      'calhub-rupee-percentage-ratio.csv',
      ['Direction', 'Reference Ratio', 'Input Value', 'Converted Result', 'Formula'],
      [
        [
          inrToPct ? 'Rupees (INR) to Percentage (%)' : 'Percentage (%) to Rupees (INR)',
          `INR ${ratioResult.rateRupee} = ${ratioResult.ratePercent}%`,
          inrToPct ? `INR ${ratioResult.inputValue}` : `${ratioResult.inputValue}%`,
          inrToPct
            ? `${formatNumber(ratioResult.outputValue, 4)}%`
            : `INR ${formatNumber(ratioResult.outputValue, 4)}`,
          ratioResult.formula,
        ],
      ]
    );
  };

  const toolANum = toolAStr.trim() === '' ? NaN : Number(toolAStr);
  const toolBNum = toolBStr.trim() === '' ? NaN : Number(toolBStr);

  const toolErrors = useMemo<PctToolErrors>(() => {
    const next: PctToolErrors = {};
    if (toolAStr.trim() === '' || !Number.isFinite(toolANum)) {
      next.valueA = 'Enter a valid number.';
    } else if (toolMode === 'percent-change' && toolANum === 0) {
      next.valueA = 'Original amount cannot be ₹0 for percentage change.';
    }
    if (toolBStr.trim() === '' || !Number.isFinite(toolBNum)) {
      next.valueB = 'Enter a valid number.';
    } else if (toolMode === 'amount-as-percent' && toolBNum === 0) {
      next.valueB = 'Total amount cannot be ₹0.';
    }
    return next;
  }, [toolAStr, toolANum, toolBStr, toolBNum, toolMode]);

  const isToolDefaultZero =
    toolAStr.trim() === '0' && toolBStr.trim() === '0' && !toolSubmitted;
  const isToolValid = Object.keys(toolErrors).length === 0;
  const toolResult = useMemo(() => {
    if (!isToolValid || isToolDefaultZero) return null;
    return calculatePercentageTool(toolMode, toolANum, toolBNum);
  }, [isToolValid, isToolDefaultZero, toolMode, toolANum, toolBNum]);

  const handleCalculateTool = () => {
    setToolSubmitted(true);
    if (toolResult && onSaveHistory) {
      onSaveHistory({
        calculatorId: 'percentage-rupee',
        calculatorTitle: 'Standard Percentage Tool',
        primaryMetricLabel: 'Computed Percentage Result',
        primaryMetricValue: toolResult.formattedResult,
        summaryLine: `${toolResult.formula} · Inputs (${toolAStr}, ${toolBStr})`,
      });
    }
    if (isToolValid && toolResultsRef.current && window.innerWidth < 1024) {
      toolResultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleExportToolCsv = () => {
    if (!toolResult) return;
    downloadCsvFile(
      'calhub-percentage-utility.csv',
      ['Mode', 'Input A', 'Input B', 'Result', 'Formula'],
      [[toolResult.mode, toolAStr, toolBStr, toolResult.formattedResult, toolResult.formula]]
    );
  };

  const isInrToPct = direction === 'inr-to-pct';

  const ratioCopySummary = ratioResult
    ? [
        'Rupee & Percentage Conversion — CalHub FinCalc Pro',
        `Direction: ${isInrToPct ? 'Rupees (₹) → Percentage (%)' : 'Percentage (%) → Rupees (₹)'}`,
        `User-Defined Reference Ratio: ₹${formatNumber(ratioResult.rateRupee, 4)} = ${formatNumber(ratioResult.ratePercent, 4)}%`,
        `Input: ${isInrToPct ? `₹${formatNumber(ratioResult.inputValue, 4)}` : `${formatNumber(ratioResult.inputValue, 4)}%`}`,
        `Result: ${isInrToPct ? `${formatNumber(ratioResult.outputValue, 4)}%` : `₹${formatNumber(ratioResult.outputValue, 4)}`}`,
      ].join('\n')
    : '';

  const toolCopySummary = toolResult
    ? [
        'Percentage Utility Result — CalHub FinCalc Pro',
        `Mode: ${toolMode}`,
        `Result: ${toolResult.formattedResult}`,
        `Formula: ${toolResult.formula}`,
      ].join('\n')
    : '';

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        <div className="luxury-card p-6 space-y-5 lg:col-span-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-white">
                Rupee &amp; Percentage Converter
              </h3>
              <p className="mt-1 text-sm text-[#A1A1AA]">
                Two-way converter using your editable reference ratio.
              </p>
            </div>
            <button
              type="button"
              onClick={handleSwitchDirection}
              aria-label="Switch conversion direction"
              className="inline-flex items-center gap-2 rounded-xl border border-[#D4AF37]/40 bg-[#D4AF37]/12 px-3 py-1.5 text-xs font-semibold text-[#F5D76E] transition-colors hover:bg-[#D4AF37]/20 whitespace-nowrap cursor-pointer focus-visible:outline-2 focus-visible:outline-[#D4AF37]"
            >
              <ArrowLeftRight className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Switch ({isInrToPct ? '₹ → %' : '% → ₹'})</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 border-b border-[#D4AF37]/15 pb-4">
            <span className="text-xs font-medium text-[#A1A1AA]">Examples:</span>
            <button
              type="button"
              onClick={() => handleLoadRatioExample('inr-to-pct', '5', '1', '12')}
              className="rounded-xl border border-[#D4AF37]/25 bg-white/[0.03] px-2.5 py-1 text-xs font-medium text-[#E4E4E7] transition-colors hover:border-[#F5D76E] hover:text-[#F5D76E] cursor-pointer"
            >
              ₹5 at ₹1 = 12%
            </button>
            <button
              type="button"
              onClick={() => handleLoadRatioExample('pct-to-inr', '60', '1', '12')}
              className="rounded-xl border border-[#D4AF37]/25 bg-white/[0.03] px-2.5 py-1 text-xs font-medium text-[#E4E4E7] transition-colors hover:border-[#F5D76E] hover:text-[#F5D76E] cursor-pointer"
            >
              60% at ₹1 = 12%
            </button>
          </div>

          <div
            role="group"
            aria-label="Conversion direction"
            className="flex rounded-xl border border-[#D4AF37]/20 bg-[#0B0B0D] p-1"
          >
            <button
              type="button"
              onClick={() => setDirection('inr-to-pct')}
              className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors cursor-pointer ${
                isInrToPct
                  ? 'bg-[#D4AF37] text-[#050505] font-semibold'
                  : 'text-[#A1A1AA] hover:text-white'
              }`}
            >
              Rupees → % (₹ → %)
            </button>
            <button
              type="button"
              onClick={() => setDirection('pct-to-inr')}
              className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors cursor-pointer ${
                !isInrToPct
                  ? 'bg-[#D4AF37] text-[#050505] font-semibold'
                  : 'text-[#A1A1AA] hover:text-white'
              }`}
            >
              Percentage → ₹ (% → ₹)
            </button>
          </div>

          <NumberInput
            id="ratio-input"
            label={isInrToPct ? 'Input Amount in Rupees (₹)' : 'Input Value in Percentage (%)'}
            prefix={isInrToPct ? '₹' : undefined}
            suffix={!isInrToPct ? '%' : undefined}
            step="any"
            placeholder="0"
            value={inputStr}
            onChange={(val) => {
              setInputStr(val);
              setRatioTouched((prev) => ({ ...prev, inputValue: true }));
            }}
            error={
              ratioSubmitted || ratioTouched.inputValue ? ratioErrors.inputValue : undefined
            }
            helperText={
              isInrToPct
                ? 'Updates live as you type. Output will be shown in %.'
                : 'Updates live as you type. Output will be shown in ₹.'
            }
          />

          <div className="luxury-subcard p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold text-white">
                User-Defined Reference Ratio
              </span>
              <span className="font-mono text-xs font-semibold text-[#F5D76E] tabular-nums">
                ₹{rateRupeeStr || '0'} = {ratePercentStr || '0'}%
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <NumberInput
                id="ratio-rate-rupee"
                label="Rate Rupee Amount"
                prefix="₹"
                step="any"
                placeholder="0"
                value={rateRupeeStr}
                onChange={(val) => {
                  setRateRupeeStr(val);
                  setRatioTouched((prev) => ({ ...prev, rateRupee: true }));
                }}
                error={
                  ratioSubmitted || ratioTouched.rateRupee ? ratioErrors.rateRupee : undefined
                }
              />
              <NumberInput
                id="ratio-rate-percent"
                label="Rate Percentage"
                suffix="%"
                step="any"
                placeholder="0"
                value={ratePercentStr}
                onChange={(val) => {
                  setRatePercentStr(val);
                  setRatioTouched((prev) => ({ ...prev, ratePercent: true }));
                }}
                error={
                  ratioSubmitted || ratioTouched.ratePercent
                    ? ratioErrors.ratePercent
                    : undefined
                }
              />
            </div>

            <p className="text-xs leading-relaxed text-[#A1A1AA]">
              User-defined conversion ratio, not a standard currency exchange rate. Enter your reference rupee and percentage ratio above.
            </p>
          </div>

          <CalcActionBar onCalculate={handleCalculateRatio} onReset={handleResetRatio} />
        </div>

        <div ref={ratioResultsRef} className="space-y-5 lg:col-span-7">
          {!ratioResult ? (
            <ResultEmptyState
              hasErrors={
                !isRatioEmpty &&
                !isRatioValid &&
                (ratioSubmitted ||
                  Boolean(
                    ratioTouched.inputValue ||
                      ratioTouched.rateRupee ||
                      ratioTouched.ratePercent
                  ))
              }
              message={
                !isRatioValid &&
                (ratioSubmitted ||
                  Boolean(
                    ratioTouched.inputValue ||
                      ratioTouched.rateRupee ||
                      ratioTouched.ratePercent
                  ))
                  ? 'Make sure the input value is valid, Rate Rupee Amount is greater than 0, and Rate Percentage is not 0.'
                  : undefined
              }
              onLoadExample={() => handleLoadRatioExample('inr-to-pct', '5', '1', '12')}
            />
          ) : (
            <>
              <TiltCard3D className="luxury-card-accent p-6 space-y-5" maxTiltDeg={2.5}>
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#D4AF37]/20 pb-4">
                  <div>
                    <p className="text-xs font-semibold text-[#F5D76E]">
                      {isInrToPct ? 'Converted Result (%)' : 'Converted Result (₹)'}
                    </p>
                    <p className="mt-1 font-mono text-3xl font-bold text-white tabular-nums sm:text-4xl">
                      <AnimatedNumber
                        value={ratioResult.outputValue}
                        format={(n) =>
                          isInrToPct ? `${formatNumber(n, 4)}%` : `₹${formatNumber(n, 4)}`
                        }
                      />
                    </p>
                    <p className="mt-2 font-mono text-xs text-[#A1A1AA] tabular-nums">
                      {isInrToPct
                        ? `₹${formatNumber(ratioResult.inputValue, 4)} → ${formatNumber(ratioResult.outputValue, 4)}%`
                        : `${formatNumber(ratioResult.inputValue, 4)}% → ₹${formatNumber(ratioResult.outputValue, 4)}`}
                    </p>
                  </div>
                  <ResultActionsBar
                    shareTitle="Rupee & Percentage Conversion — CalHub FinCalc Pro"
                    summaryText={ratioCopySummary}
                    onExportCsv={handleExportRatioCsv}
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="luxury-subcard p-4">
                    <p className="text-xs text-[#A1A1AA]">
                      Input ({isInrToPct ? '₹' : '%'})
                    </p>
                    <p className="mt-1.5 font-mono text-lg font-semibold text-white tabular-nums">
                      {isInrToPct
                        ? `₹${formatNumber(ratioResult.inputValue, 4)}`
                        : `${formatNumber(ratioResult.inputValue, 4)}%`}
                    </p>
                  </div>
                  <div className="luxury-subcard p-4">
                    <p className="text-xs font-medium text-[#F5D76E]">Active Reference Rate</p>
                    <p className="mt-1.5 font-mono text-lg font-semibold text-white tabular-nums">
                      ₹{formatNumber(ratioResult.rateRupee, 4)} = {formatNumber(ratioResult.ratePercent, 4)}%
                    </p>
                  </div>
                  <div className="luxury-subcard p-4">
                    <p className="text-xs text-[#A1A1AA]">Direction</p>
                    <p className="mt-1.5 font-mono text-lg font-semibold text-white">
                      {isInrToPct ? '₹ → %' : '% → ₹'}
                    </p>
                  </div>
                </div>
              </TiltCard3D>

              <FormulaAccordion formula={ratioResult.formula} steps={ratioResult.steps} />
            </>
          )}
        </div>
      </div>

      {/* Companion Section: Standard Percentage Utilities */}
      <div className="grid gap-6 lg:grid-cols-12 items-start border-t border-[#D4AF37]/15 pt-8">
        <div className="luxury-card p-6 space-y-5 lg:col-span-5">
          <div>
            <h3 className="text-lg font-semibold text-white">Standard Percentage Tools</h3>
            <p className="mt-1 text-sm text-[#A1A1AA]">
              Compute X% of a rupee sum, share percentage, or percentage growth/decline.
            </p>
          </div>

          <div
            role="group"
            aria-label="Percentage calculation mode"
            className="grid grid-cols-3 gap-1 rounded-xl border border-[#D4AF37]/20 bg-[#0B0B0D] p-1"
          >
            {(
              [
                { id: 'percent-of-amount', label: 'X% of ₹Y' },
                { id: 'amount-as-percent', label: '₹X of ₹Y (%)' },
                { id: 'percent-change', label: '% Change' },
              ] as { id: PercentageToolMode; label: string }[]
            ).map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  setToolMode(m.id);
                  setToolSubmitted(false);
                }}
                className={`rounded-lg px-2 py-2 text-xs font-medium transition-colors cursor-pointer ${
                  toolMode === m.id
                    ? 'bg-[#D4AF37] text-[#050505] font-semibold'
                    : 'text-[#A1A1AA] hover:text-white'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <NumberInput
              id="pct-tool-a"
              label={
                toolMode === 'percent-of-amount'
                  ? 'Percentage (%)'
                  : toolMode === 'amount-as-percent'
                  ? 'Part Amount (₹)'
                  : 'Original Amount (₹)'
              }
              prefix={toolMode === 'percent-of-amount' ? undefined : '₹'}
              suffix={toolMode === 'percent-of-amount' ? '%' : undefined}
              step="any"
              placeholder="0"
              value={toolAStr}
              onChange={(val) => {
                setToolAStr(val);
                setToolTouched((prev) => ({ ...prev, valueA: true }));
              }}
              error={toolSubmitted || toolTouched.valueA ? toolErrors.valueA : undefined}
            />
            <NumberInput
              id="pct-tool-b"
              label={
                toolMode === 'percent-of-amount'
                  ? 'Base Amount (₹)'
                  : toolMode === 'amount-as-percent'
                  ? 'Total Amount (₹)'
                  : 'New Amount (₹)'
              }
              prefix="₹"
              step="any"
              placeholder="0"
              value={toolBStr}
              onChange={(val) => {
                setToolBStr(val);
                setToolTouched((prev) => ({ ...prev, valueB: true }));
              }}
              error={toolSubmitted || toolTouched.valueB ? toolErrors.valueB : undefined}
            />
          </div>

          <CalcActionBar
            onCalculate={handleCalculateTool}
            onReset={() => {
              setToolAStr('0');
              setToolBStr('0');
              setToolTouched({});
              setToolSubmitted(false);
            }}
          />
        </div>

        <div ref={toolResultsRef} className="space-y-5 lg:col-span-7">
          {!toolResult ? (
            <ResultEmptyState
              hasErrors={
                !isToolValid &&
                (toolSubmitted || Boolean(toolTouched.valueA || toolTouched.valueB))
              }
              onLoadExample={() => {
                setToolMode('percent-of-amount');
                setToolAStr('18');
                setToolBStr('25000');
                setToolTouched({});
              }}
            />
          ) : (
            <>
              <TiltCard3D className="luxury-card-accent p-6 space-y-4" maxTiltDeg={2.5}>
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#D4AF37]/20 pb-4">
                  <div>
                    <p className="text-xs font-semibold text-[#F5D76E]">
                      Computed Percentage Result
                    </p>
                    <p className="mt-1 font-mono text-3xl font-bold text-white tabular-nums">
                      <AnimatedNumber
                        value={toolResult.resultValue}
                        format={(n) => {
                          if (toolMode === 'percent-of-amount') {
                            return `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
                          }
                          const prefix = toolMode === 'percent-change' && n > 0 ? '+' : '';
                          return `${prefix}${n.toLocaleString('en-IN', { maximumFractionDigits: 2 })}%`;
                        }}
                      />
                    </p>
                  </div>
                  <ResultActionsBar
                    shareTitle="Percentage Utility — CalHub FinCalc Pro"
                    summaryText={toolCopySummary}
                    onExportCsv={handleExportToolCsv}
                  />
                </div>
                <p className="font-mono text-xs text-[#A1A1AA]">{toolResult.formula}</p>
              </TiltCard3D>

              <FormulaAccordion formula={toolResult.formula} steps={toolResult.steps} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PercentageRupeeCalc;
