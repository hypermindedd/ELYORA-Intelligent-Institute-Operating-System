BEGIN;

CREATE TABLE ei_scope.assignment_revocation_audit (
  tenant_id text NOT NULL,
  request_id uuid NOT NULL,
  owner_subject text NOT NULL,
  teacher_id text NOT NULL,
  student_id text NOT NULL,
  previous_revision text NOT NULL,
  revoked_revision text NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  PRIMARY KEY (tenant_id, request_id)
);

ALTER TABLE ei_scope.assignment_revocation_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE ei_scope.assignment_revocation_audit FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON ei_scope.assignment_revocation_audit
  USING (tenant_id = nullif(current_setting('ei_os.tenant_id', true), ''));

COMMIT;
