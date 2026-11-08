import { createLearningScopeHandler } from "../http/learning-scope.mjs";
import { createLearningScopeCommitter } from "./learning-scope-committer.mjs";

const actorQuery = `
  SELECT actor_id AS "actorId", tenant_id AS "tenantId", role, true AS "serverAuthenticated"
  FROM ei_scope.membership WHERE tenant_id = $1 AND actor_id = $2 AND active`;

const scopeQuery = `
  SELECT d.document AS directive, d.revision, a.revision AS "assignmentRevision",
    jsonb_build_object('tenantId', a.tenant_id, 'teacherId', a.teacher_id,
      'studentId', a.student_id, 'status', a.status) AS assignment
  FROM ei_scope.directive d
  JOIN ei_scope.assignment a USING (tenant_id, teacher_id, student_id)
  WHERE d.tenant_id = $1 AND d.directive_id = $2`;

async function inTenant(pool, tenantId, begin, work) {
  const client = await pool.connect();
  let rollbackError;
  try {
    await client.query(begin);
    await client.query("SELECT set_config('ei_os.tenant_id', $1, true)", [tenantId]);
    const result = await work(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch (failure) {
      rollbackError = failure;
    }
    throw error;
  } finally {
    client.release(rollbackError);
  }
}

async function first(client, sql, params) {
  const result = await client.query(sql, params);
  return result.rows[0] ?? null;
}

export function createPostgresLearningScopeStore(pool) {
  return {
    loadActor({ tenantId, actorId }) {
      return inTenant(pool, tenantId, "BEGIN READ ONLY", client =>
        first(client, actorQuery, [tenantId, actorId]));
    },
    loadScope({ tenantId, directiveId, actorId, role }) {
      return inTenant(pool, tenantId, "BEGIN READ ONLY", client => first(client, scopeQuery + `
        AND EXISTS (
          SELECT 1 FROM ei_scope.membership m
          WHERE m.tenant_id = d.tenant_id AND m.actor_id = $3 AND m.role = $4 AND m.active
        )`, [tenantId, directiveId, actorId, role]));
    },
    async transact(work, { tenantId }) {
      try {
        return await inTenant(pool, tenantId, "BEGIN ISOLATION LEVEL SERIALIZABLE", client => work({
          loadActor: ({ actorId }) => first(client, actorQuery + " FOR SHARE", [tenantId, actorId]),
          loadScope: ({ directiveId }) => first(client, scopeQuery + " FOR UPDATE OF d FOR SHARE OF a",
            [tenantId, directiveId]),
          async putScope({ directive, revision }) {
            const result = await client.query(`
              UPDATE ei_scope.directive SET document = $3, revision = $4
              WHERE tenant_id = $1 AND directive_id = $2`, [tenantId, directive.directiveId, directive, revision]);
            if (result.rowCount !== 1) throw Error("Locked directive missing");
          },
          enqueue: event => client.query(`
            INSERT INTO ei_scope.outbox (tenant_id, event_id, occurred_at, envelope)
            VALUES ($1, $2, $3, $4)`, [tenantId, event.eventId, event.occurredAt, event]),
        }));
      } catch (error) {
        if (error?.code === "40001" || error?.code === "40P01") return false;
        throw error;
      }
    },
  };
}

/** verifyBearer owns token validation and the trusted subject-to-tenant mapping. */
export function createPostgresLearningScopeHandler({ pool, verifyBearer, now }) {
  const store = createPostgresLearningScopeStore(pool);
  return createLearningScopeHandler({
    async authenticateBearer(token) {
      const identity = await verifyBearer(token);
      if (typeof identity?.subject !== "string" || !identity.subject ||
          typeof identity.tenantId !== "string" || !identity.tenantId) return null;
      return store.loadActor({ actorId: identity.subject, tenantId: identity.tenantId });
    },
    loadScope: store.loadScope,
    commitScope: createLearningScopeCommitter({ transact: store.transact, now }),
    now,
  });
}
