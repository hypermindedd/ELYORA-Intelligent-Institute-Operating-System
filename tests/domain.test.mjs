import test from "node:test";
import assert from "node:assert/strict";
import { authorizeTeacherScope } from "../src/domain/policy.mjs";
import { approveDirective, evaluatePracticeAccess, suggestScopeChange } from "../src/domain/learning-scope.mjs";
import { evaluateRoomEligibility } from "../src/domain/rooms.mjs";
import { decideTeacherEligibility } from "../src/domain/qualification.mjs";
import { proposeIntervention, authorizeInterventionAction, measureInterventionOutcome } from "../src/domain/intelligence.mjs";
import { projectStudentOwnProgress, projectInstituteHealth } from "../src/domain/projections.mjs";
import { invokeElyoraPractice } from "../src/adapters/elyora-port.mjs";

const at = "2026-11-07T12:30:00.000Z";
const teacher = { actorId: "t1", tenantId: "org1", role: "teacher", serverAuthenticated: true };
const student = { actorId: "s1", tenantId: "org1", role: "student", serverAuthenticated: true };
const manager = { actorId: "m1", tenantId: "org1", role: "institute_manager", serverAuthenticated: true };
const assignment = { tenantId: "org1", studentId: "s1", teacherId: "t1", status: "active", classId: "c1" };
const proposed = {
  directiveId: "d1", version: 1, tenantId: "org1", studentId: "s1",
  teacherId: "t1", programId: "english", allowedTopics: ["hello"],
  excludedTopics: [], allowedActivityTypes: ["conversation"],
  maxSessionMinutes: 30, startsAt: "2026-11-07T12:00:00.000Z",
  expiresAt: "2026-11-07T13:00:00.000Z", status: "proposed"
};
const approved = approveDirective({ directive: proposed, actor: teacher, assignment }).directive;
const activity = { programId: "english", topicId: "hello", activityType: "conversation", minutes: 20 };
const request = (override = {}) => ({ directive: approved, actor: student, activity, at, ...override });
const classroom = { roomId: "r1", tenantId: "org1", roomType: "classroom",
  classId: "c1", status: "active", startsAt: proposed.startsAt, expiresAt: proposed.expiresAt };
