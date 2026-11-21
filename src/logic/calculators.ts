import { INDIAN_TAX_RULES, type FinancialYearId, type TaxRegimeId } from '../data/taxRules';

export type SimpleInterestTimeUnit = 'years' | 'months' | 'days';

export interface GrowthChartPoint {
  label: string;
  period: number;
  principal: number;
  interestEarned: number;
  totalAmount: number;
}

export interface SimpleInterestResult {
  principal: number;
  rate: number;
  timeValue: number;
  timeUnit: SimpleInterestTimeUnit;
  timeInYears: number;
  simpleInterest: number;
  totalAmount: number;
  schedule: GrowthChartPoint[];
  formula: string;
  steps: string[];
}

export function calculateSimpleInterest(
  principal: number,
  rate: number,
  timeValue: number,
  timeUnit: SimpleInterestTimeUnit
): SimpleInterestResult {
  const p = Math.max(0, principal);
  const r = Math.max(0, rate);
  const rawT = Math.max(0, timeValue);

  const divisor = timeUnit === 'years' ? 1 : timeUnit === 'months' ? 12 : 365;
  const timeInYears = rawT / divisor;
  const simpleInterest = (p * r * timeInYears) / 100;
  const totalAmount = p + simpleInterest;

  // Build evenly spaced points for responsive time-vs-amount chart
  const pointCount = Math.min(12, Math.max(4, Math.ceil(rawT || 4)));
  const shortUnit = timeUnit === 'years' ? 'Yr' : timeUnit === 'months' ? 'Mo' : 'Day';
  const schedule: GrowthChartPoint[] = [];

  for (let i = 0; i <= pointCount; i++) {
    const fraction = rawT === 0 ? 0 : i / pointCount;
    const periodVal = rawT * fraction;
    const yearsAtPoint = periodVal / divisor;
    const interestAtPoint = (p * r * yearsAtPoint) / 100;
    const roundedPeriod =
      Math.abs(periodVal - Math.round(periodVal)) < 0.05
        ? Math.round(periodVal)
        : Number(periodVal.toFixed(1));
    schedule.push({
      label: i === 0 ? 'Start' : `${shortUnit} ${roundedPeriod}`,
      period: roundedPeriod,
      principal: p,
      interestEarned: interestAtPoint,
      totalAmount: p + interestAtPoint,
    });
  }

  const unitConversionText =
    timeUnit === 'years'
      ? `${rawT} years`
      : timeUnit === 'months'
      ? `${rawT} months / 12 = ${timeInYears.toFixed(4)} years`
      : `${rawT} days / 365 = ${timeInYears.toFixed(4)} years`;

  return {
    principal: p,
    rate: r,
    timeValue: rawT,
    timeUnit,
    timeInYears,
    simpleInterest,
    totalAmount,
    schedule,
    formula: 'SI = (P × R × T) / 100 and A = P + SI',
    steps: [
      `Convert time to years: T = ${unitConversionText}.`,
      `Substitute P = ₹${p.toLocaleString('en-IN')}, R = ${r}%, and T = ${timeInYears.toFixed(4)} years.`,
      `Simple Interest SI = (${p.toLocaleString('en-IN')} × ${r} × ${timeInYears.toFixed(4)}) / 100 = ₹${simpleInterest.toLocaleString('en-IN', { maximumFractionDigits: 2 })}.`,
      `Total Maturity Amount A = P + SI = ₹${totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}.`,
    ],
  };
}

export type CompoundingFrequency = 'annually' | 'half-yearly' | 'quarterly' | 'monthly' | 'daily';

export const COMPOUNDING_PERIODS: Record<CompoundingFrequency, { n: number; label: string }> = {
  annually: { n: 1, label: 'Annually (1x / year)' },
  'half-yearly': { n: 2, label: 'Half yearly (2x / year)' },
  quarterly: { n: 4, label: 'Quarterly (4x / year)' },
  monthly: { n: 12, label: 'Monthly (12x / year)' },
  daily: { n: 365, label: 'Daily (365x / year)' },
};

