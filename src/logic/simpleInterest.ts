import { formatINR, formatNumberIN } from '../utils/formatters';

export type SimpleTimeUnit = 'years' | 'months' | 'days';

export interface SimpleInterestInput {
  principal: number;
  annualRate: number;
  timeValue: number;
  timeUnit: SimpleTimeUnit;
  daysInYear?: 365 | 360;
}

export interface SimpleInterestResult {
  principal: number;
  annualRate: number;
  timeValue: number;
  timeUnit: SimpleTimeUnit;
  daysInYear: 365 | 360;
  timeInYears: number;
  simpleInterest: number;
  totalAmount: number;
  formula: string;
  steps: string[];
}

export function calculateSimpleInterest(input: SimpleInterestInput): SimpleInterestResult {
  const { principal, annualRate, timeValue, timeUnit, daysInYear = 365 } = input;

  let timeInYears = timeValue;
  let timeConversionStep = `Time (T) = ${formatNumberIN(timeValue)} years`;

  if (timeUnit === 'months') {
    timeInYears = timeValue / 12;
    timeConversionStep = `Convert months to years: T = ${formatNumberIN(timeValue)} ÷ 12 = ${formatNumberIN(timeInYears, 6)} years`;
  } else if (timeUnit === 'days') {
    timeInYears = timeValue / daysInYear;
    timeConversionStep = `Convert days to years (${daysInYear}-day basis): T = ${formatNumberIN(timeValue)} ÷ ${daysInYear} = ${formatNumberIN(timeInYears, 6)} years`;
  }

  const simpleInterest = (principal * annualRate * timeInYears) / 100;
  const totalAmount = principal + simpleInterest;

  const steps: string[] = [
    timeConversionStep,
    `Apply formula: SI = (${formatINR(principal)} × ${annualRate}% × ${formatNumberIN(timeInYears, 6)}) ÷ 100`,
    `Simple Interest (SI) = ${formatINR(simpleInterest)}`,
    `Total Maturity Amount (A) = Principal + SI = ${formatINR(principal)} + ${formatINR(simpleInterest)} = ${formatINR(totalAmount)}`,
  ];

  return {
    principal,
    annualRate,
    timeValue,
    timeUnit,
    daysInYear,
    timeInYears,
    simpleInterest,
    totalAmount,
    formula: 'SI = (P × R × T) ÷ 100   |   A = P + SI',
    steps,
  };
}
