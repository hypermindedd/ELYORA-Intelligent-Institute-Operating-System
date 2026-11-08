import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { after, before, test } from "node:test";
import pg from "pg";
import { createPostgresLearningScopeHandler } from "../src/adapters/postgres-learning-scope.mjs";

const adminUrl = new URL(process.env.EI_SCOPE_TEST_DATABASE);
const appUrl = new URL(process.env.EI_SCOPE_TEST_APP_DATABASE);
for (const url of [adminUrl, appUrl]) {
  assert.equal(url.hostname, "127.0.0.1");
  assert.equal(url.pathname, "/ei_scope_test");
}
assert.equal(appUrl.username, "ei_scope_test");

const admin = new pg.Pool({ connectionString: adminUrl.toString() });
const pool = new pg.Pool({ connectionString: appUrl.toString() });
const now = Date.parse("2026-11-08T08:30:00Z");
const endpoint = "https://institute.test/api/v1/learning-scopes/";

const principalByToken = new Map([
  ["teacher-a", { tenantId: "tenant-a", subject: "teacher", role: "institute_manager" }],
  ["student-a", { tenantId: "tenant-a", subject: "student", role: "teacher" }],
  ["teacher-b", { tenantId: "tenant-b", subject: "teacher" }],
  ["manager-a", { tenantId: "tenant-a", subject: "manager", role: "teacher" }],
]);
const handler = createPostgresLearningScopeHandler({
  pool,
  now: () => now,
  verifyBearer: async token => principalByToken.get(token),
});

function call(id, token, action, revision) {
  const headers = { Authorization: "Bearer " + token };
  if (revision) headers["If-Match"] = revision;
  return handler(new Request(endpoint + id + (action ? "/" + action : ""), {
    method: action ? "POST" : "GET", headers
  }));
}

async function seed(tenantId, directiveId) {
  const doc = {
    tenantId, directiveId, teacherId: "teacher", studentId: "student", version: 2, status: "proposed",
    programId: "english-a1", programVersion: "2026-a1", targetLanguageCode: "en",
    localeVariant: "en-US", instructionLocale: "fa-IR", allowedTopics: ["greetings"], excludedTopics: [],
    allowedActivityTypes: ["conversation"], maxSessionMinutes: 15,
    startsAt: "2026-11-08T08:00:00Z", expiresAt: "2026-11-08T09:00:00Z", privateNotes: "confidential",
  };
  await admin.query(
    "INSERT INTO ei_scope.directive VALUES ($1, $2, 'teacher', 'student', 'r0', $3)",
    [tenantId, directiveId, doc]
  );
}

before(async () => {
  await admin.query(readFileSync(new URL("../db/migrations/001_learning_scope.sql", import.meta.url), "utf8"));
  await admin.query(`
    CREATE ROLE ei_scope_test LOGIN PASSWORD 'ei_scope_test' NOSUPERUSER NOBYPASSRLS;
    GRANT USAGE ON SCHEMA ei_scope TO ei_scope_test;
    GRANT SELECT ON ALL TABLES IN SCHEMA ei_scope TO ei_scope_test;
    GRANT UPDATE (actor_id) ON ei_scope.membership TO ei_scope_test;
    GRANT UPDATE (revision) ON ei_scope.assignment TO ei_scope_test;
    GRANT UPDATE (document, revision) ON ei_scope.directive TO ei_scope_test;
    GRANT INSERT ON ei_scope.outbox TO ei_scope_test;

    INSERT INTO ei_scope.membership VALUES
      ('tenant-a', 'teacher', 'teacher', true), ('tenant-a', 'student', 'student', true),
      ('tenant-a', 'manager', 'institute_manager', true),
      ('tenant-b', 'teacher', 'teacher', true), ('tenant-b', 'student', 'student', true);
    INSERT INTO ei_scope.assignment VALUES
      ('tenant-a', 'teacher', 'student', 'a0', 'active'),
      ('tenant-b', 'teacher', 'student', 'b0', 'active');

    CREATE FUNCTION ei_scope.reject_fixture_event() RETURNS trigger LANGUAGE plpgsql AS $$
    BEGIN
      IF NEW.envelope->'payload'->>'directiveId' = 'scope-fail' THEN
        RAISE EXCEPTION 'injected outbox failure';
      END IF;
      RETURN NEW;
    END;
    $$;
    CREATE TRIGGER reject_fixture_event BEFORE INSERT ON ei_scope.outbox
    FOR EACH ROW EXECUTE FUNCTION ei_scope.reject_fixture_event();
  `);
  await seed("tenant-a", "scope-shared");
  await seed("tenant-b", "scope-shared");
  await seed("tenant-a", "scope-only-a");
  await seed("tenant-a", "scope-fail");
  await seed("tenant-b", "scope-revoked");
});

