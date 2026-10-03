import tokens from "./tokens.json";

// Renders design tokens as CSS variables (light, plus dark via the system setting or data-theme="dark")
// and maps them into Tailwind v4's theme, so `bg-bg`, `text-ink-soft`, `border-border`, `bg-accent-soft`,
// `text-grade-clinical`, `rounded-card`, ... exist as utilities that switch with the theme.
// Written to app/tokens.css by scripts/gen-tokens.ts.
// The palette follows the original design pages: warm paper background, plum-tinted ink, pink-magenta accent.

const vars = (set: Record<string, string>, indent = "  ") =>
  Object.entries(set).map(([k, v]) => `${indent}--${k}: ${v};`).join("\n");

export function toCss(t: typeof tokens = tokens): string {
  const mapped = Object.keys(t.light).map((k) => `  --color-${k}: var(--${k});`).join("\n");
  const radius = Object.entries(t.radius).map(([k, v]) => `  --radius-${k}: ${v};`).join("\n");
  return `/* Generated from design/tokens.json. Do not edit. */
:root {
  color-scheme: light;
${vars(t.light)}
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    color-scheme: dark;
${vars(t.dark, "    ")}
  }
}
:root[data-theme="dark"] {
  color-scheme: dark;
${vars(t.dark)}
}
@theme inline {
${mapped}
${radius}
}
`;
}