export interface CompoundYearRow {
  year: number;
  openingBalance: number;
  interestEarned: number;
  closingBalance: number;
  cumulativeInterest: number;
}

export interface CompoundInterestResult {
  principal: number;
  rate: number;
  years: number;
  frequency: CompoundingFrequency;
  compoundingPeriodsPerYear: number;
  totalAmount: number;
  compoundInterest: number;
  simpleInterestBaseline: number;
  compoundingAdvantage: number;
  effectiveAnnualRate: number;
  yearlySchedule: CompoundYearRow[];
  formula: string;
  assumptions: string[];
}

export function calculateCompoundInterest(
  principal: number,
  rate: number,
  years: number,
  frequency: CompoundingFrequency
): CompoundInterestResult {
  const p = Math.max(0, principal);
  const r = Math.max(0, rate);
  const t = Math.max(0, years);
  const n = COMPOUNDING_PERIODS[frequency].n;
  const decimalRate = r / 100;

  const totalAmount = p * Math.pow(1 + decimalRate / n, n * t);
  const compoundInterest = totalAmount - p;
  const simpleInterestBaseline = (p * r * t) / 100;
  const compoundingAdvantage = Math.max(0, compoundInterest - simpleInterestBaseline);
  const effectiveAnnualRate = (Math.pow(1 + decimalRate / n, n) - 1) * 100;

  const wholeYears = Math.floor(t);
  const yearlySchedule: CompoundYearRow[] = [];
  let opening = p;

  for (let year = 1; year <= wholeYears; year++) {
    const closing = p * Math.pow(1 + decimalRate / n, n * year);
    const interest = closing - opening;
    yearlySchedule.push({
      year,
      openingBalance: opening,
      interestEarned: interest,
      closingBalance: closing,
      cumulativeInterest: closing - p,
    });
    opening = closing;
  }

  if (t > wholeYears) {
    const closing = totalAmount;
    yearlySchedule.push({
      year: Number(t.toFixed(2)),
      openingBalance: opening,
      interestEarned: closing - opening,
      closingBalance: closing,
      cumulativeInterest: closing - p,
    });
  }

  return {
    principal: p,
    rate: r,
    years: t,
    frequency,
    compoundingPeriodsPerYear: n,
    totalAmount,
    compoundInterest,
    simpleInterestBaseline,
    compoundingAdvantage,
    effectiveAnnualRate,
    yearlySchedule,
    formula: 'A = P × (1 + r / n)^(n × t) and CI = A - P',
    assumptions: [
      `Nominal annual rate r = ${r}% divided equally across ${n} compounding periods per year.`,
      'No intermediate deposits, withdrawals, or TDS deductions during the tenure.',
      'Daily compounding uses a 365 day year convention.',
    ],
  };
}

export interface AmortizationRow {
  month: number;
  openingBalance: number;
  emi: number;
  principalPaid: number;
  interestPaid: number;
  closingBalance: number;
}

export interface YearlyAmortizationRow {
  year: number;
  openingBalance: number;
  totalEmiPaid: number;
  principalPaid: number;
  interestPaid: number;
  closingBalance: number;
}

export interface LoanEmiResult {
  loanAmount: number;
  annualRate: number;
  tenureMonths: number;
  processingFee: number;
  monthlyEmi: number;
  totalInterest: number;
  totalRepayment: number;
  totalCostWithFee: number;
  principalSharePercent: number;
  interestSharePercent: number;
  schedule: AmortizationRow[];
  yearlySchedule: YearlyAmortizationRow[];
}

