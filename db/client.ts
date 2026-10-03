import { SCHEMA } from "./schema";

// Postgres access. Production uses DATABASE_URL (Railway Postgres). Without it, development and tests
// fall back to an in-memory PGlite database. Production without DATABASE_URL is an error.

interface Db {
  query<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<T[]>;
}

// Kept on globalThis so dev-mode hot reloading and per-route bundles share one connection / in-memory DB.
const g = globalThis as unknown as { __bsDb?: Promise<Db> };

async function open(): Promise<Db> {
  const url = process.env.DATABASE_URL;
  if (url) {
    const { Pool } = await import("pg");
    const internal = /\.railway\.internal/.test(url);
    const pool = new Pool({ connectionString: url, max: 5, ssl: internal || /localhost|127\.0\.0\.1/.test(url) ? false : { rejectUnauthorized: false } });
    await pool.query(SCHEMA);
    return { query: async (sql, params) => (await pool.query(sql, params as unknown[])).rows };
  }
  if (process.env.NODE_ENV === "production") throw new Error("DATABASE_URL is required in production");
  const { PGlite } = await import("@electric-sql/pglite");
  const lite = new PGlite();
  await lite.exec(SCHEMA);
  return { query: async (sql, params) => (await lite.query(sql, params as unknown[])).rows as never };
}

export function db(): Promise<Db> {
  g.__bsDb ??= open().catch((e) => {
    g.__bsDb = undefined;
    throw e;
  });
  return g.__bsDb;
}

export async function query<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T[]> {
  return (await db()).query<T>(sql, params);
}

export const hasDatabase = () => Boolean(process.env.DATABASE_URL) || process.env.NODE_ENV !== "production";
