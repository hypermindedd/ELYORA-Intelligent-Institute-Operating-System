BEGIN;

ALTER TABLE ei_scope.assignment ADD COLUMN generation uuid NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE ei_scope.directive ADD COLUMN assignment_generation uuid;

-- The migration owner backfills every tenant while both tables are locked.
ALTER TABLE ei_scope.assignment NO FORCE ROW LEVEL SECURITY;
ALTER TABLE ei_scope.directive NO FORCE ROW LEVEL SECURITY;
UPDATE ei_scope.directive d SET assignment_generation = a.generation
FROM ei_scope.assignment a
WHERE (d.tenant_id, d.teacher_id, d.student_id) = (a.tenant_id, a.teacher_id, a.student_id);
ALTER TABLE ei_scope.assignment FORCE ROW LEVEL SECURITY;
ALTER TABLE ei_scope.directive FORCE ROW LEVEL SECURITY;
ALTER TABLE ei_scope.directive ALTER COLUMN assignment_generation SET NOT NULL;

CREATE FUNCTION ei_scope.bind_directive_assignment_generation() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  current_generation uuid;
BEGIN
  SELECT generation INTO current_generation FROM ei_scope.assignment
  WHERE tenant_id = NEW.tenant_id AND teacher_id = NEW.teacher_id AND student_id = NEW.student_id
    AND status = 'active';

  IF current_generation IS NULL OR
     (NEW.assignment_generation IS NOT NULL AND NEW.assignment_generation <> current_generation) THEN
    RAISE EXCEPTION 'Directive requires the current active assignment generation' USING ERRCODE = '23514';
  END IF;
  NEW.assignment_generation := current_generation;
  RETURN NEW;
END;
$$;

CREATE TRIGGER bind_directive_assignment_generation BEFORE INSERT ON ei_scope.directive
FOR EACH ROW EXECUTE FUNCTION ei_scope.bind_directive_assignment_generation();

CREATE TABLE ei_scope.assignment_grant_audit (
  tenant_id text NOT NULL,
  request_id uuid NOT NULL,
  owner_subject text NOT NULL,
  teacher_id text NOT NULL,
  student_id text NOT NULL,
  previous_revision text,
  granted_revision text NOT NULL,
  granted_generation uuid NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  PRIMARY KEY (tenant_id, request_id)
);

ALTER TABLE ei_scope.assignment_grant_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE ei_scope.assignment_grant_audit FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON ei_scope.assignment_grant_audit
  USING (tenant_id = nullif(current_setting('ei_os.tenant_id', true), ''));

COMMIT;
