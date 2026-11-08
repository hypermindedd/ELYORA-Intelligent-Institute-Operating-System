import { evaluateStudentScope } from "../domain/learning-scope.mjs";
import { validateLanguageScopedDirective } from "../domain/language-scoped-activity.mjs";
import { authorizeActiveAssignment } from "../domain/policy.mjs";

export function verifyCurrentScopeAssignment(directive, assignment) {
  if (directive.approvedBy !== directive.teacherId) {
    return { allowed: false, reason: "APPROVER_MISMATCH" };
  }
  return authorizeActiveAssignment({
    assignment,
    tenantId: directive.tenantId,
    teacherId: directive.teacherId,
    studentId: directive.studentId
  });
}

/** Internal read. The server boundary must supply all four inputs. */
export function readGuidedLearningScope({ actor, directive, assignment, at }) {
  const scope = evaluateStudentScope({ actor, directive, at });
  if (!scope.allowed) return scope;
  const language = validateLanguageScopedDirective(directive);
  if (!language.allowed) return language;
  const currentAssignment = verifyCurrentScopeAssignment(directive, assignment);
  if (!currentAssignment.allowed) return currentAssignment;

  return {
    allowed: true,
    data: {
      directiveId: directive.directiveId,
      directiveVersion: directive.version,
      programId: directive.programId,
      programVersion: directive.programVersion,
      targetLanguageCode: directive.targetLanguageCode,
      localeVariant: directive.localeVariant,
      instructionLocale: directive.instructionLocale,
      allowedTopics: directive.allowedTopics.filter(topic => !directive.excludedTopics.includes(topic)),
      allowedActivityTypes: [...directive.allowedActivityTypes],
      maxSessionMinutes: directive.maxSessionMinutes,
      startsAt: directive.startsAt,
      expiresAt: directive.expiresAt
    }
  };
}
