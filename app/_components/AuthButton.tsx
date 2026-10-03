"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { CART_EVENT } from "./cartClient";
import { useI18n } from "./I18nProvider";

interface User { email: string; name: string }

export default function AuthButton({ className = "" }: { className?: string }) {
  const { m } = useI18n();
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [count, setCount] = useState(0);

  const load = useCallback(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => { setUser(d.user); setCount(d.cartCount ?? 0); }).catch(() => setUser(null));
  }, []);

  useEffect(() => {
    load();
    window.addEventListener(CART_EVENT, load);
    return () => window.removeEventListener(CART_EVENT, load);
  }, [load]);

  if (user === undefined) return <span className={`inline-block h-9 w-20 rounded-full bg-border/60 ${className}`} />;
  if (!user)
    return (
      <Link href="/login" className={`rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold ${className}`}>
        {m.common.login}
      </Link>
    );
  return (
    <span className={`flex items-center gap-2 ${className}`}>
      <Link href="/account#cart" aria-label={`${m.nav.cart} ${count}`} className="relative flex size-9 items-center justify-center rounded-full border border-border bg-surface">
        <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M3 4h2l2.4 11.2a1 1 0 0 0 1 .8h8.8a1 1 0 0 0 1-.8L20 8H6.2" />
          <circle cx="9.5" cy="20" r="1.2" />
          <circle cx="17" cy="20" r="1.2" />
        </svg>
        {count > 0 && <span className="absolute -right-1 -top-1 flex min-w-4.5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold leading-4.5 text-accent-ink">{count}</span>}
      </Link>
      <Link href="/account" className="max-w-24 truncate rounded-full border border-border bg-surface px-3.5 py-2 text-sm font-semibold">
        {user.name}
      </Link>
    </span>
  );
}
