/**
 * Agentic Graph Design — 3 commitments (arXiv Apr 2026)
 * Immutable plan → Separated layers → Strict escalation
 */
export type AgentState = "Planning" | "Executing" | "Recovering" | "Escalated" | "Complete";

export type AgentTrace = {
  state: AgentState;
  action: string;
  reasoning: string;
  timestamp: string;
};

export function buildPlan(question: string): { plan: string; steps: string[] } {
  // Immutable plan — locked after generation, no mid-run improvisation
  const steps = [
    "1. Parse question → identify target entity/relation",
    "2. Traverse KG subgraph → follow typed edges with provenance",
    "3. Synthesize answer → cite specific edge, not vague 'documents'",
    "4. Gate confidence → escalate if subgraph coverage < threshold",
  ];
  return {
    plan: `IMMUTABLE PLAN for: "${question}"\n${steps.join("\n")}\n(Plan is locked — execution cannot improvise. Separated layers: Planning ≠ Execution ≠ Recovery.)`,
    steps,
  };
}

export function checkEscalation(subgraphSize: number): { shouldEscalate: boolean; trace: AgentTrace } {
  // Strict escalation — fixed protocol with real limit
  const shouldEscalate = subgraphSize === 0;
  return {
    shouldEscalate,
    trace: shouldEscalate
      ? { state: "Escalated", action: "No subgraph found", reasoning: "Fixed protocol: 0 edges → escalate to human, not infinite retry", timestamp: new Date().toISOString() }
      : { state: "Executing", action: `Traversed ${subgraphSize} edges`, reasoning: "Subgraph has coverage — proceed to synthesis, don't loop", timestamp: new Date().toISOString() },
  };
}
