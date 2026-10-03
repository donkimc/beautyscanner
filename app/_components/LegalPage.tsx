import { DOCS, LEGAL_UPDATED, type DocId } from "../../content/legal";
import { getMessages } from "../../i18n/server";
import SiteFooter from "./SiteFooter";
import SiteHeader from "./SiteHeader";

export default async function LegalPage({ id }: { id: DocId }) {
  const { locale, m } = await getMessages();
  const doc = DOCS[id][locale];
  return (
    <main className="mx-auto max-w-2xl px-4 pb-12">
      <SiteHeader />
      <article className="mt-4 rounded-card bg-surface p-6 shadow-phone">
        <h1 className="font-display text-3xl font-semibold">{doc.title}</h1>
        <p className="mt-1 text-xs text-ink-soft">{m.legal.updated}: {LEGAL_UPDATED}</p>
        <p className="mt-3 rounded-2xl bg-warn-soft border border-dashed border-warn p-3 text-xs text-ink">{m.legal.draft}</p>
        {doc.intro && <p className="mt-4 text-[15px]">{doc.intro}</p>}
        {doc.sections.map((s) => (
          <section key={s.h} className="mt-6">
            <h2 className="font-display text-lg font-semibold">{s.h}</h2>
            {s.p?.map((t) => <p key={t} className="mt-2 text-[15px] leading-relaxed text-ink/90">{t}</p>)}
            {s.ul && (
              <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[15px] leading-relaxed text-ink/90">
                {s.ul.map((t) => <li key={t}>{t}</li>)}
              </ul>
            )}
          </section>
        ))}
      </article>
      <SiteFooter />
    </main>
  );
}
