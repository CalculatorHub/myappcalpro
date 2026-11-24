import fs from 'node:fs';
import path from 'node:path';
import express, { type Request, type Response } from 'express';
import { getDb } from './src/server/db.ts';
import {
  createUserSession,
  getAdminConfigStatus,
  hashPassword,
  requireAdmin,
  requireAuth,
  resolveAuthFromRequest,
  revokeSessionByHash,
  verifyAdminPasscode,
  verifyPassword,
  type AuthenticatedRequest,
} from './src/server/auth.ts';
import {
  cleanString,
  isValidIsoDate,
  parseIntInRange,
  parseNumberInRange,
  parsePositiveId,
  slugify,
} from './src/server/validators.ts';

const PORT = Number(process.env.PORT) || 3000;
const IS_PROD = process.env.NODE_ENV === 'production';

const INVESTMENT_CATEGORIES = new Set(['SIP', 'Lump Sum', 'PPF', 'FD', 'ELSS', 'Gold/SGB', 'Equity']);
const LOAN_TYPES = new Set(['Home', 'Car', 'Education', 'Personal', 'Business']);
const GOAL_CATEGORIES = new Set([
  'Emergency Fund',
  'Home Down Payment',
  'Retirement',
  'Education',
  'Travel',
  'Custom',
]);
const TXN_TYPES = new Set(['income', 'expense']);
const PAYMENT_MODES = new Set(['UPI', 'Card', 'NetBanking', 'Cash', 'Auto-Debit']);

const ALLOWED_USER_OWNED_TABLES = new Set([
  'investments',
  'loans',
  'savings_goals',
  'transactions',
  'budgets',
  'tax_plans',
  'retirement_plans',
] as const);

const ALLOWED_ADMIN_TABLES = new Set(['glossary_terms', 'education_lessons'] as const);

const ALLOWED_STAT_TABLES = new Set([
  'users',
  'sessions',
  'investments',
  'loans',
  'savings_goals',
  'transactions',
  'tax_plans',
  'retirement_plans',
  'glossary_terms',
  'education_lessons',
] as const);

function parseJsonArray<T>(raw: string, fallback: T[]): T[] {
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : fallback;
  } catch {
    return fallback;
  }
}

function parseInvestmentBody(body: Record<string, unknown> | undefined) {
  const name = cleanString(body?.name, 100);
  const category = cleanString(body?.category, 40);
  const monthlyContribution = parseNumberInRange(body?.monthly_contribution ?? 0, 0, 1e8);
  const principalAmount = parseNumberInRange(body?.principal_amount ?? 0, 0, 1e10);
  const annualReturn = parseNumberInRange(body?.annual_return, 0, 50);
  const tenureYears = parseNumberInRange(body?.tenure_years, 0.5, 50);
  const notes = cleanString(body?.notes ?? '', 300);

  if (
    name.length < 2 ||
    !INVESTMENT_CATEGORIES.has(category) ||
    monthlyContribution === null ||
    principalAmount === null ||
    annualReturn === null ||
    tenureYears === null ||
    (monthlyContribution === 0 && principalAmount === 0)
  ) {
    return null;
  }
  return { name, category, monthlyContribution, principalAmount, annualReturn, tenureYears, notes };
}

function parseLoanBody(body: Record<string, unknown> | undefined) {
  const lenderName = cleanString(body?.lender_name, 100);
  const loanType = cleanString(body?.loan_type, 30);
  const principalAmount = parseNumberInRange(body?.principal_amount, 1000, 1e10);
  const annualRate = parseNumberInRange(body?.annual_rate, 0, 45);
  const tenureMonths = parseIntInRange(body?.tenure_months, 1, 480);
  const monthsPaid = parseIntInRange(body?.months_paid ?? 0, 0, 479);
  const extraMonthlyPayment = parseNumberInRange(body?.extra_monthly_payment ?? 0, 0, 1e8);
  const notes = cleanString(body?.notes ?? '', 300);

  if (
    lenderName.length < 2 ||
    !LOAN_TYPES.has(loanType) ||
    principalAmount === null ||
    annualRate === null ||
    tenureMonths === null ||
    monthsPaid === null ||
    monthsPaid >= tenureMonths ||
    extraMonthlyPayment === null
  ) {
    return null;
  }
  return {
    lenderName,
    loanType,
    principalAmount,
    annualRate,
    tenureMonths,
    monthsPaid,
    extraMonthlyPayment,
    notes,
  };
}

function parseGoalBody(body: Record<string, unknown> | undefined) {
  const title = cleanString(body?.title, 100);
  const category = cleanString(body?.category, 40);
  const targetAmount = parseNumberInRange(body?.target_amount, 100, 1e10);
  const savedAmount = parseNumberInRange(body?.saved_amount ?? 0, 0, 1e10);
  const monthlyContribution = parseNumberInRange(body?.monthly_contribution ?? 0, 0, 1e8);
  const expectedReturn = parseNumberInRange(body?.expected_return ?? 7, 0, 30);
  const targetDate = cleanString(body?.target_date, 20);

  if (
    title.length < 2 ||
    !GOAL_CATEGORIES.has(category) ||
    targetAmount === null ||
    savedAmount === null ||
    monthlyContribution === null ||
    expectedReturn === null ||
    !isValidIsoDate(targetDate)
  ) {
    return null;
  }
  return { title, category, targetAmount, savedAmount, monthlyContribution, expectedReturn, targetDate };
}

function parseTransactionBody(body: Record<string, unknown> | undefined) {
  const type = cleanString(body?.type, 16);
  const category = cleanString(body?.category, 50);
  const title = cleanString(body?.title, 120);
  const amount = parseNumberInRange(body?.amount, 0.01, 1e10);
  const txnDate = cleanString(body?.txn_date, 20);
  const paymentMode = cleanString(body?.payment_mode ?? 'UPI', 24);
  const notes = cleanString(body?.notes ?? '', 300);

  if (
    !TXN_TYPES.has(type) ||
    category.length < 2 ||
    title.length < 2 ||
    amount === null ||
    !isValidIsoDate(txnDate) ||
    !PAYMENT_MODES.has(paymentMode)
  ) {
    return null;
  }
  return { type, category, title, amount, txnDate, paymentMode, notes };
}

