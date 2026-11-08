import { randomUUID } from "node:crypto";

const membershipPath = /^\/api\/v1\/owner\/tenants\/([A-Za-z0-9_-]{1,128})\/memberships\/([A-Za-z0-9_-]{1,128})$/;
const assignmentPath = /^\/api\/v1\/owner\/tenants\/([A-Za-z0-9_-]{1,128})\/assignments\/([A-Za-z0-9_-]{1,128})\/([A-Za-z0-9_-]{1,128})(?:\/(revocation|grant))?$/;
const assignmentTag = /^"([A-Za-z0-9_-]{1,128})"$/;
const revisionPattern = /^"([0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12})"$/;
const roles = new Set(["teacher", "student", "institute_manager"]);

async function readPolicy(request) {
  if (!/^application\/json(?:\s*;\s*charset=utf-8)?$/i.test(request.headers.get("Content-Type") ?? "")) {
    return { status: 415, code: "JSON_REQUIRED" };
  }
  if (!request.body) return { status: 400, code: "INVALID_POLICY" };
  const reader = request.body.getReader();
  try {
    const decoder = new TextDecoder("utf-8", { fatal: true });
    let text = "";
    let size = 0;
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 1024) {
        await reader.cancel();
        return { status: 413, code: "POLICY_TOO_LARGE" };
      }
      text += decoder.decode(value, { stream: true });
    }
    const policy = JSON.parse(text + decoder.decode());
    if (policy && Object.keys(policy).length === 2 && Object.hasOwn(policy, "role") &&
        Object.hasOwn(policy, "active") && roles.has(policy.role) && typeof policy.active === "boolean") return { policy };
  } catch {
    // Invalid bodies return the same bounded response.
  } finally {
    reader.releaseLock();
  }
  return { status: 400, code: "INVALID_POLICY" };
}

export function createProductOwnerHandler({
  ownerSubject, verifyBearer, readMembership, changeMembership, readAssignment, revokeAssignment, grantAssignment
}) {
  if (typeof ownerSubject !== "string" || !ownerSubject.trim()) throw TypeError("Verified owner subject required");
  return async function handleProductOwner(request) {
    const requestId = randomUUID();
    const reply = (status, data, headers = {}) => Response.json({ ...data, requestId }, {
      status, headers: { "Cache-Control": "no-store", "X-Request-Id": requestId, ...headers }
    });
    const deny = (status, code, headers) => reply(status, { code }, headers);
    const notFound = () => deny(404, "NOT_FOUND");

    const { pathname, search } = new URL(request.url);
    const memberRoute = membershipPath.exec(pathname);
    const assignmentRoute = assignmentPath.exec(pathname);
    if (!memberRoute && !assignmentRoute) return notFound();
    const methods = memberRoute ? ["GET", "PUT"] : [assignmentRoute[4] ? "POST" : "GET"];
    if (!methods.includes(request.method)) return deny(405, "METHOD_NOT_ALLOWED", { Allow: methods.join(", ") });
    if (search || (assignmentRoute && request.body !== null)) return deny(400, "INVALID_REQUEST");

    const token = /^Bearer ([A-Za-z0-9._~+\/-]+=*)$/i.exec(request.headers.get("Authorization") ?? "")?.[1];
    if (!token) return deny(401, "UNAUTHENTICATED", { "WWW-Authenticate": "Bearer" });
    try {
      const identity = await verifyBearer(token);
      if (!identity?.subject) return deny(401, "UNAUTHENTICATED", { "WWW-Authenticate": "Bearer" });
      if (identity.subject !== ownerSubject) return notFound();
      if (identity.stepUpVerified !== true) return deny(403, "STEP_UP_REQUIRED");

      if (assignmentRoute) {
        const [, tenantId, teacherId, studentId, operation] = assignmentRoute;
        const target = { tenantId, teacherId, studentId };
        let assignment;
        if (operation) {
          const ifMatch = request.headers.get("If-Match");
          const ifNoneMatch = request.headers.get("If-None-Match");
          const createOnly = operation === "grant" && ifNoneMatch === "*";
          if (ifNoneMatch !== null && (!createOnly || ifMatch !== null)) return deny(400, "INVALID_REVISION");
          if (ifMatch === null && !createOnly) return deny(428, "REVISION_REQUIRED");
          const expectedRevision = ifMatch === null ? null : assignmentTag.exec(ifMatch)?.[1];
          if (ifMatch !== null && !expectedRevision) return deny(400, "INVALID_REVISION");

          const command = { ...target, ownerSubject, expectedRevision, requestId };
          const result = operation === "grant" ? await grantAssignment(command) : await revokeAssignment(command);
          if (result?.changed === false) return deny(412, "ASSIGNMENT_CHANGED");
          if (result?.participantsUnavailable) return deny(409, "ASSIGNMENT_PARTICIPANTS_UNAVAILABLE");
          assignment = result?.assignment;
        } else {
          assignment = await readAssignment(target);
        }
        if (!assignment) return notFound();
        return reply(200, { assignment: { ...target, status: assignment.status } },
          { ETag: `"${assignment.revision}"` });
      }

      const [, tenantId, actorId] = memberRoute;
      let membership;
      if (request.method === "GET") {
        membership = await readMembership({ tenantId, actorId });
      } else {
        const ifMatch = request.headers.get("If-Match");
        if (ifMatch === null) return deny(428, "REVISION_REQUIRED");
        const expectedRevision = revisionPattern.exec(ifMatch)?.[1];
        if (!expectedRevision) return deny(400, "INVALID_REVISION");
        const { policy, status, code } = await readPolicy(request);
        if (!policy) return deny(status, code);
        const result = await changeMembership({ tenantId, actorId, ownerSubject, expectedRevision, requestId, policy });
        if (result?.changed === false) return deny(412, "MEMBERSHIP_CHANGED");
        membership = result?.membership;
      }
      if (!membership) return notFound();
      return reply(200, { membership: { tenantId, actorId, role: membership.role, active: membership.active } },
        { ETag: `"${membership.revision}"` });
    } catch {
      return deny(503, "OWNER_CONTROL_UNAVAILABLE");
    }
  };
}
