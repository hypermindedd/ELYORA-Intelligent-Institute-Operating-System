import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { createLearningScopeHandler } from "../src/http/learning-scope.mjs";

const contract = JSON.parse(readFileSync(new URL("../contracts/openapi/learning-scope.v1.json", import.meta.url)));
const origin = "https://institute.test";
const path = "/api/v1/learning-scopes/scope-a";
const contractPath = "/api/v1/learning-scopes/{directiveId}";
const at = "2026-11-08T08:30:00Z";
const assignment = { tenantId: "tenant-a", teacherId: "teacher-a", studentId: "student-a", status: "active" };
const directive = {
  ...assignment, directiveId: "scope-a", version: 2, status: "proposed",
  programId: "english-a1", programVersion: "2026-a1", targetLanguageCode: "en",
  localeVariant: "en-US", instructionLocale: "fa-IR",
  allowedTopics: ["greetings", "shopping"], excludedTopics: ["shopping"],
  allowedActivityTypes: ["conversation"], maxSessionMinutes: 15,
  startsAt: "2026-11-08T08:00:00Z", expiresAt: "2026-11-08T09:00:00Z",
  privateNotes: "do not expose"
};

const principal = (actorId, role, tenantId = "tenant-a") => ({ actorId, role, tenantId, serverAuthenticated: true });
const identities = {
  teacher: principal("teacher-a", "teacher"),
  student: principal("student-a", "student"),
  stranger: principal("student-b", "student"),
  outside: principal("teacher-a", "teacher", "tenant-b"),
  manager: principal("manager-a", "institute_manager"),
  colleague: principal("teacher-b", "teacher"),
};

function fixture({ state = directive, now = () => Date.parse(at), beforeCommit } = {}) {
  let current = state;
  let revision = 1;
  let currentAssignment = assignment;
  let assignmentRevision = 1;
  let commits = 0;
  const handler = createLearningScopeHandler({
    now,
    authenticateBearer: async token => Object.hasOwn(identities, token) ? identities[token] : null,
    loadScope: async ({ tenantId, directiveId }) =>
      tenantId === current.tenantId && directiveId === current.directiveId
        ? { directive: current, assignment: currentAssignment, revision: String(revision), assignmentRevision: String(assignmentRevision) }
        : null,
    commitScope: async mutation => {
      beforeCommit?.(() => {
        currentAssignment = { ...currentAssignment, status: "revoked" };
        assignmentRevision += 1;
      });
      if (mutation.expectedRevision !== String(revision) ||
          mutation.expectedAssignmentRevision !== String(assignmentRevision)) return false;
      assert.equal(mutation.actorId, assignment.teacherId);
      assert.equal(mutation.tenantId, assignment.tenantId);
      current = mutation.directive;
      revision += 1;
      commits += 1;
      return true;
    },
  });
  return { handler, commits: () => commits, current: () => current };
}

function request(token, { suffix = "", method = "GET", ifMatch, body, headers = {} } = {}) {
  const fields = new Headers(headers);
  if (token) fields.set("Authorization", "Bearer " + token);
  if (ifMatch !== undefined) fields.set("If-Match", ifMatch);
  return new Request(origin + path + suffix, { method, headers: fields, body });
}

async function verify(response, status, method, suffix = "") {
  assert.equal(response.status, status);
  assert.equal(response.headers.get("Cache-Control"), "no-store");
  const declared = contract.paths[contractPath + suffix][method].responses[status];
  assert.ok(declared, "response must be part of the OpenAPI contract");
  if (status === 204) {
    assert.equal(await response.text(), "");
    return;
  }
  const payload = await response.json();
  if (status >= 400) {
    const schema = contract.components.responses[declared.$ref.split("/").at(-1)].content["application/json"].schema;
    assert.deepEqual(Object.keys(payload), schema.required);
    assert.ok(schema.properties.code.enum.includes(payload.code));
  }
  return payload;
}

