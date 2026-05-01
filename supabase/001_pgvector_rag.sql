-- ─── RAG Vector Store Migration ─────────────────────────────────────────────
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- Required for the RAG layer to store and retrieve floor plan embeddings.

-- Step 1: Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Step 2: Create the floor plan embeddings table
CREATE TABLE IF NOT EXISTS floor_plan_embeddings (
  id              BIGSERIAL PRIMARY KEY,
  dimension_key   TEXT        NOT NULL,  -- e.g. "30x40"
  bhk             INTEGER     NOT NULL,  -- 1, 2, 3, 4, or 5
  facing          TEXT        NOT NULL,  -- North, South, East, West
  vastu_score     REAL,                  -- 0-100, null if unknown
  content         TEXT        NOT NULL,  -- full text description for embedding + retrieval
  metadata        JSONB       DEFAULT '{}',
  embedding       VECTOR(1536),          -- OpenAI text-embedding-3-small dimension
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Step 3: Create unique constraint to prevent duplicate ingestion
CREATE UNIQUE INDEX IF NOT EXISTS floor_plan_embeddings_uniq
  ON floor_plan_embeddings (dimension_key, bhk, facing, (left(content, 100)));

-- Step 4: Create HNSW index for fast similarity search (better than IVFFlat for small datasets)
CREATE INDEX IF NOT EXISTS floor_plan_embeddings_hnsw
  ON floor_plan_embeddings
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- Step 5: Create the similarity search function used by the retriever
CREATE OR REPLACE FUNCTION match_floor_plans(
  query_embedding  VECTOR(1536),
  match_threshold  FLOAT   DEFAULT 0.25,
  match_count      INT     DEFAULT 5
)
RETURNS TABLE (
  id             BIGINT,
  dimension_key  TEXT,
  bhk            INTEGER,
  facing         TEXT,
  vastu_score    REAL,
  content        TEXT,
  metadata       JSONB,
  similarity     FLOAT
)
LANGUAGE SQL STABLE
AS $$
  SELECT
    id,
    dimension_key,
    bhk,
    facing,
    vastu_score,
    content,
    metadata,
    1 - (embedding <=> query_embedding) AS similarity
  FROM floor_plan_embeddings
  WHERE embedding IS NOT NULL
    AND 1 - (embedding <=> query_embedding) > match_threshold
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$$;

-- Step 6: Enable Row Level Security (allow anon reads for retrieval)
ALTER TABLE floor_plan_embeddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON floor_plan_embeddings
  FOR SELECT USING (true);

CREATE POLICY "Allow service role insert" ON floor_plan_embeddings
  FOR INSERT WITH CHECK (true);

-- Verification query (run after migration to confirm setup):
-- SELECT COUNT(*) FROM floor_plan_embeddings;
-- SELECT * FROM match_floor_plans(array_fill(0.0, ARRAY[1536])::vector, 0.1, 3);
