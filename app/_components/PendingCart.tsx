"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { currentUser, postCart, takePending } from "./cartClient";
import { useI18n } from "./I18nProvider";

// After a guest logs in, adds the products they had chosen and confirms with a toast. Rendered once in the layout.
export default function PendingCart() {
  const { m } = useI18n();
  const [added, setAdded] = useState<number | null>(null);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return; // run once per page load (React may run effects twice in development)
    ran.current = true;
    (async () => {
      if (!(await currentUser())) return;
      const pending = takePending();
      if (!pending) return;
      if (await postCart(pending.productIds, pending.routine)) {
        setAdded(pending.productIds.length);
        setTimeout(() => setAdded(null), 7000);
      }
    })();
  }, []);

  if (added === null) return null;
  return (
    <div role="status" className="fixed inset-x-4 bottom-4 z-40 mx-auto flex max-w-md items-center justify-between gap-3 rounded-2xl bg-ink px-4 py-3 text-sm text-bg shadow-lift">
      <span>{m.shop.added(added)}</span>
      <Link href="/account#cart" className="shrink-0 font-semibold underline">{m.shop.goCart}</Link>
    </div>
  );
}
