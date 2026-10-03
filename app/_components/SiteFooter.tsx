import Link from "next/link";
import { getMessages } from "../../i18n/server";

export default async function SiteFooter() {
  const { m } = await getMessages();
  return (
    <footer className="mt-10 border-t border-border pt-6 text-center text-xs leading-relaxed text-ink-soft">
      <nav className="mb-3 flex flex-wrap justify-center gap-x-4 gap-y-1 font-medium text-ink">
        <Link href="/terms">{m.nav.terms}</Link>
        <Link href="/privacy">{m.nav.privacy}</Link>
        <Link href="/security">{m.nav.security}</Link>
      </nav>
      <p className="mb-2 inline-block rounded-full bg-warn-soft border border-dashed border-warn px-3 py-1 text-ink">{m.common.demo}</p>
      <p>{m.common.disclaimer}</p>
    </footer>
  );
}
