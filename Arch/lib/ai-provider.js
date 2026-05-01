import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import OpenAI from "openai";

// Guard: treat placeholder values like missing keys
export function isRealKey(key) {
  if (!key) return false;
  if (key.includes("...")) return false;       // template placeholder
  if (key.length < 16) return false;           // too short to be real
  return true;
}

export async function tryAnthropic(systemPrompt, userPrompt, maxTokens) {
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

export async function tryGemini(systemPrompt, userPrompt, maxTokens) {
  const key = process.env.GEMINI_API_KEY;
  if (!isRealKey(key)) return null;
  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
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

export async function tryGroq(systemPrompt, userPrompt, maxTokens) {
  const key = process.env.GROQ_API_KEY;
  if (!isRealKey(key)) return null;
  const client = new Groq({ apiKey: key });
  try {
    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: Math.min(maxTokens, 8000),
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

export async function tryNemotron(systemPrompt, userPrompt, maxTokens) {
  const key = process.env.NVIDIA_NIM_API_KEY;
  if (!isRealKey(key)) return null;
  const client = new OpenAI({
    apiKey: key,
    baseURL: "https://integrate.api.nvidia.com/v1",
  });
  
  try {
    const completion = await client.chat.completions.create({
      model: "z-ai/glm-5.1",
      max_tokens: Math.min(maxTokens, 16384),
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });
    return completion.choices[0]?.message?.content || "";
  } catch (err) {
    console.warn("[Nemotron] Fallback triggered:", err.message);
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

const PROVIDERS = [
  { name: "Groq (Llama-3.3-70B)",      fn: tryGroq },
  { name: "Google (Gemini 2.0 Flash)", fn: tryGemini },
  { name: "NVIDIA (Nemotron/GLM)",     fn: tryNemotron },
  { name: "Anthropic (Claude Sonnet)", fn: tryAnthropic },
];

export async function callAI(systemPrompt, userPrompt, maxTokens = 4000) {
  const errors = [];
  for (const { name, fn } of PROVIDERS) {
    try {
      const result = await fn(systemPrompt, userPrompt, maxTokens);
      if (result !== null) return { text: result, provider: name };
    } catch (err) {
      console.error(`[AI Fallback] ${name} failed:`, err.message);
      errors.push(`${name}: ${err.message}`);
    }
  }
  throw new Error("All AI providers failed: " + errors.join("; "));
}
