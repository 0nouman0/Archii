// ─── Embedding utility (OpenAI text-embedding-3-small, 1536 dims) ─────────────
// Cost: ~$0.02/million tokens. 178 floor plan descriptions ≈ $0.002 total.

import OpenAI from "openai";

export const EMBED_MODEL   = "text-embedding-3-small";
export const EMBEDDING_DIM = 1536;

let _client = null;
function getClient() {
  if (!_client) {
    const key = process.env.OPENAI_API_KEY;
    if (!key || key.includes("...") || key.length < 20) return null;
    _client = new OpenAI({ apiKey: key });
  }
  return _client;
}

export async function createEmbedding(text) {
  const client = getClient();
  if (!client) return null;
  const res = await client.embeddings.create({
    model: EMBED_MODEL,
    input: text.slice(0, 8000),
  });
  return res.data[0].embedding;
}

export async function createEmbeddings(texts) {
  const client = getClient();
  if (!client) return texts.map(() => null);
  const res = await client.embeddings.create({
    model: EMBED_MODEL,
    input: texts.map(t => t.slice(0, 8000)),
  });
  return res.data.map(d => d.embedding);
}

export function isEmbeddingAvailable() {
  const key = process.env.OPENAI_API_KEY;
  return !!(key && !key.includes("...") && key.length >= 20);
}

// Cosine similarity for keyword fallback
export function cosineSimilarity(a, b) {
  if (!a || !b || a.length !== b.length) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB) + 1e-10);
}
