import { createProductOwnerHandler } from "../http/product-owner.mjs";
import { inPostgresTenant } from "./postgres-tenant.mjs";

const membershipQuery = `
  SELECT role, active, revision FROM ei_scope.membership
  WHERE tenant_id = $1 AND actor_id = $2`;

const assignmentQuery = `
  SELECT status, revision FROM ei_scope.assignment
  WHERE tenant_id = $1 AND teacher_id = $2 AND student_id = $3`;

export function createPostgresProductOwnerHandler({ pool, ownerSubject, verifyBearer }) {
  return createProductOwnerHandler({
    ownerSubject, verifyBearer,
    readMembership: ({ tenantId, actorId }) => inPostgresTenant(pool, tenantId, "BEGIN READ ONLY", async client => {
      const result = await client.query(membershipQuery, [tenantId, actorId]);
      return result.rows[0] ?? null;
    }),
    readAssignment: ({ tenantId, teacherId, studentId }) =>
      inPostgresTenant(pool, tenantId, "BEGIN READ ONLY", async client => {
        const result = await client.query(assignmentQuery, [tenantId, teacherId, studentId]);
        return result.rows[0] ?? null;
      }),
    grantAssignment: ({ tenantId, teacherId, studentId, ownerSubject, expectedRevision, requestId }) =>
      inPostgresTenant(pool, tenantId, "BEGIN", async client => {
        const keys = [tenantId, teacherId, studentId];
        const participants = await client.query(`
          SELECT actor_id, role FROM ei_scope.membership
          WHERE tenant_id = $1 AND active AND
            ((actor_id = $2 AND role = 'teacher') OR (actor_id = $3 AND role = 'student'))
          ORDER BY actor_id FOR SHARE`, keys);
        if (participants.rowCount !== 2) return { participantsUnavailable: true };

        const result = await client.query(assignmentQuery + " FOR UPDATE", keys);
        const current = result.rows[0] ?? null;
        if ((current?.revision ?? null) !== expectedRevision) return { changed: false };
        if (current?.status === "active") return { assignment: current };

        const update = current
          ? await client.query(`
              UPDATE ei_scope.assignment
              SET status = 'active', revision = gen_random_uuid()::text, generation = gen_random_uuid()
              WHERE tenant_id = $1 AND teacher_id = $2 AND student_id = $3
              RETURNING status, revision, generation`, keys)
          : await client.query(`
              INSERT INTO ei_scope.assignment (tenant_id, teacher_id, student_id, revision, status)
              VALUES ($1, $2, $3, gen_random_uuid()::text, 'active')
              ON CONFLICT DO NOTHING RETURNING status, revision, generation`, keys);
        const assignment = update.rows[0];
        if (!assignment) return { changed: false };

        await client.query(`
          INSERT INTO ei_scope.assignment_grant_audit
            (tenant_id, teacher_id, student_id, request_id, owner_subject, previous_revision, granted_revision, granted_generation)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [...keys, requestId, ownerSubject, expectedRevision, assignment.revision, assignment.generation]);
        return { assignment };
      }),
    revokeAssignment: ({ tenantId, teacherId, studentId, ownerSubject, expectedRevision, requestId }) =>
      inPostgresTenant(pool, tenantId, "BEGIN", async client => {
        const keys = [tenantId, teacherId, studentId];
        const result = await client.query(assignmentQuery + " FOR UPDATE", keys);
        const current = result.rows[0];
        if (!current) return null;
        if (current.revision !== expectedRevision) return { changed: false };
        if (current.status === "revoked") return { assignment: current };

        const update = await client.query(`
          UPDATE ei_scope.assignment SET status = 'revoked', revision = gen_random_uuid()::text
          WHERE tenant_id = $1 AND teacher_id = $2 AND student_id = $3
          RETURNING status, revision`, keys);
        const assignment = update.rows[0];
        await client.query(`
          INSERT INTO ei_scope.assignment_revocation_audit
            (tenant_id, teacher_id, student_id, request_id, owner_subject, previous_revision, revoked_revision)
          VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [...keys, requestId, ownerSubject, current.revision, assignment.revision]);
        return { assignment };
      }),
    changeMembership: ({ tenantId, actorId, ownerSubject, expectedRevision, requestId, policy }) =>
      inPostgresTenant(pool, tenantId, "BEGIN", async client => {
        const result = await client.query(membershipQuery + " FOR UPDATE", [tenantId, actorId]);
        const current = result.rows[0];
        if (!current) return null;
        if (current.revision !== expectedRevision) return { changed: false };
        if (current.role === policy.role && current.active === policy.active) return { membership: current };

        const update = await client.query(`
          UPDATE ei_scope.membership SET role = $3, active = $4, revision = gen_random_uuid()
          WHERE tenant_id = $1 AND actor_id = $2
          RETURNING role, active, revision`, [tenantId, actorId, policy.role, policy.active]);
        await client.query(`
          INSERT INTO ei_scope.membership_audit
            (tenant_id, request_id, owner_subject, actor_id, old_role, old_active, new_role, new_active)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [tenantId, requestId, ownerSubject, actorId, current.role, current.active, policy.role, policy.active]);
        return { membership: update.rows[0] };
      }),
  });
}
