import { readFileSync } from "node:fs";
import { authorizeTenantManager } from "./policy.mjs";

const rubric = JSON.parse(readFileSync(new URL("../../packages/teacher-qualification/rehearsal.v1.json", import.meta.url), "utf8"));
const hasText = value => typeof value === "string" && value.trim().length > 0;

// Trusted in-process rehearsal only. The caller supplies fresh server-side identity
// and case assignments. No persistence, media, provider calls or credential writes.
export function createTeacherRehearsal({ tenantId, teacherId, reviewerId, managerId, variety, consent }) {
  if (consent !== true || ![tenantId, teacherId, reviewerId, managerId].every(hasText) ||
      reviewerId === teacherId || managerId === teacherId) throw Error("INVALID_CASE");
  if (!hasText(variety) || !Object.hasOwn(rubric.packs, variety)) throw Error("PACK_UNAVAILABLE");
  let taskIndex = 0;
  let stage = "opening";
  let withdrawn = false;
  let released = false;
  const observations = [];
  const task = () => rubric.tasks[taskIndex];

  function requireReviewer(actor) {
    if (!actor || actor.serverAuthenticated !== true || actor.role !== "qualification_reviewer" ||
        actor.actorId !== reviewerId || actor.tenantId !== tenantId) throw Error("REVIEWER_DENIED");
    if (withdrawn) throw Error("WITHDRAWN");
  }
  function requireStage(expected) {
    if (stage !== expected) throw Error("INVALID_STAGE");
  }
  return {
    withdraw(actor) {
      if (!actor || actor.serverAuthenticated !== true || actor.tenantId !== tenantId ||
          actor.actorId !== teacherId || actor.role !== "teacher") throw Error("TEACHER_DENIED");
      withdrawn = true;
      observations.length = 0;
    },
    turn(actor) {
      requireReviewer(actor);
      if (stage === "complete") return { stage };
      const { id, dimensions } = task();
      if (stage === "observe") return { stage, taskId: id, indicators: Object.fromEntries(dimensions.map(key => [key, rubric.indicators[key]])) };
      const line = { opening: 0, clarify: 1, transfer: 2 }[stage];
      return { stage, taskId: id, learnerLine: rubric.packs[variety][id][line] };
    },
    respond(actor, turn, outcome) {
      requireReviewer(actor);
      if (turn?.taskId !== task()?.id || turn?.stage !== stage) throw Error("STALE_TURN");
      if (!["opening", "clarify", "transfer"].includes(stage) ||
          !["understood", "still_unclear"].includes(outcome)) throw Error("INVALID_TURN");
      if (stage === "transfer") stage = "observe";
      else if (stage === "opening" && outcome === "still_unclear") stage = "clarify";
      else stage = "transfer";
    },
    observe(actor, turn, ratings) {
      requireReviewer(actor);
      requireStage("observe");
      const { id, dimensions } = task();
      if (turn?.taskId !== id || turn?.stage !== stage) throw Error("STALE_TURN");
      if (!Array.isArray(ratings)) throw Error("INVALID_OBSERVATION");
      const seen = new Set();
      const rows = ratings.map(row => {
        if (!row || !dimensions.includes(row.dimension) || seen.has(row.dimension) ||
            !hasText(row.anchor) || !Object.hasOwn(rubric.anchors, row.anchor) || !hasText(row.observedBehavior)) throw Error("INVALID_OBSERVATION");
        seen.add(row.dimension);
        return { taskId: id, dimension: row.dimension, anchor: row.anchor, observedBehavior: row.observedBehavior.trim() };
      });
      observations.push(...rows);
      taskIndex++;
      stage = taskIndex === rubric.tasks.length ? "complete" : "opening";
    },
    release(actor) {
      requireReviewer(actor);
      requireStage("complete");
      released = true;
    },
    managementReport(actor) {
      if (!authorizeTenantManager({ actor, tenantId }).allowed || actor.actorId !== managerId) throw Error("MANAGEMENT_DENIED");
      if (withdrawn || !released) throw Error("REPORT_UNAVAILABLE");
      const dimensions = Object.keys(rubric.indicators).map(dimension => {
        const evidence = observations.filter(row => row.dimension === dimension).map(({taskId, anchor}) => ({taskId, anchor}));
        const status = evidence.length ? "HUMAN_OBSERVED" : rubric.audioOnly.includes(dimension) ? "AUDIO_REQUIRED" : "NOT_OBSERVED";
        return { dimension, status, evidence };
      });
      return { mode: "OFFLINE_REHEARSAL", rubricVersion: rubric.version, teacherId, variety, reviewedBy: reviewerId,
        dimensions, professionalLevel: "NOT_ISSUED" };
    }
  };
}

export const rehearsalAnchors = Object.freeze({ ...rubric.anchors });
