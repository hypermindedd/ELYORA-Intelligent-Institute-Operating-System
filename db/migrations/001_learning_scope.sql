BEGIN;

CREATE SCHEMA ei_scope;

CREATE TABLE ei_scope.membership (
  tenant_id text NOT NULL,
  actor_id text NOT NULL,
  role text NOT NULL CHECK (role IN ('teacher', 'student', 'institute_manager')),
  active boolean NOT NULL,
  PRIMARY KEY (tenant_id, actor_id)
);

CREATE TABLE ei_scope.assignment (
  tenant_id text NOT NULL,
  teacher_id text NOT NULL,
  student_id text NOT NULL,
  revision text NOT NULL CHECK (revision ~ '^[A-Za-z0-9_-]{1,128}$'),
  status text NOT NULL CHECK (status IN ('active', 'revoked')),
  PRIMARY KEY (tenant_id, teacher_id, student_id),
  FOREIGN KEY (tenant_id, teacher_id) REFERENCES ei_scope.membership (tenant_id, actor_id),
  FOREIGN KEY (tenant_id, student_id) REFERENCES ei_scope.membership (tenant_id, actor_id)
);

CREATE TABLE ei_scope.directive (
  tenant_id text NOT NULL,
  directive_id text NOT NULL,
  teacher_id text NOT NULL,
  student_id text NOT NULL,
  revision text NOT NULL CHECK (revision ~ '^[A-Za-z0-9_-]{1,128}$'),
  document jsonb NOT NULL,
  PRIMARY KEY (tenant_id, directive_id),
  FOREIGN KEY (tenant_id, teacher_id, student_id)
    REFERENCES ei_scope.assignment (tenant_id, teacher_id, student_id),
  CHECK (jsonb_typeof(document) = 'object'
    AND document->>'tenantId' IS NOT DISTINCT FROM tenant_id
    AND document->>'directiveId' IS NOT DISTINCT FROM directive_id
    AND document->>'teacherId' IS NOT DISTINCT FROM teacher_id
    AND document->>'studentId' IS NOT DISTINCT FROM student_id)
);

CREATE TABLE ei_scope.outbox (
  tenant_id text NOT NULL,
  event_id uuid NOT NULL,
  occurred_at timestamptz NOT NULL,
  envelope jsonb NOT NULL,
  PRIMARY KEY (tenant_id, event_id),
  CHECK (jsonb_typeof(envelope) = 'object'
    AND envelope->>'tenantId' IS NOT DISTINCT FROM tenant_id
    AND envelope->>'eventId' IS NOT DISTINCT FROM event_id::text
    AND envelope->>'classification' IS NOT DISTINCT FROM 'student_private')
);

DO $$
DECLARE
  relation text;
BEGIN
  FOREACH relation IN ARRAY ARRAY['membership', 'assignment', 'directive', 'outbox']
  LOOP
    EXECUTE format('ALTER TABLE ei_scope.%I ENABLE ROW LEVEL SECURITY', relation);
    EXECUTE format('ALTER TABLE ei_scope.%I FORCE ROW LEVEL SECURITY', relation);
    EXECUTE format(
      'CREATE POLICY tenant_isolation ON ei_scope.%I USING (tenant_id = nullif(current_setting(''ei_os.tenant_id'', true), ''''))',
      relation
    );
  END LOOP;
END;
$$;

COMMIT;
