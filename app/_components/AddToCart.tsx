"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { cartIds, currentUser, postCart, rememberPending, CART_EVENT, type Pending } from "./cartClient";
import { useI18n } from "./I18nProvider";

type Status = "idle" | "busy" | "error";

export default function AddToCart({
  productIds, routine, label, className = "", wide = false, beforeLogin, loginNext,
}: {
  productIds: string[];
  routine?: Pending["routine"];
  label?: string;
  className?: string;
  /** Stretch to the full width of the container (for primary buttons). */
  wide?: boolean;
  /** Called just before a guest is sent to log in (e.g. to save survey answers so the result can be restored). */
  beforeLogin?: () => void;
  /** Where to return after logging in. Defaults to the current page. */
  loginNext?: string;
}) {
  const { m } = useI18n();
  const [status, setStatus] = useState<Status>("idle");
  const [inCart, setInCart] = useState(false);

  useEffect(() => {
    const refresh = () => cartIds().then((ids) => setInCart(Boolean(ids) && productIds.every((id) => ids!.includes(id))));
    refresh();
    window.addEventListener(CART_EVENT, refresh);
    return () => window.removeEventListener(CART_EVENT, refresh);
  }, [productIds]);

  async function add() {
    setStatus("busy");
    if (!(await currentUser())) {
      beforeLogin?.();
      rememberPending({ productIds, routine });
      window.location.assign(`/login?next=${encodeURIComponent(loginNext ?? window.location.pathname + window.location.search)}`);
      return;
    }
    setStatus((await postCart(productIds, routine)) ? "idle" : "error");
  }

  if (inCart)
    return (
      <span className={`${wide ? "flex w-full justify-center" : "inline-flex"} items-center gap-3 text-sm`}>
        <span className="font-semibold text-accent">{m.shop.inCart}</span>
        <Link href="/account#cart" className="text-ink-soft underline">{m.shop.goCart}</Link>
      </span>
    );
  return (
    <span className={wide ? "flex w-full flex-col items-stretch gap-1" : "inline-flex flex-col items-start gap-1"}>
      <button
        onClick={add} disabled={status === "busy"}
        className={className || "rounded-xl border-[1.5px] border-accent px-4 py-2.5 text-sm font-semibold text-accent transition hover:bg-accent-soft active:scale-[0.99] disabled:opacity-60"}
      >
        {label ?? m.shop.addOne}
      </button>
      {status === "error" && <span role="alert" className="text-xs text-danger">{m.shop.addFailed}</span>}
    </span>
  );
}
