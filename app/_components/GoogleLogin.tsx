"use client";

import { useState } from "react";

export default function GoogleLogin({ next }: { next: string }) {
  const [consent, setConsent] = useState(false);
  const href = `/api/auth/google?next=${encodeURIComponent(next)}`;
  return (
    <div className="space-y-4">
      <label className="flex gap-2 text-sm text-muted">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1" />
        [필수] 피부 설문 정보(건강 관련 민감정보 포함)를 맞춤 루틴 제공 목적으로 수집·이용하는 데 동의합니다. 설명 생성을 위해 AI 제공사(해외)로 전송될 수 있습니다.
      </label>
      <button
        type="button"
        disabled={!consent}
        onClick={() => window.location.assign(href)}
        className="flex w-full items-center justify-center gap-3 rounded-button border border-ink/15 bg-card py-3.5 font-semibold transition enabled:active:scale-[0.99] disabled:opacity-40"
      >
        <svg viewBox="0 0 48 48" className="size-5" aria-hidden>
          <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.2C12.4 13.6 17.7 9.5 24 9.5z" />
          <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.6 7l7.1 5.5c4.3-4 6.9-9.9 6.9-17z" />
          <path fill="#FBBC05" d="M10.5 28.6a14.5 14.5 0 0 1 0-9.2l-7.9-6.2a24 24 0 0 0 0 21.6l7.9-6.2z" />
          <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.1-5.5c-2 1.4-4.6 2.3-8.8 2.3-6.3 0-11.6-4.1-13.5-9.9l-7.9 6.2C6.5 42.6 14.6 48 24 48z" />
        </svg>
        Google로 계속하기
      </button>
    </div>
  );
}
