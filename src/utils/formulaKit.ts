import { CONFIGURABLE_TAX_RULES } from '../data/taxRules';
import { formatINR } from './formatters';

export function downloadCAFormulaKit(): void {
  const fy26 = CONFIGURABLE_TAX_RULES['FY2026-27'];
  const fy24 = CONFIGURABLE_TAX_RULES['FY2024-25'];

  const lines: string[] = [
    'FINCALC PRO — INDIAN FINANCE & CA FORMULA REFERENCE KIT',
    'Free Educational Reference Sheet (No Signup Required)',
    '====================================================================',
    '',
    '1. SIMPLE INTEREST',
    '   Formula: SI = (P * R * T) / 100',
    '   Maturity: A = P + SI',
    '   Time Conversions:',
    '     Months to years: T = Months / 12',
    '     Days to years:   T = Days / 365 (standard) or Days / 360 (commercial)',
    '',
    '2. COMPOUND INTEREST & EFFECTIVE ANNUAL RATE',
    '   Formula: A = P * (1 + r / n)^(n * t)',
    '   Interest: CI = A - P',
    '   Effective Annual Rate: EAR = ((1 + r / n)^n - 1) * 100',
    '   Compounding Frequencies (n):',
    '     Annually = 1 | Half Yearly = 2 | Quarterly = 4 | Monthly = 12 | Daily = 365',
    '',
    '3. BANK, HOME LOAN & REDUCING BALANCE EMI',
    '   Formula: EMI = [P * i * (1 + i)^N] / [(1 + i)^N - 1]',
    '   Where i = Annual Rate / (12 * 100), N = Tenure in Months',
    '   Total Interest = (EMI * N) - P',
    '   Total Cost Including Fee = (EMI * N) + Processing Fee',
    '',
    '4. RUPEE TO PERCENTAGE RATIO (CUSTOM RATIO: ₹1 = 12%)',
    '   Rupees to Percentage: Percentage = Rupee Amount * (12 / 1)',
    '   Percentage to Rupees: Rupee Amount = Percentage * (1 / 12)',
    '   Examples: ₹1 = 12% | ₹5 = 60% | 12% = ₹1 | 60% = ₹5',
    '',
    '5. INDIAN INCOME TAX SLABS (RESIDENT INDIVIDUAL)',
    `   A) ${fy26.financialYear} (${fy26.assessmentYear}) — New Regime (Sec 115BAC)`,
    `      Standard Deduction (Salaried): ${formatINR(fy26.newRegime.standardDeductionSalaried, 0)}`,
    `      Section 87A Rebate: Full tax rebate up to ${formatINR(fy26.newRegime.rebate87A.maxTaxableIncome, 0)} taxable income (marginal relief applies above threshold)`,
    ...fy26.newRegime.slabs.map((s) => `      - ${s.label}: ${s.rate}%`),
    '',
    `   B) ${fy24.financialYear} (${fy24.assessmentYear}) — New Regime (Sec 115BAC)`,
    `      Standard Deduction (Salaried): ${formatINR(fy24.newRegime.standardDeductionSalaried, 0)}`,
    `      Section 87A Rebate: Up to ${formatINR(fy24.newRegime.rebate87A.maxTaxableIncome, 0)} taxable income`,
    ...fy24.newRegime.slabs.map((s) => `      - ${s.label}: ${s.rate}%`),
    '',
    '   C) Old Tax Regime Slabs (Resident Below 60 Years)',
    `      Standard Deduction (Salaried): ${formatINR(fy26.oldRegime.standardDeductionSalaried, 0)}`,
    `      Section 87A Rebate: Up to ${formatINR(fy26.oldRegime.rebate87A.maxTaxableIncome, 0)} taxable income (max ${formatINR(fy26.oldRegime.rebate87A.maxRebateAmount, 0)})`,
    ...fy26.oldRegime.slabsByAge.below60.map((s) => `      - ${s.label}: ${s.rate}%`),
    '',
    '   D) Surcharge & Cess',
    '      Health & Education Cess: 4% on (Tax after Rebate + Surcharge)',
    '      Surcharge: 10% (>50L to 1Cr), 15% (>1Cr to 2Cr), 25% (>2Cr New Regime)',
    '',
    '====================================================================',
    'Disclaimer: Educational reference for Indian CA students and learners.',
    'Always verify current notifications at https://www.incometax.gov.in',
  ];

  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'FinCalc-Pro-CA-Formula-Kit.txt';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
