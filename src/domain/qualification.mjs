/** Institute professional credentialing, NOT ELYORA educational assessment. */
export function decideTeacherEligibility({ caseFile, reviewer }) {
  if (!caseFile || !reviewer || reviewer.serverAuthenticated !== true ||
      reviewer.role !== "qualification_reviewer" || caseFile.tenantId !== reviewer.tenantId) {
    return { status: "DENIED", reason: "REVIEWER_UNAUTHORIZED" };
  }
  if (!caseFile.consentRecorded) return { status: "BLOCKED", reason: "CONSENT_MISSING" };
  if (reviewer.actorId === caseFile.teacherId) return { status: "DENIED", reason: "SELF_REVIEW_DENIED" };
  if (!Array.isArray(caseFile.evidence) || caseFile.evidence.length === 0 ||
      caseFile.evidence.some((e) => !e || typeof e.rubricVersion !== "string" || !e.observedBehavior)) {
    return { status: "NEEDS_EVIDENCE", reason: "INSUFFICIENT_EVIDENCE" };
  }
  if (caseFile.evidence.some((e) => e.criticalError === true)) {
    return { status: "NEEDS_REVIEW", reason: "CRITICAL_ERROR_REQUIRES_ADJUDICATION" };
  }
  if (caseFile.credentialsVerified !== true) return { status: "NEEDS_EVIDENCE", reason: "CREDENTIALS_NOT_VERIFIED" };
  if (caseFile.reviewerDecision !== "approve") return { status: "NEEDS_REVIEW", reason: "EXPLICIT_APPROVAL_REQUIRED" };
  if (!Number.isFinite(Date.parse(caseFile.expiresAt)) || Date.parse(caseFile.expiresAt) <= Date.now()) {
    return { status: "NEEDS_REVIEW", reason: "INVALID_ELIGIBILITY_EXPIRY" };
  }
  return {
    status: "ELIGIBLE", reason: "HUMAN_REVIEWED",
    teacherId: caseFile.teacherId, reviewedBy: reviewer.actorId,
    expiresAt: caseFile.expiresAt
  };
}
