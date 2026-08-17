import { getGraph, queryGraph } from "@/lib/kg";
import { buildPlan, checkEscalation } from "@/lib/agentic-graph";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, question } = await req.json();
  const lastUser = question || messages?.[messages.length - 1]?.content || "";

  // Agentic Graph: Immutable plan (locked)
  const { plan } = buildPlan(lastUser);

  // KG Query: Traverse, don't retrieve
  const { subgraph, entities, answer, citations } = queryGraph(lastUser);
  const { shouldEscalate, trace } = checkEscalation(subgraph.length);

  // Try Vercel AI Gateway if key present, otherwise deterministic graph answer
  const gatewayKey = process.env.AI_GATEWAY_API_KEY || process.env.OPENAI_API_KEY;
  let llmEnhancement: string | null = null;

  if (gatewayKey && !shouldEscalate) {
    try {
      // Route through Vercel AI Gateway (OpenAI-compatible)
      const gatewayUrl = process.env.AI_GATEWAY_URL || "https://ai-gateway.vercel.sh/v1/chat/completions";
      const isGateway = !!process.env.AI_GATEWAY_API_KEY;
      const url = isGateway ? gatewayUrl : "https://api.openai.com/v1/chat/completions";
      const key = isGateway ? process.env.AI_GATEWAY_API_KEY! : process.env.OPENAI_API_KEY!;

      const sys = `You are a Graph Architect agent. You reason over a knowledge graph, not raw text. Every claim must cite a specific edge. Graph triples: ${JSON.stringify(subgraph)}. Plan: ${plan}. Enhance the draft answer but keep citations intact. Draft: ${answer}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
        body: JSON.stringify({
          model: process.env.AI_GATEWAY_MODEL || "gpt-4o-mini",
          messages: [{ role: "system", content: sys }, { role: "user", content: lastUser }],
          max_tokens: 600,
          temperature: 0.3,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        llmEnhancement = data.choices?.[0]?.message?.content || null;
      }
    } catch (e) {
      console.error("Gateway error:", e);
    }
  }

  const finalAnswer = llmEnhancement || answer;

  return Response.json({
    answer: finalAnswer,
    graph: { subgraph, entities, citations },
    agent: { plan, trace, escalated: shouldEscalate },
    meta: {
      via: gatewayKey ? (process.env.AI_GATEWAY_API_KEY ? "vercel-ai-gateway" : "openai-direct") : "graph-deterministic",
      model: process.env.AI_GATEWAY_MODEL || "graph-traversal",
    },
  });
}

export async function GET() {
  return Response.json({ graph: getGraph(), hint: "POST { messages: [{role:'user', content:'...'}] } to /api/chat" });
}
