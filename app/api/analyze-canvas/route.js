import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';

function isRealKey(key) {
  if (!key) return false;
  if (key.includes('...')) return false;
  if (key.length < 16) return false;
  return true;
}

function parseJSON(raw) {
  try { return JSON.parse(raw.replace(/```json|```/g, '').trim()); }
  catch { return null; }
}

// Build a text description of rooms for providers that can't do vision
function describeRooms(rooms, plotW, plotH) {
  if (!rooms?.length) return 'No rooms provided.';
  // Normalise canvas coords (600×450px) → fractional position (0-1)
  const CW = 600, CH = 450;
  const described = rooms.map(r => {
    const cx = (r.x + r.w / 2) / CW;
    const cy = (r.y + r.h / 2) / CH;
    // Map fractional position to compass zone
    const col = cx < 0.33 ? 'West' : cx < 0.67 ? 'Centre' : 'East';
    const row = cy < 0.33 ? 'North' : cy < 0.67 ? 'Centre' : 'South';
    const zone = row === 'Centre' && col === 'Centre' ? 'Center'
      : row === 'Centre' ? col
      : col === 'Centre' ? row
      : `${row}-${col === 'West' ? 'West' : col === 'East' ? 'East' : col}`;
    return `${r.label} → ${zone} zone (canvas pos: ${Math.round(cx * 100)}% from left, ${Math.round(cy * 100)}% from top)`;
  }).join('\n');
  return `Plot: ${plotW}×${plotH}ft\nRooms:\n${described}`;
}

const BELIEF_LABELS = {
  vastu:     'Vastu Shastra',
  islamic:   'Islāmī Mīmārī (Islamic Architecture)',
  christian: 'Sacred Christian Design',
  universal: 'Universal Design Principles',
};

export async function POST(req) {
  const { imageBase64, plotW = 30, plotH = 40, rooms = [], belief = 'vastu' } = await req.json();

  if (!imageBase64) {
    return Response.json({ error: 'Missing imageBase64' }, { status: 400 });
  }

  const beliefLabel = BELIEF_LABELS[belief] || BELIEF_LABELS.vastu;
  const methodologyOnly =
    belief === 'vastu'
      ? ''
      : ` Use only ${beliefLabel} criteria — do not evaluate using Vastu Shastra or other traditions.`;
  const systemPrompt = `You are an expert ${beliefLabel} consultant. Analyse floor plan room positions and assess compliance with ${beliefLabel} principles.${methodologyOnly} Respond ONLY as valid JSON — no markdown, no code fences.`;

  const jsonSchema = `{
  "score": <integer 0-100>,
  "rooms_detected": [{"name": "<room name>", "zone": "<zone>", "assessment": "good|acceptable|violation"}],
  "violations": [{"room": "<name>", "issue": "<specific ${beliefLabel} issue>", "severity": "critical|major|minor", "fix": "<actionable fix>"}],
  "positives": ["<things done correctly per ${beliefLabel}>"],
  "summary": "<2-sentence overall assessment>",
  "overall_advice": "<1-2 sentences of the most important change to make>"
}`;

  const visionPrompt = `Analyse this hand-drawn floor plan sketch (${plotW}×${plotH}ft plot). Identify each room's cardinal zone (N/S/E/W/NE/NW/SE/SW/Center) from its position where relevant to ${beliefLabel}. Evaluate compliance strictly with ${beliefLabel}.${methodologyOnly}\n\nRespond ONLY as:\n${jsonSchema}`;

  // ── 1. Anthropic vision ───────────────────────────────────────────────────
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
            { type: 'image', source: { type: 'base64', media_type: 'image/png', data: imageBase64 } },
            { type: 'text', text: visionPrompt },
          ],
        }],
      });
      const parsed = parseJSON(response.content[0].text);
      if (parsed) return Response.json({ ...parsed, provider: 'claude', belief });
    } catch (e) {
      console.error('Anthropic vision error:', e.message);
    }
  }

  // ── 2. Gemini vision ──────────────────────────────────────────────────────
  if (isRealKey(process.env.GEMINI_API_KEY)) {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const result = await model.generateContent([
        systemPrompt + '\n\n' + visionPrompt,
        { inlineData: { mimeType: 'image/png', data: imageBase64 } },
      ]);
      const parsed = parseJSON(result.response.text());
      if (parsed) return Response.json({ ...parsed, provider: 'gemini', belief });
    } catch (e) {
      console.error('Gemini vision error:', e.message);
    }
  }

  // ── 3. Groq text fallback (uses room positions from client state) ─────────
  if (isRealKey(process.env.GROQ_API_KEY)) {
    try {
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      const roomDesc = describeRooms(rooms, plotW, plotH);
      const textPrompt = `${systemPrompt}\n\nThe user has drawn a floor plan. Here are the rooms and their computed positions:\n\n${roomDesc}\n\nEvaluate compliance with ${beliefLabel} principles for this layout.\n\nRespond ONLY as:\n${jsonSchema}`;
      const chat = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: textPrompt }],
        max_tokens: 1500,
        temperature: 0.3,
      });
      const parsed = parseJSON(chat.choices[0].message.content);
      if (parsed) return Response.json({ ...parsed, provider: 'groq', belief });
    } catch (e) {
      console.error('Groq text fallback error:', e.message);
    }
  }

  return Response.json(
    { error: 'Analysis unavailable — all AI providers failed or are unconfigured.' },
    { status: 500 }
  );
}
