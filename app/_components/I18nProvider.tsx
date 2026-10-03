"use client";

import { createContext, useContext, type ReactNode } from "react";
import { LANG_COOKIE, type Locale } from "../../i18n/locale";
import { messages, type Messages } from "../../i18n/messages";

const Ctx = createContext<{ locale: Locale; m: Messages }>({ locale: "ko", m: messages.ko });

export function I18nProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  return <Ctx.Provider value={{ locale, m: messages[locale] }}>{children}</Ctx.Provider>;
}

export const useI18n = () => useContext(Ctx);

export function setLocaleCookie(locale: Locale) {
  document.cookie = `${LANG_COOKIE}=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`;
}
