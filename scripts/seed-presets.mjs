import { createClient } from "@supabase/supabase-js";
import { ALL_PRESETS } from "../lib/presets.js";

const supabase = createClient(
  "https://nkzuitwujyecdhjiehgs.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5renVpdHd1anllY2RoamllaGdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2NjExMTQsImV4cCI6MjA5MTIzNzExNH0.BmvnxSDhkWtRYzlY1cKD93gGkSlElUcYpoVqoUdsX_Q"
);

const rows = ALL_PRESETS.map(p => ({
  id:            p.id,
  name:          p.name,
  subtitle:      p.subtitle      ?? null,
  tag:           p.tag           ?? null,
  plot_w:        p.plotW         ?? null,
  plot_h:        p.plotH         ?? null,
  bhk:           p.bhk           ?? null,
  facing:        p.facing        ?? null,
  city:          p.city          ?? null,
  budget:        p.budget        ?? null,
  floors:        p.floors        ?? null,
  area:          p.area          ?? null,
  vastu_score:   p.vastuScore    ?? null,
  est_cost:      p.estCost       ?? null,
  highlights:    p.highlights    ?? p.features ?? p.adjustments ?? [],
  category:      p.category,
  cultural_note: p.culturalNote  ?? null,
  vastu_note:    p.vastuNote     ?? null,
  icon:          p.icon          ?? null,
  origin:        p.origin        ?? null,
  adjustments:   p.adjustments   ?? [],
  features:      p.features      ?? [],
}));

const { error } = await supabase
  .from("vastu_presets")
  .upsert(rows, { onConflict: "id" });

if (error) {
  console.error("Seed failed:", error.message);
  process.exit(1);
} else {
  console.log(`Seeded ${rows.length} presets into vastu_presets.`);
}
