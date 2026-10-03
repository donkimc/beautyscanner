"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n } from "./I18nProvider";
import { SLIDES } from "./hero/ProductArt";

const N = SLIDES.length;
const INTERVAL_MS = 2000;
// One extra copy of slide 1 at the end makes the loop seamless: after sliding onto it we jump back to the real slide 1 without animating.
const TRACK = [...SLIDES, SLIDES[0]];

export default function HeroCarousel() {
  const { m } = useI18n();
  const [i, setI] = useState(0);
  const [animate, setAnimate] = useState(true);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [hidden, setHidden] = useState(false);
  const touchX = useRef<number | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onMq = () => setReduced(mq.matches);
    const onVis = () => setHidden(document.hidden);
    mq.addEventListener("change", onMq);
    document.addEventListener("visibilitychange", onVis);
    return () => { mq.removeEventListener("change", onMq); document.removeEventListener("visibilitychange", onVis); };
  }, []);

  // Every 2 seconds: slide to the next product. Restarts whenever the slide changes (e.g. after a swipe or dot tap).
  useEffect(() => {
    if (paused || reduced || hidden) return;
    const t = setTimeout(() => { setAnimate(true); setI((x) => x + 1); }, INTERVAL_MS);
    return () => clearTimeout(t);
  }, [i, paused, reduced, hidden]);

  const onEnd = () => {
    if (i === N) { setAnimate(false); setI(0); }
  };

  const goTo = useCallback((k: number) => { setAnimate(true); setI(k); }, []);
  const prev = useCallback(() => {
    if (i > 0) return goTo(i - 1);
    setAnimate(false); setI(N);
    requestAnimationFrame(() => requestAnimationFrame(() => goTo(N - 1)));
  }, [i, goTo]);

  const active = i % N;

  return (
    <div
      role="group" aria-roledescription="carousel" aria-label={m.landing.carouselLabel}
      className="mx-auto w-56 select-none"
      onPointerEnter={(e) => e.pointerType === "mouse" && setPaused(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setPaused(false)}
      onTouchStart={(e) => { touchX.current = e.touches[0].clientX; setPaused(true); }}
      onTouchEnd={(e) => {
        setPaused(false);
        const dx = e.changedTouches[0].clientX - (touchX.current ?? 0);
        touchX.current = null;
        if (dx < -40) goTo(i + 1 > N ? 1 : i + 1);
        else if (dx > 40) prev();
      }}
    >
      <div className="relative overflow-hidden rounded-card border border-line shadow-xl shadow-ink/10">
        <div
          className={`flex ${animate ? "transition-transform duration-700 ease-[cubic-bezier(0.65,0,0.35,1)]" : ""}`}
          style={{ transform: `translateX(-${i * 100}%)` }}
          onTransitionEnd={onEnd}
        >
          {TRACK.map(({ step, bg, Art }, k) => (
            <div key={`${step}-${k}`} aria-hidden className={`aspect-[5/6] w-full shrink-0 ${bg}`}>
              <svg viewBox="0 0 200 240" className="size-full" focusable="false"><Art /></svg>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-center gap-2.5">
        <span className="min-w-20 text-center text-xs font-semibold tracking-wide text-muted" aria-live="off">
          {active + 1} · {m.result.steps[SLIDES[active].step]}
        </span>
      </div>
      <div className="mt-2 flex justify-center gap-1.5">
        {SLIDES.map((s, k) => (
          <button
            key={s.step} aria-label={m.landing.slideLabel(k + 1, N)} aria-current={k === active}
            onClick={() => goTo(k)}
            className={`h-2 rounded-full transition-all duration-300 ${k === active ? "w-5 bg-ink" : "w-2 bg-ink/25"}`}
          />
        ))}
      </div>
    </div>
  );
}
