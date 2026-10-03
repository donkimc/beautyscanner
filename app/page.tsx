"use client";

import { useState } from "react";
import { GRADE_LABEL, STEP_LABEL, type Concern, type SkinType } from "@/lib/products";
import { buildRoutine, type Answers, type Routine } from "@/lib/recommend";

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

type Phase = "survey" | "note" | "loading" | "result";

export default function Home() {
  const [phase, setPhase] = useState<Phase>("survey");
  const [idx, setIdx] = useState(0);
  const [ans, setAns] = useState<Partial<Answers>>({ note: "" });
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [explain, setExplain] = useState<Record<string, string>>({});
  const [aiUsed, setAiUsed] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const [signup, setSignup] = useState(false);
  const [saved, setSaved] = useState(false);
  const [consent, setConsent] = useState(false);

  function pick(q: Question, value: string | number | boolean) {
    setAns((a) => ({ ...a, [q.key]: value }));
    if (idx + 1 < QUESTIONS.length) setIdx(idx + 1);
    else setPhase("note");
  }

  async function finish() {
    setPhase("loading");
    const answers = ans as Answers;
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

  function restart() {
    setPhase("survey"); setIdx(0); setAns({ note: "" }); setRoutine(null); setSaved(false);
  }

  const q = QUESTIONS[idx];

  return (
    <main>
      <header className="hero">
        <p className="eyebrow">과학적 근거 기반 추천</p>
        <h1>왜 이 제품인지, 근거까지</h1>
        <p className="sub">제품마다 어떤 연구를 근거로 추천했는지 확인하세요. 근거의 신뢰도가 다르면, 다르다고 정직하게 표시합니다.</p>
        <p className="demo">데모 버전 · 제품과 근거는 샘플 데이터입니다</p>
      </header>

      {phase === "survey" && (
        <section className="card">
          <div className="progress"><span style={{ width: `${((idx + 1) / (QUESTIONS.length + 1)) * 100}%` }} /></div>
          <p className="eyebrow">질문 {idx + 1} / {QUESTIONS.length}</p>
          <h2>{q.title}</h2>
          <div className="options">
            {q.options.map((o) => (
              <button key={o.label} className="opt" onClick={() => pick(q, o.value)}>{o.label}</button>
            ))}
          </div>
          {idx > 0 && <button className="link" onClick={() => setIdx(idx - 1)}>← 이전</button>}
        </section>
      )}

      {phase === "note" && (
        <section className="card">
          <p className="eyebrow">마지막 · 선택사항</p>
          <h2>피부에 대해 더 알려주실 게 있나요?</h2>
          <textarea
            placeholder="예: 레티놀 쓰면 붉어져요 / 환절기에 특히 건조해요"
            value={ans.note}
            maxLength={200}
            onChange={(e) => setAns((a) => ({ ...a, note: e.target.value }))}
          />
          <button className="primary" onClick={finish}>내 루틴 보기</button>
        </section>
      )}

      {phase === "loading" && <section className="card"><p className="eyebrow">루틴을 만드는 중…</p></section>}

      {phase === "result" && routine && (
        <section className="card result">
          <p className="eyebrow">맞춤 루틴 · {routine.items.length} STEP</p>
          <h2>당신을 위한 추천</h2>
          <p className="sub small">예산 {Number(ans.budget).toLocaleString()}원 이하 · 합계 {routine.total.toLocaleString()}원{aiUsed ? " · AI 설명" : ""}</p>

          {routine.warnings.map((w) => <p key={w} className="warn">⚠ {w}</p>)}

          {routine.items.map((p, i) => {
            const g = GRADE_LABEL[p.grade];
            const isOpen = open === p.id;
            return (
              <article key={p.id} className="product">
                <div className="head" onClick={() => setOpen(isOpen ? null : p.id)}>
                  <div>
                    <span className="step">{i + 1}. {STEP_LABEL[p.step]}</span>
                    <h3>{p.name}</h3>
                    <p className="price">{p.price.toLocaleString()}원 <span className="badge" style={{ color: g.color, borderColor: g.color }}>● {g.label}</span></p>
                  </div>
                  <span className="chev">{isOpen ? "▲" : "▼"}</span>
                </div>
                <p className="why">{explain[p.id]}</p>
                {isOpen && <p className="evidence"><strong>근거</strong> {p.evidence}</p>}
                <div className="buy">
                  <a className="buy-btn" href={p.url} onClick={(e) => e.preventDefault()}>구매하러 가기 ↗</a>
                  <span className="ad">AD</span>
                </div>
              </article>
            );
          })}

          <div className="legend">
            {Object.values(GRADE_LABEL).map((g) => <span key={g.label}><i style={{ background: g.color }} />{g.label}</span>)}
          </div>
          <p className="fine">성분 수준의 근거는 제품 자체의 효과를 보장하지 않습니다. 이 서비스는 진단이나 치료를 대체하지 않으며, 증상이 지속되면 피부과 전문의와 상담하세요. 구매 링크는 광고(AD)를 포함할 수 있습니다.</p>

          <div className="actions">
            <button className="primary" onClick={() => setSignup(true)}>{saved ? "저장됨 ✓" : "루틴 저장하기"}</button>
            <button className="link" onClick={restart}>다시 하기</button>
          </div>
        </section>
      )}

      {signup && (
        <div className="overlay" onClick={() => setSignup(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>루틴을 저장하려면 가입하세요</h2>
            <p className="sub small">(데모) 실제 로그인은 연결되어 있지 않습니다.</p>
            <label className="consent">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} /> [필수] 피부 설문 정보(건강 관련 민감정보 포함) 수집·이용에 동의합니다. 목적: 맞춤 루틴 제공.
            </label>
            <button className="primary" disabled={!consent} onClick={() => { setSaved(true); setSignup(false); }}>Google로 계속하기 (데모)</button>
            <button className="primary kakao" disabled={!consent} onClick={() => { setSaved(true); setSignup(false); }}>카카오로 계속하기 (데모)</button>
          </div>
        </div>
      )}
    </main>
  );
}
