// ============================================================================
// CONFIGURABLE INDIAN INCOME TAX RULES DATA SECTION
// ----------------------------------------------------------------------------
// All tax slabs, standard deductions, Section 87A rebates, surcharge brackets,
// and Health & Education Cess rates are isolated in this file so CA students
// and educators can inspect, verify, or update rules for any financial year.
// ============================================================================

export type FinancialYearKey = 'FY2026-27' | 'FY2025-26' | 'FY2024-25';
export type TaxRegime = 'new' | 'old';
export type AgeCategory = 'below60' | 'senior60to79' | 'superSenior80plus';

export interface TaxSlab {
  upto: number | null; // null means no upper limit (infinity)
  rate: number; // percentage e.g. 5 for 5%
  label: string;
}

export interface SurchargeBracket {
  minExclusive: number;
  maxInclusive: number | null;
  rate: number; // percentage e.g. 10 for 10%
  label: string;
}

export interface RegimeRuleConfig {
  name: string;
  standardDeductionSalaried: number;
  rebate87A: {
    maxTaxableIncome: number;
    maxRebateAmount: number;
    marginalReliefApplicable: boolean;
  };
  surchargeBrackets: SurchargeBracket[];
  cessRatePercent: number;
  notes: string[];
}

export interface NewRegimeRuleConfig extends RegimeRuleConfig {
  slabs: TaxSlab[];
}

export interface OldRegimeRuleConfig extends RegimeRuleConfig {
  slabsByAge: Record<AgeCategory, TaxSlab[]>;
}

export interface FinancialYearTaxRules {
  key: FinancialYearKey;
  financialYear: string;
  assessmentYear: string;
  verified: boolean;
  verificationSource: string;
  assumptions: string[];
  newRegime: NewRegimeRuleConfig;
  oldRegime: OldRegimeRuleConfig;
}

const NEW_REGIME_SURCHARGE: SurchargeBracket[] = [
  { minExclusive: 50_00_000, maxInclusive: 1_00_00_000, rate: 10, label: '₹50L – ₹1 Cr (10%)' },
  { minExclusive: 1_00_00_000, maxInclusive: 2_00_00_000, rate: 15, label: '₹1 Cr – ₹2 Cr (15%)' },
  { minExclusive: 2_00_00_000, maxInclusive: null, rate: 25, label: 'Above ₹2 Cr (Capped at 25%)' },
];

const OLD_REGIME_SURCHARGE: SurchargeBracket[] = [
  { minExclusive: 50_00_000, maxInclusive: 1_00_00_000, rate: 10, label: '₹50L – ₹1 Cr (10%)' },
  { minExclusive: 1_00_00_000, maxInclusive: 2_00_00_000, rate: 15, label: '₹1 Cr – ₹2 Cr (15%)' },
  { minExclusive: 2_00_00_000, maxInclusive: 5_00_00_000, rate: 25, label: '₹2 Cr – ₹5 Cr (25%)' },
  { minExclusive: 5_00_00_000, maxInclusive: null, rate: 37, label: 'Above ₹5 Cr (37%)' },
];

const OLD_REGIME_SLABS_BY_AGE: Record<AgeCategory, TaxSlab[]> = {
  below60: [
    { upto: 2_50_000, rate: 0, label: 'Up to ₹2,50,000' },
    { upto: 5_00_000, rate: 5, label: '₹2,50,001 – ₹5,00,000' },
    { upto: 10_00_000, rate: 20, label: '₹5,00,001 – ₹10,00,000' },
    { upto: null, rate: 30, label: 'Above ₹10,00,000' },
  ],
  senior60to79: [
    { upto: 3_00_000, rate: 0, label: 'Up to ₹3,00,000' },
    { upto: 5_00_000, rate: 5, label: '₹3,00,001 – ₹5,00,000' },
    { upto: 10_00_000, rate: 20, label: '₹5,00,001 – ₹10,00,000' },
    { upto: null, rate: 30, label: 'Above ₹10,00,000' },
  ],
  superSenior80plus: [
    { upto: 5_00_000, rate: 0, label: 'Up to ₹5,00,000' },
    { upto: 10_00_000, rate: 20, label: '₹5,00,001 – ₹10,00,000' },
    { upto: null, rate: 30, label: 'Above ₹10,00,000' },
  ],
};

