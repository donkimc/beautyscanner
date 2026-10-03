import Link from "next/link";
import GoogleLogin from "../_components/GoogleLogin";
import { safeNext } from "../../auth/session";

const ERRORS: Record<string, string> = {
  not_configured: "Google 로그인이 아직 서버에 설정되지 않았어요. (관리자: GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / AUTH_SECRET 필요)",
  denied: "로그인이 취소되었어요.",
  invalid_state: "로그인 세션이 만료되었어요. 다시 시도해 주세요.",
  unverified_email: "인증된 Google 이메일이 필요해요.",
  signin_failed: "로그인 중 문제가 생겼어요. 잠시 후 다시 시도해 주세요.",
};

export default async function LoginPage(props: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await props.searchParams;
  const error = typeof sp.error === "string" ? ERRORS[sp.error] ?? ERRORS.signin_failed : null;
  const next = safeNext(typeof sp.next === "string" ? sp.next : "/try?resume=1");

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-10">
      <Link href="/" className="mb-8 text-sm text-muted">← 처음으로</Link>
      <div className="rounded-card border border-line bg-card p-6">
        <p className="text-xs tracking-widest text-muted">LOGIN</p>
        <h1 className="mt-1 text-2xl font-bold">내 루틴을 저장하세요</h1>
        <p className="mt-2 text-sm text-muted">로그인하면 설문 결과를 저장하고 다시 볼 수 있어요.</p>
        {error && <p role="alert" className="mt-4 rounded-2xl bg-warn-bg p-3 text-sm text-warn-ink">{error}</p>}
        <div className="mt-6"><GoogleLogin next={next} /></div>
      </div>
      <p className="mt-4 text-center text-sm text-muted">
        로그인 없이도 <Link href="/try" className="font-semibold text-ink underline">체험해 보기</Link>
      </p>
    </main>
  );
}