function parseTaxPlanBody(body: Record<string, unknown> | undefined) {
  const planName = cleanString(body?.plan_name, 100);
  const financialYear = cleanString(body?.financial_year, 24);
  const grossSalary = parseNumberInRange(body?.gross_salary ?? 0, 0, 1e10);
  const otherIncome = parseNumberInRange(body?.other_income ?? 0, 0, 1e10);
  const sec80c = parseNumberInRange(body?.sec_80c ?? 0, 0, 1e8);
  const sec80d = parseNumberInRange(body?.sec_80d ?? 0, 0, 1e8);
  const nps80ccd1b = parseNumberInRange(body?.nps_80ccd1b ?? 0, 0, 1e8);
  const hraExemption = parseNumberInRange(body?.hra_exemption ?? 0, 0, 1e8);
  const homeLoanInterest = parseNumberInRange(body?.home_loan_interest ?? 0, 0, 1e8);
  const tdsPaid = parseNumberInRange(body?.tds_paid ?? 0, 0, 1e9);
  const preferredRegime = body?.preferred_regime === 'old' ? 'old' : 'new';

  if (
    planName.length < 2 ||
    !['fy-2024-25', 'fy-2025-26', 'fy-2026-27'].includes(financialYear) ||
    grossSalary === null ||
    otherIncome === null ||
    sec80c === null ||
    sec80d === null ||
    nps80ccd1b === null ||
    hraExemption === null ||
    homeLoanInterest === null ||
    tdsPaid === null
  ) {
    return null;
  }
  return {
    planName,
    financialYear,
    grossSalary,
    otherIncome,
    sec80c,
    sec80d,
    nps80ccd1b,
    hraExemption,
    homeLoanInterest,
    tdsPaid,
    preferredRegime,
  };
}

function parseRetirementBody(body: Record<string, unknown> | undefined) {
  const planName = cleanString(body?.plan_name, 100);
  const currentAge = parseIntInRange(body?.current_age, 18, 75);
  const retirementAge = parseIntInRange(body?.retirement_age, 30, 85);
  const lifeExpectancy = parseIntInRange(body?.life_expectancy, 55, 105);
  const currentMonthlyExpense = parseNumberInRange(body?.current_monthly_expense, 1000, 1e8);
  const inflationRate = parseNumberInRange(body?.inflation_rate, 0, 20);
  const currentCorpus = parseNumberInRange(body?.current_corpus ?? 0, 0, 1e10);
  const monthlySip = parseNumberInRange(body?.monthly_sip ?? 0, 0, 1e8);
  const preRetireReturn = parseNumberInRange(body?.pre_retire_return, 1, 30);
  const postRetireReturn = parseNumberInRange(body?.post_retire_return, 1, 20);

  if (
    planName.length < 2 ||
    currentAge === null ||
    retirementAge === null ||
    lifeExpectancy === null ||
    retirementAge <= currentAge ||
    lifeExpectancy <= retirementAge ||
    currentMonthlyExpense === null ||
    inflationRate === null ||
    currentCorpus === null ||
    monthlySip === null ||
    preRetireReturn === null ||
    postRetireReturn === null
  ) {
    return null;
  }
  return {
    planName,
    currentAge,
    retirementAge,
    lifeExpectancy,
    currentMonthlyExpense,
    inflationRate,
    currentCorpus,
    monthlySip,
    preRetireReturn,
    postRetireReturn,
  };
}

