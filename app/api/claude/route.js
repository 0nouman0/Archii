import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import OpenAI from "openai";

// ─── Provider implementations ─────────────────────────────────────────────────

// Guard: treat placeholder values like missing keys
function isRealKey(key) {
  if (!key) return false;
  if (key.includes("...")) return false;       // template placeholder
  if (key.length < 16) return false;           // too short to be real
  return true;
}

async function tryAnthropic(systemPrompt, userPrompt, maxTokens) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!isRealKey(key)) return null;
  const client = new Anthropic({ apiKey: key });
  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });
    return message.content[0]?.text || "";
  } catch (err) {
    console.error("[Anthropic] Error:", err.message);
    throw err;
  }
}

async function tryGemini(systemPrompt, userPrompt, maxTokens) {
  const key = process.env.GEMINI_API_KEY;
  if (!isRealKey(key)) return null;
  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: systemPrompt,
    generationConfig: { maxOutputTokens: maxTokens },
  });
  try {
    const result = await model.generateContent(userPrompt);
    return result.response.text() || "";
  } catch (err) {
    console.error("[Gemini] Error:", err.message);
    throw err;
  }
}

async function tryGroq(systemPrompt, userPrompt, maxTokens) {
  const key = process.env.GROQ_API_KEY;
  if (!isRealKey(key)) return null;
  const client = new Groq({ apiKey: key });
  try {
    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: Math.min(maxTokens, 6000),
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });
    return completion.choices[0]?.message?.content || "";
  } catch (err) {
    console.error("[Groq] Error:", err.message);
    throw err;
  }
}

async function tryNemotron(systemPrompt, userPrompt, maxTokens) {
  const key = process.env.NVIDIA_NIM_API_KEY;
  if (!isRealKey(key)) return null;
  const client = new OpenAI({
    apiKey: key,
    baseURL: "https://integrate.api.nvidia.com/v1",
  });
  
  try {
    // Using the user-specified GLM model with thinking enabled
    const completion = await client.chat.completions.create({
      model: "z-ai/glm-5.1",
      max_tokens: Math.min(maxTokens, 16384),
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      // Thinking is slow for SVGs, disabling for better responsiveness
      // chat_template_kwargs: { "enable_thinking": true, "clear_thinking": false }
    });
    return completion.choices[0]?.message?.content || "";
  } catch (err) {
    console.warn("[Nemotron] GLM-5.1 model failed, trying fallback model (Llama-405B)...", err.message);
    const fallback = await client.chat.completions.create({
      model: "meta/llama-3.1-405b-instruct",
      max_tokens: Math.min(maxTokens, 4096),
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });
    return fallback.choices[0]?.message?.content || "";
  }
}

// ─── Provider registry ────────────────────────────────────────────────────────

const PROVIDER_MAP = {
  anthropic: { name: "Anthropic (Claude Sonnet)", fn: tryAnthropic },
  gemini:    { name: "Google (Gemini 2.0 Flash)", fn: tryGemini    },
  groq:      { name: "Groq (Llama-3.3-70B)",      fn: tryGroq      },
  nvidia:    { name: "NVIDIA (Nemotron/GLM)",      fn: tryNemotron  },
};

// Default order when no priority is specified
const DEFAULT_ORDER = ["groq", "gemini", "nvidia", "anthropic"];

function buildProviderChain(priorities = []) {
  // Start with requested priorities, then append any remaining providers as fallback
  const seen = new Set(priorities);
  const rest = DEFAULT_ORDER.filter(k => !seen.has(k));
  return [...priorities, ...rest]
    .map(k => PROVIDER_MAP[k])
    .filter(Boolean);
}

export async function POST(request) {
  const body = await request.json();
  const { systemPrompt, userPrompt, maxTokens = 4000, providers } = body;

  if (!systemPrompt || !userPrompt) {
    return Response.json({ error: "Missing prompts" }, { status: 400 });
  }

  const chain  = buildProviderChain(providers || []);
  const errors = [];

  for (const { name, fn } of chain) {
    try {
      const result = await fn(systemPrompt, userPrompt, maxTokens);
      if (result !== null) {
        return Response.json({ text: result, provider: name });
      }
    } catch (err) {
      const isOverloaded = err.status === 503 || err.message?.includes("overloaded") || err.message?.includes("rate_limit");
      console.error(`[AI Shard] ${name} ${isOverloaded ? "overloaded" : "failed"}:`, err.message);
      errors.push(`${name}: ${err.message}`);
    }
  }

  return Response.json(
    {
      error: "All AI providers failed or unconfigured. Set at least one key in .env.local.",
      details: errors,
    },
    { status: 503 }
  );
}
