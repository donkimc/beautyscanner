"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Locale } from "../../i18n/locale";
import { GRADE_LABEL, localized, type Grade } from "../../lib/products";
import { budgetLabel, buildRoutine, type Answers, type Routine, type Warning } from "../../lib/recommend";
import AuthButton from "../_components/AuthButton";
import { useConsent } from "../_components/ConsentProvider";
import { useI18n } from "../_components/I18nProvider";
import LanguageSwitch from "../_components/LanguageSwitch";

// Static class names so Tailwind can see them.
const GRADE_TEXT: Record<Grade, string> = {
  clinical: "text-grade-clinical border-grade-clinical",
  multiple: "text-grade-multiple border-grade-multiple",
  brand: "text-grade-brand border-grade-brand",
  emerging: "text-grade-emerging border-grade-emerging",
};
const GRADE_DOT: Record<Grade, string> = { clinical: "bg-grade-clinical", multiple: "bg-grade-multiple", brand: "bg-grade-brand", emerging: "bg-grade-emerging" };

const ANSWERS_KEY = "bs_answers";
type Phase = "survey" | "note" | "loading" | "result";

function store(key: string, value: unknown) { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* unavailable */ } }
function load<T>(key: string): T | null { try { return JSON.parse(localStorage.getItem(key) ?? "null") as T | null; } catch { return null; } }