export function calculateLoanEmi(
  loanAmount: number,
  annualRate: number,
  tenureMonths: number,
  processingFee: number
): LoanEmiResult {
  const principal = Math.max(0, loanAmount);
  const rate = Math.max(0, annualRate);
  const months = Math.max(1, Math.round(tenureMonths));
  const fee = Math.max(0, processingFee);

  const monthlyRate = rate / 12 / 100;
  let monthlyEmi = 0;

  if (principal === 0) {
    monthlyEmi = 0;
  } else if (monthlyRate === 0) {
    monthlyEmi = principal / months;
  } else {
    const factor = Math.pow(1 + monthlyRate, months);
    monthlyEmi = (principal * monthlyRate * factor) / (factor - 1);
  }

  const schedule: AmortizationRow[] = [];
  let balance = principal;
  let totalInterest = 0;

  for (let month = 1; month <= months; month++) {
    const openingBalance = balance;
    const interestPaid = monthlyRate === 0 ? 0 : openingBalance * monthlyRate;
    let principalPaid = monthlyEmi - interestPaid;
    let emiForMonth = monthlyEmi;

    if (month === months || principalPaid > openingBalance) {
      principalPaid = openingBalance;
      emiForMonth = principalPaid + interestPaid;
    }

    const closingBalance = Math.max(0, openingBalance - principalPaid);
    totalInterest += interestPaid;

    schedule.push({
      month,
      openingBalance,
      emi: emiForMonth,
      principalPaid,
      interestPaid,
      closingBalance,
    });

    balance = closingBalance;
  }

  // Build yearly summary for large-tenure scanning
  const yearlySchedule: YearlyAmortizationRow[] = [];
  for (let start = 0; start < schedule.length; start += 12) {
    const chunk = schedule.slice(start, start + 12);
    yearlySchedule.push({
      year: Math.floor(start / 12) + 1,
      openingBalance: chunk[0].openingBalance,
      totalEmiPaid: chunk.reduce((acc, row) => acc + row.emi, 0),
      principalPaid: chunk.reduce((acc, row) => acc + row.principalPaid, 0),
      interestPaid: chunk.reduce((acc, row) => acc + row.interestPaid, 0),
      closingBalance: chunk[chunk.length - 1].closingBalance,
    });
  }

  const totalRepayment = principal + totalInterest;
  const totalCostWithFee = totalRepayment + fee;
  const principalSharePercent = totalRepayment > 0 ? (principal / totalRepayment) * 100 : 100;
  const interestSharePercent = totalRepayment > 0 ? (totalInterest / totalRepayment) * 100 : 0;

  return {
    loanAmount: principal,
    annualRate: rate,
    tenureMonths: months,
    processingFee: fee,
    monthlyEmi,
    totalInterest,
    totalRepayment,
    totalCostWithFee,
    principalSharePercent,
    interestSharePercent,
    schedule,
    yearlySchedule,
  };
}

export type RatioDirection = 'inr-to-pct' | 'pct-to-inr';

export interface CustomRatioResult {
  direction: RatioDirection;
  inputValue: number;
  rateRupee: number;
  ratePercent: number;
  outputValue: number;
  formula: string;
  steps: string[];
}

