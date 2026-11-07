import { authorizeTeacherScope, authorizeStudentIdentity } from "./policy.mjs";

const denied = (reason) => ({ allowed: false, reason });
const validTime = (value) => typeof value === "string" && Number.isFinite(Date.parse(value));
const hasId = (value) => typeof value === "string" && value.trim().length > 0;
const uniqueIds = (value) => Array.isArray(value) && value.length > 0 && value.every(hasId) && new Set(value).size === value.length;

/**
 * Directives are organizational policy objects. These functions never modify
 * ELYORA Learning State or Mastery and never persist any data.
 */
export function validateDirective(directive) {
  if (!directive || !hasId(directive.directiveId) || !hasId(directive.tenantId) ||
      !hasId(directive.studentId) || !hasId(directive.teacherId) ||
      !hasId(directive.programId) || !Number.isSafeInteger(directive.version) ||
      directive.version < 1 || !uniqueIds(directive.allowedTopics) ||
      !uniqueIds(directive.allowedActivityTypes)) return denied("INVALID_DIRECTIVE");
  if (!validTime(directive.startsAt) || !validTime(directive.expiresAt) ||
      Date.parse(directive.startsAt) >= Date.parse(directive.expiresAt)) return denied("INVALID_TIMEBOX");
  if (!Number.isSafeInteger(directive.maxSessionMinutes) || directive.maxSessionMinutes <= 0) return denied("INVALID_DURATION");
  if (!Array.isArray(directive.excludedTopics) || directive.excludedTopics.some((x) => !hasId(x))) return denied("INVALID_EXCLUSIONS");
  if (!["proposed", "approved", "revoked"].includes(directive.status)) return denied("INVALID_STATUS");
  return { allowed: true, reason: "VALID" };
}

/** An AI can PROPOSE, but only an authorized assigned teacher can APPROVE. */
export function approveDirective({ directive, actor, assignment }) {
  const syntax = validateDirective(directive);
  if (!syntax.allowed) return syntax;
  if (directive.status !== "proposed" || directive.approvedBy) return denied("NOT_APPROVABLE");
  const authority = authorizeTeacherScope({
    actor, tenantId: directive.tenantId,
    studentId: directive.studentId, assignment
  });
  if (!authority.allowed) return authority;
  if (actor.actorId !== directive.teacherId) return denied("TEACHER_MISMATCH");
  return {
    allowed: true,
    directive: Object.freeze({
      ...directive,
      allowedTopics: Object.freeze([...directive.allowedTopics]),
      excludedTopics: Object.freeze([...directive.excludedTopics]),
      allowedActivityTypes: Object.freeze([...directive.allowedActivityTypes]),
      status: "approved",
      approvedBy: actor.actorId
    })
  };
}

/** The caller MUST have already independently authenticated and authorized. */
export function evaluatePracticeAccess({ directive, actor, activity, at }) {
  const studentAuthority = authorizeStudentIdentity({ actor, tenantId: directive?.tenantId, studentId: directive?.studentId });
  if (!studentAuthority.allowed) return studentAuthority;
  const syntax = validateDirective(directive);
  if (!syntax.allowed) return syntax;
  if (directive.status !== "approved" || !hasId(directive.approvedBy)) return denied("SCOPE_NOT_APPROVED");
  if (directive.revokedAt) return denied("SCOPE_REVOKED");
  if (!validTime(at)) return denied("INVALID_REQUEST_TIME");
  const t = Date.parse(at);
  if (t < Date.parse(directive.startsAt) || t >= Date.parse(directive.expiresAt)) return denied("SCOPE_OUTSIDE_TIMEBOX");
  if (!activity || !hasId(activity.topicId) || !hasId(activity.activityType) ||
      !hasId(activity.programId) || !Number.isSafeInteger(activity.minutes) || activity.minutes <= 0) return denied("INVALID_ACTIVITY");
  if (activity.programId !== directive.programId) return denied("PROGRAM_DENIED");
  if (directive.excludedTopics.includes(activity.topicId) ||
      !directive.allowedTopics.includes(activity.topicId)) return denied("TOPIC_DENIED");
  if (!directive.allowedActivityTypes.includes(activity.activityType)) return denied("ACTIVITY_TYPE_DENIED");
  if (activity.minutes > directive.maxSessionMinutes) return denied("DURATION_DENIED");
  return {
    allowed: true, reason: "WITHIN_APPROVED_SCOPE",
    directiveId: directive.directiveId, directiveVersion: directive.version
  };
}

export function suggestScopeChange({ directive, suggestedTopics, reason }) {
  const syntax = validateDirective(directive);
  if (!syntax.allowed || !uniqueIds(suggestedTopics) || !hasId(reason)) return denied("INVALID_PROPOSAL");
  return {
    allowed: false, reason: "HUMAN_APPROVAL_REQUIRED",
    proposal: Object.freeze({ directiveId: directive.directiveId, suggestedTopics: [...suggestedTopics], reason })
  };
}
