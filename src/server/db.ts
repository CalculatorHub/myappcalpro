import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import {
  INITIAL_EDUCATION_LESSONS,
  INITIAL_GLOSSARY_TERMS,
} from './seedContent.ts';

let dbInstance: DatabaseSync | null = null;

function resolveSafeDbPath(): string {
  const workspaceRoot = path.resolve(process.cwd());
  const defaultDir = path.join(workspaceRoot, 'data');
  const rawEnvPath = process.env.SQLITE_DB_PATH?.trim();

  if (!rawEnvPath) {
    mkdirSync(defaultDir, { recursive: true });
    return path.join(defaultDir, 'calhub.db');
  }

  const resolved = path.resolve(workspaceRoot, rawEnvPath);
  if (!resolved.startsWith(workspaceRoot + path.sep)) {
    throw new Error('SQLITE_DB_PATH must reside inside the workspace directory.');
  }
  mkdirSync(path.dirname(resolved), { recursive: true });
  return resolved;
}

export function getDb(): DatabaseSync {
  if (dbInstance) return dbInstance;

  const dbPath = resolveSafeDbPath();
  const db = new DatabaseSync(dbPath);
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA foreign_keys = ON;');

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      created_at TEXT NOT NULL
    );
    CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_lower ON users(LOWER(email));

    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token_hash TEXT NOT NULL UNIQUE,
      is_admin INTEGER NOT NULL DEFAULT 0,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_sessions_token_hash ON sessions(token_hash);

    CREATE TABLE IF NOT EXISTS admin_config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS investments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      monthly_contribution REAL NOT NULL DEFAULT 0,
      principal_amount REAL NOT NULL DEFAULT 0,
      annual_return REAL NOT NULL DEFAULT 0,
      tenure_years REAL NOT NULL DEFAULT 1,
      notes TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_investments_user ON investments(user_id);

    CREATE TABLE IF NOT EXISTS loans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      lender_name TEXT NOT NULL,
      loan_type TEXT NOT NULL,
      principal_amount REAL NOT NULL,
      annual_rate REAL NOT NULL,
      tenure_months INTEGER NOT NULL,
      months_paid INTEGER NOT NULL DEFAULT 0,
      extra_monthly_payment REAL NOT NULL DEFAULT 0,
      notes TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_loans_user ON loans(user_id);

    CREATE TABLE IF NOT EXISTS savings_goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      target_amount REAL NOT NULL,
      saved_amount REAL NOT NULL DEFAULT 0,
      monthly_contribution REAL NOT NULL DEFAULT 0,
      expected_return REAL NOT NULL DEFAULT 7,
      target_date TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_goals_user ON savings_goals(user_id);

    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      amount REAL NOT NULL,
      txn_date TEXT NOT NULL,
      payment_mode TEXT NOT NULL DEFAULT 'UPI',
      notes TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, txn_date DESC);

    CREATE TABLE IF NOT EXISTS budgets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      category TEXT NOT NULL,
      monthly_limit REAL NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(user_id, category),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS tax_plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      plan_name TEXT NOT NULL,
      financial_year TEXT NOT NULL,
      gross_salary REAL NOT NULL DEFAULT 0,
      other_income REAL NOT NULL DEFAULT 0,
      sec_80c REAL NOT NULL DEFAULT 0,
      sec_80d REAL NOT NULL DEFAULT 0,
      nps_80ccd1b REAL NOT NULL DEFAULT 0,
      hra_exemption REAL NOT NULL DEFAULT 0,
      home_loan_interest REAL NOT NULL DEFAULT 0,
      tds_paid REAL NOT NULL DEFAULT 0,
      preferred_regime TEXT NOT NULL DEFAULT 'new',
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_tax_plans_user ON tax_plans(user_id);

    CREATE TABLE IF NOT EXISTS retirement_plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      plan_name TEXT NOT NULL,
      current_age INTEGER NOT NULL,
      retirement_age INTEGER NOT NULL,
      life_expectancy INTEGER NOT NULL,
      current_monthly_expense REAL NOT NULL,
      inflation_rate REAL NOT NULL,
      current_corpus REAL NOT NULL DEFAULT 0,
      monthly_sip REAL NOT NULL DEFAULT 0,
      pre_retire_return REAL NOT NULL,
      post_retire_return REAL NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_retirement_plans_user ON retirement_plans(user_id);

    CREATE TABLE IF NOT EXISTS glossary_terms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      term TEXT NOT NULL,
      category TEXT NOT NULL,
      formula TEXT NOT NULL DEFAULT '',
      summary TEXT NOT NULL,
      example TEXT NOT NULL DEFAULT '',
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS education_lessons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      level TEXT NOT NULL,
      read_minutes INTEGER NOT NULL DEFAULT 5,
      summary TEXT NOT NULL,
      key_takeaways_json TEXT NOT NULL,
      content_paragraphs_json TEXT NOT NULL,
      quiz_json TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS learning_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      lesson_slug TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      quiz_score INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL,
      UNIQUE(user_id, lesson_slug),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  const now = new Date().toISOString();
  const glossaryCountRow = db
    .prepare('SELECT COUNT(*) AS count FROM glossary_terms')
    .get() as { count: number };

  if (glossaryCountRow.count === 0) {
    const insertGlossary = db.prepare(`
      INSERT INTO glossary_terms (slug, term, category, formula, summary, example, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    for (const item of INITIAL_GLOSSARY_TERMS) {
      insertGlossary.run(
        item.slug,
        item.term,
        item.category,
        item.formula,
        item.summary,
        item.example,
        now
      );
    }
  }

  const lessonsCountRow = db
    .prepare('SELECT COUNT(*) AS count FROM education_lessons')
    .get() as { count: number };

  if (lessonsCountRow.count === 0) {
    const insertLesson = db.prepare(`
      INSERT INTO education_lessons (
        slug, title, category, level, read_minutes, summary,
        key_takeaways_json, content_paragraphs_json, quiz_json, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const lesson of INITIAL_EDUCATION_LESSONS) {
      insertLesson.run(
        lesson.slug,
        lesson.title,
        lesson.category,
        lesson.level,
        lesson.readMinutes,
        lesson.summary,
        JSON.stringify(lesson.keyTakeaways),
        JSON.stringify(lesson.contentParagraphs),
        JSON.stringify(lesson.quiz),
        now
      );
    }
  }

  dbInstance = db;
  return db;
}
