import { query } from "./client";

export type CartRoutine = "morning" | "evening";
export interface CartRow { product_id: string; qty: number; routine: CartRoutine | null; added_at: string }

export const MAX_QTY = 9;

export const listCart = (userId: string) =>
  query<CartRow>(`SELECT product_id, qty, routine, added_at FROM cart_items WHERE user_id = $1 ORDER BY added_at DESC, product_id`, [userId]);

export async function cartCount(userId: string): Promise<number> {
  const [row] = await query<{ n: number }>(`SELECT COALESCE(SUM(qty), 0)::int AS n FROM cart_items WHERE user_id = $1`, [userId]);
  return row?.n ?? 0;
}

// Adds products; one already in the cart is left as it is (its quantity is not increased).
export async function addToCart(userId: string, productIds: string[], routine: CartRoutine | null): Promise<void> {
  for (const id of new Set(productIds)) {
    await query(
      `INSERT INTO cart_items (user_id, product_id, qty, routine) VALUES ($1, $2, 1, $3) ON CONFLICT (user_id, product_id) DO NOTHING`,
      [userId, id, routine],
    );
  }
}

export async function setQty(userId: string, productId: string, qty: number): Promise<void> {
  await query(`UPDATE cart_items SET qty = $3 WHERE user_id = $1 AND product_id = $2`, [userId, productId, Math.min(MAX_QTY, Math.max(1, Math.round(qty)))]);
}

export const removeFromCart = (userId: string, productId: string) => query(`DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2`, [userId, productId]);
export const clearCart = (userId: string) => query(`DELETE FROM cart_items WHERE user_id = $1`, [userId]);
