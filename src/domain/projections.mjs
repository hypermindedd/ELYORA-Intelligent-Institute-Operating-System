import { authorizeStudentIdentity, authorizeTenantManager } from "./policy.mjs";
/** Explicit allowlist: raw student/teacher private fields are not serialized. */
export function projectStudentOwnProgress({ actor, tenantId, record }) {
  const decision = authorizeStudentIdentity({ actor, tenantId, studentId: record?.studentId });
  if (!decision.allowed || !record || record.tenantId !== tenantId) return { allowed: false, reason: "STUDENT_PROJECTION_DENIED" };
  return { allowed: true, data: {
    studentId: record.studentId,
    permittedTopics: Array.isArray(record.permittedTopics) ? [...record.permittedTopics] : [],
    lastActivityAt: record.lastActivityAt ?? null
  } };
}

/**
 * Only intentionally approved aggregate fields. A small cohort is suppressed
 * pending the tenant's legal/privacy policy; never expose underlying individuals.
 */
export function projectInstituteHealth({ actor, tenantId, records, minCohortSize = 5 }) {
  const decision = authorizeTenantManager({ actor, tenantId });
  if (!decision.allowed) return { allowed: false, reason: "MANAGEMENT_PROJECTION_DENIED" };
  if (!Array.isArray(records) || !Number.isSafeInteger(minCohortSize) || minCohortSize < 5 ||
      records.some((r) => r.tenantId !== tenantId)) return { allowed: false, reason: "INVALID_AGGREGATE_INPUT" };
  if (records.length < minCohortSize) return { allowed: false, reason: "COHORT_SUPPRESSED" };
  return { allowed: true, data: {
    tenantId, totalStudents: records.length,
    elevatedRiskCount: records.filter((r) => r.riskLevel === "ELEVATED").length,
    highRiskCount: records.filter((r) => r.riskLevel === "HIGH").length
  } };
}
