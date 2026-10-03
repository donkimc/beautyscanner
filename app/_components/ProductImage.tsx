import type { Locale } from "../../i18n/locale";
import { localized, type Product } from "../../lib/products";
import { ART } from "./ProductArt";

// Soft backgrounds for the illustration fallback, chosen deterministically per product.
const TINTS = ["bg-accent-soft", "bg-warn-soft", "bg-surface-soft"];
const tintFor = (id: string) => TINTS[[...id].reduce((n, c) => n + c.charCodeAt(0), 0) % TINTS.length];

/**
 * A product picture. Uses the product's photo (`image`, a file under public/products/ or a URL) when there is one;
 * otherwise draws a clean illustration of that kind of product so every recommendation still has a picture.
 * `className` sets the size and shape, e.g. "size-24 rounded-2xl".
 */
export default function ProductImage({ product, locale, className = "" }: { product: Product; locale: Locale; className?: string }) {
  const name = localized(product, locale).name;
  if (product.image) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={product.image} alt={name} loading="lazy" decoding="async" className={`object-cover ${className}`} />;
  }
  const Art = ART[product.step];
  return (
    <div role="img" aria-label={name} className={`overflow-hidden ${tintFor(product.id)} ${className}`}>
      <svg viewBox="0 0 200 240" preserveAspectRatio="xMidYMid slice" className="size-full" focusable="false" aria-hidden>
        <Art />
      </svg>
    </div>
  );
}
