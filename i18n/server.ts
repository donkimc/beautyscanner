import { cookies, headers } from "next/headers";
import { LANG_COOKIE, resolveLocale, type Locale } from "./locale";
import { messages, type Messages } from "./messages";

export async function getLocale(): Promise<Locale> {
  const [c, h] = await Promise.all([cookies(), headers()]);
  return resolveLocale(c.get(LANG_COOKIE)?.value, h.get("accept-language"));
}

export async function getMessages(): Promise<{ locale: Locale; m: Messages }> {
  const locale = await getLocale();
  return { locale, m: messages[locale] };
}
