import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

const root = new URL("..", import.meta.url).pathname;
const rules = JSON.parse(readFileSync(join(root, "architecture/rules.json"), "utf8")) as { layers: Record<string, string[]> };

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? files(p) : /\.(ts|tsx)$/.test(f) ? [p] : [];
  });
}

test("each layer only imports from allowed layers", () => {
  for (const [layer, allowed] of Object.entries(rules.layers)) {
    for (const file of files(join(root, layer))) {
      const src = readFileSync(file, "utf8");
      for (const m of src.matchAll(/from\s+["']([^"']+)["']/g)) {
        const spec = m[1];
        let target: string | undefined;
        if (spec.startsWith("@/")) target = spec.slice(2).split("/")[0];
        else if (spec.startsWith(".")) {
          const resolved = join(file, "..", spec).slice(root.length).split("/")[0];
          target = resolved;
        }
        if (!target || target === layer || !(target in rules.layers)) continue;
        assert.ok(allowed.includes(target), `${file.slice(root.length)} (${layer}) must not import ${target}`);
      }
    }
  }
});

test("lib never imports the AI agent or the UI", () => {
  for (const file of files(join(root, "lib"))) {
    assert.ok(!/agent|\/app\//.test(readFileSync(file, "utf8").match(/from\s+["'][^"']+["']/g)?.join(" ") ?? ""), file);
  }
});

test("secrets are read only on the server", () => {
  for (const file of files(join(root, "app")).filter((f) => /\.tsx$/.test(f))) {
    assert.ok(!readFileSync(file, "utf8").includes("process.env"), `${file.slice(root.length)} reads env in a client file`);
  }
});

test("every top-level source folder is declared in architecture/rules.json", () => {
  const declared = new Set(Object.keys(rules.layers));
  const ignore = new Set(["node_modules", "public", "architecture", "plan", "tests"]);
  for (const d of readdirSync(root)) {
    if (d.startsWith(".") || ignore.has(d) || !statSync(join(root, d)).isDirectory()) continue;
    assert.ok(declared.has(d), `folder ${d}/ is not in architecture/rules.json`);
  }
});

test("client components never import server-only modules", () => {
  for (const file of files(join(root, "app")).filter((f) => /\.tsx$/.test(f))) {
    const src = readFileSync(file, "utf8");
    if (!src.startsWith('"use client"')) continue;
    const specs = [...src.matchAll(/from\s+["']([^"']+)["']/g)].map((m) => m[1]);
    assert.ok(!specs.some((x) => /\/(db|email)\/|i18n\/server|auth\/google/.test(x)), `${file.slice(root.length)} imports server-only code`);
  }
});