export function calculateCustomRupeeRatio(
  inputValue: number,
  direction: RatioDirection,
  rateRupee = 1,
  ratePercent = 12
): CustomRatioResult {
  const safeInput = Number.isFinite(inputValue) ? inputValue : 0;
  const safeRateRupee = Number.isFinite(rateRupee) && rateRupee > 0 ? rateRupee : 1;
  const safeRatePercent = Number.isFinite(ratePercent) && ratePercent !== 0 ? ratePercent : 12;

  if (direction === 'inr-to-pct') {
    const multiplier = safeRatePercent / safeRateRupee;
    const outputValue = safeInput * multiplier;
    return {
      direction,
      inputValue: safeInput,
      rateRupee: safeRateRupee,
      ratePercent: safeRatePercent,
      outputValue,
      formula: 'Percentage = Rupee Amount × (Rate % ÷ Rate ₹)',
      steps: [
        `User-defined reference ratio: ₹${safeRateRupee.toLocaleString('en-IN', { maximumFractionDigits: 4 })} = ${safeRatePercent.toLocaleString('en-IN', { maximumFractionDigits: 4 })}%.`,
        `Unit factor: ${safeRatePercent} ÷ ${safeRateRupee} = ${multiplier.toLocaleString('en-IN', { maximumFractionDigits: 4 })}% per ₹1.`,
        `Multiply ₹${safeInput.toLocaleString('en-IN', { maximumFractionDigits: 4 })} × (${safeRatePercent} ÷ ${safeRateRupee}) = ${outputValue.toLocaleString('en-IN', { maximumFractionDigits: 4 })}%.`,
      ],
    };
  }

  const divisorFactor = safeRateRupee / safeRatePercent;
  const outputValue = safeInput * divisorFactor;
  return {
    direction,
    inputValue: safeInput,
    rateRupee: safeRateRupee,
    ratePercent: safeRatePercent,
    outputValue,
    formula: 'Rupee Amount = Percentage × (Rate ₹ ÷ Rate %)',
    steps: [
      `User-defined reference ratio: ${safeRatePercent.toLocaleString('en-IN', { maximumFractionDigits: 4 })}% = ₹${safeRateRupee.toLocaleString('en-IN', { maximumFractionDigits: 4 })}.`,
      `Unit factor: ₹${safeRateRupee} ÷ ${safeRatePercent} = ₹${divisorFactor.toLocaleString('en-IN', { maximumFractionDigits: 4 })} per 1%.`,
      `Multiply ${safeInput.toLocaleString('en-IN', { maximumFractionDigits: 4 })}% × (${safeRateRupee} ÷ ${safeRatePercent}) = ₹${outputValue.toLocaleString('en-IN', { maximumFractionDigits: 4 })}.`,
    ],
  };
}

export function calculateFixedRupeeRatio(
  inputValue: number,
  direction: RatioDirection
): CustomRatioResult {
  return calculateCustomRupeeRatio(inputValue, direction, 1, 12);
}

export type PercentageToolMode = 'percent-of-amount' | 'amount-as-percent' | 'percent-change';

export interface PercentageToolResult {
  mode: PercentageToolMode;
  resultValue: number;
  formattedResult: string;
  formula: string;
  steps: string[];
}

export function calculatePercentageTool(
  mode: PercentageToolMode,
  valueA: number,
  valueB: number
): PercentageToolResult {
  const a = Number.isFinite(valueA) ? valueA : 0;
  const b = Number.isFinite(valueB) ? valueB : 0;

  if (mode === 'percent-of-amount') {
    const resultValue = (a / 100) * b;
    return {
      mode,
      resultValue,
      formattedResult: `₹${resultValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`,
      formula: 'Value = (Rate % ÷ 100) × Base Amount (₹)',
      steps: [
        `Convert ${a}% to decimal: ${a} ÷ 100 = ${(a / 100).toLocaleString('en-IN', { maximumFractionDigits: 4 })}.`,
        `Multiply by base ₹${b.toLocaleString('en-IN', { maximumFractionDigits: 2 })} = ₹${resultValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}.`,
      ],
    };
  }

  if (mode === 'amount-as-percent') {
    const resultValue = b !== 0 ? (a / b) * 100 : 0;
    return {
      mode,
      resultValue,
      formattedResult: `${resultValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}%`,
      formula: 'Share (%) = (Part Amount ÷ Total Amount) × 100',
      steps: [
        `Divide part ₹${a.toLocaleString('en-IN', { maximumFractionDigits: 2 })} by total ₹${b.toLocaleString('en-IN', { maximumFractionDigits: 2 })}.`,
        `Multiply by 100 = ${resultValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}%.`,
      ],
    };
  }

  const diff = b - a;
  const resultValue = a !== 0 ? (diff / Math.abs(a)) * 100 : 0;
  const prefix = resultValue > 0 ? '+' : '';
  return {
    mode,
    resultValue,
    formattedResult: `${prefix}${resultValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}%`,
    formula: 'Change (%) = [(New − Original) ÷ |Original|] × 100',
    steps: [
      `Difference = ₹${b.toLocaleString('en-IN', { maximumFractionDigits: 2 })} − ₹${a.toLocaleString('en-IN', { maximumFractionDigits: 2 })} = ₹${diff.toLocaleString('en-IN', { maximumFractionDigits: 2 })}.`,
      `Divide by |₹${a.toLocaleString('en-IN', { maximumFractionDigits: 2 })}| and multiply by 100 = ${prefix}${resultValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}%.`,
    ],
  };
}

