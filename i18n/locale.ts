export const LOCALES = ["ko", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const LANG_COOKIE = "bs_lang";

export const isLocale = (v: unknown): v is Locale => v === "ko" || v === "en";

// Picks the best supported language from an Accept-Language header (the phone/browser setting).
// Korean and English are supported; any other language falls back to English; no header means Korean.
export function fromAcceptLanguage(header: string | null | undefined): Locale {
  if (!header) return "ko";
  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = Number(params.find((p) => p.trim().startsWith("q="))?.split("=")[1] ?? 1);
      return { primary: tag.trim().toLowerCase().split("-")[0], q: Number.isNaN(q) ? 0 : q };
    })
    .filter((l) => l.q > 0)
    .sort((a, b) => b.q - a.q);
  for (const l of ranked) if (l.primary === "ko" || l.primary === "en") return l.primary;
  return "en";
}

// An explicit choice (cookie) wins over the browser setting.
export function resolveLocale(cookie: string | undefined, acceptLanguage: string | null | undefined): Locale {
  return isLocale(cookie) ? cookie : fromAcceptLanguage(acceptLanguage);
}