const BUDGET_2025_NEW_SLABS: TaxSlab[] = [
  { upto: 4_00_000, rate: 0, label: 'Up to ₹4,00,000' },
  { upto: 8_00_000, rate: 5, label: '₹4,00,001 – ₹8,00,000' },
  { upto: 12_00_000, rate: 10, label: '₹8,00,001 – ₹12,00,000' },
  { upto: 16_00_000, rate: 15, label: '₹12,00,001 – ₹16,00,000' },
  { upto: 20_00_000, rate: 20, label: '₹16,00,001 – ₹20,00,000' },
  { upto: 24_00_000, rate: 25, label: '₹20,00,001 – ₹24,00,000' },
  { upto: null, rate: 30, label: 'Above ₹24,00,000' },
];

const FY2024_25_NEW_SLABS: TaxSlab[] = [
  { upto: 3_00_000, rate: 0, label: 'Up to ₹3,00,000' },
  { upto: 7_00_000, rate: 5, label: '₹3,00,001 – ₹7,00,000' },
  { upto: 10_00_000, rate: 10, label: '₹7,00,001 – ₹10,00,000' },
  { upto: 12_00_000, rate: 15, label: '₹10,00,001 – ₹12,00,000' },
  { upto: 15_00_000, rate: 20, label: '₹12,00,001 – ₹15,00,000' },
  { upto: null, rate: 30, label: 'Above ₹15,00,000' },
];

