import Link from "next/link";
import { safeNext } from "../../auth/session";
import { getMessages } from "../../i18n/server";
import LoginForm from "../_components/LoginForm";
import SiteFooter from "../_components/SiteFooter";
import SiteHeader from "../_components/SiteHeader";

export default async function LoginPage(props: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { m } = await getMessages();
  const sp = await props.searchParams;
  const error = typeof sp.error === "string" ? sp.error : undefined;
  const next = safeNext(typeof sp.next === "string" ? sp.next : "/try?resume=1");

  return (
    <main className="mx-auto max-w-md px-4 pb-12">
      <SiteHeader />
      <div className="mt-4 rounded-card border border-line bg-card p-6">
        <p className="text-xs tracking-widest text-muted">{m.login.label}</p>
        <h1 className="mt-1 font-display text-2xl font-bold">{m.login.title}</h1>
        <p className="mb-5 mt-2 text-sm text-muted">{m.login.sub}</p>
        <LoginForm next={next} initialError={error} />
      </div>
      <p className="mt-4 text-center text-sm text-muted">
        <Link href="/try" className="font-semibold text-ink underline">{m.login.tryAnyway}</Link>
      </p>
      <SiteFooter />
    </main>
  );
}
