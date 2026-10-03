"use client";

import { useRouter } from "next/navigation";
import { LOCALES } from "../../i18n/locale";
import { setLocaleCookie, useI18n } from "./I18nProvider";

export default function LanguageSwitch({ className = "" }: { className?: string }) {
  const { locale, m } = useI18n();
  const router = useRouter();
  return (
    <div role="group" aria-label={m.common.language} className={`inline-flex rounded-full border border-ink/15 bg-card p-0.5 text-xs font-semibold ${className}`}>
      {LOCALES.map((l) => (
        <button
          key={l}
          aria-pressed={l === locale}
          onClick={() => { setLocaleCookie(l); router.refresh(); }}
          className={`rounded-full px-2.5 py-1 transition ${l === locale ? "bg-ink text-bg" : "text-muted"}`}
        >
          {l === "ko" ? "한" : "EN"}
        </button>
      ))}
    </div>
  );
}
