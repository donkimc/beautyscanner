import { readFileSync } from "node:fs";
import { isSafe } from "../agent/explainer";
import { buildRoutine, type Answers } from "../lib/recommend";

// Scenario evals: run the real recommender and guardrails against evals/cases.json.
interface RoutineCase { name: string; answers: Answers; expect: { steps?: string[]; withinBudget?: boolean; noWarnings?: boolean; hasWarning?: boolean; allSensitiveSafe?: boolean } }
interface GuardCase { name: string; text: string; repeat?: number; evidence: string; safe: boolean }
const cases = JSON.parse(readFileSync(new URL("./cases.json", import.meta.url), "utf8")) as { routines: RoutineCase[]; guardrails: GuardCase[] };

const results: { name: string; ok: boolean; why: string }[] = [];

for (const c of cases.routines) {
  const r = buildRoutine(c.answers);
  const failures: string[] = [];
  const e = c.expect;
  if (e.steps && JSON.stringify(r.items.map((p) => p.step)) !== JSON.stringify(e.steps)) failures.push(`steps ${r.items.map((p) => p.step)}`);
  if (e.withinBudget && r.total > c.answers.budget) failures.push(`total ${r.total} > ${c.answers.budget}`);
  if (e.noWarnings && r.warnings.length) failures.push(`warnings ${r.warnings}`);
  if (e.hasWarning && !r.warnings.length) failures.push("expected a warning");
  if (e.allSensitiveSafe && r.items.some((p) => !p.sensitiveSafe)) failures.push("unsafe product for sensitive skin");
  results.push({ name: c.name, ok: !failures.length, why: failures.join("; ") });
}
for (const g of cases.guardrails) {
  const got = isSafe(g.text.repeat(g.repeat ?? 1), g.evidence);
  results.push({ name: `guardrail: ${g.name}`, ok: got === g.safe, why: `isSafe=${got}, expected ${g.safe}` });
}

for (const r of results) console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name}${r.ok ? "" : `  (${r.why})`}`);
const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
