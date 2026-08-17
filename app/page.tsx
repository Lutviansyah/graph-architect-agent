"use client";
import { useState } from "react";

type Resp = {
  answer: string;
  graph: { subgraph: { subject: string; predicate: string; object: string; source: string }[]; citations: string[] };
  agent: { plan: string; trace: { state: string; reasoning: string }; escalated: boolean };
  meta: { via: string };
};

export default function Home() {
  const [q, setQ] = useState("Which supplier caused TurboMotor X1 returns?");
  const [resp, setResp] = useState<Resp | null>(null);
  const [loading, setLoading] = useState(false);

  async function ask() {
    setLoading(true);
    const r = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question: q }) });
    setResp(await r.json());
    setLoading(false);
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Graph Architect Agent</h1>
      <p className="text-zinc-400 mt-2">Knowledge Graph traversal, not RAG. Agentic graph: immutable plan → execution → strict escalation. Via Vercel AI Gateway.</p>

      <div className="mt-6 flex gap-2">
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Ask about suppliers, bearings, returns..." className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-sm outline-none focus:border-zinc-700" />
        <button onClick={ask} disabled={loading} className="bg-white text-black rounded-lg px-6 py-3 text-sm font-medium disabled:opacity-50">{loading ? "..." : "Ask"}</button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        {["Which supplier caused TurboMotor X1 returns?", "What about SenseCore S2 calibration?", "Show provenance for Bearing B7"].map(s => (
          <button key={s} onClick={() => setQ(s)} className="bg-zinc-900 border border-zinc-800 rounded-full px-3 py-1.5 hover:border-zinc-700">{s}</button>
        ))}
      </div>

      {resp && (
        <div className="mt-8 space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <div className="text-xs text-zinc-500 uppercase tracking-wide">Answer • via {resp.meta.via}</div>
            <p className="mt-2 leading-relaxed whitespace-pre-wrap">{resp.answer}</p>
            <div className="mt-3 text-xs text-zinc-500">Citations: {resp.graph.citations.join(", ")}</div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <div className="text-xs text-zinc-500 uppercase tracking-wide">Agentic Graph Trace</div>
              <pre className="mt-2 text-xs whitespace-pre-wrap text-zinc-300">{resp.agent.plan}</pre>
              <div className="mt-3 text-xs"><span className={`px-2 py-1 rounded ${resp.agent.escalated ? "bg-red-900 text-red-200" : "bg-emerald-900 text-emerald-200"}`}>{resp.agent.trace.state}</span> <span className="text-zinc-500 ml-2">{resp.agent.trace.reasoning}</span></div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <div className="text-xs text-zinc-500 uppercase tracking-wide">Subgraph (typed edges + provenance)</div>
              <ul className="mt-2 space-y-1.5 text-xs font-mono">
                {resp.graph.subgraph.map((t, i) => (
                  <li key={i} className="text-zinc-300">{t.subject} <span className="text-zinc-500">—{t.predicate}→</span> {t.object} <span className="text-zinc-600">[{t.source}]</span></li>
                ))}
              </ul>
            </div>
          </div>

          <div className="text-xs text-zinc-600">Graph ≠ RAG: This answer traversed a causal chain with provenance per edge, not "similar chunks".</div>
        </div>
      )}

      <footer className="mt-12 text-xs text-zinc-600 border-t border-zinc-900 pt-4">Built for Vercel Global AI Gateway Hackathon • Graph Architect (CyrilXBT) • Needle-ready for on-device extraction</footer>
    </main>
  );
}
