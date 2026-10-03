"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { GRADE_LABEL, STEP_LABEL, type Grade } from "../../lib/products";
import { buildRoutine, type Answers, type Routine } from "../../lib/recommend";
import AuthButton from "../_components/AuthButton";
import GoogleLogin from "../_components/GoogleLogin";

interface Question {
  key: keyof Answers;
  title: string;
  options: { label: string; value: string | number | boolean }[];
}

const QUESTIONS: Question[] = [
  { key: "skinType", title: "피부 타입이 어떻게 되세요?", options: [
    { label: "건성", value: "dry" }, { label: "지성", value: "oily" },
    { label: "복합성", value: "combo" }, { label: "민감성", value: "sensitive" }] },
  { key: "concern", title: "가장 신경 쓰이는 고민은요?", options: [
    { label: "건조함·수분", value: "dryness" }, { label: "트러블", value: "acne" },
    { label: "색소·잡티", value: "pigmentation" }, { label: "주름·탄력", value: "aging" }] },
  { key: "sensitive", title: "화장품에 따갑거나 붉어진 적이 있나요?", options: [
    { label: "자주 있어요", value: true }, { label: "거의 없어요", value: false }] },
  { key: "budget", title: "루틴 전체 예산은요?", options: [
    { label: "3만원 이하", value: 30000 }, { label: "5만원 이하", value: 50000 }, { label: "8만원 이하", value: 80000 }] },
  { key: "steps", title: "어느 정도 단계를 원하세요?", options: [
    { label: "간단하게 3단계", value: 3 }, { label: "꼼꼼하게 5단계", value: 5 }] },
];

// Static class names so Tailwind can see them.
const GRADE_TEXT: Record<Grade, string> = {
  clinical: "text-grade-clinical border-grade-clinical",
  multiple: "text-grade-multiple border-grade-multiple",
  brand: "text-grade-brand border-grade-brand",
  emerging: "text-grade-emerging border-grade-emerging",
};
const GRADE_DOT: Record<Grade, string> = {
  clinical: "bg-grade-clinical", multiple: "bg-grade-multiple", brand: "bg-grade-brand", emerging: "bg-grade-emerging",
};

const ANSWERS_KEY = "bs_answers";
type Phase = "survey" | "note" | "loading" | "result";

function store(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable */ }
}
function load<T>(key: string): T | null {
  try { return JSON.parse(localStorage.getItem(key) ?? "null") as T | null; } catch { return null; }
}

