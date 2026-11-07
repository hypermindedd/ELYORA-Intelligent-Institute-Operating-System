/** Derived intelligence. Never writes ELYORA mastery/progression state. */
const fail = (reason) => ({ ok: false, reason });
export function proposeIntervention({ recommendationId, tenantId, subjectId, evidenceIds, reason }) {
  if (!recommendationId || !tenantId || !subjectId || !reason ||
      !Array.isArray(evidenceIds) || evidenceIds.length === 0) return fail("EVIDENCE_REQUIRED");
  return { ok: true, recommendation: Object.freeze({
    recommendationId, tenantId, subjectId, evidenceIds: [...evidenceIds],
    reason, status: "PROPOSED", actionId: null, outcomeId: null
  }) };
}

export function authorizeInterventionAction({ recommendation, manager, actionId, approved }) {
  if (!recommendation || recommendation.status !== "PROPOSED" ||
      !manager || manager.serverAuthenticated !== true || manager.tenantId !== recommendation.tenantId ||
      !["institute_manager", "assigned_teacher"].includes(manager.role) ||
      approved !== true || !actionId) return fail("ACTION_NOT_AUTHORIZED");
  return { ok: true, action: Object.freeze({
    actionId, recommendationId: recommendation.recommendationId,
    tenantId: recommendation.tenantId, actorId: manager.actorId, status: "ASSIGNED"
  }) };
}

export function measureInterventionOutcome({ action, measurement, observer }) {
  if (!action || !["COMPLETED", "IN_PROGRESS"].includes(action.status) ||
      !observer || observer.serverAuthenticated !== true || observer.tenantId !== action.tenantId ||
      !measurement || typeof measurement.metric !== "string" ||
      !Number.isFinite(measurement.observedValue) || !Number.isFinite(measurement.baselineValue) ||
      !Number.isFinite(measurement.windowDays) || measurement.windowDays <= 0) return fail("MEASUREMENT_NOT_VALID");
  return { ok: true, outcome: Object.freeze({
    actionId: action.actionId, tenantId: action.tenantId,
    metric: measurement.metric, baselineValue: measurement.baselineValue,
    observedValue: measurement.observedValue, windowDays: measurement.windowDays,
    measuredBy: observer.actorId, status: "MEASURED"
  }) };
}
