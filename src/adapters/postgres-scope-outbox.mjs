import { randomUUID } from "node:crypto";
import { inPostgresTenant } from "./postgres-tenant.mjs";

const maxAttempts = 5;
const leaseSeconds = 60;
const initialDelaySeconds = 5;

async function claim(pool, tenantId, token) {
  return inPostgresTenant(pool, tenantId, "BEGIN", async client => {
    await client.query(`
      WITH expired AS (
        SELECT event_id FROM ei_scope.outbox
        WHERE tenant_id = $1 AND delivered_at IS NULL AND dead_lettered_at IS NULL
          AND attempt_count >= $2 AND lease_until <= clock_timestamp()
        ORDER BY lease_until, event_id LIMIT 25 FOR UPDATE SKIP LOCKED
      )
      UPDATE ei_scope.outbox o SET dead_lettered_at = clock_timestamp(),
        lease_token = NULL, lease_until = NULL
      FROM expired e WHERE o.tenant_id = $1 AND o.event_id = e.event_id`, [tenantId, maxAttempts]);

    const result = await client.query(`
      WITH candidate AS (
        SELECT event_id FROM ei_scope.outbox
        WHERE tenant_id = $1 AND delivered_at IS NULL AND dead_lettered_at IS NULL
          AND attempt_count < $2 AND available_at <= clock_timestamp()
          AND (lease_until IS NULL OR lease_until <= clock_timestamp())
        ORDER BY available_at, occurred_at, event_id LIMIT 1 FOR UPDATE SKIP LOCKED
      )
      UPDATE ei_scope.outbox o
      SET lease_token = $3, lease_until = clock_timestamp() + make_interval(secs => $4),
        attempt_count = o.attempt_count + 1
      FROM candidate c WHERE o.tenant_id = $1 AND o.event_id = c.event_id
      RETURNING o.event_id AS "eventId", o.envelope, o.attempt_count AS "attemptCount"`,
    [tenantId, maxAttempts, token, leaseSeconds]);
    return result.rows[0] ?? null;
  });
}

async function finish(pool, tenantId, token, item, delivered) {
  const delay = initialDelaySeconds * (2 ** (item.attemptCount - 1));
  return inPostgresTenant(pool, tenantId, "BEGIN", async client => {
    const result = await client.query(`
      UPDATE ei_scope.outbox
      SET delivered_at = CASE WHEN $4::boolean THEN clock_timestamp() ELSE NULL END,
        dead_lettered_at = CASE WHEN NOT $4::boolean AND attempt_count >= $5
          THEN clock_timestamp() ELSE NULL END,
        available_at = CASE WHEN NOT $4::boolean AND attempt_count < $5
          THEN clock_timestamp() + make_interval(secs => $6) ELSE available_at END,
        lease_token = NULL, lease_until = NULL
      WHERE tenant_id = $1 AND event_id = $2 AND lease_token = $3
        AND delivered_at IS NULL AND dead_lettered_at IS NULL`,
    [tenantId, item.eventId, token, delivered, maxAttempts, delay]);
    if (result.rowCount === 0) return "LEASE_LOST";
    if (delivered) return "DELIVERED";
    return item.attemptCount >= maxAttempts ? "DEAD_LETTERED" : "RETRY_SCHEDULED";
  });
}

/** A trusted scheduler supplies the tenant and a private, idempotent publisher. */
export function createPostgresScopeOutboxWorker({ pool, publish }) {
  if (typeof publish !== "function") throw TypeError("Outbox publisher required");
  return async function deliverNext(tenantId) {
    if (typeof tenantId !== "string" || !tenantId.trim()) throw TypeError("Tenant required");
    const token = randomUUID();
    const item = await claim(pool, tenantId, token);
    if (!item) return { status: "IDLE" };

    let delivered = false;
    try {
      await publish({ tenantId, eventId: item.eventId, envelope: item.envelope });
      delivered = true;
    } catch {
      // Persist only retry metadata. Publisher errors may contain private data.
    }
    const status = await finish(pool, tenantId, token, item, delivered);
    return { status, eventId: item.eventId };
  };
}
