import {
  AgeCategory,
  FinancialYearTaxRules,
  SurchargeBracket,
  TaxRegime,
  TaxSlab,
} from '../data/taxRules';

export interface IncomeTaxInput {
  salaryIncome: number;
  otherIncome: number;
  eligibleDeductions: number; // Chapter VI-A / eligible exemptions
  tdsAndCredits: number;
  regime: TaxRegime;
  ageCategory: AgeCategory;
}

export interface SlabBreakdownRow {
  label: string;
  rate: number;
  taxableInSlab: number;
  taxAmount: number;
}

export interface IncomeTaxResult {
  financialYear: string;
  assessmentYear: string;
  regime: TaxRegime;
  regimeName: string;
  verified: boolean;
  verificationSource: string;
  grossSalary: number;
  otherIncome: number;
  grossTotalIncome: number;
  standardDeductionApplied: number;
  userDeductionsEntered: number;
  userDeductionsApplied: number;
  disallowedDeductionWarning: boolean;
  netTaxableIncome: number;
  slabBreakdown: SlabBreakdownRow[];
  taxBeforeRebate: number;
  rebate87A: number;
  marginalRelief87A: number;
  taxAfterRebate: number;
  surchargeRate: number;
  surchargeBeforeRelief: number;
  surchargeMarginalRelief: number;
  surchargeApplied: number;
  cessRatePercent: number;
  healthAndEducationCess: number;
  totalTaxLiability: number;
  tdsAndCredits: number;
  netBalance: number; // positive => payable, negative => refund
  balanceStatus: 'payable' | 'refund' | 'settled';
  effectiveTaxRatePercent: number;
  assumptions: string[];
}

function computeSlabTax(taxableIncome: number, slabs: TaxSlab[]): {
  breakdown: SlabBreakdownRow[];
  totalTax: number;
} {
  let prevLimit = 0;
  let totalTax = 0;
  const breakdown: SlabBreakdownRow[] = [];

  for (const slab of slabs) {
    const upper = slab.upto ?? Infinity;
    const taxableInSlab = Math.max(0, Math.min(taxableIncome, upper) - prevLimit);
    const taxAmount = (taxableInSlab * slab.rate) / 100;
    totalTax += taxAmount;

    breakdown.push({
      label: slab.label,
      rate: slab.rate,
      taxableInSlab,
      taxAmount,
    });

    prevLimit = upper;
  }

  return { breakdown, totalTax };
}

function computeSurchargeWithMarginalRelief(
  taxableIncome: number,
  taxAfterRebate: number,
  slabs: TaxSlab[],
  brackets: SurchargeBracket[]
): {
  surchargeRate: number;
  surchargeBeforeRelief: number;
  surchargeMarginalRelief: number;
  surchargeApplied: number;
} {
  let activeBracket: SurchargeBracket | null = null;
  for (const b of brackets) {
    const upper = b.maxInclusive ?? Infinity;
    if (taxableIncome > b.minExclusive && taxableIncome <= upper) {
      activeBracket = b;
      break;
    }
  }

  if (!activeBracket || taxAfterRebate <= 0) {
    return {
      surchargeRate: 0,
      surchargeBeforeRelief: 0,
      surchargeMarginalRelief: 0,
      surchargeApplied: 0,
    };
  }

  const surchargeRate = activeBracket.rate;
  const surchargeBeforeRelief = (taxAfterRebate * surchargeRate) / 100;
  const totalWithSurcharge = taxAfterRebate + surchargeBeforeRelief;

  // Marginal relief check against the threshold immediately crossed
  const threshold = activeBracket.minExclusive;
  const taxAtThreshold = computeSlabTax(threshold, slabs).totalTax;
  // Determine surcharge rate applicable at threshold
  let thresholdSurchargeRate = 0;
  for (const b of brackets) {
    const upper = b.maxInclusive ?? Infinity;
    if (threshold > b.minExclusive && threshold <= upper) {
      thresholdSurchargeRate = b.rate;
      break;
    }
  }
  const totalTaxAtThreshold = taxAtThreshold * (1 + thresholdSurchargeRate / 100);
  const maxAllowedTax = totalTaxAtThreshold + (taxableIncome - threshold);

  let surchargeMarginalRelief = 0;
  let surchargeApplied = surchargeBeforeRelief;

  if (totalWithSurcharge > maxAllowedTax) {
    surchargeMarginalRelief = totalWithSurcharge - maxAllowedTax;
    surchargeApplied = Math.max(0, surchargeBeforeRelief - surchargeMarginalRelief);
  }

  return {
    surchargeRate,
    surchargeBeforeRelief,
    surchargeMarginalRelief,
    surchargeApplied,
  };
}

