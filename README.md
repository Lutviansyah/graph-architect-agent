# Graph Architect Agent — Vercel AI Gateway Hackathon

> Knowledge Graph traversal, not RAG. Agentic graph: immutable plan → execution → strict escalation.

Built for [Vercel Global AI Gateway Hackathon](https://vercel.com/i/ai-gateway-hackathon) — prize: $2,500 / $1,000 / $500 AI credits.

**Idea:** Most agents hide "what happens next" inside an opaque LLM loop. This agent uses **two graph skills from the Graph Architect course (CyrilXBT, 10-week):**

1. **Knowledge Graph (4-stage: Extract→Resolve→Assemble→Query)** — traverses typed edges with provenance per triple, not similar chunks. Demo: `Ticket → Premature wear → TurboMotor X1 → Bearing B7 → Nordic Bearings AB (Batch 2026-04)` — cites `source` per edge.
2. **Agentic Graph (3 commitments, arXiv Apr 2026)** — immutable plan (locked), separated layers (planning ≠ execution ≠ recovery), strict escalation (fixed limit, not infinite retry). Shown live in UI trace.

Through **Vercel AI Gateway** (OpenAI-compatible). Falls back to deterministic graph answer when no key.

## Run locally

```bash
npm install
# optional — for LLM enhancement via gateway
echo "AI_GATEWAY_API_KEY=..." > .env.local
echo "AI_GATEWAY_MODEL=gpt-4o-mini" >> .env.local
# or fallback: OPENAI_API_KEY=...
npm run dev
# http://localhost:3000
```

Deploy to Vercel:
```bash
vercel deploy
# set AI_GATEWAY_API_KEY in Vercel dashboard → redeploy
```

## API

- `GET /api/chat` — returns demo graph
- `POST /api/chat` — `{ question: string }` or `{ messages: [...] }` → `{ answer, graph: {subgraph, citations}, agent: {plan, trace}, meta: {via} }`

Test:
```bash
curl -s -X POST http://localhost:3000/api/chat -H "Content-Type: application/json" -d '{"question":"Which supplier caused TurboMotor X1 returns?"}' | jq .
```

## Submission

Reply to https://x.com/vercel/status/1959307873143665060 with repo link + short description + video/demo link. Must be open source.

## Credits

- Course: [@cyrilXBT — How to Become a Graph Architect](https://x.com/i/article/2087572131588571136)
- Anthropic KG cookbook, Neo4j/DeepLearning.AI, arXiv Apr 2026 agentic framework
- On-device extraction ready via [cactus-compute/needle](https://github.com/cactus-compute/needle) (14MB)
