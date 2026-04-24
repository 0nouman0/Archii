import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Guard: treat placeholder values like missing keys (same logic as /api/claude/route.js)
function isRealKey(key) {
  if (!key) return false;
  if (key.includes('...')) return false;   // template placeholder
  if (key.length < 16) return false;       // too short to be real
  return true;
}

export async function POST(req) {
  const { imageBase64, plotW = 30, plotH = 40 } = await req.json();

  if (!imageBase64) {
    return Response.json({ error: 'Missing imageBase64' }, { status: 400 });
  }

  const systemPrompt = `You are an expert Vastu Shastra consultant analysing hand-drawn floor plan sketches. You identify rooms, their compass zone positions, and assess Vastu compliance. Respond ONLY as valid JSON — no markdown, no code fences.`;

  const userPrompt = `Analyse this hand-drawn floor plan sketch (${plotW}×${plotH}ft plot). The user has drawn and labelled rooms. Determine each room's cardinal zone (N/S/E/W/NE/NW/SE/SW/Center) based on its position in the image. Then evaluate Vastu compliance.

Respond ONLY as this exact JSON structure:
{
  "score": <integer 0-100>,
  "rooms_detected": [{"name": "<room name>", "zone": "<zone>", "assessment": "good|acceptable|violation"}],
  "violations": [{"room": "<name>", "issue": "<specific vastu issue>", "severity": "critical|major|minor", "fix": "<actionable fix>"}],
  "positives": ["<things done correctly>"],
  "summary": "<2-sentence overall assessment>",
  "overall_advice": "<1-2 sentences of the most important change to make>"
}`;

  // ── Try Anthropic first (vision capable) ──────────────────────────────────
  if (isRealKey(process.env.ANTHROPIC_API_KEY)) {
    try {
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-5',
        max_tokens: 1500,
        system: systemPrompt,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: 'image/png', data: imageBase64 },
            },
            { type: 'text', text: userPrompt },
          ],
        }],
      });
      const text = response.content[0].text;
      const parsed = JSON.parse(text.replace(/```json|```/g, '').trim());
      return Response.json({ ...parsed, provider: 'claude' });
    } catch (e) {
      console.error('Anthropic vision error:', e.message);
    }
  }

  // ── Fallback: Gemini vision ───────────────────────────────────────────────
  if (isRealKey(process.env.GEMINI_API_KEY)) {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const result = await model.generateContent([
        systemPrompt + '\n\n' + userPrompt,
        { inlineData: { mimeType: 'image/png', data: imageBase64 } },
      ]);
      const text = result.response.text();
      const parsed = JSON.parse(text.replace(/```json|```/g, '').trim());
      return Response.json({ ...parsed, provider: 'gemini' });
    } catch (e) {
      console.error('Gemini vision error:', e.message);
    }
  }

  return Response.json(
    { error: 'No vision-capable AI provider available. Set ANTHROPIC_API_KEY or GEMINI_API_KEY.' },
    { status: 500 }
  );
}
