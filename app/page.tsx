import Link from "next/link";
import { getMessages } from "../i18n/server";
import Newsletter from "./_components/Newsletter";
import RotatingWord from "./_components/RotatingWord";
import HeroCarousel from "./_components/HeroCarousel";
import SiteFooter from "./_components/SiteFooter";
import SiteHeader from "./_components/SiteHeader";

const DOTS = ["bg-grade-clinical", "bg-grade-multiple", "bg-grade-emerging"];

export default async function Home() {
  const { m } = await getMessages();
  return (
    <div className="relative overflow-hidden">
      {/* animated background blobs: sage, clay, amber */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-24 size-72 animate-float rounded-full bg-grade-clinical/20 blur-3xl" />
        <div className="absolute -right-28 top-64 size-80 animate-float-slow rounded-full bg-brand/20 blur-3xl" />
        <div className="absolute -left-20 top-[34rem] size-64 animate-float rounded-full bg-grade-emerging/20 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-md px-4 pb-12">
        <SiteHeader />

        <section className="pt-2 text-center">
          <p className="animate-rise text-xs font-semibold tracking-[0.2em] text-muted">{m.landing.eyebrow}</p>
          <h1 className="mt-3 animate-rise font-display text-[2.15rem] font-bold leading-[1.18] [animation-delay:120ms]">
            {m.landing.title1}
            <br />
            <span className="animate-shimmer bg-gradient-to-r from-brand via-grade-emerging to-brand bg-[length:200%_auto] bg-clip-text text-transparent">{m.landing.titleAccent}</span>
            {m.landing.title2}
          </h1>
          <p className="mt-4 animate-rise text-base text-muted [animation-delay:240ms]">
            {m.landing.subPre}<RotatingWord />{m.landing.subPost}
            <br />
            {m.landing.sub2}
          </p>

          <div className="mt-6 animate-rise [animation-delay:360ms]"><HeroCarousel /></div>

          <div className="mt-6 grid animate-rise gap-2.5 [animation-delay:480ms]">
            <Link href="/try" className="rounded-button bg-ink py-3.5 text-base font-bold text-bg shadow-lg shadow-ink/20 active:scale-[0.99]">{m.landing.try}</Link>
            <Link href="/login" className="rounded-button border border-ink/15 bg-card py-3.5 text-base font-semibold active:scale-[0.99]">{m.common.login}</Link>
          </div>
          <p className="mt-3 text-xs text-muted">{m.landing.hint}</p>
        </section>

        <section className="mt-14 space-y-3">
          {m.landing.features.map((f, i) => (
            <div key={f.title} className="flex gap-3 rounded-product border border-line bg-card/80 p-4 backdrop-blur">
              <span className={`mt-1.5 size-3 shrink-0 rounded-full ${DOTS[i]}`} />
              <div>
                <h2 className="font-bold">{f.title}</h2>
                <p className="mt-0.5 text-sm text-muted">{f.body}</p>
              </div>
            </div>
          ))}
        </section>

        <div className="mt-10"><Newsletter /></div>
        <SiteFooter />
      </div>
    </div>
  );
}
