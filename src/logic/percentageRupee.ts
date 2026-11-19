import { formatINR, formatNumberIN, formatPercent } from '../utils/formatters';

export interface PercentageToolResult {
  primaryLabel: string;
  primaryValueFormatted: string;
  secondaryLabel?: string;
  secondaryValueFormatted?: string;
  formula: string;
  steps: string[];
}

export function calcPercentOfNumber(percent: number, baseNumber: number): PercentageToolResult {
  const result = (percent / 100) * baseNumber;
  return {
    primaryLabel: `${formatNumberIN(percent, 4)}% of ${formatNumberIN(baseNumber, 4)}`,
    primaryValueFormatted: formatNumberIN(result, 4),
    secondaryLabel: 'In Rupees (if base is ₹)',
    secondaryValueFormatted: formatINR(result),
    formula: 'Value = (X ÷ 100) × Number',
    steps: [
      `Convert percentage to decimal: ${formatNumberIN(percent, 4)} ÷ 100 = ${(percent / 100).toFixed(6)}`,
      `Multiply by base number: ${(percent / 100).toFixed(6)} × ${formatNumberIN(baseNumber, 4)} = ${formatNumberIN(result, 4)}`,
    ],
  };
}

export function calcWhatPercent(part: number, whole: number): PercentageToolResult {
  const percentage = (part / whole) * 100;
  return {
    primaryLabel: `${formatNumberIN(part, 4)} as a % of ${formatNumberIN(whole, 4)}`,
    primaryValueFormatted: formatPercent(percentage, 4),
    formula: 'Percentage = (Part ÷ Whole) × 100',
    steps: [
      `Divide Part by Whole: ${formatNumberIN(part, 4)} ÷ ${formatNumberIN(whole, 4)} = ${(part / whole).toFixed(6)}`,
      `Multiply by 100: ${(part / whole).toFixed(6)} × 100 = ${formatPercent(percentage, 4)}`,
    ],
  };
}

export function calcPercentChange(
  initialValue: number,
  finalValue: number
): PercentageToolResult & { direction: 'increase' | 'decrease' | 'unchanged' } {
  const diff = finalValue - initialValue;
  const pctChange = (diff / Math.abs(initialValue)) * 100;
  const direction = diff > 0 ? 'increase' : diff < 0 ? 'decrease' : 'unchanged';
  const absPct = Math.abs(pctChange);

  const label =
    direction === 'increase'
      ? 'Percentage Increase'
      : direction === 'decrease'
      ? 'Percentage Decrease'
      : 'No Change';

  return {
    direction,
    primaryLabel: label,
    primaryValueFormatted: `${direction === 'decrease' ? '-' : direction === 'increase' ? '+' : ''}${formatPercent(absPct, 4)}`,
    secondaryLabel: 'Absolute Difference',
    secondaryValueFormatted: `${diff >= 0 ? '+' : ''}${formatNumberIN(diff, 4)}`,
    formula: '% Change = [(Final − Initial) ÷ |Initial|] × 100',
    steps: [
      `Calculate difference: ${formatNumberIN(finalValue, 4)} − ${formatNumberIN(initialValue, 4)} = ${formatNumberIN(diff, 4)}`,
      `Divide by |Initial|: ${formatNumberIN(diff, 4)} ÷ ${formatNumberIN(Math.abs(initialValue), 4)} = ${(diff / Math.abs(initialValue)).toFixed(6)}`,
      `Multiply by 100: ${formatPercent(pctChange, 4)} (${label})`,
    ],
  };
}

