import {
  ArrowLeftRight,
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
  | 'conversion'
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
  { id: 'conversion', label: 'Ratios & %' },
  { id: 'tax', label: 'Income Tax' },
];

export const CALCULATOR_CARDS: CalculatorMeta[] = [
  {
    id: 'simple-interest',
    title: 'Simple Interest',
    category: 'interest',
    categoryLabel: 'Interest & Growth',
    shortDesc: 'Compute interest across years, months, or days with growth chart and steps.',
    formulaTag: 'SI = PRT / 100',
    keywords: ['simple interest', 'si', 'principal', 'rate', 'days', 'months', 'years', 'fd'],
    icon: Coins,
  },
  {
    id: 'compound-interest',
    title: 'Compound Interest',
    category: 'interest',
    categoryLabel: 'Interest & Growth',
    shortDesc: 'Annual to daily compounding with effective yield and simple-interest comparison.',
    formulaTag: 'A = P(1 + r/n)^nt',
    keywords: ['compound interest', 'ci', 'ear', 'effective annual rate', 'quarterly', 'monthly', 'maturity'],
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
    id: 'percentage-rupee',
    title: 'Percentage & Rupee Conversion',
    category: 'conversion',
    categoryLabel: 'Ratios & %',
    shortDesc: 'Percentage tools and two-way custom rupee ratio converter (₹1 = 12% default).',
    formulaTag: '₹ ↔ % Ratio',
    keywords: ['percentage', 'rupee', 'ratio', 'convert', '12%', 'change', 'share', 'proportion'],
    icon: ArrowLeftRight,
  },
  {
    id: 'income-tax',
    title: 'Income Tax',
    category: 'tax',
    categoryLabel: 'Income Tax',
    shortDesc: 'FY 2024–27 New vs Old regime educational estimates with 87A & 4% cess.',
    formulaTag: 'Sec 115BAC',
    keywords: ['income tax', '87a', '115bac', 'new regime', 'old regime', 'slab', 'tds', 'cess', 'fy 2025', 'fy 2026'],
    popular: true,
    icon: Scale,
  },
];
