import {
  Coins,
  Home,
  Scale,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';
import type { CalculatorSlug } from '../utils/storage';

export type CalculatorId = CalculatorSlug;

export type CalculatorCategory =
  | 'all'
  | 'interest'
  | 'loans'
  | 'tax';

export interface CalculatorMeta {
  id: CalculatorId;
  title: string;
  category: Exclude<CalculatorCategory, 'all'>;
  categoryLabel: string;
  shortDesc: string;
  formulaTag: string;
  keywords: string[];
  popular?: boolean;
  icon: LucideIcon;
}

export const CATEGORY_TABS: { id: CalculatorCategory; label: string }[] = [
  { id: 'all', label: 'All Tools' },
  { id: 'interest', label: 'Interest & Growth' },
  { id: 'loans', label: 'Loans & EMI' },
  { id: 'tax', label: 'Income Tax' },
];

export const CALCULATOR_CARDS: CalculatorMeta[] = [
  {
    id: 'simple-interest',
    title: 'Simple Interest',
    category: 'interest',
    categoryLabel: 'Interest & Growth',
    shortDesc: 'Compute interest across years, months, or days with monthly ₹/100 preview and steps.',
    formulaTag: 'SI = PRT / 100',
    keywords: ['simple interest', 'si', 'principal', 'rate', 'days', 'months', 'years', 'fd', 'rupee'],
    icon: Coins,
  },
  {
    id: 'compound-interest',
    title: 'Compound Interest',
    category: 'interest',
    categoryLabel: 'Interest & Growth',
    shortDesc: 'Annual to daily compounding with effective yield and monthly ₹/100 preview.',
    formulaTag: 'A = P(1 + r/n)^nt',
    keywords: ['compound interest', 'ci', 'ear', 'effective annual rate', 'quarterly', 'monthly', 'maturity', 'rupee'],
    popular: true,
    icon: TrendingUp,
  },
  {
    id: 'loan-emi',
    title: 'Home Loan EMI',
    category: 'loans',
    categoryLabel: 'Loans & EMI',
    shortDesc: 'Home price, down payment, monthly EMI, and monthly/yearly amortization.',
    formulaTag: 'EMI & Schedule',
    keywords: ['emi', 'home loan', 'mortgage', 'down payment', 'amortization', 'processing fee', 'bank'],
    popular: true,
    icon: Home,
  },
  {
    id: 'income-tax',
    title: 'Income Tax',
    category: 'tax',
    categoryLabel: 'Income Tax',
    shortDesc: 'FY 2024–27 New vs Old regime educational estimates with 87A & post-tax income.',
    formulaTag: 'Sec 115BAC',
    keywords: ['income tax', '87a', '115bac', 'new regime', 'old regime', 'slab', 'tds', 'cess', 'fy 2025', 'fy 2026'],
    popular: true,
    icon: Scale,
  },
];
