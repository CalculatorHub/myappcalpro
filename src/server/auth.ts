import crypto from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import { getDb } from './db.ts';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
  isAdminSession: boolean;
}

export interface AuthenticatedRequest extends Request {
  authUser?: AuthUser;
  authTokenHash?: string;
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split(':');
  if (parts.length !== 2) return false;
  const [salt, expectedHex] = parts;
  if (!salt || !expectedHex) return false;
  const actualBuf = crypto.scryptSync(password, salt, 64);
  const expectedBuf = Buffer.from(expectedHex, 'hex');
  if (actualBuf.length !== expectedBuf.length) return false;
  return crypto.timingSafeEqual(actualBuf, expectedBuf);
}

export function hashSessionToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function createUserSession(userId: number, isAdmin = false): string {
  const db = getDb();
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashSessionToken(rawToken);
  const now = new Date();
  const expires = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  db.prepare(
    'INSERT INTO sessions (user_id, token_hash, is_admin, expires_at, created_at) VALUES (?, ?, ?, ?, ?)'
  ).run(userId, tokenHash, isAdmin ? 1 : 0, expires.toISOString(), now.toISOString());

  return rawToken;
}

export function revokeSessionByHash(tokenHash: string): void {
  const db = getDb();
  db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(tokenHash);
}

export function getAdminConfigStatus(): {
  envConfigured: boolean;
  claimedInDb: boolean;
  isConfigured: boolean;
} {
  const envPasscode = process.env.ADMIN_PASSCODE?.trim();
  if (envPasscode && envPasscode.length > 0) {
    return { envConfigured: true, claimedInDb: false, isConfigured: true };
  }
  const db = getDb();
  const row = db
    .prepare("SELECT value FROM admin_config WHERE key = 'admin_passcode_hash'")
    .get() as { value: string } | undefined;
  const claimedInDb = Boolean(row?.value);
  return { envConfigured: false, claimedInDb, isConfigured: claimedInDb };
}

export function verifyAdminPasscode(passcode: string): boolean {
  const envPasscode = process.env.ADMIN_PASSCODE?.trim();
  if (envPasscode && envPasscode.length > 0) {
    const a = Buffer.from(passcode);
    const b = Buffer.from(envPasscode);
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  }

  const db = getDb();
  const row = db
    .prepare("SELECT value FROM admin_config WHERE key = 'admin_passcode_hash'")
    .get() as { value: string } | undefined;
  if (!row?.value) return false;
  return verifyPassword(passcode, row.value);
}

export function extractBearerToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return null;
  const token = header.slice(7).trim();
  return token.length > 10 ? token : null;
}

export function resolveAuthFromRequest(req: Request): {
  user: AuthUser;
  tokenHash: string;
} | null {
  const rawToken = extractBearerToken(req);
  if (!rawToken) return null;

  const db = getDb();
  const tokenHash = hashSessionToken(rawToken);
  const row = db
    .prepare(
      `
      SELECT s.user_id, s.is_admin, s.expires_at, u.name, u.email, u.role
      FROM sessions s
      JOIN users u ON u.id = s.user_id
      WHERE s.token_hash = ?
    `
    )
    .get(tokenHash) as
    | {
        user_id: number;
        is_admin: number;
        expires_at: string;
        name: string;
        email: string;
        role: string;
      }
    | undefined;

  if (!row) return null;
  if (new Date(row.expires_at).getTime() <= Date.now()) {
    revokeSessionByHash(tokenHash);
    return null;
  }

  return {
    tokenHash,
    user: {
      id: row.user_id,
      name: row.name,
      email: row.email,
      role: row.role,
      isAdminSession: row.is_admin === 1 || row.role === 'admin',
    },
  };
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const resolved = resolveAuthFromRequest(req);
  if (!resolved) {
    res.status(401).json({ error: 'Authentication required. Please sign in to save and manage records.' });
    return;
  }
  const authReq = req as AuthenticatedRequest;
  authReq.authUser = resolved.user;
  authReq.authTokenHash = resolved.tokenHash;
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const resolved = resolveAuthFromRequest(req);
  if (!resolved) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }
  if (!resolved.user.isAdminSession) {
    res.status(403).json({ error: 'Admin privileges required. Unlock Admin Console first.' });
    return;
  }
  const authReq = req as AuthenticatedRequest;
  authReq.authUser = resolved.user;
  authReq.authTokenHash = resolved.tokenHash;
  next();
}
