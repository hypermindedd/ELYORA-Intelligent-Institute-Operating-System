import { invokeElyoraPractice } from "../adapters/elyora-port.mjs";
import { evaluateLanguageScopedPractice } from "../domain/language-scoped-activity.mjs";
import { authorizeActiveAssignment } from "../domain/policy.mjs";

/**
 * Internal, offline composition. A future server must resolve actor, current
 * directive, assignment and clock itself before calling this function.
 */
export async function startGuidedPractice({ actor, directive, assignment, activity, at }) {
  const scope = evaluateLanguageScopedPractice({ actor, directive, activity, at });
  if (!scope.allowed) return scope;
  if (directive.approvedBy !== directive.teacherId) {
    return { allowed: false, reason: "APPROVER_MISMATCH" };
  }

  const currentAssignment = authorizeActiveAssignment({
    assignment,
    tenantId: directive.tenantId,
    teacherId: directive.teacherId,
    studentId: directive.studentId
  });
  if (!currentAssignment.allowed) return currentAssignment;

  const request = Object.freeze({
    directiveId: scope.directiveId,
    directiveVersion: scope.directiveVersion,
    programId: directive.programId,
    programVersion: directive.programVersion,
    targetLanguageCode: directive.targetLanguageCode,
    localeVariant: directive.localeVariant,
    instructionLocale: directive.instructionLocale,
    topicId: activity.topicId,
    activityType: activity.activityType,
    minutes: activity.minutes
  });
  try {
    await invokeElyoraPractice(request);
  } catch (error) {
    if (error?.code !== "BLOCKED_NOT_CONNECTED") throw error;
    return { ...scope, integration: error.code };
  }
  throw Error("UNVERIFIED_ELYORA_PRACTICE_RESPONSE");
}
