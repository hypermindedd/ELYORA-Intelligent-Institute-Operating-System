import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { createLearningScopeHandler } from "../src/http/learning-scope.mjs";
import { createLearningScopeCommitter } from "../src/adapters/learning-scope-committer.mjs";

const eventContract = JSON.parse(readFileSync(new URL("../contracts/events/learning-scope-transition.v1.schema.json", import.meta.url)));
const fact = eventContract.allOf[1].properties;
const now = Date.parse("2026-11-08T08:30:00Z");
const ids = { tenantId: "tenant-a", teacherId: "teacher-a", studentId: "student-a" };
const teacher = { tenantId: ids.tenantId, actorId: ids.teacherId, serverAuthenticated: true, role: "teacher" };
const directive = {
  ...ids, directiveId: "scope-a", version: 2, status: "proposed",
  programId: "english-a1", programVersion: "2026-a1", targetLanguageCode: "en",
  localeVariant: "en-US", instructionLocale: "fa-IR", allowedTopics: ["greetings"], excludedTopics: [],
  allowedActivityTypes: ["conversation"], maxSessionMinutes: 15,
  startsAt: "2026-11-08T08:00:00Z", expiresAt: "2026-11-08T09:00:00Z",
  privateNotes: "restricted"
};
const intent = {
  actorId: teacher.actorId, tenantId: ids.tenantId, expectedRevision: "before",
  expectedAssignmentRevision: "assignment-before", directive: { ...directive, status: "approved" }
};

function fixture({ actor = teacher, time = now, failOutbox = false, assignmentStatus = "active" } = {}) {
  let durable = {
    scope: { directive, revision: "before", assignmentRevision: "assignment-before", assignment: { ...ids, status: assignmentStatus } },
    events: []
  };
  const transact = async callback => {
    const pending = structuredClone(durable);
    const result = await callback({
      loadActor: async () => actor,
      loadScope: async () => pending.scope,
      putScope: async next => { pending.scope = { ...pending.scope, ...next }; },
      enqueue: async event => {
        if (failOutbox) throw Error("simulated outbox insert failure");
        pending.events.push(event);
      }
    });
    durable = pending;
    return result;
  };
  const commit = createLearningScopeCommitter({ transact, now: () => time });
  const handler = createLearningScopeHandler({
    authenticateBearer: async token => token === "teacher" ? teacher : null,
    loadScope: async () => durable.scope,
    commitScope: commit,
    now: () => time,
  });
  return { commit, handler, state: () => durable };
}

test("approval and revocation persist the current policy and emit only restricted transition facts", async () => {
  const { commit, state } = fixture();
  assert.equal(await commit({ ...intent, directive: { ...intent.directive, allowedTopics: ["tampered"] } }), true);
  const approved = state().scope;
  assert.deepEqual(approved.directive.allowedTopics, ["greetings"]);
  assert.equal(approved.directive.approvedBy, teacher.actorId);
  assert.notEqual(approved.revision, intent.expectedRevision);

  assert.equal(await commit(intent), false);
  assert.equal(await commit({ ...intent, expectedRevision: approved.revision,
    directive: { directiveId: directive.directiveId, status: "revoked" } }), true);
  assert.equal(state().scope.directive.status, "revoked");
  assert.equal(state().events.length, 2);
  assert.deepEqual(state().events.map(e => e.eventType), fact.eventType.enum);
  for (const event of state().events) {
    assert.equal(event.classification, fact.classification.const);
    assert.equal(event.subjectId, ids.studentId);
    assert.deepEqual(Object.keys(event.payload).sort(), [...fact.payload.required].sort());
    assert.equal(event.payload.directiveVersion, 2);
    assert.match(event.payload.revision, new RegExp(fact.payload.properties.revision.pattern));
  }
  assert.notEqual(state().events[0].eventId, state().events[1].eventId);
  assert.equal(state().events[1].payload.revision, state().scope.revision);
});

test("a failed outbox append leaves the prior directive and event list intact", async () => {
  const { commit, state } = fixture({ failOutbox: true });
  await assert.rejects(commit(intent), /simulated outbox/);
  assert.equal(state().scope.revision, "before");
  assert.equal(state().scope.directive.status, "proposed");
  assert.deepEqual(state().events, []);
});

test("the transaction rechecks current role, assignment, revisions and expiry", async () => {
  for (const [config, mutation] of [
    [{ actor: null }, intent],
    [{ actor: { ...teacher, role: "institute_manager" } }, intent],
    [{ actor: { ...teacher, tenantId: "tenant-b" } }, intent],
    [{ assignmentStatus: "revoked" }, intent],
    [{}, { ...intent, expectedAssignmentRevision: "outdated" }],
    [{ time: Date.parse(directive.expiresAt) }, intent]
  ]) {
    const { commit, state } = fixture(config);
    assert.equal(await commit(mutation), false);
    assert.equal(state().scope.revision, "before");
    assert.deepEqual(state().events, []);
  }
});

test("HTTP acknowledges the transition only after both writes commit", async () => {
  const url = "https://institute.test/api/v1/learning-scopes/scope-a/approval";
  const request = () => new Request(url, {
    method: "POST", headers: { Authorization: "Bearer teacher", "If-Match": '"before"' }
  });
  const success = fixture();
  assert.equal((await success.handler(request())).status, 204);
  assert.equal(success.state().events.length, 1);
  assert.equal((await success.handler(request())).status, 412);
  assert.equal(success.state().events.length, 1);

  const failure = fixture({ failOutbox: true });
  const response = await failure.handler(request());
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { code: "SCOPE_UNAVAILABLE" });
  assert.equal(failure.state().scope.directive.status, "proposed");
  assert.equal(failure.state().events.length, 0);
});
