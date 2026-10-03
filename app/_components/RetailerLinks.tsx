"use client";

import { retailerSearchLinks, type Product } from "../../lib/products";
import { useI18n } from "./I18nProvider";

// "Find it at Coupang / Naver Shopping": plain search links for real products until affiliate links exist.
export default function RetailerLinks({ product, className = "" }: { product: Product; className?: string }) {
  const { m } = useI18n();
  const links = retailerSearchLinks(product);
  if (!links) return null;
  const a = "underline decoration-border underline-offset-2 hover:text-accent";
  return (
    <span className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-sm ${className}`}>
      <a href={links.coupang} target="_blank" rel="noopener noreferrer nofollow" className={a}>{m.product.coupang} ↗</a>
      <a href={links.naver} target="_blank" rel="noopener noreferrer nofollow" className={a}>{m.product.naver} ↗</a>
    </span>
  );
}
