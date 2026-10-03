import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ProductImage from "../app/_components/ProductImage";
import { ART } from "../app/_components/ProductArt";
import { existsSync } from "node:fs";
import { PRODUCTS, hasBuyLink, retailerSearchLinks, type Step } from "../lib/products";
import { money, priceText, totalText } from "../lib/price";
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
  for (const product of PRODUCTS) assert.match(render(product), product.image ? /<img/ : /role="img"/, product.id);
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

test("real products: photos exist on disk, and only clean product shots are used", () => {
  const real = PRODUCTS.filter((p) => p.real);
  assert.deepEqual(real.map((p) => p.id), ["r1", "r2", "r3", "r4", "r5"]);
  for (const p of PRODUCTS.filter((x) => x.image)) assert.ok(existsSync(new URL(`../public${p.image}`, import.meta.url)), `${p.id} ${p.image}`);
  // Anua's promo photo shows a celebrity's face and Torriden's is an ad banner with a "No.1" claim: they stay on the illustration until clean photos exist.
  assert.equal(PRODUCTS.find((p) => p.id === "r4")!.image, undefined);
  assert.equal(PRODUCTS.find((p) => p.id === "r3")!.image, undefined);
  assert.ok(PRODUCTS.filter((p) => !p.real).every((p) => !p.image && p.name.includes("[샘플]")));
});

test("real products are not given evidence we don't have: unreviewed ones are 'unrated'", () => {
  for (const id of ["r1", "r4", "r5"]) assert.equal(PRODUCTS.find((p) => p.id === id)!.grade, "unrated");
  for (const l of ["ko", "en"] as const) assert.ok(messages[l].result.grades.unrated.length > 0);
});

test("retailer search links exist only for real products and carry the product name", () => {
  const r1 = PRODUCTS.find((p) => p.id === "r1")!;
  const links = retailerSearchLinks(r1)!;
  assert.match(links.naver, /^https:\/\/search\.shopping\.naver\.com\/search\/all\?query=/);
  assert.match(links.coupang, /^https:\/\/www\.coupang\.com\/np\/search\?q=/);
  assert.ok(decodeURIComponent(links.naver).includes(r1.name));
  assert.equal(retailerSearchLinks(PRODUCTS.find((p) => !p.real)!), null);
  assert.ok(PRODUCTS.every((p) => !hasBuyLink(p)), "no affiliate links yet, so search links are not shown with an AD label");
});

test("estimated prices are marked, quoted ones are not", () => {
  const byId = (id: string) => PRODUCTS.find((p) => p.id === id)!;
  assert.equal(priceText(byId("r3"), "en"), "16,900 KRW");      // quoted on the original page
  assert.equal(priceText(byId("r1"), "en"), "~13,000 KRW");     // estimate
  assert.equal(priceText(byId("r1"), "ko"), "약 13,000원");
  assert.equal(money(1000, "ko"), "1,000원");
  assert.equal(totalText([{ product: byId("r3") }, { product: byId("c1") }], "en"), "23,800 KRW");
  assert.equal(totalText([{ product: byId("r3") }, { product: byId("r1") }], "en"), "~29,900 KRW");
  assert.equal(totalText([{ product: byId("r1"), qty: 2 }], "ko"), "약 26,000원");
});
