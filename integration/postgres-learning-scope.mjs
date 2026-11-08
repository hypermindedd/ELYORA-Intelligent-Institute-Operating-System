import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { after, before, test } from "node:test";
import pg from "pg";
import { createPostgresScopeInvalidationPublisher } from "../src/adapters/postgres-scope-invalidation.mjs";
import { createPostgresScopeOutboxWorker } from "../src/adapters/postgres-scope-outbox.mjs";
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
const workerUrl = new URL(appUrl);
workerUrl.username = "ei_outbox_test";
workerUrl.password = "ei_outbox_test";
const workerPool = new pg.Pool({ connectionString: workerUrl.toString() });
const sinkUrl = new URL(appUrl);
sinkUrl.username = "ei_invalidation_test";
sinkUrl.password = "ei_invalidation_test";
const sinkPool = new pg.Pool({ connectionString: sinkUrl.toString() });
const now = Date.parse("2026-11-08T08:30:00Z");
const endpoint = "https://institute.test/api/v1/learning-scopes/";

const principalByToken = new Map([
  ["teacher-a", { tenantId: "tenant-a", subject: "teacher", role: "institute_manager" }],
  ["student-a", { tenantId: "tenant-a", subject: "student", role: "teacher" }],
  ["teacher-b", { tenantId: "tenant-b", subject: "teacher" }],
  ["teacher-work", { tenantId: "tenant-work", subject: "teacher" }],
  ["teacher-other", { tenantId: "tenant-other", subject: "teacher" }],
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
  for (const migration of ["001_learning_scope.sql", "002_learning_scope_outbox_delivery.sql"]) {
    await admin.query(readFileSync(new URL("../db/migrations/" + migration, import.meta.url), "utf8"));
  }
  await admin.query(`
    CREATE ROLE ei_scope_test LOGIN PASSWORD 'ei_scope_test' NOSUPERUSER NOBYPASSRLS;
    GRANT USAGE ON SCHEMA ei_scope TO ei_scope_test;
    GRANT SELECT ON ALL TABLES IN SCHEMA ei_scope TO ei_scope_test;
    GRANT UPDATE (actor_id) ON ei_scope.membership TO ei_scope_test;
    GRANT UPDATE (revision) ON ei_scope.assignment TO ei_scope_test;
    GRANT UPDATE (document, revision) ON ei_scope.directive TO ei_scope_test;
    GRANT INSERT ON ei_scope.outbox TO ei_scope_test;

    CREATE ROLE ei_outbox_test LOGIN PASSWORD 'ei_outbox_test' NOSUPERUSER NOBYPASSRLS;
    GRANT USAGE ON SCHEMA ei_scope TO ei_outbox_test;
    GRANT SELECT ON ei_scope.outbox TO ei_outbox_test;
    GRANT UPDATE (available_at, attempt_count, lease_token, lease_until, delivered_at, dead_lettered_at)
      ON ei_scope.outbox TO ei_outbox_test;

    CREATE ROLE ei_invalidation_test LOGIN PASSWORD 'ei_invalidation_test' NOSUPERUSER NOBYPASSRLS;
    GRANT USAGE ON SCHEMA ei_scope TO ei_invalidation_test;
    GRANT INSERT ON ei_scope.scope_invalidation TO ei_invalidation_test;

    INSERT INTO ei_scope.membership VALUES
      ('tenant-a', 'teacher', 'teacher', true), ('tenant-a', 'student', 'student', true),
      ('tenant-a', 'manager', 'institute_manager', true),
      ('tenant-b', 'teacher', 'teacher', true), ('tenant-b', 'student', 'student', true),
      ('tenant-work', 'teacher', 'teacher', true), ('tenant-work', 'student', 'student', true),
      ('tenant-other', 'teacher', 'teacher', true), ('tenant-other', 'student', 'student', true);
    INSERT INTO ei_scope.assignment VALUES
      ('tenant-a', 'teacher', 'student', 'a0', 'active'),
      ('tenant-b', 'teacher', 'student', 'b0', 'active'),
      ('tenant-work', 'teacher', 'student', 'w0', 'active'),
      ('tenant-other', 'teacher', 'student', 'o0', 'active');

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
  for (const id of ["scope-delivery", "scope-retry", "scope-stale", "scope-dead", "scope-expired-last"]) {
    await seed("tenant-work", id);
  }
  await seed("tenant-other", "scope-delivery");
});

after(async () => { await Promise.all([admin.end(), pool.end(), workerPool.end(), sinkPool.end()]); });

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

async function emit(id, token = "teacher-work") {
  assert.equal((await call(id, token, "approval", '"r0"')).status, 204);
}

test("the private worker leases a fact once under competition and stays within its tenant", async () => {
  await emit("scope-delivery");
  await emit("scope-delivery", "teacher-other");
  await assert.rejects(workerPool.query("SELECT * FROM ei_scope.directive"), { code: "42501" });
  await assert.rejects(pool.query("UPDATE ei_scope.outbox SET attempt_count = 4"), { code: "42501" });

  const entered = Promise.withResolvers();
  const release = Promise.withResolvers();
  const delivered = [];
  const worker = createPostgresScopeOutboxWorker({ pool: workerPool, publish: async item => {
    delivered.push(item);
    entered.resolve();
    await release.promise;
  } });
  const first = worker("tenant-work");
  await Promise.race([entered.promise, first]);
  try {
    assert.deepEqual(await worker("tenant-work"), { status: "IDLE" });
  } finally {
    release.resolve();
  }
  const result = await first;
  assert.equal(result.status, "DELIVERED");
  assert.deepEqual(delivered.map(item => [item.tenantId, item.envelope.tenantId, item.eventId]),
    [["tenant-work", "tenant-work", result.eventId]]);
  assert.equal((await admin.query("SELECT 1 FROM ei_scope.outbox WHERE tenant_id = 'tenant-other' AND delivered_at IS NULL")).rowCount, 1);
});

test("known failures wait before retrying and retain the event ID", async () => {
  await emit("scope-retry");
  const failed = createPostgresScopeOutboxWorker({ pool: workerPool, publish: async () => { throw Error("private failure"); } });
  const result = await failed("tenant-work");
  assert.equal(result.status, "RETRY_SCHEDULED");
  assert.deepEqual(await failed("tenant-work"), { status: "IDLE" });
  await admin.query("UPDATE ei_scope.outbox SET available_at = clock_timestamp() - interval '1 second' WHERE event_id = $1", [result.eventId]);

  const seen = [];
  const recovered = createPostgresScopeOutboxWorker({ pool: workerPool, publish: async item => { seen.push(item.eventId); } });
  assert.deepEqual(await recovered("tenant-work"), { status: "DELIVERED", eventId: result.eventId });
  assert.deepEqual(seen, [result.eventId]);
});

test("a recovered lease fences the stale worker and the consumer deduplicates publication", async () => {
  await emit("scope-stale");
  const entered = Promise.withResolvers();
  const release = Promise.withResolvers();
  const publish = createPostgresScopeInvalidationPublisher({ pool: sinkPool });
  const stalled = createPostgresScopeOutboxWorker({ pool: workerPool, publish: async item => {
    await publish(item);
    entered.resolve(item.eventId);
    await release.promise;
  } });
  const first = stalled("tenant-work");
  const eventId = await Promise.race([entered.promise, first]);
  try {
    await admin.query("UPDATE ei_scope.outbox SET lease_until = clock_timestamp() - interval '1 second' WHERE event_id = $1", [eventId]);
    const recovered = createPostgresScopeOutboxWorker({ pool: workerPool, publish });
    assert.deepEqual(await recovered("tenant-work"), { status: "DELIVERED", eventId });
  } finally {
    release.resolve();
  }
  assert.deepEqual(await first, { status: "LEASE_LOST", eventId });
  const { rows } = await admin.query(
    "SELECT tenant_id, event_id, directive_id FROM ei_scope.scope_invalidation WHERE event_id = $1", [eventId]);
  assert.deepEqual(rows, [{ tenant_id: "tenant-work", event_id: eventId, directive_id: "scope-stale" }]);
});

test("known failures and expired final leases become terminal", async () => {
  await emit("scope-dead");
  await emit("scope-expired-last");
  await admin.query(`
    UPDATE ei_scope.outbox SET attempt_count = 4
    WHERE tenant_id = 'tenant-work' AND envelope->'payload'->>'directiveId' = 'scope-dead';
    UPDATE ei_scope.outbox SET attempt_count = 5, lease_token = event_id,
      lease_until = clock_timestamp() - interval '1 second'
    WHERE tenant_id = 'tenant-work' AND envelope->'payload'->>'directiveId' = 'scope-expired-last';
  `);
  const worker = createPostgresScopeOutboxWorker({ pool: workerPool, publish: async () => { throw Error("private failure"); } });
  assert.equal((await worker("tenant-work")).status, "DEAD_LETTERED");
  assert.deepEqual(await worker("tenant-work"), { status: "IDLE" });
  const { rows } = await admin.query(`
    SELECT dead_lettered_at, lease_token FROM ei_scope.outbox
    WHERE tenant_id = 'tenant-work' AND envelope->'payload'->>'directiveId' IN ('scope-dead', 'scope-expired-last')`);
  assert.equal(rows.length, 2);
  assert.ok(rows.every(row => row.dead_lettered_at && row.lease_token === null));
});
