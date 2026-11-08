import { inPostgresTenant } from "./postgres-tenant.mjs";

/** Private consumer. A marker requests an authorized re-read; it grants no access. */
export function createPostgresScopeInvalidationPublisher({ pool }) {
  return async function publish({ tenantId, eventId, envelope }) {
    if (!tenantId || !eventId || envelope?.tenantId !== tenantId || envelope.eventId !== eventId ||
        envelope.schemaVersion !== 1 || envelope.classification !== "student_private" ||
        !["institute.learning_scope.approved", "institute.learning_scope.revoked"].includes(envelope.eventType) ||
        typeof envelope.payload?.directiveId !== "string" || !envelope.payload.directiveId) {
      throw Error("Invalid scope invalidation event");
    }
    await inPostgresTenant(pool, tenantId, "BEGIN", client => client.query(`
      INSERT INTO ei_scope.scope_invalidation (tenant_id, event_id, directive_id)
      VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`, [tenantId, eventId, envelope.payload.directiveId]));
  };
}
