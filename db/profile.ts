import { query } from "./client";

// The saved skin profile (the latest survey answers) plus the editable display name.

export async function getProfileAnswers(userId: string): Promise<unknown | null> {
  const rows = await query<{ answers: unknown }>(`SELECT answers FROM profiles WHERE user_id = $1`, [userId]);
  return rows[0]?.answers ?? null;
}

export async function saveProfileAnswers(userId: string, answers: unknown): Promise<void> {
  await query(
    `INSERT INTO profiles (user_id, answers) VALUES ($1, $2::jsonb)
     ON CONFLICT (user_id) DO UPDATE SET answers = EXCLUDED.answers, updated_at = now()`,
    [userId, JSON.stringify(answers)],
  );
}

export async function updateName(userId: string, name: string): Promise<void> {
  await query(`UPDATE users SET name = $2 WHERE id = $1`, [userId, name]);
}