export type TaxAgeCategory = 'below-60' | 'senior-60-79' | 'super-senior-80';

export interface TaxSlabBreakdownRow {
  label: string;
  rate: number;
  taxableSlice: number;
  taxAmount: number;
}

export interface IncomeTaxResult {
  financialYear: FinancialYearId;
  regime: TaxRegimeId;
  ageCategory: TaxAgeCategory;
  salaryIncome: number;
  otherIncome: number;
  grossTotalIncome: number;
  standardDeduction: number;
  eligibleDeductionsApplied: number;
  taxableIncome: number;
  slabBreakdown: TaxSlabBreakdownRow[];
  taxBeforeRebate: number;
  rebate87A: number;
  marginalRelief: number;
  surcharge: number;
  cessAmount: number;
  totalTaxLiability: number;
  tdsAndCredits: number;
  balancePayableOrRefund: number; // positive = payable, negative = refund
  effectiveTaxRate: number;
}

function getEffectiveSlabs(
  regime: TaxRegimeId,
  ageCategory: TaxAgeCategory,
  defaultSlabs: { min: number; max: number | null; rate: number; label: string }[]
) {
  if (regime === 'new' || ageCategory === 'below-60') {
    return defaultSlabs;
  }
  if (ageCategory === 'senior-60-79') {
    return [
      { min: 0, max: 300000, rate: 0, label: 'Up to ₹3,00,000' },
      { min: 300000, max: 500000, rate: 5, label: '₹3,00,001 to ₹5,00,000' },
      { min: 500000, max: 1000000, rate: 20, label: '₹5,00,001 to ₹10,00,000' },
      { min: 1000000, max: null, rate: 30, label: 'Above ₹10,00,000' },
    ];
  }
  return [
    { min: 0, max: 500000, rate: 0, label: 'Up to ₹5,00,000' },
    { min: 500000, max: 1000000, rate: 20, label: '₹5,00,001 to ₹10,00,000' },
    { min: 1000000, max: null, rate: 30, label: 'Above ₹10,00,000' },
  ];
}

function computeSlabTaxOnly(
  income: number,
  slabs: { min: number; max: number | null; rate: number; label: string }[]
): { total: number; rows: TaxSlabBreakdownRow[] } {
  let total = 0;
  const rows: TaxSlabBreakdownRow[] = slabs.map((slab) => {
    const upper = slab.max ?? Infinity;
    const taxableSlice = Math.max(0, Math.min(income, upper) - slab.min);
    const taxAmount = (taxableSlice * slab.rate) / 100;
    total += taxAmount;
    return {
      label: slab.label,
      rate: slab.rate,
      taxableSlice,
      taxAmount,
    };
  });
  return { total, rows };
}

function computeSurcharge(
  taxableIncome: number,
  taxAfterRebate: number,
  maxSurchargeRate: number,
  slabs: { min: number; max: number | null; rate: number; label: string }[]
): number {
  if (taxableIncome <= 5000000 || taxAfterRebate <= 0) {
    return 0;
  }

  let rate = 0;
  let threshold = 5000000;
  let prevRate = 0;

  if (taxableIncome > 50000000) {
    rate = maxSurchargeRate;
    threshold = 50000000;
    prevRate = 25;
  } else if (taxableIncome > 20000000) {
    rate = 25;
    threshold = 20000000;
    prevRate = 15;
  } else if (taxableIncome > 10000000) {
    rate = 15;
    threshold = 10000000;
    prevRate = 10;
  } else {
    rate = 10;
    threshold = 5000000;
    prevRate = 0;
  }

  const rawSurcharge = (taxAfterRebate * rate) / 100;
  const taxAtThreshold = computeSlabTaxOnly(threshold, slabs).total;
  const surchargeAtThreshold = (taxAtThreshold * prevRate) / 100;
  const totalAtThreshold = taxAtThreshold + surchargeAtThreshold;
  const excessIncome = taxableIncome - threshold;
  const totalWithRawSurcharge = taxAfterRebate + rawSurcharge;

  if (totalWithRawSurcharge > totalAtThreshold + excessIncome) {
    return Math.max(0, totalAtThreshold + excessIncome - taxAfterRebate);
  }
  return rawSurcharge;
}