export default function Try() {
  const [phase, setPhase] = useState<Phase>("survey");
  const [idx, setIdx] = useState(0);
  const [ans, setAns] = useState<Partial<Answers>>({ note: "" });
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [explain, setExplain] = useState<Record<string, string>>({});
  const [aiUsed, setAiUsed] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const [modal, setModal] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function run(answers: Answers) {
    setPhase("loading");
    const r = buildRoutine(answers);
    setRoutine(r);
    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ answers, productIds: r.items.map((p) => p.id) }),
      });
      const data = await res.json();
      setExplain(data.explanations);
      setAiUsed(data.ai);
    } catch {
      setExplain({});
    }
    setPhase("result");
  }

  // Who is logged in, and restore the routine after the Google redirect (?resume=1).
  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => setEmail(d.user?.email ?? null)).catch(() => {});
    if (new URLSearchParams(window.location.search).get("resume")) {
      const a = load<Answers>(ANSWERS_KEY);
      if (a) { setAns(a); run(a); }
    }
  }, []);

  function pick(q: Question, value: string | number | boolean) {
    setAns((a) => ({ ...a, [q.key]: value }));
    if (idx + 1 < QUESTIONS.length) setIdx(idx + 1);
    else setPhase("note");
  }

  function finish() {
    const answers = ans as Answers;
    store(ANSWERS_KEY, answers);
    run(answers);
  }

  function save() {
    if (!email) return setModal(true);
    store(`bs_saved:${email}`, { answers: ans, at: new Date().toISOString() });
    setSaved(true);
  }

  function restart() {
    setPhase("survey"); setIdx(0); setAns({ note: "" }); setRoutine(null); setSaved(false);
  }

  const q = QUESTIONS[idx];
  const card = "rounded-card border border-line bg-card p-6";

  return (
    <main className="mx-auto max-w-md px-4 pb-16">
      <header className="flex items-center justify-between py-4">
        <Link href="/" className="text-lg font-extrabold tracking-tight">뷰티스캐너</Link>
        <AuthButton />
      </header>

      <p className="mb-4 text-center">
        <span className="rounded-full bg-warn-bg px-3 py-1 text-xs text-warn-ink">데모 버전 · 제품과 근거는 샘플 데이터입니다</span>
      </p>

      {phase === "survey" && (
        <section className={card}>
          <div className="mb-5 h-1 overflow-hidden rounded bg-line/70">
            <span className="block h-full bg-ink transition-all duration-300" style={{ width: `${((idx + 1) / (QUESTIONS.length + 1)) * 100}%` }} />
          </div>
          <p className="text-xs tracking-widest text-muted">질문 {idx + 1} / {QUESTIONS.length}</p>
          <h1 className="mb-4 mt-1 text-xl font-bold">{q.title}</h1>
          <div className="grid gap-2.5">
            {q.options.map((o) => (
              <button key={o.label} onClick={() => pick(q, o.value)}
                className="rounded-2xl border-[1.5px] border-line bg-card p-4 text-left text-base transition hover:border-ink active:scale-[0.99]">
                {o.label}
              </button>
            ))}
          </div>
          {idx > 0 && <button className="mt-3 text-sm text-muted" onClick={() => setIdx(idx - 1)}>← 이전</button>}
        </section>
      )}

      {phase === "note" && (
        <section className={card}>
          <p className="text-xs tracking-widest text-muted">마지막 · 선택사항</p>
          <h1 className="mb-4 mt-1 text-xl font-bold">피부에 대해 더 알려주실 게 있나요?</h1>
          <textarea
            className="mb-3 min-h-24 w-full rounded-2xl border-[1.5px] border-line p-3 text-base outline-none focus:border-ink"
            placeholder="예: 레티놀 쓰면 붉어져요 / 환절기에 특히 건조해요"
            value={ans.note} maxLength={200}
            onChange={(e) => setAns((a) => ({ ...a, note: e.target.value }))}
          />
          <button onClick={finish} className="w-full rounded-button bg-ink py-3.5 font-semibold text-white active:scale-[0.99]">내 루틴 보기</button>
        </section>
      )}

      {phase === "loading" && (
        <section className={`${card} text-center`}>
          <div className="mx-auto mb-3 size-8 animate-spin rounded-full border-2 border-line border-t-brand" />
          <p className="text-sm text-muted">루틴을 만드는 중…</p>
        </section>
      )}

      {phase === "result" && routine && (
        <section className={card}>
          <p className="text-xs tracking-widest text-muted">맞춤 루틴 · {routine.items.length} STEP</p>
          <h1 className="mt-1 text-2xl font-bold">당신을 위한 추천</h1>
          <p className="mt-1 text-sm text-muted">
            예산 {Number(ans.budget).toLocaleString()}원 이하 · 합계 {routine.total.toLocaleString()}원{aiUsed ? " · AI 설명" : ""}
          </p>

          {routine.warnings.map((w) => (
            <p key={w} className="mt-3 rounded-2xl bg-warn-bg p-3 text-sm text-warn-ink">⚠ {w}</p>
          ))}

          {routine.items.map((p, i) => {
            const g = GRADE_LABEL[p.grade];
            const isOpen = open === p.id;
            return (
              <article key={p.id} className="mt-3.5 animate-rise rounded-product border-[1.5px] border-line p-4" style={{ animationDelay: `${i * 80}ms` }}>
                <button className="flex w-full items-start justify-between gap-2 text-left" onClick={() => setOpen(isOpen ? null : p.id)}>
                  <span>
                    <span className="text-xs text-muted">{i + 1}. {STEP_LABEL[p.step]}</span>
                    <span className="mt-0.5 block text-base font-bold">{p.name}</span>
                    <span className="mt-1 block text-sm font-semibold">
                      {p.price.toLocaleString()}원
                      <span className={`ml-1.5 whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium ${GRADE_TEXT[p.grade]}`}>● {g.label}</span>
                    </span>
                  </span>
                  <span className="text-muted">{isOpen ? "▲" : "▼"}</span>
                </button>
                <p className="my-2.5 text-sm text-muted">{explain[p.id]}</p>
                {isOpen && <p className="rounded-xl bg-bg px-3 py-2.5 text-[13px]"><strong>근거</strong> {p.evidence}</p>}
                <div className="mt-2.5 flex items-center gap-2.5">
                  <a href={p.url} onClick={(e) => e.preventDefault()} className="rounded-xl bg-ink px-4 py-2.5 text-sm text-white">구매하러 가기 ↗</a>
                  <span className="rounded-lg border border-line px-1.5 py-0.5 text-[11px] text-muted">AD</span>
                </div>
              </article>
            );
          })}

          <div className="mt-5 flex flex-wrap gap-x-3.5 gap-y-1.5 text-xs text-muted">
            {(Object.keys(GRADE_LABEL) as Grade[]).map((k) => (
              <span key={k} className="flex items-center gap-1.5"><i className={`size-2 rounded-full ${GRADE_DOT[k]}`} />{GRADE_LABEL[k].label}</span>
            ))}
          </div>
          <p className="mt-3.5 text-xs text-muted">
            성분 수준의 근거는 제품 자체의 효과를 보장하지 않습니다. 이 서비스는 진단이나 치료를 대체하지 않으며, 증상이 지속되면 피부과 전문의와 상담하세요. 구매 링크는 광고(AD)를 포함할 수 있습니다.
          </p>

          <div className="mt-4">
            <button onClick={save} disabled={saved} className="w-full rounded-button bg-ink py-3.5 font-semibold text-white active:scale-[0.99] disabled:opacity-60">
              {saved ? "저장됨 ✓" : email ? "루틴 저장하기" : "로그인하고 루틴 저장하기"}
            </button>
            {saved && <p className="mt-2 text-xs text-muted">이 기기에 저장되었어요. 계정에 저장하는 기능은 준비 중입니다.</p>}
            <button className="mt-3 text-sm text-muted" onClick={restart}>다시 하기</button>
          </div>
        </section>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={() => setModal(false)}>
          <div className="w-full max-w-md rounded-card bg-card p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold">루틴을 저장하려면 로그인하세요</h2>
            <p className="mb-4 mt-1 text-sm text-muted">로그인 후 방금 만든 루틴으로 돌아와요.</p>
            <GoogleLogin next="/try?resume=1" />
            <button className="mt-3 w-full text-sm text-muted" onClick={() => setModal(false)}>나중에 할게요</button>
          </div>
        </div>
      )}
    </main>
  );
}
