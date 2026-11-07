import { readFileSync } from "node:fs";
const registry = JSON.parse(readFileSync(new URL("../engines/registry.v1.json", import.meta.url), "utf8"));
if (registry.status !== "IN_DESIGN" || registry.schemaVersion !== 1 || !Array.isArray(registry.engines) || registry.engines.length !== 20) {
  throw Error("Engine registry count/status/version invalid");
}
const ids = new Set();
for (const [i, engine] of registry.engines.entries()) {
  const expected = "I" + String(i+1).padStart(2,"0");
  if (engine.id !== expected || ids.has(engine.id)) throw Error("Duplicate/misordered engine "+engine.id);
  ids.add(engine.id);
  for (const key of ["name","owner","sourceOfTruth","inboundContract","outboundContract","dataClassification","implementationStatus","commandPolicy","releaseEvidence"]) {
    if (!engine[key]) throw Error(engine.id+" missing "+key);
  }
  if (engine.commandPolicy !== "SERVER_AUTHORIZATION_REQUIRED") throw Error("Server auth gate lost for "+engine.id);
  if (!Array.isArray(engine.allowedStateWrites) || !Array.isArray(engine.dependsOn) || !Array.isArray(engine.parentEngineReuse)) throw Error("Bad arrays "+engine.id);
  if (engine.allowedStateWrites.some((write) => /mastery|progression|learning_state|assessment_state/i.test(write))) {
    throw Error("Protected ELYORA mutation forbidden in "+engine.id);
  }
  if (engine.sourceOfTruth.includes("ELYORA") && engine.allowedStateWrites.length) throw Error("External ELYORA engine cannot be written locally");
  if (engine.parentEngineReuse.some((p) => !/^E(0[1-9]|1[0-5])$/.test(p))) throw Error("Invalid ELYORA parent engine reference");
}
const byId = new Map(registry.engines.map((engine) => [engine.id,engine]));
const visited = new Set(), visiting = new Set();
function visit(id) {
  if (!byId.has(id)) throw Error("Unknown engine "+id);
  if (visiting.has(id)) throw Error("Dependency cycle "+id);
  if (visited.has(id)) return;
  visiting.add(id);
  for (const dep of byId.get(id).dependsOn) visit(dep);
  visiting.delete(id); visited.add(id);
}
for (const engine of registry.engines) visit(engine.id);
console.log("ENGINE_REGISTRY_DESIGN_LINT_PASS", registry.engines.length, "engines with acyclic dependencies, guarded ELYORA ownership");
