export async function GET() {
  const providers = [
    { name: "ANTHROPIC_API_KEY",    val: process.env.ANTHROPIC_API_KEY },
    { name: "GEMINI_API_KEY",       val: process.env.GEMINI_API_KEY },
    { name: "GROQ_API_KEY",         val: process.env.GROQ_API_KEY },
    { name: "NVIDIA_NIM_API_KEY",   val: process.env.NVIDIA_NIM_API_KEY },
    { name: "SUPABASE_URL",         val: process.env.NEXT_PUBLIC_SUPABASE_URL },
  ];

  const results = providers.map(p => {
    const isConfigured = !!p.val && !p.val.includes("...");
    const length = p.val ? p.val.length : 0;
    const masked = p.val ? (p.val.slice(0, 6) + "..." + p.val.slice(-4)) : "MISSING";
    
    return {
      provider: p.name,
      configured: isConfigured,
      length,
      masked,
      status: isConfigured ? "Ready" : (p.val ? "Placeholder/Invalid" : "Missing")
    };
  });

  return Response.json(results);
}
