import { readGuidedLearningScope } from "../application/guided-scope.mjs";
import { transitionLearningScope } from "../application/learning-scope-transition.mjs";
import { validateLanguageScopedDirective } from "../domain/language-scoped-activity.mjs";
import { authorizeTeacherScope } from "../domain/policy.mjs";

const routePattern = /^\/api\/v1\/learning-scopes\/([A-Za-z0-9_-]{1,128})(?:\/(approval|revocation))?$/;
const revisionPattern = /^[A-Za-z0-9_-]{1,128}$/;
const ifMatchPattern = /^"([A-Za-z0-9_-]{1,128})"$/;

function respond(status, code, headers = {}) {
  const options = { status, headers: { "Cache-Control": "no-store", ...headers } };
  return code ? Response.json({ code }, options) : new Response(null, options);
}

function json(data, headers = {}) {
  return Response.json(data, { headers: { "Cache-Control": "no-store", ...headers } });
}

/** Server-only handler. The authenticator and store implement ADR-EI-009. */
export function createLearningScopeHandler({ authenticateBearer, loadScope, commitScope, now = Date.now }) {
  return async function handleLearningScope(request) {
    const { pathname, search } = new URL(request.url);
    const route = routePattern.exec(pathname);
    if (!route) return respond(404, "NOT_FOUND");
    const [, directiveId, operation] = route;
    const method = operation ? "POST" : "GET";
    if (request.method !== method) return respond(405, "METHOD_NOT_ALLOWED", { Allow: method });
    if (search || request.body !== null) return respond(400, "INVALID_REQUEST");

    const token = /^Bearer ([A-Za-z0-9._~+\/-]+=*)$/i.exec(request.headers.get("Authorization") ?? "")?.[1];
    if (!token) return respond(401, "UNAUTHENTICATED", { "WWW-Authenticate": "Bearer" });

    try {
      const actor = await authenticateBearer(token);
      if (actor?.serverAuthenticated !== true ||
          typeof actor.actorId !== "string" || !actor.actorId ||
          typeof actor.tenantId !== "string" || !actor.tenantId) {
        return respond(401, "UNAUTHENTICATED", { "WWW-Authenticate": "Bearer" });
      }

      const tenantId = actor.tenantId;
      const snapshot = await loadScope({ tenantId, directiveId, actorId: actor.actorId, role: actor.role });
      const directive = snapshot?.directive;
      if (directive?.tenantId !== tenantId || directive.directiveId !== directiveId) {
        return respond(404, "NOT_FOUND");
      }
      const { assignment, revision, assignmentRevision } = snapshot;
      if (!operation && actor.role === "student") {
        const view = readGuidedLearningScope({ actor, directive, assignment, at: new Date(now()).toISOString() });
        return view.allowed ? json(view.data) : respond(404, "NOT_FOUND");
      }

      const teacher = authorizeTeacherScope({ actor, tenantId, studentId: directive.studentId, assignment });
      if (!teacher.allowed || directive.teacherId !== actor.actorId ||
          !validateLanguageScopedDirective(directive).allowed) {
        return respond(404, "NOT_FOUND");
      }
      if (typeof revision !== "string" || !revisionPattern.test(revision) ||
          typeof assignmentRevision !== "string" || !revisionPattern.test(assignmentRevision)) {
        return respond(503, "SCOPE_UNAVAILABLE");
      }
      if (!operation) {
        return json({ directiveId, status: directive.status }, { ETag: `"${revision}"` });
      }

      const ifMatch = request.headers.get("If-Match");
      if (ifMatch === null) return respond(428, "REVISION_REQUIRED");
      const expected = ifMatchPattern.exec(ifMatch)?.[1];
      if (!expected) return respond(400, "INVALID_REVISION");
      if (expected !== revision) return respond(412, "SCOPE_CHANGED");

      const at = new Date(now()).toISOString();
      const status = operation === "approval" ? "approved" : "revoked";
      const next = transitionLearningScope({ directive, actor, assignment, status, at });
      if (!next) return respond(409, "INVALID_SCOPE_TRANSITION");
      const committed = await commitScope({
        actorId: actor.actorId, tenantId, directive: next,
        expectedRevision: revision, expectedAssignmentRevision: assignmentRevision
      });
      if (committed === false) return respond(412, "SCOPE_CHANGED");
      return committed === true ? respond(204) : respond(503, "SCOPE_UNAVAILABLE");
    } catch {
      return respond(503, "SCOPE_UNAVAILABLE");
    }
  };
}