test("assigned, server-authenticated teacher can author scope", () => {
  assert.equal(authorizeTeacherScope({ actor: teacher, tenantId: "org1", studentId: "s1", assignment }).allowed, true);
});
test("browser impersonation / absent server auth denies", () => {
  assert.equal(authorizeTeacherScope({ actor: { ...teacher, serverAuthenticated: false }, tenantId: "org1", studentId: "s1", assignment }).allowed, false);
});
test("cross-tenant teacher denied", () => {
  assert.equal(approveDirective({ directive: proposed, actor: { ...teacher, tenantId: "evil" }, assignment }).allowed, false);
});
test("teacher cannot approve another teacher's directive", () => {
  assert.equal(approveDirective({ directive: proposed, actor: { ...teacher, actorId: "t2" }, assignment }).allowed, false);
});
test("proposed AI directive cannot be exercised before approval", () => {
  assert.equal(evaluatePracticeAccess(request({ directive: proposed })).reason, "SCOPE_NOT_APPROVED");
});
test("student can practice inside teacher-approved time and topic", () => {
  assert.equal(evaluatePracticeAccess(request()).allowed, true);
});
test("students cannot access another student's directive", () => {
  assert.equal(evaluatePracticeAccess(request({ actor: { ...student, actorId: "s2" } })).allowed, false);
});
test("cross-tenant student cannot practice", () => {
  assert.equal(evaluatePracticeAccess(request({ actor: { ...student, tenantId: "org2" } })).allowed, false);
});
test("excluded, unapproved and cross-program topics denied", () => {
  assert.equal(evaluatePracticeAccess(request({ activity: { ...activity, topicId: "other" } })).reason, "TOPIC_DENIED");
  assert.equal(evaluatePracticeAccess(request({ directive: { ...approved, excludedTopics: ["hello"] } })).reason, "TOPIC_DENIED");
  assert.equal(evaluatePracticeAccess(request({ activity: { ...activity, programId: "math" } })).reason, "PROGRAM_DENIED");
});
test("timebox enforced including exact expiry boundary", () => {
  assert.equal(evaluatePracticeAccess(request({ at: proposed.expiresAt })).reason, "SCOPE_OUTSIDE_TIMEBOX");
  assert.equal(evaluatePracticeAccess(request({ at: "2026-11-07T11:59:59Z" })).allowed, false);
});
test("duration and revoke enforced", () => {
  assert.equal(evaluatePracticeAccess(request({ activity: { ...activity, minutes: 45 } })).reason, "DURATION_DENIED");
  assert.equal(evaluatePracticeAccess(request({ directive: { ...approved, revokedAt: at } })).reason, "SCOPE_REVOKED");
});
test("invalid directive fails closed", () => {
  assert.equal(evaluatePracticeAccess(request({ directive: { ...approved, version: -2 } })).allowed, false);
});
test("AI suggestion does not grant new topic", () => {
  const result = suggestScopeChange({ directive: approved, suggestedTopics: ["advanced"], reason: "progress signal" });
  assert.equal(result.allowed, false);
  assert.equal(evaluatePracticeAccess(request({ activity: { ...activity, topicId: "advanced" } })).allowed, false);
});
test("only enrolled teacher or student can enter class", () => {
  assert.equal(evaluateRoomEligibility({ room: classroom, actor: student, enrollment: assignment, at }).allowed, true);
  assert.equal(evaluateRoomEligibility({ room: classroom, actor: manager, enrollment: assignment, at }).allowed, false);
  assert.equal(evaluateRoomEligibility({ room: classroom, actor: student, enrollment: { ...assignment, status: "revoked" }, at }).allowed, false);
});
test("private student and teacher cabins have isolated owners", () => {
  const ownStudentRoom = { ...classroom, roomType: "student_private", ownerId: "s1" };
  const ownTeacherRoom = { ...classroom, roomType: "teacher_private", ownerId: "t1" };
  assert.equal(evaluateRoomEligibility({ room: ownStudentRoom, actor: student, at }).allowed, true);
  assert.equal(evaluateRoomEligibility({ room: ownStudentRoom, actor: manager, at }).allowed, false);
  assert.equal(evaluateRoomEligibility({ room: ownTeacherRoom, actor: student, at }).allowed, false);
  assert.equal(evaluateRoomEligibility({ room: ownTeacherRoom, actor: teacher, at }).allowed, true);
});
test("institute command cabin requires authorized manager", () => {
  const command = { ...classroom, roomType: "institute_command" };
  assert.equal(evaluateRoomEligibility({ room: command, actor: manager, at }).allowed, true);
  assert.equal(evaluateRoomEligibility({ room: command, actor: teacher, at }).allowed, false);
});
test("room expiry and tenant enforced", () => {
  assert.equal(evaluateRoomEligibility({ room: classroom, actor: student, enrollment: assignment, at: proposed.expiresAt }).allowed, false);
  assert.equal(evaluateRoomEligibility({ room: { ...classroom, tenantId: "other" }, actor: student, enrollment: assignment, at }).allowed, false);
});
test("teacher cannot self-approve eligibility", () => {
  const caseFile = { teacherId: "t1", tenantId: "org1", consentRecorded: true,
    evidence: [{ rubricVersion: "1", observedBehavior: "Demonstrated correction" }],
    credentialsVerified: true, reviewerDecision: "approve", expiresAt: "2027-12-01T00:00:00.000Z" };
  assert.equal(decideTeacherEligibility({ caseFile, reviewer: { actorId: "t1", role: "qualification_reviewer", tenantId: "org1", serverAuthenticated: true } }).status, "DENIED");
  assert.equal(decideTeacherEligibility({ caseFile, reviewer: { actorId: "qa1", role: "qualification_reviewer", tenantId: "org1", serverAuthenticated: true } }).status, "ELIGIBLE");
});
test("critical teaching error is not automatically cleared", () => {
  const caseFile = { teacherId: "t1", tenantId: "org1", consentRecorded: true,
    evidence: [{ rubricVersion: "1", observedBehavior: "Critical misinstruction", criticalError: true }],
    credentialsVerified: true, reviewerDecision: "approve", expiresAt: "2027-12-01T00:00:00.000Z" };
  assert.equal(decideTeacherEligibility({ caseFile, reviewer: { actorId: "qa1", role: "qualification_reviewer", tenantId: "org1", serverAuthenticated: true } }).status, "NEEDS_REVIEW");
});
test("recommendation does not auto-execute action or imply measured outcome", () => {
  const rec = proposeIntervention({ recommendationId: "rec1", tenantId: "org1", subjectId: "s1", evidenceIds: ["ev1"], reason: "attendance" });
  assert.equal(rec.recommendation.actionId, null);
  assert.equal(authorizeInterventionAction({ recommendation: rec.recommendation, manager, actionId: "act1", approved: false }).ok, false);
  const action = authorizeInterventionAction({ recommendation: rec.recommendation, manager, actionId: "act1", approved: true });
  assert.equal(action.action.status, "ASSIGNED");
  assert.equal(measureInterventionOutcome({ action: action.action, measurement: { metric: "engagement", observedValue: 1, baselineValue: 0, windowDays: 7 }, observer: manager }).ok, false);
});
test("student own projection has no private notes; manager only approved aggregates", () => {
  const record = { tenantId: "org1", studentId: "s1", permittedTopics: ["hello"], privateJournal: "secret", lastActivityAt: at };
  const self = projectStudentOwnProgress({ actor: student, tenantId: "org1", record });
  assert.equal(self.allowed, true);
  assert.equal(Object.hasOwn(self.data, "privateJournal"), false);
  const records = Array.from({ length: 6 }, (_, i) => ({
    tenantId: "org1", studentId: "s"+i, teacherPrivateNote: "private",
    riskLevel: i < 2 ? "HIGH" : "LOW"
  }));
  const aggregate = projectInstituteHealth({ actor: manager, tenantId: "org1", records });
  assert.equal(aggregate.allowed, true);
  assert.equal(aggregate.data.highRiskCount, 2);
  assert.equal(Object.hasOwn(aggregate.data, "teacherPrivateNote"), false);
  assert.equal(projectInstituteHealth({ actor: manager, tenantId: "org1", records: records.slice(0, 3) }).allowed, false);
});
test("wrong tenant and unauthorized manager cannot see aggregates", () => {
  const records = Array.from({ length: 6 }, () => ({ tenantId: "org1", riskLevel: "LOW" }));
  assert.equal(projectInstituteHealth({ actor: teacher, tenantId: "org1", records }).allowed, false);
  assert.equal(projectInstituteHealth({ actor: manager, tenantId: "org1", records: [{ tenantId: "other" }, ...records] }).allowed, false);
});
test("official ELYORA integration fails closed until contract verified", async () => {
  await assert.rejects(invokeElyoraPractice({}), (e) => e.code === "BLOCKED_NOT_CONNECTED");
});
