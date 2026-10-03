"use client";

import { useState } from "react";

// Mock newsletter: validates and shows a confirmation, but stores and sends nothing.
export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("올바른 이메일 주소를 입력해 주세요.");
    if (!agree) return setError("수신 동의에 체크해 주세요.");
    setError("");
    setDone(true);
  }

  return (
    <section id="newsletter" className="rounded-card border border-line bg-card p-6">
      <p className="text-xs tracking-widest text-muted">NEWSLETTER · 데모</p>
      <h2 className="mt-1 text-xl font-bold">매주 한 번, 근거 리포트</h2>
      <p className="mt-1 text-sm text-muted">성분 하나를 골라 연구가 실제로 말하는 것만 정리해 드려요.</p>

      <div className="mt-4 rounded-2xl bg-brand-soft p-4">
        <p className="text-[11px] font-semibold text-brand">샘플 · 이번 주 리포트 #1</p>
        <p className="mt-1 text-sm font-semibold">히알루론산, 정말 속건조에 효과가 있을까?</p>
        <p className="mt-1 text-xs text-muted">성분 수준 근거와 제품 수준 근거를 나눠서 살펴봅니다. (샘플 문구)</p>
      </div>

      {done ? (
        <p role="status" className="mt-4 rounded-2xl bg-warn-bg p-4 text-sm text-warn-ink">
          ✓ 구독 신청이 접수된 것처럼 보여드렸어요. 데모라서 이메일은 저장되거나 발송되지 않습니다.
        </p>
      ) : (
        <form onSubmit={submit} className="mt-4 space-y-3" noValidate>
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-button border-[1.5px] border-line bg-bg px-4 py-3 text-base outline-none focus:border-ink"
          />
          <label className="flex gap-2 text-xs text-muted">
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5" />
            [선택] 광고성 정보(뉴스레터) 수신에 동의합니다. (데모: 실제 수집 없음)
          </label>
          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          <button className="w-full rounded-button bg-ink py-3.5 font-semibold text-white active:scale-[0.99]">구독하기</button>
        </form>
      )}
    </section>
  );
}
