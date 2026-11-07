/**
 * Pure Institute policy decisions, not a running authentication service.
 * 'actor' and membership/assignment inputs MUST originate from a trusted server
 * that has independently verified session, tenant and resource ownership.
 * Never pass browser-supplied identity, role or membership into these functions.
 */
const deny = (reason) => Object.freeze({ allowed: false, reason });
const allow = () => Object.freeze({ allowed: true, reason: "AUTHORIZED" });

export function authorizeTeacherScope({ actor, tenantId, studentId, assignment }) {
  if (!actor || actor.serverAuthenticated !== true || !actor.actorId) return deny("UNAUTHENTICATED");
  if (!tenantId || !studentId || !assignment) return deny("MISSING_RESOURCE");
  if (actor.role !== "teacher") return deny("ROLE_DENIED");
  if (actor.tenantId !== tenantId) return deny("TENANT_DENIED");
  return authorizeActiveAssignment({ assignment, tenantId, teacherId: actor.actorId, studentId });
}

export function authorizeActiveAssignment({ assignment, tenantId, teacherId, studentId }) {
  if (!assignment || !tenantId || !teacherId || !studentId) return deny("MISSING_RESOURCE");
  if (assignment.tenantId !== tenantId) return deny("TENANT_DENIED");
  if (assignment.teacherId !== teacherId || assignment.studentId !== studentId) return deny("ASSIGNMENT_DENIED");
  if (assignment.status !== "active") return deny("ASSIGNMENT_INACTIVE");
  return allow();
}

export function authorizeStudentIdentity({ actor, tenantId, studentId }) {
  if (!actor || actor.serverAuthenticated !== true || !actor.actorId) return deny("UNAUTHENTICATED");
  if (actor.role !== "student" || actor.actorId !== studentId) return deny("STUDENT_ID_DENIED");
  if (!tenantId || actor.tenantId !== tenantId) return deny("TENANT_DENIED");
  return allow();
}

export function authorizeTenantManager({ actor, tenantId }) {
  if (!actor || actor.serverAuthenticated !== true || !actor.actorId) return deny("UNAUTHENTICATED");
  if (actor.role !== "institute_manager" || actor.tenantId !== tenantId || !tenantId) return deny("MANAGEMENT_DENIED");
  return allow();
}