export function calcOriginalBeforeChange(
  finalValue: number,
  percent: number,
  mode: 'increase' | 'discount'
): PercentageToolResult {
  const factor = mode === 'increase' ? 1 + percent / 100 : 1 - percent / 100;
  const original = finalValue / factor;
  const adjustmentAmount = Math.abs(finalValue - original);

  return {
    primaryLabel: `Original Value (Before ${formatNumberIN(percent, 4)}% ${mode === 'increase' ? 'Increase' : 'Discount'})`,
    primaryValueFormatted: formatNumberIN(original, 4),
    secondaryLabel: mode === 'increase' ? 'Markup / Tax Component' : 'Discount Saved',
    secondaryValueFormatted: formatNumberIN(adjustmentAmount, 4),
    formula:
      mode === 'increase'
        ? 'Original = Final ÷ (1 + Rate ÷ 100)'
        : 'Original = Final ÷ (1 − Rate ÷ 100)',
    steps: [
      mode === 'increase'
        ? `Compute multiplier: 1 + (${formatNumberIN(percent, 4)} ÷ 100) = ${factor.toFixed(6)}`
        : `Compute multiplier: 1 − (${formatNumberIN(percent, 4)} ÷ 100) = ${factor.toFixed(6)}`,
      `Divide final value by multiplier: ${formatNumberIN(finalValue, 4)} ÷ ${factor.toFixed(6)} = ${formatNumberIN(original, 4)}`,
      `Verify: ${formatNumberIN(original, 4)} ${mode === 'increase' ? '+' : '−'} ${formatNumberIN(percent, 4)}% = ${formatNumberIN(finalValue, 4)}`,
    ],
  };
}

export interface CustomRupeePercentResult {
  matchingRupees: number;
  matchingPercent: number;
  valueToConvert: number;
  rupeesToPercentValue: number;
  percentToRupeesValue: number;
  ratioPercentPerRupee: number;
  ratioRupeesPerPercent: number;
  rupeesToPercentFormula: string;
  percentToRupeesFormula: string;
  rupeesToPercentSteps: string[];
  percentToRupeesSteps: string[];
}

export function calcCustomRupeePercent(
  matchingRupees: number,
  matchingPercent: number,
  valueToConvert: number
): CustomRupeePercentResult {
  const ratioPercentPerRupee = matchingPercent / matchingRupees;
  const ratioRupeesPerPercent = matchingRupees / matchingPercent;

  const rupeesToPercentValue = valueToConvert * ratioPercentPerRupee;
  const percentToRupeesValue = valueToConvert * ratioRupeesPerPercent;

  return {
    matchingRupees,
    matchingPercent,
    valueToConvert,
    rupeesToPercentValue,
    percentToRupeesValue,
    ratioPercentPerRupee,
    ratioRupeesPerPercent,
    rupeesToPercentFormula: 'Percentage = Rupees × (Matching % ÷ Matching ₹)',
    percentToRupeesFormula: 'Rupees = Percentage × (Matching ₹ ÷ Matching %)',
    rupeesToPercentSteps: [
      `Ratio defined: ${formatINR(matchingRupees)} = ${formatNumberIN(matchingPercent, 4)}%`,
      `Rate per ₹1: ${formatNumberIN(matchingPercent, 4)}% ÷ ${formatNumberIN(matchingRupees, 4)} = ${formatNumberIN(ratioPercentPerRupee, 6)}% per ₹1`,
      `Convert ${formatINR(valueToConvert)}: ${formatNumberIN(valueToConvert, 4)} × ${formatNumberIN(ratioPercentPerRupee, 6)}% = ${formatNumberIN(rupeesToPercentValue, 4)}%`,
    ],
    percentToRupeesSteps: [
      `Ratio defined: ${formatNumberIN(matchingPercent, 4)}% = ${formatINR(matchingRupees)}`,
      `Rupee value per 1%: ${formatNumberIN(matchingRupees, 4)} ÷ ${formatNumberIN(matchingPercent, 4)} = ${formatINR(ratioRupeesPerPercent, 4)} per 1%`,
      `Convert ${formatNumberIN(valueToConvert, 4)}%: ${formatNumberIN(valueToConvert, 4)} × ${formatNumberIN(ratioRupeesPerPercent, 6)} = ${formatINR(percentToRupeesValue)}`,
    ],
  };
}
