import Link from "next/link";
import { safeNext } from "../../../auth/session";
import { getMessages } from "../../../i18n/server";
import SiteHeader from "../../_components/SiteHeader";
import VerifyButton from "../../_components/VerifyButton";

export default async function VerifyPage(props: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { m } = await getMessages();
  const sp = await props.searchParams;
  const token = typeof sp.token === "string" ? sp.token : "";
  const next = safeNext(typeof sp.next === "string" ? sp.next : "/");
  return (
    <main className="mx-auto max-w-md px-4 pb-12">
      <SiteHeader />
      <div className="mt-4 rounded-card border border-line bg-card p-6">
        <h1 className="font-display text-2xl font-bold">{m.verify.title}</h1>
        {token ? (
          <>
            <p className="mb-5 mt-2 text-sm text-muted">{m.verify.body}</p>
            <VerifyButton token={token} next={next} />
          </>
        ) : (
          <>
            <p className="my-3 rounded-2xl bg-warn-bg p-3 text-sm text-warn-ink">{m.verify.invalid}</p>
            <Link href="/login" className="block rounded-button border border-ink/15 bg-card py-3 text-center font-semibold">{m.verify.back}</Link>
          </>
        )}
      </div>
    </main>
  );
}