async function createApp() {
  const db = getDb();
  const app = express();

  app.disable('x-powered-by');
  app.use(express.json({ limit: '512kb' }));

  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  // Health Check
  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, database: 'sqlite', timestamp: new Date().toISOString() });
  });

  // ── Authentication Routes ──────────────────────────────────────────────
  app.post('/api/auth/register', (req: Request, res: Response) => {
    const name = cleanString(req.body?.name, 80);
    const email = cleanString(req.body?.email, 120).toLowerCase();
    const password = typeof req.body?.password === 'string' ? req.body.password : '';

    if (name.length < 2) {
      res.status(400).json({ error: 'Name must be at least 2 characters.' });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ error: 'Please enter a valid email address.' });
      return;
    }
    if (password.length < 8 || password.length > 128) {
      res.status(400).json({ error: 'Password must be between 8 and 128 characters.' });
      return;
    }

    const existing = db.prepare('SELECT id FROM users WHERE LOWER(email) = ?').get(email) as
      | { id: number }
      | undefined;
    if (existing) {
      res.status(409).json({ error: 'An account with this email already exists.' });
      return;
    }

    const now = new Date().toISOString();
    const passwordHash = hashPassword(password);
    let userId: number;
    try {
      const insert = db
        .prepare('INSERT INTO users (name, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?)')
        .run(name, email, passwordHash, 'user', now);
      userId = Number(insert.lastInsertRowid);
    } catch {
      res.status(409).json({ error: 'An account with this email already exists.' });
      return;
    }

    const token = createUserSession(userId, false);

    res.status(201).json({
      token,
      user: { id: userId, name, email, role: 'user', isAdminSession: false },
    });
  });

  app.post('/api/auth/login', (req: Request, res: Response) => {
    const email = cleanString(req.body?.email, 120).toLowerCase();
    const password = typeof req.body?.password === 'string' ? req.body.password : '';

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const row = db
      .prepare('SELECT id, name, email, password_hash, role FROM users WHERE LOWER(email) = ?')
      .get(email) as
      | { id: number; name: string; email: string; password_hash: string; role: string }
      | undefined;

    if (!row || !verifyPassword(password, row.password_hash)) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const token = createUserSession(row.id, row.role === 'admin');
    res.json({
      token,
      user: {
        id: row.id,
        name: row.name,
        email: row.email,
        role: row.role,
        isAdminSession: row.role === 'admin',
      },
    });
  });

  app.post('/api/auth/logout', requireAuth, (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    if (authReq.authTokenHash) {
      revokeSessionByHash(authReq.authTokenHash);
    }
    res.json({ ok: true });
  });

  app.get('/api/auth/me', (req: Request, res: Response) => {
    const resolved = resolveAuthFromRequest(req);
    if (!resolved) {
      res.json({ user: null });
      return;
    }
    res.json({ user: resolved.user });
  });

  // ── Protected Admin Setup & Console Routes ─────────────────────────────
  app.get('/api/admin/status', (req: Request, res: Response) => {
    const status = getAdminConfigStatus();
    const resolved = resolveAuthFromRequest(req);
    res.json({
      configured: status.isConfigured,
      envConfigured: status.envConfigured,
      claimedInDb: status.claimedInDb,
      canClaim: !status.envConfigured && !status.claimedInDb,
      isAdminSession: Boolean(resolved?.user.isAdminSession),
    });
  });

  app.post('/api/admin/claim', requireAuth, (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const status = getAdminConfigStatus();
    if (status.isConfigured) {
      res.status(409).json({ error: 'Admin passcode is already configured.' });
      return;
    }

    const passcode = typeof req.body?.passcode === 'string' ? req.body.passcode.trim() : '';
    if (passcode.length < 8 || passcode.length > 128) {
      res.status(400).json({ error: 'Admin passcode must be 8 to 128 characters.' });
      return;
    }

    const now = new Date().toISOString();
    const hash = hashPassword(passcode);
    const result = db
      .prepare(
        "INSERT OR IGNORE INTO admin_config (key, value, updated_at) VALUES ('admin_passcode_hash', ?, ?)"
      )
      .run(hash, now);

    if (result.changes === 0) {
      res.status(409).json({ error: 'Admin passcode was already claimed.' });
      return;
    }

    if (authReq.authTokenHash && authReq.authUser) {
      db.prepare('UPDATE sessions SET is_admin = 1 WHERE token_hash = ?').run(authReq.authTokenHash);
    }

    res.status(201).json({ ok: true, isAdminSession: true });
  });

  app.post('/api/admin/unlock', requireAuth, (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const status = getAdminConfigStatus();
    if (!status.isConfigured) {
      res.status(400).json({ error: 'No admin passcode configured yet. Set one up first.' });
      return;
    }

    const passcode = typeof req.body?.passcode === 'string' ? req.body.passcode.trim() : '';
    if (!passcode || !verifyAdminPasscode(passcode)) {
      res.status(401).json({ error: 'Invalid admin passcode.' });
      return;
    }

    if (authReq.authTokenHash) {
      db.prepare('UPDATE sessions SET is_admin = 1 WHERE token_hash = ?').run(authReq.authTokenHash);
    }

    res.json({ ok: true, isAdminSession: true });
  });

  app.get('/api/admin/stats', requireAdmin, (_req: Request, res: Response) => {
    const count = (
      table:
        | 'users'
        | 'sessions'
        | 'investments'
        | 'loans'
        | 'savings_goals'
        | 'transactions'
        | 'tax_plans'
        | 'retirement_plans'
        | 'glossary_terms'
        | 'education_lessons'
    ) => {
      if (!ALLOWED_STAT_TABLES.has(table)) {
        throw new Error('Disallowed table lookup');
      }
      return (db.prepare(`SELECT COUNT(*) AS c FROM ${table}`).get() as { c: number }).c;
    };

    res.json({
      usersCount: count('users'),
      activeSessionsCount: count('sessions'),
      investmentsCount: count('investments'),
      loansCount: count('loans'),
      goalsCount: count('savings_goals'),
      transactionsCount: count('transactions'),
      taxPlansCount: count('tax_plans'),
      retirementPlansCount: count('retirement_plans'),
      glossaryTermsCount: count('glossary_terms'),
      educationLessonsCount: count('education_lessons'),
      timestamp: new Date().toISOString(),
    });
  });

  const handleDeleteOwnedRecord = (
    table:
      | 'investments'
      | 'loans'
      | 'savings_goals'
      | 'transactions'
      | 'budgets'
      | 'tax_plans'
      | 'retirement_plans',
    entityLabel: string,
    req: Request,
    res: Response
  ) => {
    if (!ALLOWED_USER_OWNED_TABLES.has(table)) {
      res.status(500).json({ error: 'Invalid resource table.' });
      return;
    }
    const user = (req as AuthenticatedRequest).authUser!;
    const id = parsePositiveId(req.params.id);
    if (!id) {
      res.status(400).json({ error: `Invalid ${entityLabel.toLowerCase()} ID.` });
      return;
    }
    const del = db.prepare(`DELETE FROM ${table} WHERE id = ? AND user_id = ?`).run(id, user.id);
    if (del.changes === 0) {
      res.status(404).json({ error: `${entityLabel} not found.` });
      return;
    }
    res.json({ ok: true });
  };

  const handleDeleteAdminRecord = (
    table: 'glossary_terms' | 'education_lessons',
    entityLabel: string,
    req: Request,
    res: Response
  ) => {
    if (!ALLOWED_ADMIN_TABLES.has(table)) {
      res.status(500).json({ error: 'Invalid admin resource table.' });
      return;
    }
    const id = parsePositiveId(req.params.id);
    if (!id) {
      res.status(400).json({ error: `Invalid ${entityLabel.toLowerCase()} ID.` });
      return;
    }
    const del = db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(id);
    if (del.changes === 0) {
      res.status(404).json({ error: `${entityLabel} not found.` });
      return;
    }
    res.json({ ok: true });
  };

  // ── 2. Investment Planner CRUD ─────────────────────────────────────────
  app.get('/api/investments', requireAuth, (req: Request, res: Response) => {
    const user = (req as AuthenticatedRequest).authUser!;
    const rows = db
      .prepare('SELECT * FROM investments WHERE user_id = ? ORDER BY updated_at DESC, id DESC')
      .all(user.id);
    res.json({ items: rows });
  });

  app.post('/api/investments', requireAuth, (req: Request, res: Response) => {
    const user = (req as AuthenticatedRequest).authUser!;
    const parsed = parseInvestmentBody(req.body as Record<string, unknown> | undefined);
    if (!parsed) {
      res.status(400).json({
        error: 'Provide valid name, category, return (0-50%), tenure (0.5-50 yrs), and principal or monthly SIP > 0.',
      });
      return;
    }

    const duplicate = db
      .prepare(
        `SELECT * FROM investments
         WHERE user_id = ? AND LOWER(name) = LOWER(?) AND category = ?
           AND monthly_contribution = ? AND principal_amount = ? AND annual_return = ? AND tenure_years = ?`
      )
      .get(
        user.id,
        parsed.name,
        parsed.category,
        parsed.monthlyContribution,
        parsed.principalAmount,
        parsed.annualReturn,
        parsed.tenureYears
      );
    if (duplicate) {
      res.status(200).json({ item: duplicate, deduplicated: true });
      return;
    }

    const now = new Date().toISOString();
    const info = db
      .prepare(
        `INSERT INTO investments
        (user_id, name, category, monthly_contribution, principal_amount, annual_return, tenure_years, notes, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        user.id,
        parsed.name,
        parsed.category,
        parsed.monthlyContribution,
        parsed.principalAmount,
        parsed.annualReturn,
        parsed.tenureYears,
        parsed.notes,
        now,
        now
      );

    const created = db
      .prepare('SELECT * FROM investments WHERE id = ? AND user_id = ?')
      .get(Number(info.lastInsertRowid), user.id);
    res.status(201).json({ item: created });
  });

  app.put('/api/investments/:id', requireAuth, (req: Request, res: Response) => {
    const user = (req as AuthenticatedRequest).authUser!;
    const id = parsePositiveId(req.params.id);
    if (!id) {
      res.status(400).json({ error: 'Invalid investment ID.' });
      return;
    }

    const parsed = parseInvestmentBody(req.body as Record<string, unknown> | undefined);
    if (!parsed) {
      res.status(400).json({ error: 'Invalid investment update payload.' });
      return;
    }

    const now = new Date().toISOString();
    const upd = db
      .prepare(
        `UPDATE investments
         SET name = ?, category = ?, monthly_contribution = ?, principal_amount = ?,
             annual_return = ?, tenure_years = ?, notes = ?, updated_at = ?
         WHERE id = ? AND user_id = ?`
      )
      .run(
        parsed.name,
        parsed.category,
        parsed.monthlyContribution,
        parsed.principalAmount,
        parsed.annualReturn,
        parsed.tenureYears,
        parsed.notes,
        now,
        id,
        user.id
      );

    if (upd.changes === 0) {
      res.status(404).json({ error: 'Investment record not found.' });
      return;
    }

    const item = db
      .prepare('SELECT * FROM investments WHERE id = ? AND user_id = ?')
      .get(id, user.id);
    res.json({ item });
  });

  app.delete('/api/investments/:id', requireAuth, (req, res) =>
    handleDeleteOwnedRecord('investments', 'Investment record', req, res)
  );

  // ── 3. Loan Management CRUD ────────────────────────────────────────────
  app.get('/api/loans', requireAuth, (req: Request, res: Response) => {
    const user = (req as AuthenticatedRequest).authUser!;
    const rows = db
      .prepare('SELECT * FROM loans WHERE user_id = ? ORDER BY updated_at DESC, id DESC')
      .all(user.id);
    res.json({ items: rows });
  });

  app.post('/api/loans', requireAuth, (req: Request, res: Response) => {
    const user = (req as AuthenticatedRequest).authUser!;
    const parsed = parseLoanBody(req.body as Record<string, unknown> | undefined);
    if (!parsed) {
      res.status(400).json({ error: 'Invalid loan details. Ensure months paid is less than tenure.' });
      return;
    }

    const duplicate = db
      .prepare(
        `SELECT * FROM loans
         WHERE user_id = ? AND LOWER(lender_name) = LOWER(?) AND loan_type = ?
           AND principal_amount = ? AND annual_rate = ? AND tenure_months = ?`
      )
      .get(
        user.id,
        parsed.lenderName,
        parsed.loanType,
        parsed.principalAmount,
        parsed.annualRate,
        parsed.tenureMonths
      );
    if (duplicate) {
      res.status(200).json({ item: duplicate, deduplicated: true });
      return;
    }

    const now = new Date().toISOString();
    const info = db
      .prepare(
        `INSERT INTO loans
        (user_id, lender_name, loan_type, principal_amount, annual_rate, tenure_months, months_paid, extra_monthly_payment, notes, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        user.id,
        parsed.lenderName,
        parsed.loanType,
        parsed.principalAmount,
        parsed.annualRate,
        parsed.tenureMonths,
        parsed.monthsPaid,
        parsed.extraMonthlyPayment,
        parsed.notes,
        now,
        now
      );

    const created = db
      .prepare('SELECT * FROM loans WHERE id = ? AND user_id = ?')
      .get(Number(info.lastInsertRowid), user.id);
    res.status(201).json({ item: created });
  });

  app.put('/api/loans/:id', requireAuth, (req: Request, res: Response) => {
    const user = (req as AuthenticatedRequest).authUser!;
    const id = parsePositiveId(req.params.id);
    if (!id) {
      res.status(400).json({ error: 'Invalid loan ID.' });
      return;
    }

    const parsed = parseLoanBody(req.body as Record<string, unknown> | undefined);
    if (!parsed) {
      res.status(400).json({ error: 'Invalid loan update payload.' });
      return;
    }

    const now = new Date().toISOString();
    const upd = db
      .prepare(
        `UPDATE loans
         SET lender_name = ?, loan_type = ?, principal_amount = ?, annual_rate = ?,
             tenure_months = ?, months_paid = ?, extra_monthly_payment = ?, notes = ?, updated_at = ?
         WHERE id = ? AND user_id = ?`
      )
      .run(
        parsed.lenderName,
        parsed.loanType,
        parsed.principalAmount,
        parsed.annualRate,
        parsed.tenureMonths,
        parsed.monthsPaid,
        parsed.extraMonthlyPayment,
        parsed.notes,
        now,
        id,
        user.id
      );

    if (upd.changes === 0) {
      res.status(404).json({ error: 'Loan record not found.' });
      return;
    }
    const item = db.prepare('SELECT * FROM loans WHERE id = ? AND user_id = ?').get(id, user.id);
    res.json({ item });
  });

  app.delete('/api/loans/:id', requireAuth, (req, res) =>
    handleDeleteOwnedRecord('loans', 'Loan record', req, res)
  );

  // ── 4. Savings Goal Tracker CRUD ───────────────────────────────────────
  app.get('/api/goals', requireAuth, (req: Request, res: Response) => {
    const user = (req as AuthenticatedRequest).authUser!;
    const rows = db
      .prepare('SELECT * FROM savings_goals WHERE user_id = ? ORDER BY updated_at DESC, id DESC')
      .all(user.id);
    res.json({ items: rows });
  });

  app.post('/api/goals', requireAuth, (req: Request, res: Response) => {
    const user = (req as AuthenticatedRequest).authUser!;
    const parsed = parseGoalBody(req.body as Record<string, unknown> | undefined);
    if (!parsed) {
      res.status(400).json({ error: 'Invalid savings goal details.' });
      return;
    }

    const duplicate = db
      .prepare(
        `SELECT * FROM savings_goals
         WHERE user_id = ? AND LOWER(title) = LOWER(?) AND category = ?
           AND target_amount = ? AND target_date = ?`
      )
      .get(user.id, parsed.title, parsed.category, parsed.targetAmount, parsed.targetDate);
    if (duplicate) {
      res.status(200).json({ item: duplicate, deduplicated: true });
      return;
    }

    const now = new Date().toISOString();
    const info = db
      .prepare(
        `INSERT INTO savings_goals
        (user_id, title, category, target_amount, saved_amount, monthly_contribution, expected_return, target_date, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        user.id,
        parsed.title,
        parsed.category,
        parsed.targetAmount,
        parsed.savedAmount,
        parsed.monthlyContribution,
        parsed.expectedReturn,
        parsed.targetDate,
        now,
        now
      );

    const created = db
      .prepare('SELECT * FROM savings_goals WHERE id = ? AND user_id = ?')
      .get(Number(info.lastInsertRowid), user.id);
    res.status(201).json({ item: created });
  });

  app.put('/api/goals/:id', requireAuth, (req: Request, res: Response) => {
    const user = (req as AuthenticatedRequest).authUser!;
    const id = parsePositiveId(req.params.id);
    if (!id) {
      res.status(400).json({ error: 'Invalid goal ID.' });
      return;
    }

    const parsed = parseGoalBody(req.body as Record<string, unknown> | undefined);
    if (!parsed) {
      res.status(400).json({ error: 'Invalid savings goal update payload.' });
      return;
    }

    const now = new Date().toISOString();
    const upd = db
      .prepare(
        `UPDATE savings_goals
         SET title = ?, category = ?, target_amount = ?, saved_amount = ?,
             monthly_contribution = ?, expected_return = ?, target_date = ?, updated_at = ?
         WHERE id = ? AND user_id = ?`
      )
      .run(
        parsed.title,
        parsed.category,
        parsed.targetAmount,
        parsed.savedAmount,
        parsed.monthlyContribution,
        parsed.expectedReturn,
        parsed.targetDate,
        now,
        id,
        user.id
      );

    if (upd.changes === 0) {
      res.status(404).json({ error: 'Savings goal not found.' });
      return;
    }

    const item = db
      .prepare('SELECT * FROM savings_goals WHERE id = ? AND user_id = ?')
      .get(id, user.id);
    res.json({ item });
  });

  app.delete('/api/goals/:id', requireAuth, (req, res) =>
    handleDeleteOwnedRecord('savings_goals', 'Savings goal', req, res)
  );

  // ── 5. Expense & Budget Manager CRUD ───────────────────────────────────
  app.get('/api/transactions', requireAuth, (req: Request, res: Response) => {
    const user = (req as AuthenticatedRequest).authUser!;
    const rows = db
      .prepare('SELECT * FROM transactions WHERE user_id = ? ORDER BY txn_date DESC, id DESC LIMIT 500')
      .all(user.id);
    res.json({ items: rows });
  });

  app.post('/api/transactions', requireAuth, (req: Request, res: Response) => {
    const user = (req as AuthenticatedRequest).authUser!;
    const parsed = parseTransactionBody(req.body as Record<string, unknown> | undefined);
    if (!parsed) {
      res.status(400).json({ error: 'Invalid transaction payload.' });
      return;
    }

    const cutoffIso = new Date(Date.now() - 30_000).toISOString();
    const duplicate = db
      .prepare(
        `SELECT * FROM transactions
         WHERE user_id = ? AND type = ? AND category = ? AND LOWER(title) = LOWER(?)
           AND amount = ? AND txn_date = ? AND payment_mode = ? AND created_at >= ?`
      )
      .get(
        user.id,
        parsed.type,
        parsed.category,
        parsed.title,
        parsed.amount,
        parsed.txnDate,
        parsed.paymentMode,
        cutoffIso
      );
    if (duplicate) {
      res.status(200).json({ item: duplicate, deduplicated: true });
      return;
    }

    const now = new Date().toISOString();
    const info = db
      .prepare(
        `INSERT INTO transactions
        (user_id, type, category, title, amount, txn_date, payment_mode, notes, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        user.id,
        parsed.type,
        parsed.category,
        parsed.title,
        parsed.amount,
        parsed.txnDate,
        parsed.paymentMode,
        parsed.notes,
        now
      );

    const created = db
      .prepare('SELECT * FROM transactions WHERE id = ? AND user_id = ?')
      .get(Number(info.lastInsertRowid), user.id);
    res.status(201).json({ item: created });
  });

  app.put('/api/transactions/:id', requireAuth, (req: Request, res: Response) => {
    const user = (req as AuthenticatedRequest).authUser!;
    const id = parsePositiveId(req.params.id);
    if (!id) {
      res.status(400).json({ error: 'Invalid transaction ID.' });
      return;
    }

    const parsed = parseTransactionBody(req.body as Record<string, unknown> | undefined);
    if (!parsed) {
      res.status(400).json({ error: 'Invalid transaction update payload.' });
      return;
    }

    const upd = db
      .prepare(
        `UPDATE transactions
         SET type = ?, category = ?, title = ?, amount = ?, txn_date = ?, payment_mode = ?, notes = ?
         WHERE id = ? AND user_id = ?`
      )
      .run(
        parsed.type,
        parsed.category,
        parsed.title,
        parsed.amount,
        parsed.txnDate,
        parsed.paymentMode,
        parsed.notes,
        id,
        user.id
      );

    if (upd.changes === 0) {
      res.status(404).json({ error: 'Transaction not found.' });
      return;
    }

    const item = db
      .prepare('SELECT * FROM transactions WHERE id = ? AND user_id = ?')
      .get(id, user.id);
    res.json({ item });
  });

  app.delete('/api/transactions/:id', requireAuth, (req, res) =>
    handleDeleteOwnedRecord('transactions', 'Transaction', req, res)
  );

  app.get('/api/budgets', requireAuth, (req: Request, res: Response) => {
    const user = (req as AuthenticatedRequest).authUser!;
    const rows = db
      .prepare('SELECT * FROM budgets WHERE user_id = ? ORDER BY category ASC')
      .all(user.id);
    res.json({ items: rows });
  });

  app.put('/api/budgets', requireAuth, (req: Request, res: Response) => {
    const user = (req as AuthenticatedRequest).authUser!;
    const category = cleanString(req.body?.category, 50);
    const monthlyLimit = parseNumberInRange(req.body?.monthly_limit, 0, 1e9);

    if (category.length < 2 || monthlyLimit === null) {
      res.status(400).json({ error: 'Provide a valid category and non-negative monthly budget limit.' });
      return;
    }

    const now = new Date().toISOString();
    db.prepare(
      `INSERT INTO budgets (user_id, category, monthly_limit, updated_at)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(user_id, category) DO UPDATE SET monthly_limit = excluded.monthly_limit, updated_at = excluded.updated_at`
    ).run(user.id, category, monthlyLimit, now);

    const item = db
      .prepare('SELECT * FROM budgets WHERE user_id = ? AND category = ?')
      .get(user.id, category);
    res.json({ item });
  });

  app.delete('/api/budgets/:id', requireAuth, (req, res) =>
    handleDeleteOwnedRecord('budgets', 'Budget', req, res)
  );

  // ── 7. Tax Planner CRUD ────────────────────────────────────────────────
  app.get('/api/tax-plans', requireAuth, (req: Request, res: Response) => {
    const user = (req as AuthenticatedRequest).authUser!;
    const rows = db
      .prepare('SELECT * FROM tax_plans WHERE user_id = ? ORDER BY updated_at DESC, id DESC')
      .all(user.id);
    res.json({ items: rows });
  });

  app.post('/api/tax-plans', requireAuth, (req: Request, res: Response) => {
    const user = (req as AuthenticatedRequest).authUser!;
    const parsed = parseTaxPlanBody(req.body as Record<string, unknown> | undefined);
    if (!parsed) {
      res.status(400).json({ error: 'Invalid tax plan values.' });
      return;
    }

    const duplicate = db
      .prepare(
        `SELECT * FROM tax_plans
         WHERE user_id = ? AND LOWER(plan_name) = LOWER(?) AND financial_year = ?
           AND gross_salary = ? AND other_income = ?`
      )
      .get(user.id, parsed.planName, parsed.financialYear, parsed.grossSalary, parsed.otherIncome);
    if (duplicate) {
      res.status(200).json({ item: duplicate, deduplicated: true });
      return;
    }

    const now = new Date().toISOString();
    const info = db
      .prepare(
        `INSERT INTO tax_plans
        (user_id, plan_name, financial_year, gross_salary, other_income, sec_80c, sec_80d, nps_80ccd1b, hra_exemption, home_loan_interest, tds_paid, preferred_regime, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        user.id,
        parsed.planName,
        parsed.financialYear,
        parsed.grossSalary,
        parsed.otherIncome,
        parsed.sec80c,
        parsed.sec80d,
        parsed.nps80ccd1b,
        parsed.hraExemption,
        parsed.homeLoanInterest,
        parsed.tdsPaid,
        parsed.preferredRegime,
        now
      );

    const item = db
      .prepare('SELECT * FROM tax_plans WHERE id = ? AND user_id = ?')
      .get(Number(info.lastInsertRowid), user.id);
    res.status(201).json({ item });
  });

  app.put('/api/tax-plans/:id', requireAuth, (req: Request, res: Response) => {
    const user = (req as AuthenticatedRequest).authUser!;
    const id = parsePositiveId(req.params.id);
    if (!id) {
      res.status(400).json({ error: 'Invalid tax plan ID.' });
      return;
    }

    const parsed = parseTaxPlanBody(req.body as Record<string, unknown> | undefined);
    if (!parsed) {
      res.status(400).json({ error: 'Invalid tax plan update payload.' });
      return;
    }

    const now = new Date().toISOString();
    const upd = db
      .prepare(
        `UPDATE tax_plans
         SET plan_name = ?, financial_year = ?, gross_salary = ?, other_income = ?,
             sec_80c = ?, sec_80d = ?, nps_80ccd1b = ?, hra_exemption = ?,
             home_loan_interest = ?, tds_paid = ?, preferred_regime = ?, updated_at = ?
         WHERE id = ? AND user_id = ?`
      )
      .run(
        parsed.planName,
        parsed.financialYear,
        parsed.grossSalary,
        parsed.otherIncome,
        parsed.sec80c,
        parsed.sec80d,
        parsed.nps80ccd1b,
        parsed.hraExemption,
        parsed.homeLoanInterest,
        parsed.tdsPaid,
        parsed.preferredRegime,
        now,
        id,
        user.id
      );

    if (upd.changes === 0) {
      res.status(404).json({ error: 'Tax plan not found.' });
      return;
    }
    const item = db
      .prepare('SELECT * FROM tax_plans WHERE id = ? AND user_id = ?')
      .get(id, user.id);
    res.json({ item });
  });

  app.delete('/api/tax-plans/:id', requireAuth, (req, res) =>
    handleDeleteOwnedRecord('tax_plans', 'Tax plan', req, res)
  );

  // ── 8. Retirement Planner CRUD ─────────────────────────────────────────
  app.get('/api/retirement-plans', requireAuth, (req: Request, res: Response) => {
    const user = (req as AuthenticatedRequest).authUser!;
    const rows = db
      .prepare('SELECT * FROM retirement_plans WHERE user_id = ? ORDER BY updated_at DESC, id DESC')
      .all(user.id);
    res.json({ items: rows });
  });

  app.post('/api/retirement-plans', requireAuth, (req: Request, res: Response) => {
    const user = (req as AuthenticatedRequest).authUser!;
    const parsed = parseRetirementBody(req.body as Record<string, unknown> | undefined);
    if (!parsed) {
      res.status(400).json({
        error: 'Ensure current age < retirement age < life expectancy and all numeric rates are valid.',
      });
      return;
    }

    const duplicate = db
      .prepare(
        `SELECT * FROM retirement_plans
         WHERE user_id = ? AND LOWER(plan_name) = LOWER(?) AND current_age = ?
           AND retirement_age = ? AND life_expectancy = ? AND current_monthly_expense = ?`
      )
      .get(
        user.id,
        parsed.planName,
        parsed.currentAge,
        parsed.retirementAge,
        parsed.lifeExpectancy,
        parsed.currentMonthlyExpense
      );
    if (duplicate) {
      res.status(200).json({ item: duplicate, deduplicated: true });
      return;
    }

    const now = new Date().toISOString();
    const info = db
      .prepare(
        `INSERT INTO retirement_plans
        (user_id, plan_name, current_age, retirement_age, life_expectancy, current_monthly_expense, inflation_rate, current_corpus, monthly_sip, pre_retire_return, post_retire_return, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        user.id,
        parsed.planName,
        parsed.currentAge,
        parsed.retirementAge,
        parsed.lifeExpectancy,
        parsed.currentMonthlyExpense,
        parsed.inflationRate,
        parsed.currentCorpus,
        parsed.monthlySip,
        parsed.preRetireReturn,
        parsed.postRetireReturn,
        now
      );

    const item = db
      .prepare('SELECT * FROM retirement_plans WHERE id = ? AND user_id = ?')
      .get(Number(info.lastInsertRowid), user.id);
    res.status(201).json({ item });
  });

  app.put('/api/retirement-plans/:id', requireAuth, (req: Request, res: Response) => {
    const user = (req as AuthenticatedRequest).authUser!;
    const id = parsePositiveId(req.params.id);
    if (!id) {
      res.status(400).json({ error: 'Invalid retirement plan ID.' });
      return;
    }

    const parsed = parseRetirementBody(req.body as Record<string, unknown> | undefined);
    if (!parsed) {
      res.status(400).json({ error: 'Invalid retirement plan update payload.' });
      return;
    }

    const now = new Date().toISOString();
    const upd = db
      .prepare(
        `UPDATE retirement_plans
         SET plan_name = ?, current_age = ?, retirement_age = ?, life_expectancy = ?,
             current_monthly_expense = ?, inflation_rate = ?, current_corpus = ?,
             monthly_sip = ?, pre_retire_return = ?, post_retire_return = ?, updated_at = ?
         WHERE id = ? AND user_id = ?`
      )
      .run(
        parsed.planName,
        parsed.currentAge,
        parsed.retirementAge,
        parsed.lifeExpectancy,
        parsed.currentMonthlyExpense,
        parsed.inflationRate,
        parsed.currentCorpus,
        parsed.monthlySip,
        parsed.preRetireReturn,
        parsed.postRetireReturn,
        now,
        id,
        user.id
      );

    if (upd.changes === 0) {
      res.status(404).json({ error: 'Retirement plan not found.' });
      return;
    }
    const item = db
      .prepare('SELECT * FROM retirement_plans WHERE id = ? AND user_id = ?')
      .get(id, user.id);
    res.json({ item });
  });

  app.delete('/api/retirement-plans/:id', requireAuth, (req, res) =>
    handleDeleteOwnedRecord('retirement_plans', 'Retirement plan', req, res)
  );

  // ── 9. Financial Glossary (Public Read + Protected Admin CRUD) ──────────
  app.get('/api/glossary', (_req: Request, res: Response) => {
    const items = db.prepare('SELECT * FROM glossary_terms ORDER BY term ASC').all();
    res.json({ items });
  });

  app.post('/api/admin/glossary', requireAdmin, (req: Request, res: Response) => {
    const term = cleanString(req.body?.term, 100);
    const category = cleanString(req.body?.category, 40);
    const formula = cleanString(req.body?.formula ?? '', 180);
    const summary = cleanString(req.body?.summary, 500);
    const example = cleanString(req.body?.example ?? '', 400);

    if (term.length < 2 || category.length < 2 || summary.length < 10) {
      res.status(400).json({ error: 'Provide term, category, and a descriptive summary.' });
      return;
    }

    const baseSlug = slugify(term) || `term-${Date.now()}`;
    const existing = db.prepare('SELECT id FROM glossary_terms WHERE slug = ?').get(baseSlug);
    const slug = existing ? `${baseSlug}-${Date.now().toString(36)}` : baseSlug;
    const now = new Date().toISOString();

    const info = db
      .prepare(
        `INSERT INTO glossary_terms (slug, term, category, formula, summary, example, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .run(slug, term, category, formula, summary, example, now);

    const item = db
      .prepare('SELECT * FROM glossary_terms WHERE id = ?')
      .get(Number(info.lastInsertRowid));
    res.status(201).json({ item });
  });

  app.put('/api/admin/glossary/:id', requireAdmin, (req: Request, res: Response) => {
    const id = parsePositiveId(req.params.id);
    if (!id) {
      res.status(400).json({ error: 'Invalid glossary ID.' });
      return;
    }
    const term = cleanString(req.body?.term, 100);
    const category = cleanString(req.body?.category, 40);
    const formula = cleanString(req.body?.formula ?? '', 180);
    const summary = cleanString(req.body?.summary, 500);
    const example = cleanString(req.body?.example ?? '', 400);

    if (term.length < 2 || category.length < 2 || summary.length < 10) {
      res.status(400).json({ error: 'Invalid glossary fields.' });
      return;
    }

    const now = new Date().toISOString();
    const upd = db
      .prepare(
        'UPDATE glossary_terms SET term = ?, category = ?, formula = ?, summary = ?, example = ?, updated_at = ? WHERE id = ?'
      )
      .run(term, category, formula, summary, example, now, id);
    if (upd.changes === 0) {
      res.status(404).json({ error: 'Glossary term not found.' });
      return;
    }
    const item = db.prepare('SELECT * FROM glossary_terms WHERE id = ?').get(id);
    res.json({ item });
  });

  app.delete('/api/admin/glossary/:id', requireAdmin, (req, res) =>
    handleDeleteAdminRecord('glossary_terms', 'Glossary term', req, res)
  );

  // ── 10. Financial Education Center (Public Read + User Progress + Admin CRUD) ──
  app.get('/api/education/lessons', (_req: Request, res: Response) => {
    const rows = db.prepare('SELECT * FROM education_lessons ORDER BY id ASC').all() as Array<{
      id: number;
      slug: string;
      title: string;
      category: string;
      level: string;
      read_minutes: number;
      summary: string;
      key_takeaways_json: string;
      content_paragraphs_json: string;
      quiz_json: string;
      updated_at: string;
    }>;

    const items = rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      category: r.category,
      level: r.level,
      read_minutes: r.read_minutes,
      summary: r.summary,
      keyTakeaways: parseJsonArray<string>(r.key_takeaways_json, []),
      contentParagraphs: parseJsonArray<string>(r.content_paragraphs_json, []),
      quiz: parseJsonArray(r.quiz_json, []),
      updated_at: r.updated_at,
    }));

    res.json({ items });
  });

  app.get('/api/education/progress', requireAuth, (req: Request, res: Response) => {
    const user = (req as AuthenticatedRequest).authUser!;
    const items = db
      .prepare('SELECT lesson_slug, completed, quiz_score, updated_at FROM learning_progress WHERE user_id = ?')
      .all(user.id);
    res.json({ items });
  });

  app.put('/api/education/progress', requireAuth, (req: Request, res: Response) => {
    const user = (req as AuthenticatedRequest).authUser!;
    const lessonSlug = cleanString(req.body?.lesson_slug, 80);
    const completed = req.body?.completed ? 1 : 0;
    const quizScore = parseIntInRange(req.body?.quiz_score ?? 0, 0, 100);

    if (!lessonSlug || quizScore === null) {
      res.status(400).json({ error: 'Invalid lesson progress payload.' });
      return;
    }

    const exists = db
      .prepare('SELECT id FROM education_lessons WHERE slug = ?')
      .get(lessonSlug);
    if (!exists) {
      res.status(404).json({ error: 'Lesson not found.' });
      return;
    }

    const now = new Date().toISOString();
    db.prepare(
      `INSERT INTO learning_progress (user_id, lesson_slug, completed, quiz_score, updated_at)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(user_id, lesson_slug) DO UPDATE SET completed = excluded.completed, quiz_score = excluded.quiz_score, updated_at = excluded.updated_at`
    ).run(user.id, lessonSlug, completed, quizScore, now);

    const item = db
      .prepare('SELECT lesson_slug, completed, quiz_score, updated_at FROM learning_progress WHERE user_id = ? AND lesson_slug = ?')
      .get(user.id, lessonSlug);
    res.json({ item });
  });

  app.post('/api/admin/lessons', requireAdmin, (req: Request, res: Response) => {
    const title = cleanString(req.body?.title, 140);
    const category = cleanString(req.body?.category, 50);
    const level = cleanString(req.body?.level ?? 'Beginner', 30);
    const readMinutes = parseIntInRange(req.body?.read_minutes ?? 5, 1, 60);
    const summary = cleanString(req.body?.summary, 400);
    const keyTakeaways = Array.isArray(req.body?.keyTakeaways)
      ? req.body.keyTakeaways.map((s: unknown) => cleanString(s, 220)).filter(Boolean).slice(0, 6)
      : [];
    const contentParagraphs = Array.isArray(req.body?.contentParagraphs)
      ? req.body.contentParagraphs.map((s: unknown) => cleanString(s, 1000)).filter(Boolean).slice(0, 8)
      : [];

    if (
      title.length < 4 ||
      category.length < 2 ||
      readMinutes === null ||
      summary.length < 10 ||
      contentParagraphs.length === 0
    ) {
      res.status(400).json({ error: 'Provide title, category, summary, and at least one paragraph.' });
      return;
    }

    const baseSlug = slugify(title) || `lesson-${Date.now()}`;
    const existing = db.prepare('SELECT id FROM education_lessons WHERE slug = ?').get(baseSlug);
    const slug = existing ? `${baseSlug}-${Date.now().toString(36)}` : baseSlug;
    const now = new Date().toISOString();

    const info = db
      .prepare(
        `INSERT INTO education_lessons
        (slug, title, category, level, read_minutes, summary, key_takeaways_json, content_paragraphs_json, quiz_json, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        slug,
        title,
        category,
        level,
        readMinutes,
        summary,
        JSON.stringify(keyTakeaways),
        JSON.stringify(contentParagraphs),
        JSON.stringify([]),
        now
      );

    res.status(201).json({
      item: {
        id: Number(info.lastInsertRowid),
        slug,
        title,
        category,
        level,
        read_minutes: readMinutes,
        summary,
        keyTakeaways,
        contentParagraphs,
        quiz: [],
        updated_at: now,
      },
    });
  });

  app.delete('/api/admin/lessons/:id', requireAdmin, (req, res) =>
    handleDeleteAdminRecord('education_lessons', 'Lesson', req, res)
  );

  // ── 1 & 6. Consolidated Workspace Summary (Insights Dashboard + Reports) ──
  app.get('/api/workspace/summary', requireAuth, (req: Request, res: Response) => {
    const user = (req as AuthenticatedRequest).authUser!;
    res.json({
      investments: db
        .prepare('SELECT * FROM investments WHERE user_id = ? ORDER BY updated_at DESC, id DESC')
        .all(user.id),
      loans: db
        .prepare('SELECT * FROM loans WHERE user_id = ? ORDER BY updated_at DESC, id DESC')
        .all(user.id),
      goals: db
        .prepare('SELECT * FROM savings_goals WHERE user_id = ? ORDER BY updated_at DESC, id DESC')
        .all(user.id),
      transactions: db
        .prepare('SELECT * FROM transactions WHERE user_id = ? ORDER BY txn_date DESC, id DESC LIMIT 500')
        .all(user.id),
      budgets: db
        .prepare('SELECT * FROM budgets WHERE user_id = ? ORDER BY category ASC')
        .all(user.id),
      taxPlans: db
        .prepare('SELECT * FROM tax_plans WHERE user_id = ? ORDER BY updated_at DESC, id DESC')
        .all(user.id),
      retirementPlans: db
        .prepare('SELECT * FROM retirement_plans WHERE user_id = ? ORDER BY updated_at DESC, id DESC')
        .all(user.id),
      learningProgress: db
        .prepare('SELECT lesson_slug, completed, quiz_score, updated_at FROM learning_progress WHERE user_id = ?')
        .all(user.id),
    });
  });

  // Ensure unmatched /api/* endpoints return JSON 404 rather than HTML
  app.all('/api/*', (_req, res) => {
    res.status(404).json({ error: 'API endpoint not found.' });
  });

  // ── Vite Dev Middleware / Production Static Serving ──────────────────────
  if (!IS_PROD) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir, { index: false }));
    app.get('*', (_req, res) => {
      const indexHtml = path.join(distDir, 'index.html');
      if (fs.existsSync(indexHtml)) {
        res.sendFile(indexHtml);
      } else {
        res.status(404).send('Build output not found. Run npm run build first.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CalHub FinCalc Pro server running on http://0.0.0.0:${PORT} (${IS_PROD ? 'prod' : 'dev'})`);
  });
}

createApp().catch((err) => {
  console.error('Failed to start CalHub FinCalc Pro server:', err);
  process.exit(1);
});
