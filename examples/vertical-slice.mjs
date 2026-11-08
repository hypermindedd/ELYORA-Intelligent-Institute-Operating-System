/**
 * OFFLINE SIMULATION ONLY — not a connected authentication, media or ELYORA test.
 */
import { approveLanguageScopedDirective } from "../src/domain/language-scoped-activity.mjs";
import { startGuidedPractice } from "../src/application/guided-practice.mjs";
import { readGuidedLearningScope } from "../src/application/guided-scope.mjs";
import { evaluateRoomEligibility } from "../src/domain/rooms.mjs";

const now = "2026-11-07T12:30:00.000Z";
const teacher = { actorId: "t1", role: "teacher", tenantId: "school1", serverAuthenticated: true }; // simulated trusted server context
const student = { actorId: "s1", role: "student", tenantId: "school1", serverAuthenticated: true };
const assignment = { teacherId: "t1", studentId: "s1", tenantId: "school1", status: "active" };
const directive = {
  directiveId: "d1", version: 2, tenantId: "school1", studentId: "s1",
  teacherId: "t1", programId: "english-a1", programVersion: "demo-english-a1",
  targetLanguageCode: "en", localeVariant: "en-US", instructionLocale: "fa-IR", allowedTopics: ["greetings"],
  excludedTopics: [], allowedActivityTypes: ["conversation"],
  maxSessionMinutes: 20, startsAt: "2026-11-07T12:00:00.000Z",
  expiresAt: "2026-11-07T13:00:00.000Z", status: "proposed"
};
const approval = approveLanguageScopedDirective({ directive, actor: teacher, assignment });
if (!approval.allowed) throw Error("Offline approval expectation failed");
const view = readGuidedLearningScope({ directive: approval.directive, actor: student, assignment, at: now });
if (!view.allowed || !view.data.allowedTopics.includes("greetings")) {
  throw Error("Offline student-view expectation failed");
}
const access = await startGuidedPractice({
  directive: approval.directive, actor: student, assignment,
  activity: { programId: "english-a1", programVersion: "demo-english-a1", targetLanguageCode: "en",
    localeVariant: "en-US", topicId: "greetings", activityType: "conversation", minutes: 15 },
  at: now
});
if (!access.allowed) throw Error("Offline student-scope expectation failed");
const room = {
  roomId: "r1", tenantId: "school1", classId: "c1", roomType: "classroom",
  status: "active", startsAt: "2026-11-07T12:00:00.000Z", expiresAt: "2026-11-07T13:00:00.000Z"
};
const roomEligibility = evaluateRoomEligibility({ room, actor: student,
  enrollment: { ...assignment, classId: "c1" }, at: now });
if (!roomEligibility.allowed) throw Error("Offline room-eligibility expectation failed");
if (access.integration !== "BLOCKED_NOT_CONNECTED") throw Error("ELYORA must fail closed without a verified contract");
console.log(JSON.stringify({
  mode: "OFFLINE_SIMULATION_NOT_PRODUCTION",
  directive: approval.directive.status, studentScopeReadable: view.allowed, scopeDecision: access.reason,
  roomDecision: roomEligibility.reason,
  elyoraIntegration: access.integration, liveEducation: "NOT_TESTED"
}, null, 2));
