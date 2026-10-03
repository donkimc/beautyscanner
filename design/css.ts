import tokens from "./tokens.json";

// Maps token groups to Tailwind v4 theme namespaces, so `bg-bg`, `text-ink`, `rounded-card`,
// `text-grade-clinical` etc. exist as utilities. Written to app/tokens.css by scripts/gen-tokens.ts.
const NAMESPACE: Record<keyof typeof tokens, string> = {
  color: "color",
  grade: "color-grade",
  radius: "radius",
};

export function toCss(t: typeof tokens = tokens): string {
  const lines = (Object.keys(NAMESPACE) as (keyof typeof tokens)[]).flatMap((group) =>
    Object.entries(t[group]).map(([name, value]) => `  --${NAMESPACE[group]}-${name}: ${value};`),
  );
  return `/* Generated from design/tokens.json. Do not edit. */\n@theme {\n${lines.join("\n")}\n}\n`;
}
