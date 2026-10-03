// Five hand-drawn, unbranded product illustrations (one per routine step). Colors come from the
// design tokens through Tailwind fill-* utilities. Decorative only (aria-hidden by the carousel).

import type { Step } from "../../../lib/products";

const Star = ({ x, y, d = "0s", s = 1 }: { x: number; y: number; d?: string; s?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path className="origin-center animate-twinkle fill-card" style={{ animationDelay: d, transformBox: "fill-box" }} d="M0 -8 L2 -2 L8 0 L2 2 L0 8 L-2 2 L-8 0 L-2 -2 Z" />
  </g>
);

const Leaf = ({ x, y, r, c }: { x: number; y: number; r: number; c: string }) => (
  <path className={c} transform={`translate(${x} ${y}) rotate(${r})`} d="M0 0 C 14 -8 26 -2 30 12 C 16 18 4 14 0 0 Z" />
);

const Shadow = () => <ellipse cx="100" cy="216" rx="52" ry="7" className="fill-ink/15" />;
const Halo = () => <circle cx="100" cy="128" r="74" className="fill-card/60" />;

function Cleanser() {
  return (
    <>
      <Halo />
      <Leaf x={20} y={170} r={-20} c="fill-sage/40" />
      <Leaf x={150} y={60} r={30} c="fill-sage/30" />
      <Shadow />
      <rect x="64" y="86" width="72" height="128" rx="22" className="fill-sage" />
      <rect x="72" y="96" width="9" height="96" rx="4.5" className="fill-card/30" />
      <rect x="76" y="132" width="52" height="52" rx="8" className="fill-card" />
      <circle cx="102" cy="150" r="7" className="fill-sage-soft" />
      <rect x="86" y="164" width="32" height="4" rx="2" className="fill-ink/25" />
      <rect x="92" y="172" width="20" height="4" rx="2" className="fill-ink/15" />
      <rect x="84" y="66" width="32" height="22" rx="6" className="fill-ink" />
      <rect x="96" y="44" width="8" height="24" rx="3" className="fill-ink" />
      <rect x="80" y="34" width="46" height="13" rx="6.5" className="fill-ink" />
      <rect x="120" y="36" width="16" height="8" rx="3" className="fill-ink" />
      <Star x={40} y={60} d="0s" /> <Star x={160} y={150} d="0.8s" s={0.8} />
    </>
  );
}

function Toner() {
  return (
    <>
      <Halo />
      <Leaf x={150} y={150} r={-60} c="fill-brand/30" />
      <Leaf x={22} y={70} r={20} c="fill-sage/30" />
      <Shadow />
      <rect x="72" y="62" width="56" height="152" rx="18" className="fill-brand-soft" />
      <rect x="72" y="62" width="56" height="152" rx="18" className="fill-none stroke-brand/30" strokeWidth="2" />
      <rect x="79" y="76" width="8" height="120" rx="4" className="fill-card/70" />
      <rect x="81" y="108" width="38" height="62" rx="7" className="fill-card" />
      <path d="M100 120 C 92 126 92 140 100 148 C 108 140 108 126 100 120 Z" className="fill-sage" />
      <rect x="88" y="156" width="24" height="4" rx="2" className="fill-ink/20" />
      <rect x="82" y="38" width="36" height="26" rx="6" className="fill-brand" />
      <rect x="82" y="38" width="36" height="7" rx="3.5" className="fill-card/25" />
      <Star x={158} y={60} d="0.4s" /> <Star x={36} y={150} d="1.2s" s={0.8} />
    </>
  );
}

function Serum() {
  return (
    <>
      <Halo />
      <Leaf x={24} y={150} r={-30} c="fill-grade-emerging/35" />
      <Shadow />
      <rect x="64" y="102" width="72" height="112" rx="22" className="fill-grade-emerging" />
      <rect x="72" y="112" width="9" height="82" rx="4.5" className="fill-card/35" />
      <rect x="78" y="140" width="52" height="46" rx="8" className="fill-card" />
      <circle cx="104" cy="156" r="6" className="fill-amber-soft" />
      <rect x="88" y="170" width="32" height="4" rx="2" className="fill-ink/25" />
      <rect x="82" y="86" width="36" height="18" rx="5" className="fill-ink" />
      <rect x="88" y="34" width="24" height="54" rx="12" className="fill-ink" />
      <rect x="93" y="42" width="5" height="30" rx="2.5" className="fill-card/25" />
      {/* animated droplet */}
      <path className="animate-drip fill-grade-emerging" style={{ transformBox: "fill-box" }} d="M158 70 C 150 82 150 92 158 92 C 166 92 166 82 158 70 Z" />
      <Star x={44} y={52} d="0.2s" /> <Star x={166} y={170} d="1s" s={0.8} />
    </>
  );
}

function Moisturizer() {
  return (
    <>
      <Halo />
      <Leaf x={150} y={176} r={-30} c="fill-sage/40" />
      <Leaf x={14} y={176} r={-100} c="fill-brand/25" />
      <Shadow />
      <rect x="44" y="132" width="112" height="82" rx="22" className="fill-card" />
      <rect x="44" y="132" width="112" height="82" rx="22" className="fill-none stroke-line" strokeWidth="2" />
      <rect x="58" y="158" width="84" height="36" rx="9" className="fill-sage-soft" />
      <path d="M100 163 C 91 170 91 183 100 190 C 109 183 109 170 100 163 Z" className="fill-sage" />
      <path d="M100 172 V190" className="stroke-card/70" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="38" y="98" width="124" height="38" rx="12" className="fill-brand" />
      <rect x="46" y="104" width="108" height="6" rx="3" className="fill-card/25" />
      <path d="M50 120 h100 M50 126 h100" className="stroke-ink/15" strokeWidth="1.5" />
      <Star x={34} y={70} d="0.6s" /> <Star x={166} y={92} d="0s" s={0.8} />
    </>
  );
}

function Sunscreen() {
  const rays = [0, 45, 90, 135, 180, 225, 270, 315];
  const body = "M62 60 L138 60 L138 168 Q138 180 126 185 L120 189 L80 189 L74 185 Q62 180 62 168 Z";
  return (
    <>
      <Halo />
      <Leaf x={18} y={150} r={-40} c="fill-sage/35" />
      <Shadow />
      <path d={body} className="fill-card" />
      <rect x="62" y="92" width="76" height="62" className="fill-amber-soft" />
      <path d={body} className="fill-none stroke-line" strokeWidth="2" />
      <g transform="translate(100 123)">
        <circle r="11" className="fill-grade-emerging" />
        {rays.map((a) => (
          <rect key={a} x="-1.5" y="-21" width="3" height="7" rx="1.5" transform={`rotate(${a})`} className="fill-grade-emerging" />
        ))}
      </g>
      {/* flat crimped end of the tube */}
      <rect x="62" y="42" width="76" height="20" rx="2" className="fill-sage" />
      <path d="M62 48 h76 M62 53 h76 M62 58 h76" className="stroke-card/40" strokeWidth="1.5" />
      {/* cap */}
      <rect x="76" y="189" width="48" height="27" rx="7" className="fill-brand" />
      <rect x="76" y="189" width="48" height="6" rx="3" className="fill-card/25" />
      <Star x={162} y={64} d="0.3s" /> <Star x={40} y={104} d="1.1s" s={0.8} />
    </>
  );
}

export const SLIDES: { step: Step; bg: string; Art: () => React.JSX.Element }[] = [
  { step: "cleanser", bg: "bg-sage-soft", Art: Cleanser },
  { step: "toner", bg: "bg-brand-soft", Art: Toner },
  { step: "serum", bg: "bg-amber-soft", Art: Serum },
  { step: "moisturizer", bg: "bg-sage-soft", Art: Moisturizer },
  { step: "sunscreen", bg: "bg-cream", Art: Sunscreen },
];
