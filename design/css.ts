import tokens from "./tokens.json";

// Renders design tokens as CSS custom properties (written to app/tokens.css by scripts/gen-tokens.ts).
export function toCss(t: typeof tokens = tokens): string {
  const lines = Object.entries(t).flatMap(([group, values]) =>
    Object.entries(values).map(([name, value]) => `  --${group}-${name}: ${value};`),
  );
  return `/* Generated from design/tokens.json. Do not edit. */\n:root {\n${lines.join("\n")}\n}\n`;
}
