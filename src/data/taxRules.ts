export type FinancialYearId = 'fy-2024-25' | 'fy-2025-26' | 'fy-2026-27';
export type FinancialYearKey = FinancialYearId;
export type TaxRegimeId = 'new' | 'old';
export type TaxRegime = TaxRegimeId;
export type AgeCategory = 'below-60' | 'senior-60-79' | 'super-senior-80';

export interface TaxSlab {
  min: number;
  max: number | null;
  upto?: number | null;
  rate: number; // percentage, e.g. 5 means 5%
  label: string;
}

export interface SurchargeBracket {
  minExclusive: number;
  maxInclusive: number | null;
  rate: number;
}

export interface FinancialYearTaxRules {
  financialYear: string;
  assessmentYear: string;
  verified: boolean;
  verificationSource: string;
  assumptions: string[];
  newRegime: {
    name: string;
    standardDeductionSalaried: number;
    cessRatePercent: number;
    rebate87A: {
      maxTaxableIncome: number;
      maxRebateAmount: number;
      marginalReliefApplicable: boolean;
    };
    slabs: TaxSlab[];
    surchargeBrackets: SurchargeBracket[];
    notes: string[];
  };
  oldRegime: {
    name: string;
    standardDeductionSalaried: number;
    cessRatePercent: number;
    rebate87A: {
      maxTaxableIncome: number;
      maxRebateAmount: number;
      marginalReliefApplicable: boolean;
    };
    slabsByAge: Record<AgeCategory, TaxSlab[]>;
    surchargeBrackets: SurchargeBracket[];
    notes: string[];
  };
}

export interface RegimeRuleConfig {
  label: string;
  sectionReference: string;
  standardDeductionSalaried: number;
  allowsChapterVIADeductions: boolean;
  rebate87ALimit: number;
  rebate87AMaxAmount: number;
  has87AMarginalRelief: boolean;
  cessRate: number;
  maxSurchargeRate: number;
  slabs: TaxSlab[];
  assumptions: string[];
}

export interface FinancialYearConfig {
  id: FinancialYearId;
  label: string;
  assessmentYearLabel: string;
  regimeScopeNote: string;
  statusNote: string;
  regimes: Record<TaxRegimeId, RegimeRuleConfig>;
}

/**
 * Configurable Indian Income Tax Rules (Resident Individual below 60 years).
 * Kept in a single data module for educational inspection by CA students.
 */