export const CONFIGURABLE_TAX_RULES: Record<FinancialYearKey, FinancialYearTaxRules> = {
  'FY2026-27': {
    key: 'FY2026-27',
    financialYear: 'FY 2026-27',
    assessmentYear: 'AY 2027-28',
    verified: true,
    verificationSource: 'Union Budget 2025 / 2026 & Income Tax India Individual Slab Provisions',
    assumptions: [
      'Assumes Resident Individual taxpayer with normal slab-rate income (special-rate capital gains / VDA / lottery income excluded).',
      'Standard Deduction of ₹75,000 (New Regime) or ₹50,000 (Old Regime) applies automatically to Gross Salary.',
      'Section 87A rebate applies to resident individuals on normal income; marginal relief is applied where taxable income marginally crosses ₹12,00,000 under the New Regime.',
      'Health & Education Cess at 4% is levied on (Income Tax after Rebate + Surcharge).',
    ],
    newRegime: {
      name: 'New Tax Regime (Default — Sec 115BAC)',
      slabs: BUDGET_2025_NEW_SLABS,
      standardDeductionSalaried: 75_000,
      rebate87A: {
        maxTaxableIncome: 12_00_000,
        maxRebateAmount: 60_000,
        marginalReliefApplicable: true,
      },
      surchargeBrackets: NEW_REGIME_SURCHARGE,
      cessRatePercent: 4,
      notes: [
        'Slabs are uniform across all age categories.',
        'Most Chapter VI-A deductions (80C, 80D, HRA) are not eligible; employer NPS contribution u/s 80CCD(2) remains eligible.',
        'Surcharge is capped at 25% for income exceeding ₹2 Crore.',
      ],
    },
    oldRegime: {
      name: 'Old Tax Regime (Optional)',
      slabsByAge: OLD_REGIME_SLABS_BY_AGE,
      standardDeductionSalaried: 50_000,
      rebate87A: {
        maxTaxableIncome: 5_00_000,
        maxRebateAmount: 12_500,
        marginalReliefApplicable: false,
      },
      surchargeBrackets: OLD_REGIME_SURCHARGE,
      cessRatePercent: 4,
      notes: [
        'Basic exemption depends on age: ₹2.5L (<60 yrs), ₹3L (60–79 yrs), ₹5L (80+ yrs).',
        'Supports eligible Chapter VI-A deductions (80C, 80D, 80CCD, 80G) and house property / HRA exemptions.',
      ],
    },
  },
  'FY2025-26': {
    key: 'FY2025-26',
    financialYear: 'FY 2025-26',
    assessmentYear: 'AY 2026-27',
    verified: true,
    verificationSource: 'Union Budget 2025 & Finance Act 2025 Provisions',
    assumptions: [
      'Assumes Resident Individual taxpayer with normal slab-rate income (special-rate capital gains excluded).',
      'Standard Deduction of ₹75,000 (New Regime) or ₹50,000 (Old Regime) applies to Gross Salary.',
      'Section 87A rebate up to ₹60,000 eliminates tax on taxable income up to ₹12,00,000 under the New Regime (salaried effective zero-tax threshold ₹12,75,000), with marginal relief just above ₹12L.',
      'Health & Education Cess at 4% applies on total tax plus surcharge.',
    ],
    newRegime: {
      name: 'New Tax Regime (Default — Sec 115BAC)',
      slabs: BUDGET_2025_NEW_SLABS,
      standardDeductionSalaried: 75_000,
      rebate87A: {
        maxTaxableIncome: 12_00_000,
        maxRebateAmount: 60_000,
        marginalReliefApplicable: true,
      },
      surchargeBrackets: NEW_REGIME_SURCHARGE,
      cessRatePercent: 4,
      notes: [
        'Updated Union Budget 2025 slabs with ₹4L basic exemption.',
        'Surcharge capped at 25%.',
      ],
    },
    oldRegime: {
      name: 'Old Tax Regime (Optional)',
      slabsByAge: OLD_REGIME_SLABS_BY_AGE,
      standardDeductionSalaried: 50_000,
      rebate87A: {
        maxTaxableIncome: 5_00_000,
        maxRebateAmount: 12_500,
        marginalReliefApplicable: false,
      },
      surchargeBrackets: OLD_REGIME_SURCHARGE,
      cessRatePercent: 4,
      notes: [
        'Age-based basic exemption limits apply.',
        'Eligible Chapter VI-A deductions reduce taxable income.',
      ],
    },
  },
  'FY2024-25': {
    key: 'FY2024-25',
    financialYear: 'FY 2024-25',
    assessmentYear: 'AY 2025-26',
    verified: true,
    verificationSource: 'Finance (No. 2) Act, 2024 (Union Budget July 2024)',
    assumptions: [
      'Assumes Resident Individual taxpayer with normal slab-rate income.',
      'Standard Deduction increased to ₹75,000 under the New Regime (₹50,000 under Old Regime) for salaried taxpayers.',
      'Section 87A rebate up to ₹25,000 applies for taxable income up to ₹7,00,000 under the New Regime, with marginal relief just above ₹7L.',
      'Health & Education Cess at 4% applies on tax plus surcharge.',
    ],
    newRegime: {
      name: 'New Tax Regime (Default — Sec 115BAC)',
      slabs: FY2024_25_NEW_SLABS,
      standardDeductionSalaried: 75_000,
      rebate87A: {
        maxTaxableIncome: 7_00_000,
        maxRebateAmount: 25_000,
        marginalReliefApplicable: true,
      },
      surchargeBrackets: NEW_REGIME_SURCHARGE,
      cessRatePercent: 4,
      notes: [
        'Slabs revised by Budget July 2024 (₹3L–₹7L at 5%, ₹7L–₹10L at 10%).',
        'Surcharge capped at 25%.',
      ],
    },
    oldRegime: {
      name: 'Old Tax Regime (Optional)',
      slabsByAge: OLD_REGIME_SLABS_BY_AGE,
      standardDeductionSalaried: 50_000,
      rebate87A: {
        maxTaxableIncome: 5_00_000,
        maxRebateAmount: 12_500,
        marginalReliefApplicable: false,
      },
      surchargeBrackets: OLD_REGIME_SURCHARGE,
      cessRatePercent: 4,
      notes: [
        'Age-based basic exemption limits apply.',
        'Eligible Chapter VI-A deductions reduce taxable income.',
      ],
    },
  },
};

export const FINANCIAL_YEAR_OPTIONS: FinancialYearKey[] = [
  'FY2026-27',
  'FY2025-26',
  'FY2024-25',
];