export default function Try() {
  const { m, locale } = useI18n();
  const { ensure } = useConsent();
  const [phase, setPhase] = useState<Phase>("survey");
  const [idx, setIdx] = useState(0);
  const [ans, setAns] = useState<Partial<Answers>>({ note: "" });
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [explain, setExplain] = useState<Record<string, string>>({});
  const [aiUsed, setAiUsed] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [saved, setSaved] = useState<"no" | "yes" | "error">("no");
  const [notice, setNotice] = useState("");
  const allowAi = useRef(false);

  const explainFor = useCallback(async (answers: Answers, r: Routine, loc: Locale) => {
    try {
      const res = await fetch("/api/explain", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ answers, productIds: r.items.map((p) => p.id), locale: loc, allowAi: allowAi.current }),
      });
      const data = await res.json();
      setExplain(data.explanations);
      setAiUsed(data.ai);
    } catch { setExplain({}); }
  }, []);

  const run = useCallback(async (answers: Answers) => {
    setPhase("loading");
    const r = buildRoutine(answers);
    setRoutine(r);
    const cfg = await fetch("/api/config").then((x) => x.json()).catch(() => ({ ai: false }));
    // Only ask about the overseas AI transfer if AI is actually enabled on the server.
    allowAi.current = cfg.ai ? await ensure(["ai"], { skipIfDeclined: true }) : false;
    await explainFor(answers, r, locale);
    setPhase("result");
  }, [ensure, explainFor, locale]);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => setEmail(d.user?.email ?? null)).catch(() => {});
    if (new URLSearchParams(window.location.search).get("resume")) {
      const a = load<Answers>(ANSWERS_KEY);
      if (a) { setAns(a); run(a); }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-write explanations when the language is switched on the result page.
  useEffect(() => {
    if (phase === "result" && routine) explainFor(ans as Answers, routine, locale);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);

  async function pick(key: string, value: string | number | boolean) {
    // Consent for sensitive survey data is requested right before the first answer is recorded.
    if (!(await ensure(["sensitive"]))) return setNotice(m.survey.consentDeclined);
    setNotice("");
    setAns((a) => ({ ...a, [key]: value }));
    if (idx + 1 < m.survey.questions.length) setIdx(idx + 1);
    else setPhase("note");
  }

  function finish() {
    const answers = ans as Answers;
    store(ANSWERS_KEY, answers);
    run(answers);
  }

  async function save() {
    if (!email || !routine) {
      store(ANSWERS_KEY, ans);
      window.location.assign(`/login?next=${encodeURIComponent("/try?resume=1")}`);
      return;
    }
    const res = await fetch("/api/routines", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ answers: ans, productIds: routine.items.map((p) => p.id), total: routine.total }),
    }).catch(() => null);
    setSaved(res?.ok ? "yes" : "error");
  }

  function restart() { setPhase("survey"); setIdx(0); setAns({ note: "" }); setRoutine(null); setSaved("no"); setNotice(""); }

  const warningText = (w: Warning) => (w.code === "missing" ? m.result.warnings.missing(w.n) : m.result.warnings[w.code]);
  const q = m.survey.questions[idx];
  const card = "rounded-card bg-surface p-6 shadow-phone";

  return (
    <main className="mx-auto max-w-md px-4 pb-16">
      <header className="flex items-center justify-between gap-2 py-4">
        <Link href="/" className="font-display text-xl font-semibold tracking-tight">{m.brand}</Link>
        <div className="flex items-center gap-2"><LanguageSwitch /><AuthButton /></div>
      </header>

      <p className="mb-4 text-center"><span className="rounded-full bg-warn-soft border border-dashed border-warn px-3 py-1 text-xs text-ink">{m.common.demo}</span></p>

      {phase === "survey" && (
        <section className={card}>
          <div className="mb-5 h-1 overflow-hidden rounded bg-border/70">
            <span className="block h-full bg-accent transition-all duration-300" style={{ width: `${((idx + 1) / (m.survey.questions.length + 1)) * 100}%` }} />
          </div>
          <p className="eyebrow-faint">{m.survey.step(idx + 1, m.survey.questions.length)}</p>
          <h1 className="mt-1 whitespace-pre-line font-display text-2xl font-semibold leading-tight">{q.title}</h1>
          <p className="mb-5 mt-2 text-sm text-ink-soft">{q.sub}</p>
          <div className="grid gap-2.5">
            {q.options.map((o) => (
              <button key={o.label} onClick={() => pick(q.key, o.value)}
                className="rounded-2xl border-[1.5px] border-border bg-surface p-4 text-left text-base transition hover:border-accent active:bg-accent-soft active:scale-[0.99]">{o.label}</button>
            ))}
          </div>
          {notice && <p role="alert" className="mt-3 rounded-2xl bg-warn-soft border border-dashed border-warn p-3 text-sm text-ink">{notice}</p>}
          {idx > 0 && <button className="mt-3 text-sm text-ink-soft" onClick={() => setIdx(idx - 1)}>{m.common.back}</button>}
        </section>
      )}

      {phase === "note" && (
        <section className={card}>
          <p className="eyebrow-faint">{m.survey.noteLabel}</p>
          <h1 className="mb-4 mt-1 font-display text-xl font-semibold">{m.survey.noteTitle}</h1>
          <textarea
            className="mb-3 min-h-24 w-full rounded-2xl border-[1.5px] border-border bg-bg p-3 text-base outline-none focus:border-accent"
            placeholder={m.survey.notePlaceholder} value={ans.note} maxLength={200} onChange={(e) => setAns((a) => ({ ...a, note: e.target.value }))}
          />
          <button onClick={finish} className="w-full rounded-button bg-ink py-3.5 font-semibold text-bg active:scale-[0.99]">{m.survey.seeRoutine}</button>
        </section>
      )}

      {phase === "loading" && (
        <section className={`${card} text-center`}>
          <div className="mx-auto mb-3 size-8 animate-spin rounded-full border-2 border-border border-t-accent" />
          <p className="text-sm text-ink-soft">{m.survey.building}</p>
        </section>
      )}

      {phase === "result" && routine && (
        <section className={card}>
          <p className="eyebrow">{m.result.label(routine.items.length)}</p>
          <h1 className="mt-1 font-display text-2xl font-semibold">{m.result.title}</h1>
          <p className="mt-1 text-sm text-ink-soft">{m.result.budgetLine(budgetLabel(Number(ans.budget), locale), routine.total.toLocaleString(), aiUsed)}</p>

          {routine.warnings.map((w) => <p key={w.code} className="mt-3 rounded-2xl bg-warn-soft border border-dashed border-warn p-3 text-sm text-ink">⚠ {warningText(w)}</p>)}

          {routine.items.map((p, i) => {
            const isOpen = open === p.id;
            const text = localized(p, locale);
            return (
              <article key={p.id} className="mt-3.5 animate-rise rounded-product border-[1.5px] border-border p-4" style={{ animationDelay: `${i * 80}ms` }}>
                <button className="flex w-full items-start justify-between gap-2 text-left" onClick={() => setOpen(isOpen ? null : p.id)} aria-expanded={isOpen}>
                  <span>
                    <span className="text-xs text-ink-soft">{i + 1}. {m.result.steps[p.step]}</span>
                    <span className="mt-0.5 block text-base font-bold">{text.name}</span>
                    <span className="mt-1 block text-sm font-semibold">
                      {p.price.toLocaleString()}{locale === "ko" ? m.common.won : " KRW"}
                      <span className={`ml-1.5 whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium ${GRADE_TEXT[p.grade]}`}>● {m.result.grades[p.grade]}</span>
                    </span>
                  </span>
                  <span className="text-ink-soft" aria-hidden>{isOpen ? "▲" : "▼"}</span>
                </button>
                <p className="my-2.5 text-sm text-ink-soft">{explain[p.id]}</p>
                {isOpen && <p className="rounded-xl bg-bg px-3 py-2.5 text-[13px]"><strong>{m.result.evidence}</strong> {text.evidence}</p>}
                <div className="mt-2.5 flex items-center gap-2.5">
                  <a href={p.url} onClick={(e) => e.preventDefault()} className="rounded-xl bg-ink px-4 py-2.5 text-sm text-bg">{m.result.buy}</a>
                  <span className="rounded-lg border border-border px-1.5 py-0.5 text-[11px] text-ink-soft">{m.result.ad}</span>
                </div>
              </article>
            );
          })}

          <div className="mt-5 flex flex-wrap gap-x-3.5 gap-y-1.5 text-xs text-ink-soft">
            {(Object.keys(GRADE_LABEL) as Grade[]).map((k) => <span key={k} className="flex items-center gap-1.5"><i className={`size-2 rounded-full ${GRADE_DOT[k]}`} />{m.result.grades[k]}</span>)}
          </div>
          <p className="mt-3.5 text-xs text-ink-soft">{m.result.fine}</p>

          <div className="mt-4">
            <button onClick={save} disabled={saved === "yes"} className="w-full rounded-button bg-ink py-3.5 font-semibold text-bg active:scale-[0.99] disabled:opacity-60">
              {saved === "yes" ? m.result.saved : email ? m.result.save : m.result.saveLogin}
            </button>
            {saved === "yes" && <p className="mt-2 text-xs text-ink-soft">{m.result.savedHint} <Link href="/account" className="underline">{m.nav.account}</Link></p>}
            {saved === "error" && <p role="alert" className="mt-2 text-xs text-danger">{m.result.saveFailed}</p>}
            <button className="mt-3 text-sm text-ink-soft" onClick={restart}>{m.common.restart}</button>
          </div>
        </section>
      )}
      <p className="mt-8 text-center text-xs text-ink-soft">
        <Link href="/terms" className="underline">{m.nav.terms}</Link> · <Link href="/privacy" className="underline">{m.nav.privacy}</Link> · <Link href="/security" className="underline">{m.nav.security}</Link>
      </p>
    </main>
  );
}
