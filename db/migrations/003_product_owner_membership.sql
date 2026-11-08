BEGIN;

ALTER TABLE ei_scope.membership ADD COLUMN revision uuid NOT NULL DEFAULT gen_random_uuid();

CREATE TABLE ei_scope.membership_audit (
  tenant_id text NOT NULL,
  request_id uuid NOT NULL,
  owner_subject text NOT NULL,
  actor_id text NOT NULL,
  old_role text NOT NULL,
  old_active boolean NOT NULL,
  new_role text NOT NULL,
  new_active boolean NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  PRIMARY KEY (tenant_id, request_id)
);

ALTER TABLE ei_scope.membership_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE ei_scope.membership_audit FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON ei_scope.membership_audit
  USING (tenant_id = nullif(current_setting('ei_os.tenant_id', true), ''));

COMMIT;
