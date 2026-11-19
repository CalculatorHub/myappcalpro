import { formatINR } from '../utils/formatters';

export type LoanTenureUnit = 'years' | 'months';

export interface LoanEmiInput {
  loanAmount: number;
  annualRate: number;
  tenureValue: number;
  tenureUnit: LoanTenureUnit;
  processingFeeAmount: number;
}

export interface AmortizationRow {
  month: number;
  openingBalance: number;
  emi: number;
  principalPaid: number;
  interestPaid: number;
  closingBalance: number;
}

export interface YearlyAmortizationSummary {
  year: number;
  principalPaid: number;
  interestPaid: number;
  endingBalance: number;
}

export interface LoanEmiResult {
  loanAmount: number;
  annualRate: number;
  totalMonths: number;
  monthlyEmi: number;
  totalInterest: number;
  totalRepayment: number;
  processingFee: number;
  totalCostIncludingFee: number;
  principalPercent: number;
  interestPercent: number;
  formula: string;
  steps: string[];
  schedule: AmortizationRow[];
  yearlySummary: YearlyAmortizationSummary[];
}

export function calculateLoanEmi(input: LoanEmiInput): LoanEmiResult {
  const { loanAmount, annualRate, tenureValue, tenureUnit, processingFeeAmount } = input;
  const totalMonths = Math.max(
    1,
    Math.round(tenureUnit === 'years' ? tenureValue * 12 : tenureValue)
  );
  const monthlyRate = annualRate / (12 * 100);

  let monthlyEmi: number;
  if (monthlyRate === 0) {
    monthlyEmi = loanAmount / totalMonths;
  } else {
    const factor = Math.pow(1 + monthlyRate, totalMonths);
    monthlyEmi = (loanAmount * monthlyRate * factor) / (factor - 1);
  }

  const schedule: AmortizationRow[] = [];
  const yearlyMap = new Map<number, YearlyAmortizationSummary>();

  let balance = loanAmount;
  let totalInterest = 0;
  let totalRepayment = 0;

  for (let m = 1; m <= totalMonths; m++) {
    const openingBalance = balance;
    const interestPaid = openingBalance * monthlyRate;
    let principalPaid: number;
    let actualEmi: number;

    if (m === totalMonths) {
      // Settle exact remaining balance in the final installment to avoid floating drift
      principalPaid = openingBalance;
      actualEmi = principalPaid + interestPaid;
    } else {
      principalPaid = Math.min(openingBalance, monthlyEmi - interestPaid);
      actualEmi = monthlyEmi;
    }

    const closingBalance = Math.max(0, openingBalance - principalPaid);
    totalInterest += interestPaid;
    totalRepayment += actualEmi;

    schedule.push({
      month: m,
      openingBalance,
      emi: actualEmi,
      principalPaid,
      interestPaid,
      closingBalance,
    });

    const yearIdx = Math.ceil(m / 12);
    const existing = yearlyMap.get(yearIdx) ?? {
      year: yearIdx,
      principalPaid: 0,
      interestPaid: 0,
      endingBalance: closingBalance,
    };
    existing.principalPaid += principalPaid;
    existing.interestPaid += interestPaid;
    existing.endingBalance = closingBalance;
    yearlyMap.set(yearIdx, existing);

    balance = closingBalance;
  }

  const totalCostIncludingFee = totalRepayment + processingFeeAmount;
  const principalPercent = totalRepayment > 0 ? (loanAmount / totalRepayment) * 100 : 100;
  const interestPercent = totalRepayment > 0 ? (totalInterest / totalRepayment) * 100 : 0;

  const steps: string[] = [
    `Total installments (N) = ${totalMonths} months`,
    `Monthly interest rate (r) = ${annualRate}% ÷ (12 × 100) = ${(monthlyRate * 100).toFixed(4)}% (${monthlyRate.toFixed(6)})`,
    monthlyRate === 0
      ? `At 0% interest, EMI = ${formatINR(loanAmount)} ÷ ${totalMonths} = ${formatINR(monthlyEmi)}`
      : `Monthly EMI = P × r × (1+r)^N ÷ [(1+r)^N − 1] = ${formatINR(monthlyEmi)}`,
    `Total Interest Payable = Total Repayment − Principal = ${formatINR(totalRepayment)} − ${formatINR(loanAmount)} = ${formatINR(totalInterest)}`,
    `Total Cost Including Fee = ${formatINR(totalRepayment)} + ${formatINR(processingFeeAmount)} = ${formatINR(totalCostIncludingFee)}`,
  ];

  return {
    loanAmount,
    annualRate,
    totalMonths,
    monthlyEmi,
    totalInterest,
    totalRepayment,
    processingFee: processingFeeAmount,
    totalCostIncludingFee,
    principalPercent,
    interestPercent,
    formula: 'EMI = [P × r × (1 + r)^N] ÷ [(1 + r)^N − 1]',
    steps,
    schedule,
    yearlySummary: Array.from(yearlyMap.values()),
  };
}
