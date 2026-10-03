import { query } from "./client";

export interface SavedRoutine { id: string; answers: unknown; product_ids: string[]; total: number; created_at: string }

export async function saveRoutine(userId: string, answers: unknown, productIds: string[], total: number) {
  return (await query<{ id: string }>(
    `INSERT INTO routines (user_id, answers, product_ids, total) VALUES ($1, $2::jsonb, $3, $4) RETURNING id`,
    [userId, JSON.stringify(answers), productIds, total],
  ))[0];
}

export const listRoutines = (userId: string) =>
  query<SavedRoutine>(`SELECT id, answers, product_ids, total, created_at FROM routines WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`, [userId]);

export const deleteRoutine = (userId: string, id: string) => query(`DELETE FROM routines WHERE user_id = $1 AND id = $2`, [userId, id]);
