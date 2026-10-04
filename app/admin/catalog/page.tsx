import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { isAdminEmail } from "../../../auth/admin";
import { sessionFromHeader } from "../../../auth/session";
import { loadCatalog, samplesHidden } from "../../../catalog/load";
import { listListings } from "../../../db/catalog";
import { getMessages } from "../../../i18n/server";
import { naverConfigured } from "../../../retailer/naver";
import AdminCatalog from "../../_components/AdminCatalog";
import SiteHeader from "../../_components/SiteHeader";

export const metadata = { robots: { index: false, follow: false } };

export default async function AdminCatalogPage() {
  const { m } = await getMessages();
  const session = sessionFromHeader((await headers()).get("cookie"));
  if (!session) redirect("/login?next=/admin/catalog");
  if (!isAdminEmail(session.email)) notFound();

  const [catalog, listings] = await Promise.all([loadCatalog(), listListings()]);
  const info = Object.fromEntries(listings.map((l) => [l.product_id, { approved: l.approved, price: l.price, mall: l.mall ?? "", at: new Date(l.fetched_at).toISOString().slice(0, 10) }]));

  return (
    <main className="mx-auto max-w-2xl px-4 pb-12">
      <SiteHeader />
      <div className="px-1 pb-4 pt-2">
        <p className="eyebrow">ADMIN</p>
        <h1 className="mt-1 font-display text-3xl font-semibold leading-tight">{m.admin.title}</h1>
        <p className="mt-1 text-sm text-ink-soft">{m.admin.sub}</p>
      </div>
      <AdminCatalog products={catalog} info={info} naverReady={naverConfigured()} hideSamples={samplesHidden()} />
    </main>
  );
}
