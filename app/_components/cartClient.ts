// Client helpers for the shopping cart. A guest's "add to cart" is remembered, they log in, then it's added.

export const PENDING_KEY = "bs_pending_cart";
export const CART_EVENT = "bs:cart";
export interface Pending { productIds: string[]; routine?: "morning" | "evening" }

export const notifyCartChanged = () => window.dispatchEvent(new Event(CART_EVENT));

export async function postCart(productIds: string[], routine?: Pending["routine"]): Promise<boolean> {
  const res = await fetch("/api/cart", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ productIds, routine }) }).catch(() => null);
  if (res?.ok) notifyCartChanged();
  return Boolean(res?.ok);
}

export function rememberPending(p: Pending) {
  try { localStorage.setItem(PENDING_KEY, JSON.stringify(p)); } catch { /* storage unavailable */ }
}

export function takePending(): Pending | null {
  try {
    const raw = localStorage.getItem(PENDING_KEY);
    localStorage.removeItem(PENDING_KEY);
    const p = raw ? (JSON.parse(raw) as Pending) : null;
    return p && Array.isArray(p.productIds) && p.productIds.length ? p : null;
  } catch { return null; }
}

export async function currentUser(): Promise<{ email: string; name: string } | null> {
  const d = await fetch("/api/auth/me").then((r) => r.json()).catch(() => null);
  return d?.user ?? null;
}

// Shared between all "Add to cart" buttons on a page: one request, refreshed whenever the cart changes.
let cached: Promise<string[] | null> | null = null;
if (typeof window !== "undefined") window.addEventListener(CART_EVENT, () => { cached = null; });

export function cartIds(): Promise<string[] | null> {
  cached ??= fetch("/api/cart")
    .then(async (res) => (res.ok ? ((await res.json()).items as { productId: string }[]).map((i) => i.productId) : null))
    .catch(() => null);
  return cached;
}
