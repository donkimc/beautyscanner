// Decorative phone mockup: a scan beam sweeps down while evidence dots pop in.
const ROWS = [
  { dot: "bg-grade-clinical", delay: "0.6s", w: "w-16" },
  { dot: "bg-grade-multiple", delay: "1.4s", w: "w-16" },
  { dot: "bg-grade-brand", delay: "2.2s", w: "w-14" },
  { dot: "bg-grade-emerging", delay: "3s", w: "w-16" },
];

export default function ScanCard() {
  return (
    <div aria-hidden className="relative mx-auto w-44 animate-bob">
      <div className="relative overflow-hidden rounded-[1.8rem] border-[6px] border-ink bg-surface p-3 shadow-2xl shadow-brand/25">
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border" />
        <div className="space-y-2">
          {ROWS.map((r) => (
            <div key={r.delay} className="flex items-center gap-2.5 rounded-xl border border-border p-2">
              <div className="size-7 shrink-0 rounded-lg bg-accent-soft" />
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className={`h-2 rounded-full bg-ink/80 ${r.w}`} />
                <div className="h-2 w-12 rounded-full bg-border" />
              </div>
              <span className={`size-3 rounded-full ${r.dot} animate-pop`} style={{ animationDelay: r.delay }} />
            </div>
          ))}
        </div>
        <div className="mt-3 h-7 rounded-lg bg-ink" />
        <div className="pointer-events-none absolute inset-x-0 h-12 animate-scan bg-gradient-to-b from-transparent via-accent/35 to-transparent" />
      </div>
    </div>
  );
}
