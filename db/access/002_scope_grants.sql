-- Apply after scope migrations 001 through 005 in each Institute database.
BEGIN;
GRANT USAGE ON SCHEMA ei_scope TO ei_scope_api, ei_scope_delivery, ei_scope_projection, ei_scope_governance;

GRANT SELECT ON ei_scope.membership, ei_scope.assignment, ei_scope.directive TO ei_scope_api;
-- PostgreSQL requires UPDATE on at least one column for the row locks used by the committer.
GRANT UPDATE (actor_id) ON ei_scope.membership TO ei_scope_api;
GRANT UPDATE (revision) ON ei_scope.assignment TO ei_scope_api;
GRANT UPDATE (document, revision) ON ei_scope.directive TO ei_scope_api;
GRANT INSERT (tenant_id, event_id, occurred_at, envelope) ON ei_scope.outbox TO ei_scope_api;

GRANT SELECT ON ei_scope.outbox TO ei_scope_delivery;
GRANT UPDATE (available_at, attempt_count, lease_token, lease_until, delivered_at, dead_lettered_at)
  ON ei_scope.outbox TO ei_scope_delivery;

GRANT INSERT (tenant_id, event_id, directive_id) ON ei_scope.scope_invalidation TO ei_scope_projection;

GRANT SELECT ON ei_scope.membership, ei_scope.assignment TO ei_scope_governance;
GRANT UPDATE (role, active, revision) ON ei_scope.membership TO ei_scope_governance;
GRANT INSERT (tenant_id, teacher_id, student_id, revision, status) ON ei_scope.assignment TO ei_scope_governance;
GRANT UPDATE (status, revision, generation) ON ei_scope.assignment TO ei_scope_governance;
GRANT INSERT ON ei_scope.membership_audit, ei_scope.assignment_revocation_audit, ei_scope.assignment_grant_audit TO ei_scope_governance;
COMMIT;
