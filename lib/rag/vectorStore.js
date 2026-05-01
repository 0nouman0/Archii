// ─── Supabase pgvector store for floor plan knowledge ────────────────────────
import { createClient } from "@supabase/supabase-js";
import { createEmbedding } from "./embeddings.js";

function getSupabaseAdmin() {
  const url  = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key  = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

// Insert a floor plan document into the vector store
export async function upsertFloorPlanDocument(doc) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase not configured");

  const embedding = await createEmbedding(doc.content);

  const { error } = await supabase.from("floor_plan_embeddings").upsert({
    dimension_key: doc.dimensionKey,
    bhk:           doc.bhk,
    facing:        doc.facing,
    vastu_score:   doc.vastuScore || null,
    content:       doc.content,
    metadata:      doc.metadata || {},
    embedding:     embedding,
  }, { onConflict: "dimension_key,bhk,facing,content" });

  if (error) throw new Error(`Vector store upsert failed: ${error.message}`);
  return { success: true };
}

// Semantic similarity search using pgvector
export async function searchSimilarPlans(queryText, { topK = 5, minScore = 0.3 } = {}) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const queryEmbedding = await createEmbedding(queryText);
  if (!queryEmbedding) return [];

  const { data, error } = await supabase.rpc("match_floor_plans", {
    query_embedding:  queryEmbedding,
    match_threshold:  minScore,
    match_count:      topK,
  });

  if (error) {
    console.warn("pgvector search failed:", error.message);
    return [];
  }
  return data || [];
}

// Get all documents for a specific dimension+BHK combo (without embedding)
export async function getByDimension(dimensionKey, bhk, facing) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("floor_plan_embeddings")
    .select("id, dimension_key, bhk, facing, vastu_score, content, metadata")
    .eq("dimension_key", dimensionKey)
    .eq("bhk", bhk)
    .eq("facing", facing)
    .order("vastu_score", { ascending: false })
    .limit(5);

  if (error) {
    console.warn("DB fetch failed:", error.message);
    return [];
  }
  return data || [];
}

// Count ingested documents
export async function getIngestionStats() {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { total: 0, byDimension: {} };

  const { data, error } = await supabase
    .from("floor_plan_embeddings")
    .select("dimension_key, bhk, facing", { count: "exact" });

  if (error) return { total: 0, byDimension: {} };

  const byDimension = {};
  (data || []).forEach(row => {
    const key = `${row.dimension_key}_${row.bhk}BHK_${row.facing}`;
    byDimension[key] = (byDimension[key] || 0) + 1;
  });

  return { total: data?.length || 0, byDimension };
}
