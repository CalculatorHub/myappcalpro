import { formatINR, formatNumberIN, formatPercent } from '../utils/formatters';

export type CompoundingFrequency =
  | 'annually'
  | 'half-yearly'
  | 'quarterly'
  | 'monthly'
  | 'daily';

export type CompoundTimeUnit = 'years' | 'months';

export const COMPOUNDING_PERIODS_PER_YEAR: Record<CompoundingFrequency, { n: number; label: string }> = {
  annually: { n: 1, label: 'Annually (1×/yr)' },
  'half-yearly': { n: 2, label: 'Half-Yearly (2×/yr)' },
  quarterly: { n: 4, label: 'Quarterly (4×/yr)' },
  monthly: { n: 12, label: 'Monthly (12×/yr)' },
  daily: { n: 365, label: 'Daily (365×/yr)' },
};

export interface CompoundInterestInput {
  principal: number;
  annualRate: number;
  timeValue: number;
  timeUnit: CompoundTimeUnit;
  frequency: CompoundingFrequency;
}

export interface CompoundGrowthRow {
  periodLabel: string;
  yearNumber: number;
  openingBalance: number;
  interestEarned: number;
  closingBalance: number;
  cumulativeInterest: number;
  principalShare: number;
}

export interface CompoundInterestResult {
  principal: number;
  annualRate: number;
  timeInYears: number;
  frequency: CompoundingFrequency;
  compoundingPerYear: number;
  totalPeriods: number;
  totalAmount: number;
  compoundInterest: number;
  effectiveAnnualRate: number;
  formula: string;
  assumptions: string[];
  steps: string[];
  yearlySchedule: CompoundGrowthRow[];
}

export function calculateCompoundInterest(input: CompoundInterestInput): CompoundInterestResult {
  const { principal, annualRate, timeValue, timeUnit, frequency } = input;
  const n = COMPOUNDING_PERIODS_PER_YEAR[frequency].n;
  const tYears = timeUnit === 'months' ? timeValue / 12 : timeValue;

  const rateDecimal = annualRate / 100;
  const periodicRate = rateDecimal / n;
  const totalPeriods = n * tYears;

  const totalAmount = principal * Math.pow(1 + periodicRate, totalPeriods);
  const compoundInterest = totalAmount - principal;
  const effectiveAnnualRate = (Math.pow(1 + periodicRate, n) - 1) * 100;

  const yearlySchedule: CompoundGrowthRow[] = [];
  const totalYearsCeil = Math.max(1, Math.ceil(tYears));

  let prevBalance = principal;
  for (let yr = 1; yr <= totalYearsCeil; yr++) {
    const elapsedYears = Math.min(yr, tYears);
    const prevElapsed = yr - 1;
    const isPartial = elapsedYears - prevElapsed < 0.9999;

    const closingBalance = principal * Math.pow(1 + periodicRate, n * elapsedYears);
    const interestEarned = closingBalance - prevBalance;
    const cumulativeInterest = closingBalance - principal;

    yearlySchedule.push({
      periodLabel: isPartial
        ? `Yr ${yr} (${formatNumberIN(elapsedYears - prevElapsed, 2)} yr)`
        : `Year ${yr}`,
      yearNumber: yr,
      openingBalance: prevBalance,
      interestEarned,
      closingBalance,
      cumulativeInterest,
      principalShare: principal,
    });

    prevBalance = closingBalance;
  }

  const assumptions = [
    `Compounding frequency is ${COMPOUNDING_PERIODS_PER_YEAR[frequency].label} (n = ${n}).`,
    'Nominal annual interest rate remains constant throughout the tenure.',
    'All earned interest is reinvested without interim withdrawals or tax deductions (TDS).',
    frequency === 'daily'
      ? 'Daily compounding uses a standard 365-day year convention.'
      : 'Each compounding period carries an equal periodic rate of (R ÷ n).',
  ];

  const steps = [
    timeUnit === 'months'
      ? `Convert tenure to years: t = ${formatNumberIN(timeValue)} ÷ 12 = ${formatNumberIN(tYears, 4)} years`
      : `Tenure: t = ${formatNumberIN(tYears, 4)} years`,
    `Periodic rate (r/n) = ${annualRate}% ÷ ${n} = ${formatPercent(periodicRate * 100, 4)} per period`,
    `Total compounding periods (n × t) = ${n} × ${formatNumberIN(tYears, 4)} = ${formatNumberIN(totalPeriods, 4)}`,
    `Total Amount (A) = ${formatINR(principal)} × (1 + ${periodicRate.toFixed(6)})^${formatNumberIN(totalPeriods, 4)} = ${formatINR(totalAmount)}`,
    `Compound Interest (CI) = A − P = ${formatINR(totalAmount)} − ${formatINR(principal)} = ${formatINR(compoundInterest)}`,
  ];

  return {
    principal,
    annualRate,
    timeInYears: tYears,
    frequency,
    compoundingPerYear: n,
    totalPeriods,
    totalAmount,
    compoundInterest,
    effectiveAnnualRate,
    formula: 'A = P × (1 + r / n)^(n × t)   |   CI = A − P',
    assumptions,
    steps,
    yearlySchedule,
  };
}
