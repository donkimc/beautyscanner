import type { Locale } from "../i18n/locale";
import { messages } from "../i18n/messages";
import type { Product } from "./products";

export const money = (n: number, locale: Locale) => `${n.toLocaleString()}${locale === "ko" ? "원" : " KRW"}`;

// Estimated prices get "약 " / "~" in front so nobody mistakes an estimate for a quoted price.
export const priceText = (p: Product, locale: Locale, qty = 1) => `${p.approxPrice ? messages[locale].product.approx : ""}${money(p.price * qty, locale)}`;

export function totalText(lines: { product: Product; qty?: number }[], locale: Locale): string {
  const total = lines.reduce((s, l) => s + l.product.price * (l.qty ?? 1), 0);
  return `${lines.some((l) => l.product.approxPrice) ? messages[locale].product.approx : ""}${money(total, locale)}`;
}
