import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMessages } from "../../../i18n/server";
import { priceText } from "../../../lib/price";
import { findProduct } from "../../../catalog/load";
import { hasBuyLink, isAffiliate, localized } from "../../../lib/products";
import AddToCart from "../../_components/AddToCart";
import BackLink from "../../_components/BackLink";
import ProductImage from "../../_components/ProductImage";
import RetailerLinks from "../../_components/RetailerLinks";
import { GRADE_TEXT } from "../../_components/grade";
import SiteFooter from "../../_components/SiteFooter";
import SiteHeader from "../../_components/SiteHeader";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const p = await findProduct(id);
  const { locale, m } = await getMessages();
  return { title: p ? `${localized(p, locale).name} · ${m.brand}` : m.brand };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const product = await findProduct(id);
  if (!product) notFound();
  const { locale, m } = await getMessages();
  const text = localized(product, locale);
  const chip = "rounded-full border border-border bg-surface-soft px-3 py-1 text-xs";
  const attrs = [
    product.texture === "light" ? m.product.attrs.light : m.product.attrs.rich,
    ...(product.fragranceFree ? [m.product.attrs.fragranceFree] : []),
    ...(product.vegan ? [m.product.attrs.vegan] : []),
    ...(product.sensitiveSafe ? [m.product.attrs.lowIrritation] : []),
  ];

  return (
    <main className="mx-auto max-w-md px-4 pb-12">
      <SiteHeader />
      <BackLink className="mb-3" />
      <article className="overflow-hidden rounded-card bg-surface shadow-phone">
        <ProductImage product={product} locale={locale} className="aspect-square w-full" />
        <div className="space-y-5 p-6">
          <div>
            <p className="eyebrow">{m.result.steps[product.step]}</p>
            <h1 className="mt-1.5 font-display text-[1.65rem] font-semibold leading-tight">{text.name}</h1>
            <p className="mt-2 flex flex-wrap items-center gap-2.5">
              <span className="text-lg font-bold">{priceText(product, locale)}</span>
              <span className={`whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium ${GRADE_TEXT[product.grade]}`}>● {m.result.grades[product.grade]}</span>
            </p>
          </div>

          <p className="rounded-[14px] border border-dashed border-warn bg-warn-soft px-4 py-3 text-xs leading-relaxed text-ink">{product.real ? m.product.real : m.product.sample}</p>
          {product.priceSource === "naver" && product.priceDate && (
            <p className="-mt-2 text-xs text-ink-soft">{m.product.listingNote(m.product.naver, product.priceDate.slice(0, 10))}</p>
          )}

          <section>
            <h2 className="eyebrow-faint">{m.product.details}</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {attrs.map((a) => <span key={a} className={chip}>{a}</span>)}
              <span className={chip}>{m.product.suits}: {m.product.time[product.time]}</span>
            </div>
          </section>

          <section>
            <h2 className="eyebrow-faint">{m.product.goodFor}</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {product.concerns.map((c) => <span key={c} className="rounded-full bg-accent-soft px-3 py-1 text-xs text-accent">{m.result.concerns[c]}</span>)}
            </div>
          </section>

          <section>
            <h2 className="eyebrow-faint">{m.product.evidence}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{text.evidence}</p>
          </section>

          <div className="space-y-3 border-t border-border pt-5">
            <AddToCart
              productIds={[product.id]} wide label={m.product.addToCart}
              className="w-full rounded-button bg-ink py-3.5 font-semibold text-bg transition active:scale-[0.99] disabled:opacity-60"
            />
            {hasBuyLink(product) ? (
              <div className="flex items-center gap-2.5">
                <a href={product.url} target="_blank" rel={isAffiliate(product) ? "sponsored noopener noreferrer" : "noopener noreferrer nofollow"} className="flex-1 rounded-button border-[1.5px] border-ink py-3 text-center font-semibold">
                  {isAffiliate(product) ? m.product.buy : m.product.viewAt(m.product.naver)}
                </a>
                {isAffiliate(product) && <span className="rounded-lg border border-border px-1.5 py-0.5 text-[11px] text-ink-soft">{m.product.ad}</span>}
              </div>
            ) : product.real ? (
              <div className="space-y-1.5 rounded-2xl bg-surface-soft p-3.5">
                <p className="text-xs font-semibold">{m.product.findOn}</p>
                <RetailerLinks product={product} />
                <p className="text-[11px] text-ink-faint">{m.product.searchNote}</p>
              </div>
            ) : (
              <p className="text-center text-xs text-ink-faint">{m.product.linkSoon}</p>
            )}
            <p className="text-center text-xs text-ink-soft">{m.common.disclaimer}</p>
          </div>
        </div>
      </article>
      <p className="mt-4 text-center text-sm"><Link href="/try" className="font-semibold underline">{m.landing.try}</Link></p>
      <SiteFooter />
    </main>
  );
}
