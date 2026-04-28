import Anthropic from "@anthropic-ai/sdk";
import Groq      from "groq-sdk";
import OpenAI    from "openai";

function isRealKey(key) {
  return !!(key && !key.includes("...") && key.length >= 16);
}

// Rough token estimate: 1 token ≈ 4 chars
function estimateTokens(str) { return Math.ceil((str || "").length / 4); }

// Truncate a prompt string to stay under a token budget
function truncateToTokens(str, maxTokens) {
  const maxChars = maxTokens * 4;
  if (str.length <= maxChars) return str;
  return str.slice(0, maxChars) + "\n...[truncated]";
}

function streamResponse(readable) {
  return new Response(readable, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}

export async function POST(request) {
  const { systemPrompt, userPrompt, maxTokens = 8000 } = await request.json();

  if (!systemPrompt || !userPrompt) {
    return Response.json({ error: "Missing prompts" }, { status: 400 });
  }

  // ── 1. Anthropic Claude (primary) ────────────────────────────────────────────
  const antKey = process.env.ANTHROPIC_API_KEY;
  if (isRealKey(antKey)) {
    const client = new Anthropic({ apiKey: antKey });
    const readable = new ReadableStream({
      async start(controller) {
        try {
          const stream = client.messages.stream({
            model: "claude-sonnet-4-5",
            max_tokens: maxTokens,
            system: systemPrompt,
            messages: [{ role: "user", content: userPrompt }],
          });
          for await (const chunk of stream) {
            if (chunk.type === "content_block_delta" && chunk.delta?.type === "text_delta")
              controller.enqueue(new TextEncoder().encode(chunk.delta.text));
          }
        } catch (e) { controller.error(e); }
        controller.close();
      },
    });
    return streamResponse(readable);
  }

  // ── 2. NVIDIA NIM — meta/llama-3.1-70b-instruct (128K ctx, high limits) ─────
  const nimKey = process.env.NVIDIA_NIM_API_KEY;
  if (isRealKey(nimKey)) {
    const client = new OpenAI({ apiKey: nimKey, baseURL: "https://integrate.api.nvidia.com/v1" });
    const readable = new ReadableStream({
      async start(controller) {
        try {
          const stream = await client.chat.completions.create({
            model: "meta/llama-3.1-70b-instruct",
            max_tokens: Math.min(maxTokens, 4096),
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user",   content: userPrompt },
            ],
            stream: true,
          });
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) controller.enqueue(new TextEncoder().encode(content));
          }
        } catch (e) {
          console.error("[NVIDIA NIM] Error:", e.message);
          controller.error(e);
        }
        controller.close();
      },
    });
    return streamResponse(readable);
  }

  // ── 3. Groq — truncate to fit 12K TPM limit ───────────────────────────────
  const groqKey = process.env.GROQ_API_KEY;
  if (isRealKey(groqKey)) {
    // Groq free tier: 12,000 TPM total. Reserve 3000 for output → 9000 for input.
    const INPUT_TOKEN_BUDGET = 9000;
    const outputTokens = Math.min(maxTokens, 3000);
    const inputBudget = INPUT_TOKEN_BUDGET;
    const sysTokens = estimateTokens(systemPrompt);
    const usrTokens = estimateTokens(userPrompt);

    let sys = systemPrompt;
    let usr = userPrompt;
    if (sysTokens + usrTokens > inputBudget) {
      // Give system prompt 60% of budget, user 40%
      sys = truncateToTokens(systemPrompt, Math.floor(inputBudget * 0.6));
      usr = truncateToTokens(userPrompt,   Math.floor(inputBudget * 0.4));
    }

    const client = new Groq({ apiKey: groqKey });
    const readable = new ReadableStream({
      async start(controller) {
        try {
          const stream = await client.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            max_tokens: outputTokens,
            messages: [
              { role: "system", content: sys },
              { role: "user",   content: usr },
            ],
            stream: true,
          });
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) controller.enqueue(new TextEncoder().encode(content));
          }
        } catch (e) {
          console.error("[Groq] Error:", e.message);
          controller.error(e);
        }
        controller.close();
      },
    });
    return streamResponse(readable);
  }

  // ── 4. Gemini fallback ────────────────────────────────────────────────────
  const geminiKey = process.env.GEMINI_API_KEY;
  if (isRealKey(geminiKey)) {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(geminiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const readable = new ReadableStream({
      async start(controller) {
        try {
          const result = await model.generateContentStream(
            `${systemPrompt}\n\n${userPrompt}`
          );
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) controller.enqueue(new TextEncoder().encode(text));
          }
        } catch (e) {
          console.error("[Gemini] Error:", e.message);
          controller.error(e);
        }
        controller.close();
      },
    });
    return streamResponse(readable);
  }

  return Response.json({ error: "No AI provider available — check API keys in .env" }, { status: 503 });
}
