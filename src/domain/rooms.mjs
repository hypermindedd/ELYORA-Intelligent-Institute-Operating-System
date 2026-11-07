import { authorizeStudentIdentity, authorizeTenantManager } from "./policy.mjs";
const deny = (reason) => ({ allowed: false, reason });
const validDate = (s) => typeof s === "string" && Number.isFinite(Date.parse(s));
const hasId = (s) => typeof s === "string" && s.length > 0;

/**
 * Authorization eligibility only. This is NOT a signed live-room token,
 * official attendance, session recording permission or physical presence.
 */
export function evaluateRoomEligibility({ room, actor, enrollment, at }) {
  if (!room || !actor || actor.serverAuthenticated !== true || !hasId(room.roomId) || !hasId(room.tenantId)) return deny("UNAUTHENTICATED_OR_INVALID_ROOM");
  if (actor.tenantId !== room.tenantId) return deny("TENANT_DENIED");
  if (room.status !== "active") return deny("ROOM_INACTIVE");
  if (!validDate(at) || !validDate(room.startsAt) || !validDate(room.expiresAt) ||
      Date.parse(room.startsAt) >= Date.parse(room.expiresAt)) return deny("INVALID_ROOM_TIME");
  if (Date.parse(at) < Date.parse(room.startsAt) || Date.parse(at) >= Date.parse(room.expiresAt)) return deny("ROOM_NOT_OPEN");
  if (room.roomType === "student_private") {
    const own = authorizeStudentIdentity({ actor, tenantId: room.tenantId, studentId: room.ownerId });
    return own.allowed ? { allowed: true, reason: "OWN_CABIN" } : deny("PRIVATE_ROOM_DENIED");
  }
  if (room.roomType === "teacher_private") {
    return actor.role === "teacher" && actor.actorId === room.ownerId
      ? { allowed: true, reason: "OWN_CABIN" } : deny("PRIVATE_ROOM_DENIED");
  }
  if (room.roomType === "institute_command") {
    return authorizeTenantManager({ actor, tenantId: room.tenantId });
  }
  if (room.roomType !== "classroom") return deny("UNKNOWN_ROOM_TYPE");
  if (!enrollment || enrollment.tenantId !== room.tenantId || enrollment.classId !== room.classId ||
      enrollment.status !== "active") return deny("CLASS_ENROLLMENT_DENIED");
  const allowedStudent = actor.role === "student" && actor.actorId === enrollment.studentId;
  const assignedTeacher = actor.role === "teacher" && actor.actorId === enrollment.teacherId;
  return allowedStudent || assignedTeacher
    ? { allowed: true, reason: "CLASS_MEMBERSHIP" }
    : deny("CLASS_ACTOR_DENIED");
}
