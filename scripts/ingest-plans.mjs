/**
 * ingest-plans.mjs  — RAG Knowledge Base Builder
 *
 * Processes two data sources from Arch/plans/:
 *   1. 37 local PNG screenshots  → NVIDIA Llama Vision extracts room layout data
 *   2. 141 CSV rows              → text metadata parsed into vastu descriptions
 *
 * Vision:     NVIDIA NIM meta/llama-3.2-11b-vision-instruct (free)
 * Embeddings: OpenAI text-embedding-3-small, 1536 dims (~$0.002 for all 178 entries)
 *
 * Usage:
 *   node scripts/ingest-plans.mjs
 *   node scripts/ingest-plans.mjs --csv-only      (skip screenshots)
 *   node scripts/ingest-plans.mjs --screenshots-only
 *   node scripts/ingest-plans.mjs --dry-run       (no Supabase writes, just print)
 *
 * Prerequisites:
 *   1. Run Arch/supabase/001_pgvector_rag.sql in your Supabase SQL editor
 *   2. OPENAI_API_KEY + NVIDIA_NIM_API_KEY in Arch/.env
 */

import fs   from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import OpenAI           from "openai";

const NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1";
const VISION_MODEL    = "meta/llama-3.2-11b-vision-instruct";
const EMBED_MODEL     = "text-embedding-3-small";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT      = path.resolve(__dirname, "..");
const PLAN_DIR  = path.join(ROOT, "plans");

// ─── CLI flags ────────────────────────────────────────────────────────────────
const args        = process.argv.slice(2);
const DRY_RUN     = args.includes("--dry-run");
const CSV_ONLY    = args.includes("--csv-only");
const SHOTS_ONLY  = args.includes("--screenshots-only");

// ─── Env loading ──────────────────────────────────────────────────────────────
function loadEnv() {
  const envPath = path.join(ROOT, ".env");
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, "utf8").split("\n");
  for (const line of lines) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
}
loadEnv();

// ─── Clients ──────────────────────────────────────────────────────────────────
const OPENAI_KEY = process.env.OPENAI_API_KEY;
const NVIDIA_KEY = process.env.NVIDIA_NIM_API_KEY;
const SUPA_URL   = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPA_KEY   = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function isRealKey(k) { return k && !k.includes("...") && k.length > 20; }

function preflight() {
  const missing = [];
  if (!isRealKey(OPENAI_KEY))  missing.push("OPENAI_API_KEY (platform.openai.com/api-keys)");
  if (!isRealKey(NVIDIA_KEY))  missing.push("NVIDIA_NIM_API_KEY (for vision — already in .env)");
  if (!SUPA_URL)  missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!SUPA_KEY)  missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY");
  if (missing.length) {
    console.error("\n❌  Missing environment variables in Arch/.env:");
    missing.forEach(k => console.error(`    - ${k}`));
    if (DRY_RUN) {
      console.warn("\n  ⚠  Continuing in dry-run mode with missing keys (API calls will be skipped).\n");
      return;
    }
    console.error("\nAdd them to Arch/.env and re-run.\n");
    process.exit(1);
  }
}

const openai    = new OpenAI({ apiKey: OPENAI_KEY || "" });
const nimClient = new OpenAI({ apiKey: NVIDIA_KEY || "", baseURL: NVIDIA_BASE_URL });
const supabase  = createClient(SUPA_URL, SUPA_KEY);

// ─── Vastu zone map used to enrich CSV text descriptions ─────────────────────
const ZONE_MAP = {
  North: {
    "Living": "N", "Kitchen": "SE", "Master Bed": "SW", "Puja": "NE",
    "Bedroom 2": "W", "Bedroom 3": "E", "Bathroom": "NW", "Toilet": "NW",
    "Utility": "NW", "Dining": "S", "Corridor": "C", "Staircase": "SW",
  },
  East: {
    "Living": "E", "Kitchen": "SE", "Master Bed": "SW", "Puja": "NE",
    "Bedroom 2": "W", "Bedroom 3": "N", "Bathroom": "NW", "Toilet": "NW",
    "Utility": "NW", "Dining": "S", "Corridor": "C", "Staircase": "SW",
  },
  South: {
    "Living": "SE", "Kitchen": "SE", "Master Bed": "SW", "Puja": "NE",
    "Bedroom 2": "W", "Bedroom 3": "N", "Bathroom": "NW", "Toilet": "NW",
    "Utility": "NW", "Dining": "E", "Corridor": "C", "Staircase": "SW",
  },
  West: {
    "Living": "W", "Kitchen": "SE", "Master Bed": "SW", "Puja": "NE",
    "Bedroom 2": "N", "Bedroom 3": "E", "Bathroom": "NW", "Toilet": "NW",
    "Utility": "NW", "Dining": "S", "Corridor": "C", "Staircase": "SW",
  },
};

