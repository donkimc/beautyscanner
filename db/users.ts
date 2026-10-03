import { createHash, randomBytes } from "node:crypto";
import { query } from "./client";

export interface DbUser { id: string; email: string; name: string | null; locale: string | null }

export const normalizeEmail = (e: string) => e.trim().toLowerCase();
export const isEmail = (e: string) => e.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
export const hashToken = (t: string) => createHash("sha256").update(t).digest("hex");

export async function upsertUser(email: string, name?: string | null, locale?: string | null): Promise<DbUser> {
  const rows = await query<DbUser>(
    `INSERT INTO users (email, name, locale) VALUES ($1, $2, $3)
     ON CONFLICT (email) DO UPDATE SET name = COALESCE(users.name, EXCLUDED.name), locale = COALESCE(EXCLUDED.locale, users.locale)
     RETURNING id, email, name, locale`,
    [normalizeEmail(email), name ?? null, locale ?? null],
  );
  await query(`UPDATE consents SET user_id = $1 WHERE user_id IS NULL AND email = $2`, [rows[0].id, rows[0].email]);
  return rows[0];
}

export async function getUser(id: string): Promise<DbUser | null> {
  return (await query<DbUser>(`SELECT id, email, name, locale FROM users WHERE id = $1`, [id]))[0] ?? null;
}

export async function deleteUser(id: string): Promise<void> {
  await query(`DELETE FROM users WHERE id = $1`, [id]);
}

// ---- email login tokens (single use, 15 minutes, only the hash is stored) ----

export const TOKEN_TTL_MINUTES = 15;
export const MAX_TOKENS_PER_HOUR = 5;

export async function createLoginToken(email: string): Promise<string | null> {
  const e = normalizeEmail(email);
  const [{ n }] = await query<{ n: number }>(
    `SELECT count(*)::int AS n FROM login_tokens WHERE email = $1 AND created_at > now() - interval '1 hour'`,
    [e],
  );
  if (n >= MAX_TOKENS_PER_HOUR) return null;
  const token = randomBytes(32).toString("base64url");
  await query(
    `INSERT INTO login_tokens (email, token_hash, expires_at) VALUES ($1, $2, now() + ($3 || ' minutes')::interval)`,
    [e, hashToken(token), String(TOKEN_TTL_MINUTES)],
  );
  return token;
}

// Atomically consumes a token: returns the email once, then never again.
export async function consumeLoginToken(token: string): Promise<string | null> {
  const rows = await query<{ email: string }>(
    `UPDATE login_tokens SET used_at = now()
     WHERE token_hash = $1 AND used_at IS NULL AND expires_at > now() RETURNING email`,
    [hashToken(token)],
  );
  return rows[0]?.email ?? null;
}
