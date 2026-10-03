import Link from "next/link";
import AuthButton from "./_components/AuthButton";
import Newsletter from "./_components/Newsletter";
import RotatingWord from "./_components/RotatingWord";
import ScanCard from "./_components/ScanCard";

const FEATURES = [
  { dot: "bg-grade-clinical", title: "근거 등급 표시", body: "임상 검증부터 브랜드 자체 시험까지, 신뢰도가 다르면 다르다고 표시해요." },
  { dot: "bg-grade-multiple", title: "예산에 맞춘 루틴", body: "3단계·5단계, 내 예산 안에서 빠진 단계까지 짚어드려요." },
  { dot: "bg-grade-emerging", title: "솔직한 광고 표기", body: "구매 링크에는 AD를 붙이고, 광고가 근거 등급을 바꾸지 않아요." },
];

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      {/* animated background blobs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-0">
        <div className="absolute -left-24 -top-24 size-72 animate-float rounded-full bg-brand/25 blur-3xl" />
        <div className="absolute -right-28 top-64 size-80 animate-float-slow rounded-full bg-grade-emerging/20 blur-3xl" />
        <div className="absolute -left-20 top-[34rem] size-64 animate-float rounded-full bg-grade-clinical/15 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-md px-4 pb-16">
        <header className="flex items-center justify-between py-4">
          <span className="text-lg font-extrabold tracking-tight">뷰티스캐너</span>
          <AuthButton />
        </header>

        <section className="pt-2 text-center">
          <p className="animate-rise text-xs font-semibold tracking-[0.2em] text-muted">과학적 근거 기반 스킨케어</p>
          <h1 className="mt-3 animate-rise text-[2rem] font-extrabold leading-tight [animation-delay:120ms]">
            광고 말고,
            <br />
            <span className="animate-shimmer bg-gradient-to-r from-brand via-grade-emerging to-brand bg-[length:200%_auto] bg-clip-text text-transparent">
              근거
            </span>
            로 고르는 내 스킨케어
          </h1>
          <p className="mt-4 animate-rise text-base text-muted [animation-delay:240ms]">
            <RotatingWord /> 고민에 맞는 루틴을
            <br />
            예산 안에서, 이유까지 알려드려요.
          </p>

          <div className="mt-6 animate-rise [animation-delay:360ms]">
            <ScanCard />
          </div>

          <div className="mt-6 grid animate-rise gap-2.5 [animation-delay:480ms]">
            <Link href="/try" className="rounded-button bg-ink py-3.5 text-base font-bold text-white shadow-lg shadow-ink/20 active:scale-[0.99]">
              무료로 체험하기 →
            </Link>
            <Link href="/login" className="rounded-button border border-ink/15 bg-card py-3.5 text-base font-semibold active:scale-[0.99]">
              로그인
            </Link>
          </div>
          <p className="mt-3 text-xs text-muted">설문 5문항 · 가입 없이 결과 확인</p>
        </section>

        <section className="mt-14 space-y-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="flex gap-3 rounded-product border border-line bg-card/80 p-4 backdrop-blur">
              <span className={`mt-1.5 size-3 shrink-0 rounded-full ${f.dot}`} />
              <div>
                <h2 className="font-bold">{f.title}</h2>
                <p className="mt-0.5 text-sm text-muted">{f.body}</p>
              </div>
            </div>
          ))}
        </section>

        <div className="mt-10"><Newsletter /></div>

        <footer className="mt-10 text-center text-xs leading-relaxed text-muted">
          <p className="mb-2 inline-block rounded-full bg-warn-bg px-3 py-1 text-warn-ink">데모 버전 · 제품과 근거는 샘플 데이터입니다</p>
          <p>이 서비스는 진단이나 치료를 대체하지 않아요. 증상이 지속되면 피부과 전문의와 상담하세요.</p>
        </footer>
      </div>
    </div>
  );
}
