import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { sessionFromHeader } from "../../auth/session";
import { listRoutines } from "../../db/routines";
import { PRODUCTS, localized } from "../../lib/products";
import { getMessages } from "../../i18n/server";
import { AccountData, DeleteRoutine } from "../_components/AccountClient";
import SiteFooter from "../_components/SiteFooter";
import SiteHeader from "../_components/SiteHeader";

export default async function AccountPage() {
  const { locale, m } = await getMessages();
  const user = sessionFromHeader((await headers()).get("cookie"));
  if (!user) redirect("/login?next=/account");
  const routines = await listRoutines(user.uid);
  const byId = new Map(PRODUCTS.map((p) => [p.id, p]));

  return (
    <main className="mx-auto max-w-md px-4 pb-12">
      <SiteHeader />
      <section className="mt-4 rounded-card bg-surface p-6 shadow-phone">
        <h1 className="font-display text-2xl font-semibold">{m.account.title}</h1>
        <p className="mt-1 break-all text-sm text-ink-soft">{user.email}</p>

        <h2 className="mb-2 mt-6 font-display text-lg font-semibold">{m.account.routines}</h2>
        {routines.length === 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-ink-soft">{m.account.none}</p>
            <Link href="/try" className="block rounded-button bg-ink py-3 text-center font-semibold text-bg">{m.account.tryNow}</Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {routines.map((r) => (
              <li key={r.id} className="rounded-product border border-border p-4">
                <p className="text-xs text-ink-soft">{new Date(r.created_at).toLocaleDateString(locale === "ko" ? "ko-KR" : "en-US")} · {m.account.total} {Number(r.total).toLocaleString()}{locale === "ko" ? m.common.won : ""}</p>
                <ul className="mt-2 space-y-0.5 text-sm">
                  {r.product_ids.map((id) => <li key={id}>• {byId.get(id) ? localized(byId.get(id)!, locale).name : id}</li>)}
                </ul>
                <div className="mt-2"><DeleteRoutine id={r.id} /></div>
              </li>
            ))}
          </ul>
        )}

        <h2 className="mb-2 mt-8 font-display text-lg font-semibold">{m.account.data}</h2>
        <AccountData />
      </section>
      <SiteFooter />
    </main>
  );
}
