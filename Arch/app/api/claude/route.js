import { callAI } from "../../../lib/ai-provider.js";

// ─── Multi-Provider API Route ────────────────────────────────────────────────
// Fallback orchestrated API that tries Groq, Gemini, and NVIDIA NIM.
// Replaces the previous hardcoded Anthropic-only route.

export async function POST(request) {
  try {
    const body = await request.json();
    const { systemPrompt, userPrompt, maxTokens = 4000 } = body;

    if (!systemPrompt || !userPrompt) {
      return Response.json({ error: "Missing prompts" }, { status: 400 });
    }

    // Use the shared AI provider utility with fallback logic
    const { text, provider } = await callAI(systemPrompt, userPrompt, maxTokens);

    return Response.json({ text, provider });
  } catch (err) {
    console.error("[AI Route Error]:", err.message);
    return Response.json(
      {
        error: "AI Generation failed.",
        details: err.message,
      },
      { status: 503 }
    );
  }
}
