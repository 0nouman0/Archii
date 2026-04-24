import Anthropic from "@anthropic-ai/sdk";

function isRealKey(key) {
  if (!key) return false;
  if (key.includes("...")) return false;
  if (key.length < 16) return false;
  return true;
}

export async function POST(request) {
  const { systemPrompt, userPrompt, maxTokens = 8000 } = await request.json();

  if (!systemPrompt || !userPrompt) {
    return Response.json({ error: "Missing prompts" }, { status: 400 });
  }

  const key = process.env.ANTHROPIC_API_KEY;
  if (!isRealKey(key)) {
    return Response.json({ error: "Anthropic key not configured for streaming" }, { status: 503 });
  }

  const client = new Anthropic({ apiKey: key });

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
          if (chunk.type === "content_block_delta" && chunk.delta?.type === "text_delta") {
            controller.enqueue(new TextEncoder().encode(chunk.delta.text));
          }
        }
      } catch (e) {
        controller.error(e);
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      "X-Accel-Buffering": "no",
    },
  });
}