// ─── Utilities ────────────────────────────────────────────────────────────────
const sleep = ms => new Promise(r => setTimeout(r, ms));

function progress(label, current, total, extra = "") {
  const pct   = Math.round((current / total) * 100);
  const bar   = "█".repeat(Math.floor(pct / 5)) + "░".repeat(20 - Math.floor(pct / 5));
  process.stdout.write(`\r  [${bar}] ${pct}% (${current}/${total})  ${label}${extra}        `);
  if (current === total) process.stdout.write("\n");
}

function parseDimension(text) {
  const m = text?.match(/(\d{2,3})\s*[xX×]\s*(\d{2,3})/);
  return m ? { w: parseInt(m[1]), h: parseInt(m[2]), key: `${m[1]}x${m[2]}` } : null;
}

function parseFacing(text) {
  for (const f of ["North", "South", "East", "West"])
    if (text?.toLowerCase().includes(f.toLowerCase())) return f;
  return null;
}

function parseBHK(text) {
  const m = text?.match(/(\d)\s*BHK/i) || text?.match(/(\d)\s*bed/i);
  return m ? parseInt(m[1]) : null;
}

// ─── Build a rich vastu text description from metadata ────────────────────────
function buildDescription(dim, bhk, facing, title, extra = "") {
  const zones   = ZONE_MAP[facing] || ZONE_MAP.North;
  const bhkRooms = bhk >= 4 ? ["Master Bed","Bedroom 2","Bedroom 3","Bedroom 4"] :
                   bhk >= 3 ? ["Master Bed","Bedroom 2","Bedroom 3"] :
                   bhk >= 2 ? ["Master Bed","Bedroom 2"] : ["Bedroom"];
  const allRooms  = ["Living","Kitchen","Puja","Dining","Bathroom","Toilet","Utility","Corridor",...bhkRooms];
  const roomZones = allRooms.map(r => `${r}→${zones[r] || "varies"}`).join(", ");

  const entranceMap = {
    North: "North wall (preferred NE half for maximum auspiciousness)",
    East:  "East wall (most auspicious direction per Vastu)",
    South: "South wall (SE half reduces negative effects)",
    West:  "West wall (NW half preferred)",
  };

  return `${dim.key}ft ${bhk}BHK ${facing}-facing vastu floor plan. Area: ${dim.w * dim.h} sqft.
Title: ${title}
Room zone placements: ${roomZones}.
Entrance: ${entranceMap[facing] || "front wall"}.
Key vastu features: Puja in NE (receives morning light, most sacred zone). Master Bedroom mandatory in SW (heaviest zone). Kitchen in SE (Agneya fire zone, cook faces East). Bathroom/Toilet in NW (acceptable, never NE). Corridor/Brahmasthan kept open in center. ${facing}-facing entrance on ${facing} wall.
Door placement: Main entrance on ${facing} wall. Room doors face toward central corridor. Kitchen door never directly opposite bathroom. Puja door opens East.
Window placement: Living room North+East windows. Kitchen East window mandatory. Puja East window. Master Bed South+West windows only. Bathrooms North/West for ventilation.
${extra ? `Additional notes: ${extra}` : ""}`.trim();
}

// ─── Phase 1: Parse CSV ───────────────────────────────────────────────────────
function parseCSV() {
  const csvPath = path.join(PLAN_DIR, "floorcsv.csv");
  if (!fs.existsSync(csvPath)) { console.log("  ⚠ floorcsv.csv not found"); return []; }

  const text  = fs.readFileSync(csvPath, "utf-8-sig" in Buffer ? "utf-8-sig" : "utf8");
  const lines = text.split("\n");
  // header: web_scraper_order, web_scraper_start_url, pagination, data, data2, data3, data4, data5, data6, data7, image
  const parsed = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    // Simple CSV split (handles quoted fields with commas)
    const cols = [];
    let cur = "", inQ = false;
    for (const ch of line) {
      if (ch === '"')  { inQ = !inQ; continue; }
      if (ch === ',' && !inQ) { cols.push(cur.trim()); cur = ""; }
      else cur += ch;
    }
    cols.push(cur.trim());

    const title  = cols[3]  || "";
    const desc   = cols[4]  || "";
    const layout = cols[5]  || "";
    const area   = cols[6]  || "";
    const imgUrl = cols[10] || "";

    if (!title) continue;

    const dim    = parseDimension(title) || parseDimension(layout);
    const facing = parseFacing(title) || parseFacing(desc);
    const bhk    = parseBHK(title) || parseBHK(desc);

    if (!dim || !facing || !bhk) continue; // skip rows we can't parse

    parsed.push({ dim, facing, bhk, title, desc, imgUrl });
  }

  console.log(`  CSV parsed: ${parsed.length} usable rows`);
  return parsed;
}

