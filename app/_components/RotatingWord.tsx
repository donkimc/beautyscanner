"use client";

import { useEffect, useState } from "react";

const WORDS = ["건조함", "트러블", "색소·잡티", "주름·탄력"];

export default function RotatingWord() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % WORDS.length), 2200);
    return () => clearInterval(t);
  }, []);
  return (
    <span key={i} className="inline-block animate-pop font-bold text-brand">
      {WORDS[i]}
    </span>
  );
}