export function calculateIncomeTaxForRegime(
  input: IncomeTaxInput,
  rules: FinancialYearTaxRules
): IncomeTaxResult {
  const isNew = input.regime === 'new';
  const regimeConfig = isNew ? rules.newRegime : rules.oldRegime;
  const slabs = isNew ? rules.newRegime.slabs : rules.oldRegime.slabsByAge[input.ageCategory];

  const grossSalary = Math.max(0, input.salaryIncome);
  const otherIncome = Math.max(0, input.otherIncome);
  const grossTotalIncome = grossSalary + otherIncome;

  const standardDeductionApplied =
    grossSalary > 0 ? Math.min(grossSalary, regimeConfig.standardDeductionSalaried) : 0;

  // Under New Regime, standard Chapter VI-A deductions (80C/80D/HRA) are not deducted from slab tax;
  // we allow 0 by default under New Regime and flag a clear warning if the user entered deductions.
  const userDeductionsEntered = Math.max(0, input.eligibleDeductions);
  const userDeductionsApplied = isNew ? 0 : userDeductionsEntered;
  const disallowedDeductionWarning = isNew && userDeductionsEntered > 0;

  const netTaxableIncome = Math.max(
    0,
    grossTotalIncome - standardDeductionApplied - userDeductionsApplied
  );

  const { breakdown: slabBreakdown, totalTax: taxBeforeRebate } = computeSlabTax(
    netTaxableIncome,
    slabs
  );

  // Section 87A Rebate + Marginal Relief (New Regime)
  let rebate87A = 0;
  let marginalRelief87A = 0;
  const { maxTaxableIncome, maxRebateAmount, marginalReliefApplicable } =
    regimeConfig.rebate87A;

  if (netTaxableIncome <= maxTaxableIncome) {
    rebate87A = Math.min(taxBeforeRebate, maxRebateAmount);
  } else if (marginalReliefApplicable) {
    const excessIncome = netTaxableIncome - maxTaxableIncome;
    if (taxBeforeRebate > excessIncome) {
      marginalRelief87A = taxBeforeRebate - excessIncome;
    }
  }

  const taxAfterRebate = Math.max(0, taxBeforeRebate - rebate87A - marginalRelief87A);

  // Surcharge & Surcharge Marginal Relief
  const {
    surchargeRate,
    surchargeBeforeRelief,
    surchargeMarginalRelief,
    surchargeApplied,
  } = computeSurchargeWithMarginalRelief(
    netTaxableIncome,
    taxAfterRebate,
    slabs,
    regimeConfig.surchargeBrackets
  );

  const taxPlusSurcharge = taxAfterRebate + surchargeApplied;
  const healthAndEducationCess = (taxPlusSurcharge * regimeConfig.cessRatePercent) / 100;
  const totalTaxLiability = Math.round(taxPlusSurcharge + healthAndEducationCess);

  const tdsAndCredits = Math.max(0, input.tdsAndCredits);
  const netBalance = totalTaxLiability - tdsAndCredits;
  const balanceStatus: 'payable' | 'refund' | 'settled' =
    netBalance > 0 ? 'payable' : netBalance < 0 ? 'refund' : 'settled';

  const effectiveTaxRatePercent =
    grossTotalIncome > 0 ? (totalTaxLiability / grossTotalIncome) * 100 : 0;

  return {
    financialYear: rules.financialYear,
    assessmentYear: rules.assessmentYear,
    regime: input.regime,
    regimeName: regimeConfig.name,
    verified: rules.verified,
    verificationSource: rules.verificationSource,
    grossSalary,
    otherIncome,
    grossTotalIncome,
    standardDeductionApplied,
    userDeductionsEntered,
    userDeductionsApplied,
    disallowedDeductionWarning,
    netTaxableIncome,
    slabBreakdown,
    taxBeforeRebate,
    rebate87A,
    marginalRelief87A,
    taxAfterRebate,
    surchargeRate,
    surchargeBeforeRelief,
    surchargeMarginalRelief,
    surchargeApplied,
    cessRatePercent: regimeConfig.cessRatePercent,
    healthAndEducationCess,
    totalTaxLiability,
    tdsAndCredits,
    netBalance,
    balanceStatus,
    effectiveTaxRatePercent,
    assumptions: [...rules.assumptions, ...regimeConfig.notes],
  };
}

export interface IncomeTaxComparison {
  selected: IncomeTaxResult;
  alternate: IncomeTaxResult;
  recommendedRegime: TaxRegime | 'tie';
  savingsAmount: number;
}

export function calculateIncomeTaxWithComparison(
  input: IncomeTaxInput,
  rules: FinancialYearTaxRules
): IncomeTaxComparison {
  const selected = calculateIncomeTaxForRegime(input, rules);
  const alternateRegime: TaxRegime = input.regime === 'new' ? 'old' : 'new';
  const alternate = calculateIncomeTaxForRegime(
    { ...input, regime: alternateRegime },
    rules
  );

  const diff = selected.totalTaxLiability - alternate.totalTaxLiability;
  let recommendedRegime: TaxRegime | 'tie' = 'tie';
  if (diff < 0) recommendedRegime = input.regime;
  else if (diff > 0) recommendedRegime = alternateRegime;

  return {
    selected,
    alternate,
    recommendedRegime,
    savingsAmount: Math.abs(diff),
  };
}
