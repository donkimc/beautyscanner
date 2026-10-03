import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "뷰티스캐너 · 근거 기반 스킨케어 추천",
  description: "설문 몇 개로 예산에 맞는 맞춤 루틴과 근거 등급을 확인하세요.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
