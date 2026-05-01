# Manual Work Tracker

Items that require your hand, not the AI's. Code is done — these need configuration, research, or a decision from you.

---

## Phase 1 — Already Shipped (2 items need your attention)

### 1. Plan Share Link — deploy to a public URL first

**Status:** Code is live. URL hash encoding works on localhost. Useless until deployed.

**Why it matters:** The share link encodes your plot params (width, height, BHK, city, facing, budget) as a base64 URL hash. When someone opens that link, the studio pre-fills with those params and they hit Generate. But `http://localhost:3000/app#abc123` means nothing to anyone else.

**What you need to do:**
1. Deploy the project to Vercel (or wherever you're hosting it)
2. Confirm the deployed URL (e.g. `https://archii.vercel.app`)
3. Test: generate a plan → click SHARE → paste the copied link in a new incognito tab → confirm it pre-fills params correctly
4. Note: the link shares **params only**, not the generated SVG. The recipient re-generates with the same inputs — AI output may differ slightly. This is intentional (SVG is ~30KB, too large for a URL hash).

**If you want the link to also restore the SVG exactly:** that requires a Supabase lookup by plan ID — flag it and I'll add it in Phase 2.

---

### 2. WhatsApp Share — image preview doesn't work yet

**Status:** The 📲 button opens wa.me with a text message (plan summary + link). That part works. The original ask was "deep link with a plan image preview" — that part is **not done yet**.

**Why:** WhatsApp image preview requires a publicly hosted URL with `og:image` meta tags that WhatsApp can scrape. That's a server-side feature, not a button.

**What you need to do (choose one option):**

**Option A — Workaround (works today, no extra code):**
1. Generate a plan → click **Export PNG** (already in sidebar)
2. Open WhatsApp → paste the share link text + manually attach the downloaded PNG
3. Client sees the image. Slightly manual but it works right now.

**Option B — Proper OG image preview (needs dev work, flag me):**
Requires:
- A `/api/og` route that renders the plan SVG to a PNG on the server using `@vercel/og` or `sharp`
- The share URL points to a page (`/share/[hash]`) with `<meta property="og:image" content="..." />` in its `<head>`
- WhatsApp scrapes that URL and shows the image preview automatically
- Tell me if you want this — I'll build it as a Phase 2 add-on.

---

## Phase 2 — Before we start (1 thing to confirm)

### 3. Supabase — confirm `generated_plans` table schema

The Comparison Checklist and Preset Library features in Phase 2 will read from Supabase. Make sure your table has at minimum these columns (check in your Supabase dashboard):

```
id               uuid / int (primary key)
created_at       timestamp
plot_width       int
plot_height      int
bhk              int
facing           text
city             text
budget           text
svg_code         text
vastu_score      int
total_cost       numeric
rooms            jsonb
vastu_report     jsonb
cost_report      jsonb
furniture_layout jsonb
```

If any column is missing, add it via Supabase Table Editor (no SQL needed). The app will silently skip nulls — it won't crash — but comparisons will show blanks for missing data.

---

## Phase 3 — Research tasks (do these before Phase 3 starts)

### 4. Regulatory Checklist — manually compile approval documents per city

The **Regulatory Auto-Approval Checklist Generator** (Phase 3 feature #2) will generate a formatted PDF checklist of documents needed for plan approval in each city. The AI can hallucinate here — this needs real data.

**What you need to research and hand me:**

For each authority below, find the **official document checklist** from their website or a trusted source:

| Authority | City | Website to check |
|---|---|---|
| BBMP | Bengaluru | bbmp.gov.in |
| BMC / MCGM | Mumbai | mcgm.gov.in |
| MCD / DDA | Delhi | mcd.gov.in, dda.gov.in |
| GHMC | Hyderabad | ghmc.gov.in |
| CMDA | Chennai | cmdachennai.gov.in |
| PMC | Pune | pmc.gov.in |

**For each, collect:**
- List of documents required for residential plan sanction
- Fee structure (sq.ft rate or flat fee)
- Any online portal link for submission
- Typical turnaround time if mentioned

**Format:** Just paste the raw info in a message or a text file. I'll structure it into the checklist generator prompt and hardcode the accurate data so the AI uses it as ground truth instead of guessing.

---

### 5. Energy Efficiency Scoring — city climate data needed

The **Energy Efficiency Scoring** feature (Phase 3 feature #4) simulates passive solar gain and natural ventilation. It needs baseline climate data per city.

**What to collect** (a quick search per city is enough):

| City | Data needed |
|---|---|
| Bengaluru | Average summer temp (°C), prevailing wind direction, humidity % |
| Mumbai | Same |
| Delhi | Same + winter temp |
| Hyderabad | Same |
| Chennai | Same |
| Pune | Same |

Sources: IMD (mausam.imd.gov.in), or just Wikipedia's city climate tables are fine for this level of simulation.

---

## Done — no action needed

- Phase 1: Blueprint/Dark/Light theme — works, no config
- Phase 1: Room Label Toggle — works, no config
- Phase 1: Sun Path Overlay — works, no config
- Phase 1: Progress Bar — works, no config
- Phase 1: Fix All Violations — works, no config
- Phase 1: Explain to My Parents — works, needs `ANTHROPIC_API_KEY` (already set)