export const INDIAN_TAX_RULES: Record<FinancialYearId, FinancialYearConfig> = {
  'fy-2026-27': {
    id: 'fy-2026-27',
    label: 'FY 2026–27',
    assessmentYearLabel: 'AY 2027–28',
    regimeScopeNote: 'Baseline Finance Act Slabs',
    statusNote:
      'Uses enacted Finance Act 2025 baseline slabs for New and Old regimes (subject to any subsequent Finance Act amendments). Educational estimate only.',
    regimes: {
      new: {
        label: 'New Regime (Default)',
        sectionReference: 'Section 115BAC(1A)',
        standardDeductionSalaried: 75000,
        allowsChapterVIADeductions: false,
        rebate87ALimit: 1200000,
        rebate87AMaxAmount: 60000,
        has87AMarginalRelief: true,
        cessRate: 4,
        maxSurchargeRate: 25,
        slabs: [
          { min: 0, max: 400000, rate: 0, label: 'Up to ₹4,00,000' },
          { min: 400000, max: 800000, rate: 5, label: '₹4,00,001 to ₹8,00,000' },
          { min: 800000, max: 1200000, rate: 10, label: '₹8,00,001 to ₹12,00,000' },
          { min: 1200000, max: 1600000, rate: 15, label: '₹12,00,001 to ₹16,00,000' },
          { min: 1600000, max: 2000000, rate: 20, label: '₹16,00,001 to ₹20,00,000' },
          { min: 2000000, max: 2400000, rate: 25, label: '₹20,00,001 to ₹24,00,000' },
          { min: 2400000, max: null, rate: 30, label: 'Above ₹24,00,000' },
        ],
        assumptions: [
          'Assumes resident individual taxpayer below 60 years of age.',
          'Includes ₹75,000 standard deduction applied automatically against positive salary income.',
          'Chapter VI-A deductions (such as 80C and 80D) are excluded under Section 115BAC.',
          'Section 87A rebate eliminates normal tax up to ₹12,00,000 taxable income, with marginal relief just above ₹12,00,000.',
          'Assumes ordinary slab rate income (excludes special rate capital gains).',
        ],
      },
      old: {
        label: 'Old Regime (Optional)',
        sectionReference: 'General Slab Rates',
        standardDeductionSalaried: 50000,
        allowsChapterVIADeductions: true,
        rebate87ALimit: 500000,
        rebate87AMaxAmount: 12500,
        has87AMarginalRelief: false,
        cessRate: 4,
        maxSurchargeRate: 37,
        slabs: [
          { min: 0, max: 250000, rate: 0, label: 'Up to ₹2,50,000' },
          { min: 250000, max: 500000, rate: 5, label: '₹2,50,001 to ₹5,00,000' },
          { min: 500000, max: 1000000, rate: 20, label: '₹5,00,001 to ₹10,00,000' },
          { min: 1000000, max: null, rate: 30, label: 'Above ₹10,00,000' },
        ],
        assumptions: [
          'Assumes resident individual below 60 years (basic exemption ₹2,50,000).',
          'Includes ₹50,000 standard deduction against positive salary income.',
          'Allows user entered eligible deductions (e.g., Sections 80C, 80D, 80CCD(1B), HRA).',
          'Section 87A rebate up to ₹12,500 applies if taxable income does not exceed ₹5,00,000.',
        ],
      },
    },
  },
  'fy-2025-26': {
    id: 'fy-2025-26',
    label: 'FY 2025–26',
    assessmentYearLabel: 'AY 2026–27',
    regimeScopeNote: 'Finance Act 2025 Estimate',
    statusNote: 'Based on Finance Act 2025 slab rates, ₹75,000 standard deduction, and ₹12,00,000 Section 87A rebate limit under New Regime. Educational estimate only.',
    regimes: {
      new: {
        label: 'New Regime (Default)',
        sectionReference: 'Section 115BAC(1A)',
        standardDeductionSalaried: 75000,
        allowsChapterVIADeductions: false,
        rebate87ALimit: 1200000,
        rebate87AMaxAmount: 60000,
        has87AMarginalRelief: true,
        cessRate: 4,
        maxSurchargeRate: 25,
        slabs: [
          { min: 0, max: 400000, rate: 0, label: 'Up to ₹4,00,000' },
          { min: 400000, max: 800000, rate: 5, label: '₹4,00,001 to ₹8,00,000' },
          { min: 800000, max: 1200000, rate: 10, label: '₹8,00,001 to ₹12,00,000' },
          { min: 1200000, max: 1600000, rate: 15, label: '₹12,00,001 to ₹16,00,000' },
          { min: 1600000, max: 2000000, rate: 20, label: '₹16,00,001 to ₹20,00,000' },
          { min: 2000000, max: 2400000, rate: 25, label: '₹20,00,001 to ₹24,00,000' },
          { min: 2400000, max: null, rate: 30, label: 'Above ₹24,00,000' },
        ],
        assumptions: [
          'Assumes resident individual taxpayer below 60 years of age.',
          'Includes ₹75,000 standard deduction applied automatically against positive salary income.',
          'Chapter VI-A deductions are disallowed under Section 115BAC (except employer NPS u/s 80CCD(2), not modeled separately).',
          'Section 87A rebate up to ₹60,000 applies for taxable income up to ₹12,00,000, with marginal relief above ₹12,00,000.',
        ],
      },
      old: {
        label: 'Old Regime (Optional)',
        sectionReference: 'General Slab Rates',
        standardDeductionSalaried: 50000,
        allowsChapterVIADeductions: true,
        rebate87ALimit: 500000,
        rebate87AMaxAmount: 12500,
        has87AMarginalRelief: false,
        cessRate: 4,
        maxSurchargeRate: 37,
        slabs: [
          { min: 0, max: 250000, rate: 0, label: 'Up to ₹2,50,000' },
          { min: 250000, max: 500000, rate: 5, label: '₹2,50,001 to ₹5,00,000' },
          { min: 500000, max: 1000000, rate: 20, label: '₹5,00,001 to ₹10,00,000' },
          { min: 1000000, max: null, rate: 30, label: 'Above ₹10,00,000' },
        ],
        assumptions: [
          'Assumes resident individual below 60 years (basic exemption ₹2,50,000).',
          'Includes ₹50,000 standard deduction against positive salary income.',
          'Allows eligible Chapter VI-A and housing deductions entered above.',
          'Section 87A rebate up to ₹12,500 applies if taxable income does not exceed ₹5,00,000.',
        ],
      },
    },
  },
  'fy-2024-25': {
    id: 'fy-2024-25',
    label: 'FY 2024–25',
    assessmentYearLabel: 'AY 2025–26',
    regimeScopeNote: 'Finance (No. 2) Act 2024 Estimate',
    statusNote: 'Based on Finance (No. 2) Act 2024 slab rates, ₹75,000 standard deduction, and ₹7,00,000 Section 87A rebate limit under New Regime. Educational estimate only.',
    regimes: {
      new: {
        label: 'New Regime (Default)',
        sectionReference: 'Section 115BAC(1A)',
        standardDeductionSalaried: 75000,
        allowsChapterVIADeductions: false,
        rebate87ALimit: 700000,
        rebate87AMaxAmount: 25000,
        has87AMarginalRelief: true,
        cessRate: 4,
        maxSurchargeRate: 25,
        slabs: [
          { min: 0, max: 300000, rate: 0, label: 'Up to ₹3,00,000' },
          { min: 300000, max: 700000, rate: 5, label: '₹3,00,001 to ₹7,00,000' },
          { min: 700000, max: 1000000, rate: 10, label: '₹7,00,001 to ₹10,00,000' },
          { min: 1000000, max: 1200000, rate: 15, label: '₹10,00,001 to ₹12,00,000' },
          { min: 1200000, max: 1500000, rate: 20, label: '₹12,00,001 to ₹15,00,000' },
          { min: 1500000, max: null, rate: 30, label: 'Above ₹15,00,000' },
        ],
        assumptions: [
          'Assumes resident individual taxpayer below 60 years of age.',
          'Includes ₹75,000 standard deduction applied automatically against positive salary income.',
          'Chapter VI A deductions are disallowed under Section 115BAC.',
          'Section 87A rebate up to ₹25,000 applies for taxable income up to ₹7,00,000, with marginal relief above ₹7,00,000.',
        ],
      },
      old: {
        label: 'Old Regime (Optional)',
        sectionReference: 'General Slab Rates',
        standardDeductionSalaried: 50000,
        allowsChapterVIADeductions: true,
        rebate87ALimit: 500000,
        rebate87AMaxAmount: 12500,
        has87AMarginalRelief: false,
        cessRate: 4,
        maxSurchargeRate: 37,
        slabs: [
          { min: 0, max: 250000, rate: 0, label: 'Up to ₹2,50,000' },
          { min: 250000, max: 500000, rate: 5, label: '₹2,50,001 to ₹5,00,000' },
          { min: 500000, max: 1000000, rate: 20, label: '₹5,00,001 to ₹10,00,000' },
          { min: 1000000, max: null, rate: 30, label: 'Above ₹10,00,000' },
        ],
        assumptions: [
          'Assumes resident individual below 60 years (basic exemption ₹2,50,000).',
          'Includes ₹50,000 standard deduction against positive salary income.',
          'Allows eligible Chapter VI A and housing deductions entered above.',
          'Section 87A rebate up to ₹12,500 applies if taxable income does not exceed ₹5,00,000.',
        ],
      },
    },
  },
};
