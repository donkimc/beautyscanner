import type { Locale } from "../i18n/locale";

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export function loginEmail(locale: Locale, link: string, minutes: number) {
  const ko = locale === "ko";
  const subject = ko ? "[뷰티스캐너] 로그인 확인 링크" : "[BeautyScanner] Your login link";
  const lead = ko ? "아래 버튼을 눌러 로그인을 완료하세요." : "Press the button below to finish logging in.";
  const button = ko ? "로그인 완료" : "Finish logging in";
  const note = ko
    ? `링크는 ${minutes}분 동안, 한 번만 사용할 수 있어요. 본인이 요청하지 않았다면 이 메일을 무시하세요.`
    : `The link works once and expires in ${minutes} minutes. If you didn't request it, ignore this email.`;
  const text = `${lead}\n\n${link}\n\n${note}`;
  const html = `<div style="font-family:-apple-system,'Apple SD Gothic Neo',Segoe UI,sans-serif;max-width:420px;margin:auto;padding:24px;color:#16211c">
<h2 style="margin:0 0 12px">${ko ? "뷰티스캐너" : "BeautyScanner"}</h2>
<p>${esc(lead)}</p>
<p><a href="${esc(link)}" style="display:inline-block;background:#16211c;color:#fff;padding:12px 20px;border-radius:12px;text-decoration:none">${esc(button)}</a></p>
<p style="color:#55645b;font-size:13px">${esc(note)}</p>
<p style="color:#55645b;font-size:12px;word-break:break-all">${esc(link)}</p></div>`;
  return { subject, text, html };
}