// ─── Phase 2: List local screenshots ─────────────────────────────────────────
function listScreenshots() {
  if (!fs.existsSync(PLAN_DIR)) return [];
  return fs.readdirSync(PLAN_DIR)
    .filter(f => /\.(png|jpg|jpeg|webp)$/i.test(f))
    .map(f => path.join(PLAN_DIR, f));
}

// ─── Phase 3: NVIDIA Llama Vision extraction ─────────────────────────────────
const VISION_PROMPT = `You are a Vastu Shastra expert and architectural analyst.
Analyse this floor plan image. A single image may show ONE or MULTIPLE floor plans side by side.
Extract each distinct floor plan separately.

For each plan return a JSON object with these fields:
{
  "dimension": "WxH in feet e.g. 30x40",
  "facing": "North or South or East or West",
  "bhk": <integer number of bedrooms>,
  "rooms": [{"name": "room name", "zone": "one of NE/NW/SE/SW/N/S/E/W/C", "approx_sqft": <number>}],
  "entrance_wall": "top or bottom or left or right",
  "has_puja": true or false,
  "has_staircase": true or false,
  "vastu_observations": ["observation 1", "observation 2"],
  "title_text": "exact title text visible in image if any"
}

Respond ONLY with a valid JSON array containing one object per floor plan. No markdown, no code fences, no explanation.`;

async function analyseScreenshot(imgPath) {
  if (DRY_RUN) {
    const fname = path.basename(imgPath);
    return [{ dimension: "30x40", facing: "North", bhk: 3, title_text: fname, rooms: [], vastu_observations: [] }];
  }

  const ext  = path.extname(imgPath).toLowerCase().replace(".", "");
  const mime = ext === "png" ? "image/png" : ext === "jpg" || ext === "jpeg" ? "image/jpeg" : "image/webp";
  const b64  = fs.readFileSync(imgPath).toString("base64");

  const response = await nimClient.chat.completions.create({
    model: VISION_MODEL,
    max_tokens: 2000,
    messages: [{
      role: "user",
      content: [
        { type: "image_url", image_url: { url: `data:${mime};base64,${b64}` } },
        { type: "text", text: VISION_PROMPT },
      ],
    }],
  });

  const raw = response.choices[0]?.message?.content || "[]";
  try {
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const parsed  = JSON.parse(cleaned);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return [];
  }
}

// ─── Phase 4: Create OpenAI embedding (text-embedding-3-small, 1536 dims) ────
async function embed(text) {
  if (DRY_RUN) return new Array(1536).fill(0);
  const res = await openai.embeddings.create({
    model: EMBED_MODEL,
    input: text.slice(0, 8000),
  });
  return res.data[0].embedding;
}

