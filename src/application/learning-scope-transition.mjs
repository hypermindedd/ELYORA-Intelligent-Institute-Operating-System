import { approveLanguageScopedDirective, validateLanguageScopedDirective } from "../domain/language-scoped-activity.mjs";
import { authorizeTeacherScope } from "../domain/policy.mjs";

export function transitionLearningScope({ directive, actor, assignment, status, at }) {
  if (!validateLanguageScopedDirective(directive).allowed || directive.revokedAt ||
      !Number.isFinite(Date.parse(at))) return null;

  if (status === "approved") {
    if (Date.parse(at) >= Date.parse(directive.expiresAt)) return null;
    const approval = approveLanguageScopedDirective({ directive, actor, assignment });
    return approval.allowed ? approval.directive : null;
  }
  if (status !== "revoked" || directive.status !== "approved" ||
      directive.approvedBy !== directive.teacherId || directive.teacherId !== actor?.actorId) return null;
  const authority = authorizeTeacherScope({ actor, tenantId: directive.tenantId, studentId: directive.studentId, assignment });
  return authority.allowed ? { ...directive, status: "revoked", revokedAt: at } : null;
}
