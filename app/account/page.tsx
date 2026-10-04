import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { sessionFromHeader } from "../../auth/session";
import { listCart } from "../../db/cart";
import { getProfileAnswers } from "../../db/profile";
import { listRoutines } from "../../db/routines";
import { getUser } from "../../db/users";
import { getMessages } from "../../i18n/server";
import { loadCatalog } from "../../catalog/load";
import { localized } from "../../lib/products";
import { parseAnswers } from "../../lib/recommend";
import { AccountData, DeleteRoutine } from "../_components/AccountClient";
import { CartList, ProfileCard, SkinProfile } from "../_components/Dashboard";
import SiteFooter from "../_components/SiteFooter";
import SiteHeader from "../_components/SiteHeader";

const card = "rounded-card bg-surface p-6 shadow-phone";

export default async function Dashboard() {
  const { locale, m } = await getMessages();
  const session = sessionFromHeader((await headers()).get("cookie"));
  const user = session && (await getUser(session.uid));
  if (!user) redirect("/login?next=/account");

  const [rawAnswers, cart, routines] = await Promise.all([getProfileAnswers(user.id), listCart(user.id), listRoutines(user.id)]);
  const answers = parseAnswers(rawAnswers);
  const catalog = await loadCatalog();
  const byId = new Map(catalog.map((p) => [p.id, p]));
  const name = user.name ?? user.email.split("@")[0];

  return (
    <main className="mx-auto max-w-md space-y-5 px-4 pb-12">
      <SiteHeader />
      <div className="px-1 pt-2">
        <p className="eyebrow">{m.dashboard.title}</p>
        <h1 className="mt-1 font-display text-3xl font-semibold leading-tight">{m.dashboard.hello(name)}</h1>
      </div>

      <section id="cart" className={`${card} scroll-mt-4`}>
        <h2 className="mb-4 font-display text-xl font-semibold">{m.dashboard.cart}</h2>
        <CartList products={catalog} initial={cart.filter((c) => byId.has(c.product_id)).map((c) => ({ productId: c.product_id, qty: c.qty, routine: c.routine }))} />
      </section>

      <section className={card}>
        <h2 className="mb-4 font-display text-xl font-semibold">{m.dashboard.skin}</h2>
        <SkinProfile answers={answers} />
      </section>

      <section className={card}>
        <h2 className="mb-4 font-display text-xl font-semibold">{m.dashboard.profile}</h2>
        <ProfileCard name={name} email={user.email} />
      </section>

      <section className={card}>
        <h2 className="mb-3 font-display text-xl font-semibold">{m.dashboard.routines}</h2>
        {routines.length === 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-ink-soft">{m.account.none}</p>
            <Link href="/try" className="block rounded-button bg-ink py-3 text-center font-semibold text-bg">{m.account.tryNow}</Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {routines.map((r) => (
              <li key={r.id} className="rounded-product border-[1.5px] border-border p-4">
                <p className="text-xs text-ink-soft">{new Date(r.created_at).toLocaleDateString(locale === "ko" ? "ko-KR" : "en-US")} · {m.account.total} {Number(r.total).toLocaleString()}{locale === "ko" ? m.common.won : " KRW"}</p>
                <ul className="mt-2 space-y-0.5 text-sm">
                  {r.product_ids.map((id) => (
                    <li key={id}>• {byId.get(id) ? <Link href={`/products/${id}`} className="underline">{localized(byId.get(id)!, locale).name}</Link> : id}</li>
                  ))}
                </ul>
                <div className="mt-2"><DeleteRoutine id={r.id} /></div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={card}>
        <h2 className="mb-4 font-display text-xl font-semibold">{m.account.data}</h2>
        <AccountData />
      </section>
      <SiteFooter />
    </main>
  );
}
