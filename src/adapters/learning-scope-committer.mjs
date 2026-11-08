import { randomUUID } from "node:crypto";
import { transitionLearningScope } from "../application/learning-scope-transition.mjs";

/**
 * The transaction host locks or serializes authority and scope reads, commits
 * only on success, and rolls back both writes if the callback rejects.
 */
export function createLearningScopeCommitter({ transact, now = Date.now }) {
  return function commitScope({ actorId, tenantId, directive, expectedRevision, expectedAssignmentRevision }) {
    return transact(async ({ loadActor, loadScope, putScope, enqueue }) => {
      const actor = await loadActor({ actorId, tenantId });
      if (!actor || actor.actorId !== actorId || actor.tenantId !== tenantId) return false;
      const current = await loadScope({ tenantId, directiveId: directive.directiveId });
      if (!current?.directive || current.directive.tenantId !== tenantId ||
          current.directive.directiveId !== directive.directiveId ||
          current.revision !== expectedRevision || current.assignmentRevision !== expectedAssignmentRevision) return false;

      const occurredAt = new Date(now()).toISOString();
      const next = transitionLearningScope({
        directive: current.directive, actor, assignment: current.assignment,
        status: directive.status, at: occurredAt
      });
      if (!next) return false;

      const revision = randomUUID();
      const eventId = randomUUID();
      await putScope({ directive: next, revision });
      await enqueue({
        eventId, eventType: "institute.learning_scope." + next.status,
        schemaVersion: 1, occurredAt, tenantId, actorId, subjectId: next.studentId,
        correlationId: eventId, classification: "student_private",
        payload: { directiveId: next.directiveId, directiveVersion: next.version, revision }
      });
      return true;
    }, { tenantId });
  };
}
