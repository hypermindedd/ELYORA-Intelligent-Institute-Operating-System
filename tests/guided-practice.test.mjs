import assert from "node:assert/strict";
import { test } from "node:test";
import { startGuidedPractice } from "../src/application/guided-practice.mjs";
import { approveLanguageScopedDirective } from "../src/domain/language-scoped-activity.mjs";

const assignment = { tenantId: "institute-a", teacherId: "teacher-a", studentId: "student-a", status: "active" };
const teacher = { tenantId: assignment.tenantId, actorId: assignment.teacherId, role: "teacher", serverAuthenticated: true };
const student = { tenantId: assignment.tenantId, actorId: assignment.studentId, role: "student", serverAuthenticated: true };
const program = { programId: "english-a1", programVersion: "demo-a1-v1", targetLanguageCode: "en", localeVariant: "en-US" };
const draft = {
  ...program, directiveId: "directive-a", version: 2, status: "proposed",
  tenantId: assignment.tenantId, teacherId: assignment.teacherId, studentId: assignment.studentId,
  instructionLocale: "fa-IR", allowedTopics: ["greetings"], excludedTopics: ["shopping"],
  allowedActivityTypes: ["conversation"], maxSessionMinutes: 15,
  startsAt: "2026-11-08T08:00:00Z", expiresAt: "2026-11-08T09:00:00Z"
};
const approval = approveLanguageScopedDirective({ directive: draft, actor: teacher, assignment });
assert.equal(approval.allowed, true);
const fixture = {
  actor: student, assignment, directive: approval.directive, at: "2026-11-08T08:15:00Z",
  activity: { ...program, topicId: "greetings", activityType: "conversation", minutes: 10 }
};

test("teacher-approved scope reaches only the closed parent adapter", async () => {
  assert.deepEqual(await startGuidedPractice(fixture), {
    allowed: true, reason: "WITHIN_APPROVED_SCOPE",
    directiveId: "directive-a", directiveVersion: 2, integration: "BLOCKED_NOT_CONNECTED"
  });
});

for (const [label, override, reason] of [
  ["unapproved proposal", { directive: draft }, "SCOPE_NOT_APPROVED"],
  ["revoked directive", { directive: { ...fixture.directive, revokedAt: fixture.at } }, "SCOPE_REVOKED"],
  ["expired directive", { at: draft.expiresAt }, "SCOPE_OUTSIDE_TIMEBOX"],
  ["different student", { actor: { ...student, actorId: "student-b" } }, "STUDENT_ID_DENIED"],
  ["different tenant", { actor: { ...student, tenantId: "institute-b" } }, "TENANT_DENIED"],
  ["unauthenticated actor", { actor: { ...student, serverAuthenticated: false } }, "UNAUTHENTICATED"],
  ["missing current assignment", { assignment: null }, "MISSING_RESOURCE"],
  ["revoked current assignment", { assignment: { ...assignment, status: "revoked" } }, "ASSIGNMENT_INACTIVE"],
  ["assignment from another tenant", { assignment: { ...assignment, tenantId: "institute-b" } }, "TENANT_DENIED"],
  ["reassigned teacher", { assignment: { ...assignment, teacherId: "teacher-b" } }, "ASSIGNMENT_DENIED"],
  ["different assigned student", { assignment: { ...assignment, studentId: "student-b" } }, "ASSIGNMENT_DENIED"],
  ["tampered approval", { directive: { ...fixture.directive, approvedBy: "teacher-b" } }, "APPROVER_MISMATCH"],
  ["legacy directive with added locale fields", { directive: { ...fixture.directive, version: 1 } }, "LANGUAGE_SCOPE_VERSION_REQUIRED"],
  ["unapproved topic", { activity: { ...fixture.activity, topicId: "shopping" } }, "TOPIC_DENIED"],
  ["unapproved regional variant", { activity: { ...fixture.activity, localeVariant: "en-GB" } }, "LANGUAGE_VARIANT_DENIED"],
  ["unapproved curriculum version", { activity: { ...fixture.activity, programVersion: "demo-a1-v2" } }, "PROGRAM_VERSION_DENIED"],
  ["exhausted timebox", { activity: { ...fixture.activity, minutes: 16 } }, "DURATION_DENIED"]
]) {
  test("guided practice denies " + label, async () => {
    assert.deepEqual(await startGuidedPractice({ ...fixture, ...override }), { allowed: false, reason });
  });
}
