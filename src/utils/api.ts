export interface ApiUser {
  id: number;
  name: string;
  email: string;
  role: string;
  isAdminSession: boolean;
}

export interface AdminStatus {
  configured: boolean;
  envConfigured: boolean;
  claimedInDb: boolean;
  canClaim: boolean;
  isAdminSession: boolean;
}

export interface InvestmentRecord {
  id: number;
  user_id: number;
  name: string;
  category: string;
  monthly_contribution: number;
  principal_amount: number;
  annual_return: number;
  tenure_years: number;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface LoanRecord {
  id: number;
  user_id: number;
  lender_name: string;
  loan_type: string;
  principal_amount: number;
  annual_rate: number;
  tenure_months: number;
  months_paid: number;
  extra_monthly_payment: number;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface SavingsGoalRecord {
  id: number;
  user_id: number;
  title: string;
  category: string;
  target_amount: number;
  saved_amount: number;
  monthly_contribution: number;
  expected_return: number;
  target_date: string;
  created_at: string;
  updated_at: string;
}

export interface TransactionRecord {
  id: number;
  user_id: number;
  type: 'income' | 'expense';
  category: string;
  title: string;
  amount: number;
  txn_date: string;
  payment_mode: string;
  notes: string;
  created_at: string;
}

export interface BudgetRecord {
  id: number;
  user_id: number;
  category: string;
  monthly_limit: number;
  updated_at: string;
}

export interface TaxPlanRecord {
  id: number;
  user_id: number;
  plan_name: string;
  financial_year: 'fy-2024-25' | 'fy-2025-26' | 'fy-2026-27';
  gross_salary: number;
  other_income: number;
  sec_80c: number;
  sec_80d: number;
  nps_80ccd1b: number;
  hra_exemption: number;
  home_loan_interest: number;
  tds_paid: number;
  preferred_regime: 'new' | 'old';
  updated_at: string;
}

export interface RetirementPlanRecord {
  id: number;
  user_id: number;
  plan_name: string;
  current_age: number;
  retirement_age: number;
  life_expectancy: number;
  current_monthly_expense: number;
  inflation_rate: number;
  current_corpus: number;
  monthly_sip: number;
  pre_retire_return: number;
  post_retire_return: number;
  updated_at: string;
}

export interface GlossaryTermRecord {
  id: number;
  slug: string;
  term: string;
  category: string;
  formula: string;
  summary: string;
  example: string;
  updated_at: string;
}

export interface EducationQuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface EducationLessonRecord {
  id: number;
  slug: string;
  title: string;
  category: string;
  level: string;
  read_minutes: number;
  summary: string;
  keyTakeaways: string[];
  contentParagraphs: string[];
  quiz: EducationQuizQuestion[];
  updated_at: string;
}

export interface LearningProgressRecord {
  lesson_slug: string;
  completed: number;
  quiz_score: number;
  updated_at: string;
}

export interface WorkspaceSummary {
  investments: InvestmentRecord[];
  loans: LoanRecord[];
  goals: SavingsGoalRecord[];
  transactions: TransactionRecord[];
  budgets: BudgetRecord[];
  taxPlans: TaxPlanRecord[];
  retirementPlans: RetirementPlanRecord[];
  learningProgress: LearningProgressRecord[];
}

export const EMPTY_WORKSPACE: WorkspaceSummary = {
  investments: [],
  loans: [],
  goals: [],
  transactions: [],
  budgets: [],
  taxPlans: [],
  retirementPlans: [],
  learningProgress: [],
};

// Strictly in-memory token store (never persisted to localStorage/sessionStorage)
let inMemoryBearerToken: string | null = null;

export function setInMemoryToken(token: string | null): void {
  inMemoryBearerToken = token;
}

export function getInMemoryToken(): string | null {
  return inMemoryBearerToken;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (inMemoryBearerToken) {
    headers.set('Authorization', `Bearer ${inMemoryBearerToken}`);
  }

  const response = await fetch(path, {
    ...options,
    headers,
  });

  const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok) {
    const message =
      typeof payload.error === 'string' && payload.error.trim().length > 0
        ? payload.error
        : `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return payload as T;
}
