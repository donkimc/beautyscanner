"use client";

import { useEffect, useState } from "react";
import { useI18n } from "./I18nProvider";

export default function RotatingWord() {
  const { m } = useI18n();
  const words = m.landing.words;
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % words.length), 2200);
    return () => clearInterval(t);
  }, [words.length]);
  return (
    <span key={`${i}-${words[0]}`} className="inline-block animate-pop font-bold text-accent">
      {words[i % words.length]}
    </span>
  );
}
