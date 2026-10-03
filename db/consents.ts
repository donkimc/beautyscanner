import { query } from "./client";

export interface ConsentInput { purpose: string; version: string; granted: boolean }

export async function recordConsents(items: ConsentInput[], who: { userId?: string; email?: string; anonId?: string }) {
  for (const c of items) {
    await query(
      `INSERT INTO consents (user_id, email, anon_id, purpose, version, granted) VALUES ($1, $2, $3, $4, $5, $6)`,
      [who.userId ?? null, who.email?.toLowerCase() ?? null, who.anonId ?? null, c.purpose, c.version, c.granted],
    );
  }
}

export async function listConsents(userId: string) {
  return query(`SELECT purpose, version, granted, created_at FROM consents WHERE user_id = $1 ORDER BY created_at DESC`, [userId]);
}