// ─── Phase 5: Insert to Supabase (skip duplicates) ───────────────────────────
async function upsert(record) {
  if (DRY_RUN) return;
  const { error } = await supabase.from("floor_plan_embeddings").insert(record);
  // 23505 = unique_violation — safe to skip, row already exists
  if (error && error.code !== "23505") throw new Error(error.message);
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("\n" + "═".repeat(60));
  console.log("  ARCHII  ─  RAG Knowledge Base Ingestion");
  console.log("═".repeat(60));
  if (DRY_RUN) console.log("  🔵 DRY RUN mode — no data will be written to Supabase\n");

  preflight();

  const results = { ok: 0, skipped: 0, errors: 0, total: 0 };

  // ── PHASE 1: Process CSV rows ────────────────────────────────────────────
  if (!SHOTS_ONLY) {
    console.log("\n📄 PHASE 1 — CSV metadata ingestion");
    console.log("  Parsing floorcsv.csv…");
    const rows = parseCSV();
    results.total += rows.length;

    for (let i = 0; i < rows.length; i++) {
      const { dim, facing, bhk, title, desc } = rows[i];
      progress("csv", i + 1, rows.length, ` ${dim.key} ${bhk}BHK ${facing}`);

      try {
        const content   = buildDescription(dim, bhk, facing, title, desc);
        const embedding = await embed(content);
        await upsert({
          dimension_key: dim.key,
          bhk,
          facing,
          vastu_score: null,
          content,
          metadata: { source: "csv", title, plotW: dim.w, plotH: dim.h },
          embedding,
        });
        results.ok++;
      } catch (e) {
        results.errors++;
        // Show error but keep going
        process.stdout.write(`\n  ⚠  ${dim.key} ${bhk}BHK ${facing}: ${e.message}\n`);
      }
      await sleep(100); // NVIDIA NIM rate limit buffer
    }
    console.log(`\n  ✅ CSV phase complete — ${results.ok} ingested, ${results.errors} errors`);
  }

  // ── PHASE 2: Process screenshots with Claude Vision ───────────────────────
  if (!CSV_ONLY) {
    console.log("\n🖼  PHASE 2 — Screenshot Vision analysis");
    const shots  = listScreenshots();
    const okBefore = results.ok;
    results.total += shots.length;
    console.log(`  Found ${shots.length} screenshots in plans/`);

    for (let i = 0; i < shots.length; i++) {
      const fname = path.basename(shots[i]);
      progress("vision", i + 1, shots.length, ` ${fname.slice(0, 40)}`);

      try {
        const plans = await analyseScreenshot(shots[i]);
        if (!plans.length) { results.skipped++; continue; }

        for (const plan of plans) {
          const dim    = parseDimension(plan.dimension || plan.title_text || "");
          const facing = parseFacing(plan.facing || plan.title_text || "");
          const bhk    = plan.bhk || parseBHK(plan.title_text || "");
          if (!dim || !facing || !bhk) { results.skipped++; continue; }

          // Build rich content combining vision data + vastu knowledge
          const roomSummary  = (plan.rooms || []).map(r => `${r.name}→${r.zone}`).join(", ");
          const vastu_obs    = (plan.vastu_observations || []).join("; ");
          const baseContent  = buildDescription(dim, bhk, facing, plan.title_text || `${dim.key} ${bhk}BHK ${facing}`, vastu_obs);
          const visionExtra  = roomSummary
            ? `\nExtracted room zones from floor plan image: ${roomSummary}.`
            : "";
          const content  = baseContent + visionExtra;
          const embedding = await embed(content);

          await upsert({
            dimension_key: dim.key,
            bhk,
            facing,
            vastu_score: null,
            content,
            metadata: {
              source:       "screenshot",
              filename:     fname,
              rooms:        plan.rooms || [],
              has_puja:     plan.has_puja,
              has_staircase: plan.has_staircase,
              entrance_wall: plan.entrance_wall,
              plotW: dim.w, plotH: dim.h,
            },
            embedding,
          });
          results.ok++;
        }
      } catch (e) {
        results.errors++;
        process.stdout.write(`\n  ⚠  ${fname}: ${e.message}\n`);
      }

      await sleep(800); // Vision calls are slower; respect rate limits
    }

    const newFromShots = results.ok - okBefore;
    console.log(`\n  ✅ Screenshot phase complete — ${newFromShots} plan(s) ingested, ${results.errors} errors`);
  }

  // ── PHASE 3: Final summary ─────────────────────────────────────────────────
  console.log("\n" + "═".repeat(60));
  console.log("  INGESTION COMPLETE");
  console.log("═".repeat(60));
  console.log(`  ✅  Ingested : ${results.ok}`);
  console.log(`  ⏭  Skipped  : ${results.skipped}`);
  console.log(`  ❌  Errors   : ${results.errors}`);
  console.log(`  📦  Total    : ${results.total}`);

  if (DRY_RUN) {
    console.log("\n  ℹ  Dry run — nothing was written. Remove --dry-run to ingest.\n");
  } else {
    console.log("\n  📊 Verify in Supabase:");
    console.log("     SELECT COUNT(*), facing FROM floor_plan_embeddings GROUP BY facing;\n");
    console.log("  🚀 Next: start the dev server and generate a plan — scores should now hit 75+.\n");
  }
}

main().catch(err => { console.error("\n💥 Fatal:", err.message); process.exit(1); });