test("teacher reads, approves and revokes while the student sees only the effective scope", async () => {
  const { handler, commits, current } = fixture();
  const first = await handler(request("teacher"));
  const firstTag = first.headers.get("ETag");
  assert.equal(firstTag, '"1"');
  assert.deepEqual(await verify(first, 200, "get"), { directiveId: "scope-a", status: "proposed" });
  assert.deepEqual(await verify(await handler(request("student")), 404, "get"), { code: "NOT_FOUND" });

  await verify(await handler(request("teacher", { method: "POST", suffix: "/approval", ifMatch: firstTag })), 204, "post", "/approval");
  assert.equal(current().approvedBy, "teacher-a");
  assert.equal(current().version, 2);
  const read = await handler(request("student"));
  assert.equal(read.headers.get("ETag"), null);
  const data = await verify(read, 200, "get");
  assert.deepEqual(Object.keys(data).sort(), [...contract.components.schemas.StudentScope.required].sort());
  assert.deepEqual(data.allowedTopics, ["greetings"]);
  assert.equal(data.directiveVersion, 2);

  const after = await handler(request("teacher"));
  const secondTag = after.headers.get("ETag");
  assert.equal(secondTag, '"2"');
  assert.equal((await verify(after, 200, "get")).status, "approved");
  await verify(await handler(request("teacher", { method: "POST", suffix: "/revocation", ifMatch: secondTag })), 204, "post", "/revocation");
  assert.equal(current().revokedAt, new Date(at).toISOString());
  await verify(await handler(request("student")), 404, "get");
  assert.equal(commits(), 2);
});

test("role, tenant and student identity cannot be forged via request fields", async () => {
  const { handler, commits } = fixture({ state: { ...directive, status: "approved", approvedBy: "teacher-a" } });
  for (const token of ["outside", "stranger", "manager", "colleague"]) {
    await verify(await handler(request(token, { headers: { "X-Tenant": "tenant-a", "X-Role": "teacher" } })), 404, "get");
    await verify(await handler(request(token, { method: "POST", suffix: "/revocation", ifMatch: '"1"' })), 404, "post", "/revocation");
  }
  const unauthenticated = await handler(request(null, { headers: { Cookie: "session=teacher", "X-Role": "teacher" } }));
  assert.equal(unauthenticated.headers.get("WWW-Authenticate"), "Bearer");
  await verify(unauthenticated, 401, "get");
  await verify(await handler(request("student", { method: "POST", suffix: "/revocation", ifMatch: '"1"' })), 404, "post", "/revocation");
  assert.equal(commits(), 0);
});

test("missing, malformed, weak and stale preconditions fail without a write", async () => {
  const { handler, commits } = fixture();
  for (const [ifMatch, status] of [[undefined, 428], ["*", 400], ['W/"1"', 400], ['"1", "2"', 400], ['"2"', 412]]) {
    await verify(await handler(request("teacher", { method: "POST", suffix: "/approval", ifMatch })), status, "post", "/approval");
  }
  await verify(await handler(request("teacher", { method: "POST", suffix: "/approval", ifMatch: '"1"', body: "{}" })), 400, "post", "/approval");
  assert.equal(commits(), 0);
});

test("competing approvals commit once and an assignment race loses the precondition", async () => {
  const options = { method: "POST", suffix: "/approval", ifMatch: '"1"' };
  const concurrent = fixture();
  const responses = await Promise.all([
    concurrent.handler(request("teacher", options)),
    concurrent.handler(request("teacher", options)),
  ]);
  assert.deepEqual(responses.map(r => r.status).sort(), [204, 412]);
  assert.equal(concurrent.commits(), 1);

  const changed = fixture({ beforeCommit: revoke => revoke() });
  await verify(await changed.handler(request("teacher", options)), 412, "post", "/approval");
  assert.equal(changed.commits(), 0);
});

test("expired scopes cannot be approved or viewed, and teachers can still revoke them", async () => {
  const now = () => Date.parse(directive.expiresAt);
  const expired = fixture({ now });
  await verify(await expired.handler(request("teacher", { method: "POST", suffix: "/approval", ifMatch: '"1"' })), 409, "post", "/approval");
  const approved = fixture({ now, state: { ...directive, status: "approved", approvedBy: "teacher-a" } });
  await verify(await approved.handler(request("student")), 404, "get");
  await verify(await approved.handler(request("teacher", { method: "POST", suffix: "/revocation", ifMatch: '"1"' })), 204, "post", "/revocation");
});

test("adapter errors fail closed without leaking private storage details", async () => {
  const handler = createLearningScopeHandler({
    authenticateBearer: async () => identities.teacher,
    loadScope: async () => { throw Error("private storage credentials"); },
  });
  assert.deepEqual(await verify(await handler(request("teacher")), 503, "get"), { code: "SCOPE_UNAVAILABLE" });
});

test("incorrect method, query fields and invalid bearer tokens fail before any mutation", async () => {
  const { handler, commits } = fixture();
  const wrongMethod = await handler(request("teacher", { method: "PUT" }));
  assert.equal(wrongMethod.headers.get("Allow"), "GET");
  await verify(wrongMethod, 405, "get");
  await verify(await handler(request("teacher", { suffix: "?tenantId=tenant-b" })), 400, "get");
  await verify(await handler(request("unknown")), 401, "get");
  assert.equal(commits(), 0);
});