export function calculateIndianIncomeTax(params: {
  financialYear: FinancialYearId;
  regime: TaxRegimeId;
  ageCategory?: TaxAgeCategory;
  salaryIncome: number;
  otherIncome: number;
  eligibleDeductions: number;
  tdsAndCredits: number;
}): IncomeTaxResult {
  const fyConfig = INDIAN_TAX_RULES[params.financialYear];
  const rule = fyConfig.regimes[params.regime];
  const ageCategory: TaxAgeCategory = params.ageCategory ?? 'below-60';
  const effectiveSlabs = getEffectiveSlabs(params.regime, ageCategory, rule.slabs);

  const salaryIncome = Math.max(0, params.salaryIncome);
  const otherIncome = Math.max(0, params.otherIncome);
  const grossTotalIncome = salaryIncome + otherIncome;

  const standardDeduction = salaryIncome > 0 ? Math.min(salaryIncome, rule.standardDeductionSalaried) : 0;
  const eligibleDeductionsApplied = rule.allowsChapterVIADeductions
    ? Math.max(0, params.eligibleDeductions)
    : 0;

  const taxableIncome = Math.max(
    0,
    grossTotalIncome - standardDeduction - eligibleDeductionsApplied
  );

  const { total: taxBeforeRebate, rows: slabBreakdown } = computeSlabTaxOnly(
    taxableIncome,
    effectiveSlabs
  );

  let rebate87A = 0;
  let marginalRelief = 0;

  if (taxableIncome <= rule.rebate87ALimit) {
    rebate87A = Math.min(taxBeforeRebate, rule.rebate87AMaxAmount);
  } else if (rule.has87AMarginalRelief) {
    const excessOverLimit = taxableIncome - rule.rebate87ALimit;
    if (taxBeforeRebate > excessOverLimit) {
      marginalRelief = taxBeforeRebate - excessOverLimit;
    }
  }

  const taxAfterRebateAndRelief = Math.max(0, taxBeforeRebate - rebate87A - marginalRelief);
  const surcharge = computeSurcharge(
    taxableIncome,
    taxAfterRebateAndRelief,
    rule.maxSurchargeRate,
    effectiveSlabs
  );
  const taxPlusSurcharge = taxAfterRebateAndRelief + surcharge;
  const cessAmount = (taxPlusSurcharge * rule.cessRate) / 100;
  const totalTaxLiability = Math.round(taxPlusSurcharge + cessAmount);
  const tdsAndCredits = Math.max(0, params.tdsAndCredits);
  const balancePayableOrRefund = totalTaxLiability - tdsAndCredits;
  const effectiveTaxRate = grossTotalIncome > 0 ? (totalTaxLiability / grossTotalIncome) * 100 : 0;

  return {
    financialYear: params.financialYear,
    regime: params.regime,
    ageCategory,
    salaryIncome,
    otherIncome,
    grossTotalIncome,
    standardDeduction,
    eligibleDeductionsApplied,
    taxableIncome,
    slabBreakdown,
    taxBeforeRebate,
    rebate87A,
    marginalRelief,
    surcharge,
    cessAmount,
    totalTaxLiability,
    tdsAndCredits,
    balancePayableOrRefund,
    effectiveTaxRate,
  };
}
