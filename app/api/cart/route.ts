import { sessionFrom } from "../../../auth/session";
import { addToCart, clearCart, listCart, removeFromCart, setQty, type CartRoutine } from "../../../db/cart";
import { PRODUCTS } from "../../../lib/products";

const KNOWN = new Set(PRODUCTS.map((p) => p.id));
const noStore = { "cache-control": "no-store" };
const routineOf = (v: unknown): CartRoutine | null => (v === "morning" || v === "evening" ? v : null);

export async function GET(req: Request) {
  const user = sessionFrom(req);
  if (!user) return Response.json({ error: "unauthorized" }, { status: 401 });
  const rows = await listCart(user.uid);
  return Response.json({ items: rows.filter((r) => KNOWN.has(r.product_id)).map((r) => ({ productId: r.product_id, qty: r.qty, routine: r.routine })) }, { headers: noStore });
}

// Add products. Already-present products are left as they are.
export async function POST(req: Request) {
  const user = sessionFrom(req);
  if (!user) return Response.json({ error: "unauthorized" }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { productIds?: unknown; routine?: unknown };
  const ids = body.productIds;
  if (!Array.isArray(ids) || ids.length < 1 || ids.length > 10 || !ids.every((id) => typeof id === "string" && KNOWN.has(id))) {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }
  await addToCart(user.uid, ids as string[], routineOf(body.routine));
  return Response.json({ ok: true });
}

export async function PATCH(req: Request) {
  const user = sessionFrom(req);
  if (!user) return Response.json({ error: "unauthorized" }, { status: 401 });
  const { productId, qty } = (await req.json().catch(() => ({}))) as { productId?: unknown; qty?: unknown };
  if (typeof productId !== "string" || !KNOWN.has(productId) || typeof qty !== "number" || !Number.isFinite(qty)) {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }
  await setQty(user.uid, productId, qty);
  return Response.json({ ok: true });
}

// ?productId=ID removes one product; no parameter empties the cart.
export async function DELETE(req: Request) {
  const user = sessionFrom(req);
  if (!user) return Response.json({ error: "unauthorized" }, { status: 401 });
  const id = new URL(req.url).searchParams.get("productId");
  if (id === null) await clearCart(user.uid);
  else if (KNOWN.has(id)) await removeFromCart(user.uid, id);
  else return Response.json({ error: "bad_request" }, { status: 400 });
  return Response.json({ ok: true });
}
