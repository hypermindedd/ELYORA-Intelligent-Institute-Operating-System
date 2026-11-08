BEGIN;

ALTER TABLE ei_scope.outbox
  ADD COLUMN available_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  ADD COLUMN attempt_count integer NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
  ADD COLUMN lease_token uuid,
  ADD COLUMN lease_until timestamptz,
  ADD COLUMN delivered_at timestamptz,
  ADD COLUMN dead_lettered_at timestamptz,
  ADD CONSTRAINT outbox_consistent_lease CHECK (
    (lease_token IS NULL) = (lease_until IS NULL)
    AND num_nonnulls(delivered_at, dead_lettered_at) <= 1
    AND (num_nonnulls(delivered_at, dead_lettered_at) = 0 OR lease_token IS NULL)
  );

CREATE INDEX outbox_pending_by_tenant ON ei_scope.outbox (tenant_id, available_at, occurred_at, event_id)
  WHERE delivered_at IS NULL AND dead_lettered_at IS NULL;

CREATE TABLE ei_scope.scope_invalidation (
  tenant_id text NOT NULL,
  event_id uuid NOT NULL,
  directive_id text NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  PRIMARY KEY (tenant_id, event_id)
);
ALTER TABLE ei_scope.scope_invalidation ENABLE ROW LEVEL SECURITY;
ALTER TABLE ei_scope.scope_invalidation FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON ei_scope.scope_invalidation
  USING (tenant_id = nullif(current_setting('ei_os.tenant_id', true), ''));

COMMIT;
