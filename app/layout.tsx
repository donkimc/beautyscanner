import type { Metadata, Viewport } from "next";
import { getMessages } from "../i18n/server";
import { ConsentProvider } from "./_components/ConsentProvider";
import { I18nProvider } from "./_components/I18nProvider";
import PendingCart from "./_components/PendingCart";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await getMessages();
  return locale === "en"
    ? { title: "BeautyScanner · Evidence-based skincare", description: "A few questions give you a budget-aware routine with evidence grades." }
    : { title: "뷰티스캐너 · 근거 기반 스킨케어 추천", description: "설문 몇 개로 예산에 맞는 맞춤 루틴과 근거 등급을 확인하세요." };
}

export const viewport: Viewport = {
  // Matches the paper (light) and plum-black (dark) page backgrounds.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f5ef" },
    { media: "(prefers-color-scheme: dark)", color: "#16131a" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { locale } = await getMessages();
  return (
    <html lang={locale}>
      <body>
        <I18nProvider locale={locale}>
          <ConsentProvider>
            {children}
            <PendingCart />
          </ConsentProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