after(async () => { await Promise.all([admin.end(), pool.end()]); });

test("tenant keys, row policies, and role-specific API views isolate the same directive ID", async () => {
  assert.equal((await pool.query("SELECT * FROM ei_scope.directive")).rowCount, 0);
  assert.equal((await call("scope-only-a", "teacher-b")).status, 404);
  assert.equal((await call("scope-shared", "manager-a")).status, 404);
  assert.equal((await call("scope-shared", "student-a", "approval", '"r0"')).status, 404);

  const teacher = await call("scope-shared", "teacher-a");
  assert.equal(teacher.status, 200);
  assert.equal(teacher.headers.get("ETag"), '"r0"');
  assert.equal((await call("scope-shared", "teacher-a", "approval", '"r0"')).status, 204);
  const student = await call("scope-shared", "student-a");
  assert.equal(student.status, 200);
  const view = await student.json();
  assert.deepEqual(view.allowedTopics, ["greetings"]);
  assert.equal(Object.hasOwn(view, "privateNotes"), false);
  assert.equal((await (await call("scope-shared", "teacher-b")).json()).status, "proposed");

  const reader = await pool.connect();
  try {
    await reader.query("BEGIN");
    await reader.query("SELECT set_config('ei_os.tenant_id', 'tenant-a', true)");
    assert.equal((await reader.query("SELECT * FROM ei_scope.directive WHERE tenant_id = 'tenant-b'")).rowCount, 0);
    assert.equal((await reader.query("SELECT * FROM ei_scope.outbox")).rowCount, 1);
    await reader.query("ROLLBACK");
    assert.equal((await reader.query("SELECT * FROM ei_scope.directive")).rowCount, 0);
  } finally {
    reader.release();
  }
  const approved = await call("scope-shared", "teacher-a");
  assert.equal((await call("scope-shared", "teacher-a", "revocation", approved.headers.get("ETag"))).status, 204);
  assert.equal((await call("scope-shared", "student-a")).status, 404);
});

test("competing requests produce one committed transition and one outbox fact", async () => {
  const results = await Promise.all([
    call("scope-only-a", "teacher-a", "approval", '"r0"'),
    call("scope-only-a", "teacher-a", "approval", '"r0"'),
  ]);
  assert.deepEqual(results.map(result => result.status).sort(), [204, 412]);
  const { rows } = await admin.query(`
    SELECT envelope FROM ei_scope.outbox
    WHERE tenant_id = 'tenant-a' AND envelope->'payload'->>'directiveId' = 'scope-only-a'`);
  assert.equal(rows.length, 1);
  assert.deepEqual(Object.keys(rows[0].envelope.payload).sort(), ["directiveId", "directiveVersion", "revision"]);
});

test("a database outbox error rolls back the prior update", async () => {
  assert.equal((await call("scope-fail", "teacher-a", "approval", '"r0"')).status, 503);
  const current = await call("scope-fail", "teacher-a");
  assert.equal(current.headers.get("ETag"), '"r0"');
  assert.equal((await current.json()).status, "proposed");
  const result = await admin.query("SELECT 1 FROM ei_scope.outbox WHERE envelope->'payload'->>'directiveId' = 'scope-fail'");
  assert.equal(result.rowCount, 0);
});

test("revoking a teacher assignment or membership prevents later writes", async () => {
  await admin.query("UPDATE ei_scope.assignment SET status = 'revoked', revision = 'b1' WHERE tenant_id = 'tenant-b'");
  assert.equal((await call("scope-revoked", "teacher-b", "approval", '"r0"')).status, 404);
  await admin.query("UPDATE ei_scope.membership SET active = false WHERE tenant_id = 'tenant-b' AND actor_id = 'teacher'");
  assert.equal((await call("scope-revoked", "teacher-b")).status, 401);
});
