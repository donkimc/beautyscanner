import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ProductImage from "../app/_components/ProductImage";
import { ART } from "../app/_components/ProductArt";
import { PRODUCTS, type Step } from "../lib/products";
import { messages } from "../i18n/messages";

const p = PRODUCTS[0];
const render = (product: typeof p, locale: "ko" | "en" = "en") => renderToStaticMarkup(createElement(ProductImage, { product, locale, className: "size-10" }));

test("a product with a photo renders an <img> with the product name as alt text", () => {
  const html = render({ ...p, image: "/products/c1.webp" });
  assert.match(html, /<img[^>]+src="\/products\/c1\.webp"/);
  assert.match(html, /alt="\[Sample\] Mild-acid gel cleanser"/);
  assert.match(html, /loading="lazy"/);
});

test("a product without a photo renders an accessible illustration instead", () => {
  const html = render(p);
  assert.match(html, /role="img"/);
  assert.match(html, /aria-label="\[Sample\] Mild-acid gel cleanser"/);
  assert.match(html, /<svg/);
  assert.doesNotMatch(html, /<img/);
});

test("the alt text follows the language", () => {
  assert.match(render(p, "ko"), /aria-label="\[샘플\] 약산성 젤 클렌저"/);
});

test("every routine step has an illustration, and every product renders a picture", () => {
  const steps: Step[] = ["cleanser", "toner", "serum", "moisturizer", "sunscreen"];
  for (const s of steps) assert.equal(typeof ART[s], "function", s);
  for (const product of PRODUCTS) assert.match(render(product), /role="img"/, product.id);
});

test("the shop, routine, cart, dashboard and product texts exist in both languages", () => {
  for (const l of ["ko", "en"] as const) {
    const m = messages[l];
    for (const t of ["morning", "evening"] as const) assert.ok(m.routine.title[t] && m.routine.tab[t] && m.routine.tabSub[t]);
    for (const step of ["cleanser", "toner", "serum", "moisturizer"] as const) for (const t of ["morning", "evening"] as const) assert.ok(m.routine.tips[step][t].length > 0, `${l} ${step} ${t}`);
    assert.ok(m.routine.tips.sunscreen.morning.length > 0);
    assert.ok(m.cart.empty && m.cart.note && m.dashboard.title && m.product.sample && m.shop.addAll);
    assert.ok(m.routine.skipped.eveningOnly("X").includes("X") && m.routine.skipped.morningOnly("X").includes("X"));
  }
});
