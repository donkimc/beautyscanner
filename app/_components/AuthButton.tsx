"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface User { email: string; name: string; picture?: string }

export default function AuthButton({ className = "" }: { className?: string }) {
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUser(d.user))
      .catch(() => setUser(null));
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  }

  if (user === undefined) return <span className={`inline-block h-9 w-20 rounded-full bg-line/60 ${className}`} />;
  if (!user)
    return (
      <Link href="/login" className={`rounded-full border border-ink/15 bg-card px-4 py-2 text-sm font-semibold ${className}`}>
        로그인
      </Link>
    );
  return (
    <span className={`flex items-center gap-2 text-sm ${className}`}>
      <span className="max-w-24 truncate font-semibold">{user.name}</span>
      <button onClick={logout} className="rounded-full border border-ink/15 bg-card px-3 py-1.5 text-xs text-muted">
        로그아웃
      </button>
    </span>
  );
}
