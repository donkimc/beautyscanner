// One-off: generate a small, low-cost picture for every fictional sample product (lib/samples.ts) with Atlas Cloud.
// The key is read from a git-ignored env file and sent only to api.atlascloud.ai. Pictures are AI-generated
// illustrations of generic packaging with a made-up brand label; they must never be presented as real product photos.
//
//   npx tsx scripts/gen-images.ts --dry-run                 list prompts and the estimated cost, no API call
//   npx tsx scripts/gen-images.ts --limit 3                 make the first 3 missing pictures (test run)
//   npx tsx scripts/gen-images.ts --ids c01,t02             make specific ones
//   npx tsx scripts/gen-images.ts                           make every missing picture
// Options: --env <file> (default .env.local), --force (overwrite existing), --max-usd <n> (default 1)
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import { SAMPLE_SPECS } from "../lib/samples";

const API = "https://api.atlascloud.ai/api/v1";
const MODEL = "openai/gpt-image-1-mini/text-to-image"; // black-forest-labs/flux-schnell errors on Atlas Cloud (server-side bug), so this is the cheapest working model
const SIZE = "1024x1024"; // smallest this model offers; shrunk to 400px below
const USD_PER_IMAGE = 0.004; // Atlas Cloud list price at quality "low"; check your dashboard
const OUT_DIR = join(process.cwd(), "public", "products", "demo");
const MANIFEST = join(OUT_DIR, "manifest.json");

const args = process.argv.slice(2);
const flag = (n: string) => args.includes(`--${n}`);
const opt = (n: string) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : undefined; };

function loadKey(): string {
  const file = opt("env") ?? ".env.local";
  const line = readFileSync(file, "utf8").split("\n").find((l) => l.startsWith("ATLAS_API_KEY="));
  const key = (line ?? "").slice("ATLAS_API_KEY=".length).trim().replace(/^["']|["']$/g, "");
  if (!key) throw new Error(`ATLAS_API_KEY is empty in ${file}`);
  return key;
}

type Json = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
const unwrap = (j: Json): Json => (j && typeof j.data === "object" && j.data ? j.data : j);
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function generate(key: string, prompt: string): Promise<Buffer> {
  const headers = { Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
  const res = await fetch(`${API}/model/generateImage`, { method: "POST", headers, body: JSON.stringify({ model: MODEL, prompt, size: SIZE, quality: "low" }) });
  if (!res.ok) throw new Error(`submit ${res.status}: ${(await res.text()).slice(0, 200)}`);
  let d = unwrap((await res.json()) as Json);
  const id = d.id ?? d.prediction_id;
  for (let i = 0; i < 60; i++) {
    const out = d.outputs ?? d.output;
    if (d.status === "failed") throw new Error(`generation failed: ${String(d.error ?? "").slice(0, 200)}`);
    if (["succeeded", "completed"].includes(d.status) && Array.isArray(out) && out[0]) {
      const img = await fetch(out[0]);
      if (!img.ok) throw new Error(`download ${img.status}`);
      return Buffer.from(await img.arrayBuffer());
    }
    await sleep(1500);
    const poll = await fetch(`${API}/model/prediction/${id}`, { headers });
    if (!poll.ok) throw new Error(`poll ${poll.status}`);
    d = unwrap((await poll.json()) as Json);
  }
  throw new Error("timed out");
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const ids = opt("ids")?.split(",");
  let todo = SAMPLE_SPECS.filter((s) => (ids ? ids.includes(s.product.id) : true) && (flag("force") || !existsSync(join(OUT_DIR, `${s.product.id}.jpg`))));
  if (opt("limit")) todo = todo.slice(0, Number(opt("limit")));
  const maxUsd = Number(opt("max-usd") ?? 1);
  const estimate = todo.length * USD_PER_IMAGE;
  console.log(`${todo.length} pictures to make, estimated cost $${estimate.toFixed(3)} (cap $${maxUsd}), model ${MODEL}, size ${SIZE}`);
  if (estimate > maxUsd) throw new Error("estimated cost is over the cap; raise --max-usd or use --limit");
  if (flag("dry-run")) { for (const s of todo) console.log(`${s.product.id}  ${s.prompt}`); return; }

  const key = loadKey();
  const manifest: Record<string, { prompt: string; model: string; size: string; at: string }> = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : {};
  let spent = 0, failures = 0, made = 0;
  const queue = [...todo];
  const worker = async () => {
    for (let s = queue.shift(); s; s = queue.shift()) {
      if (failures >= 5) return; // stop early when something is wrong
      if (spent + USD_PER_IMAGE > maxUsd) return;
      try {
        spent += USD_PER_IMAGE;
        const raw = await generate(key, s.prompt);
        // Small, soft JPEG: this is a placeholder illustration, not a product shot.
        await sharp(raw).resize(400, 400, { fit: "cover" }).jpeg({ quality: 55, mozjpeg: true }).toFile(join(OUT_DIR, `${s.product.id}.jpg`));
        manifest[s.product.id] = { prompt: s.prompt, model: MODEL, size: SIZE, at: new Date().toISOString() };
        made++;
        console.log(`ok   ${s.product.id}  (${made}/${todo.length})`);
      } catch (e) {
        failures++;
        console.error(`FAIL ${s.product.id}: ${(e as Error).message}`);
      }
    }
  };
  await Promise.all([worker(), worker(), worker()]);
  writeFileSync(MANIFEST, JSON.stringify(manifest, null, 1) + "\n");
  console.log(`done: ${made} made, ${failures} failed, about $${spent.toFixed(3)} spent`);
  if (failures) process.exitCode = 1;
}

main().catch((e) => { console.error(String(e.message ?? e)); process.exit(1); });
