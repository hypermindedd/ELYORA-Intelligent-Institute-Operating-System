/**
 * OFFLINE SIMULATION ONLY — not a connected authentication, media or ELYORA test.
 */
import { approveDirective, evaluatePracticeAccess } from "../src/domain/learning-scope.mjs";
import { evaluateRoomEligibility } from "../src/domain/rooms.mjs";
import { invokeElyoraPractice } from "../src/adapters/elyora-port.mjs";

const now = "2026-11-07T12:30:00.000Z";
const teacher = { actorId: "t1", role: "teacher", tenantId: "school1", serverAuthenticated: true }; // simulated trusted server context
const student = { actorId: "s1", role: "student", tenantId: "school1", serverAuthenticated: true };
const assignment = { teacherId: "t1", studentId: "s1", tenantId: "school1", status: "active" };
const directive = {
  directiveId: "d1", version: 1, tenantId: "school1", studentId: "s1",
  teacherId: "t1", programId: "english-a1", allowedTopics: ["greetings"],
  excludedTopics: [], allowedActivityTypes: ["conversation"],
  maxSessionMinutes: 20, startsAt: "2026-11-07T12:00:00.000Z",
  expiresAt: "2026-11-07T13:00:00.000Z", status: "proposed"
};
const approval = approveDirective({ directive, actor: teacher, assignment });
if (!approval.allowed) throw Error("Offline approval expectation failed");
const access = evaluatePracticeAccess({
  directive: approval.directive, actor: student,
  activity: { programId: "english-a1", topicId: "greetings", activityType: "conversation", minutes: 15 },
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
let elyora = "UNKNOWN";
try { await invokeElyoraPractice(access); } catch (error) { elyora = error.code; }
if (elyora !== "BLOCKED_NOT_CONNECTED") throw Error("ELYORA must fail closed without a verified contract");
console.log(JSON.stringify({
  mode: "OFFLINE_SIMULATION_NOT_PRODUCTION",
  directive: approval.directive.status, scopeDecision: access.reason,
  roomDecision: roomEligibility.reason,
  elyoraIntegration: elyora, liveEducation: "NOT_TESTED"
}, null, 2));
