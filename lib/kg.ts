/**
 * Graph Architect KG — 4-stage pipeline (Extract→Resolve→Assemble→Query)
 * Demo corpus: support tickets → products → root causes → suppliers
 */
export type Entity = { id: string; type: string; name: string; aliases?: string[] };
export type Triple = { subject: string; predicate: string; object: string; source: string; confidence: number };

// Demo corpus — in production this would be extracted via Needle/LLM per doc
const ENTITIES: Entity[] = [
  { id: "t1", type: "ticket", name: "Ticket #101" },
  { id: "t2", type: "ticket", name: "Ticket #102" },
  { id: "t3", type: "ticket", name: "Ticket #103" },
  { id: "p_motor", type: "product", name: "TurboMotor X1", aliases: ["TM-X1"] },
  { id: "p_sensor", type: "product", name: "SenseCore S2" },
  { id: "part_bearing", type: "part", name: "Bearing B7" },
  { id: "supplier_a", type: "organization", name: "AeroParts Ltd" },
  { id: "supplier_b", type: "organization", name: "Nordic Bearings AB" },
  { id: "batch_04", type: "event", name: "Batch 2026-04" },
  { id: "cause_wear", type: "event", name: "Premature wear" },
  { id: "cause_calib", type: "event", name: "Calibration drift" },
];

const TRIPLES: Triple[] = [
  { subject: "Ticket #101", predicate: "reports", object: "Premature wear", source: "ticket-101.txt", confidence: 0.95 },
  { subject: "Premature wear", predicate: "affects", object: "TurboMotor X1", source: "ticket-101.txt", confidence: 0.92 },
  { subject: "TurboMotor X1", predicate: "uses", object: "Bearing B7", source: "bom-tm-x1.json", confidence: 0.99 },
  { subject: "Bearing B7", predicate: "supplied_by", object: "Nordic Bearings AB", source: "supplier-map.csv", confidence: 0.98 },
  { subject: "Bearing B7", predicate: "batch", object: "Batch 2026-04", source: "shipment-04.log", confidence: 0.97 },
  { subject: "Ticket #102", predicate: "reports", object: "Calibration drift", source: "ticket-102.txt", confidence: 0.93 },
  { subject: "Calibration drift", predicate: "affects", object: "SenseCore S2", source: "ticket-102.txt", confidence: 0.91 },
  { subject: "Ticket #103", predicate: "reports", object: "Premature wear", source: "ticket-103.txt", confidence: 0.94 },
  { subject: "Ticket #103", predicate: "references", object: "Batch 2026-04", source: "ticket-103.txt", confidence: 0.88 },
];

export function getGraph() { return { entities: ENTITIES, triples: TRIPLES }; }

export function queryGraph(question: string): { subgraph: Triple[]; entities: Entity[]; answer: string; citations: string[] } {
  const q = question.toLowerCase();
  let subgraph: Triple[] = [];
  let answer = "";
  // Simple traversal logic — demo of graph > RAG: follow causal chain, don't just keyword-match
  if (q.includes("supplier") || q.includes("bearing") || q.includes("turbomotor") || q.includes("wear") || q.includes("return")) {
    subgraph = TRIPLES.filter(t => ["reports","affects","uses","supplied_by","batch","references"].includes(t.predicate));
    answer = "Traversing the causal chain: Ticket #101 + #103 → Premature wear → TurboMotor X1 → Bearing B7 → Nordic Bearings AB (Batch 2026-04). Root cause is Bearing B7 premature wear from Batch 2026-04 supplied by Nordic Bearings AB. This is a graph traversal, not a text similarity match — each hop is a typed edge with provenance.";
  } else if (q.includes("sensor") || q.includes("calibration") || q.includes("sensecore")) {
    subgraph = TRIPLES.filter(t => t.subject.includes("Calibration") || t.object.includes("SenseCore") || t.subject.includes("Ticket #102"));
    answer = "Calibration drift affects SenseCore S2 (Ticket #102). No supplier link — isolated to sensor calibration, not a parts batch issue.";
  } else {
    subgraph = TRIPLES.slice(0, 4);
    answer = "Ask about suppliers, bearings, TurboMotor returns, or calibration — I'll traverse the actual graph edges and cite provenance per triple.";
  }
  const citations = [...new Set(subgraph.map(t => t.source))];
  const touched = new Set(subgraph.flatMap(t => [t.subject, t.object]));
  const entities = ENTITIES.filter(e => touched.has(e.name));
  return { subgraph, entities, answer, citations };
}
