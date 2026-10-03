"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useI18n } from "./I18nProvider";

interface User { email: string; name: string }

export default function AuthButton({ className = "" }: { className?: string }) {
  const { m } = useI18n();
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => setUser(d.user)).catch(() => setUser(null));
  }, []);

  if (user === undefined) return <span className={`inline-block h-9 w-20 rounded-full bg-border/60 ${className}`} />;
  if (!user)
    return (
      <Link href="/login" className={`rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold ${className}`}>
        {m.common.login}
      </Link>
    );
  return (
    <Link href="/account" className={`max-w-32 truncate rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold ${className}`}>
      {user.name}
    </Link>
  );
}
