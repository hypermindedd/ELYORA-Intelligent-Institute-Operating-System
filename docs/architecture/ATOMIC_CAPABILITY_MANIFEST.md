# Atomic capability manifest contract — mandatory for new modules
Each domain capability must declare:
```yaml
capability_id: I05.scope.approve
owner: InstitutePolicy
source_of_truth: InstituteDirectiveStore
input_contract: LearningScopeDirectiveV1
output_contract: ScopeApprovalDecisionV1
command_permission: tenant.teacher.assigned_student.scope.approve
event_types: [LearningScopeDirectiveApprovedV1]
projection_consumers: [StudentPrivateCabin, TeacherAssignedStudentView]
classification: student_private
idempotency: required
retry_policy: no_raw_privileged_retry_without_reauth
telemetry: redacted_correlation_id_only
rollback: compensating_revocation_event
test_evidence: REQUIRED_BEFORE_CONNECTED_PASS
status: IN_DESIGN
```
Definition independence: no domain internal table or UI component as another module's contract; event facts never substitute commands, and derived intelligence never modifies ELYORA Mastery. A conceptual engine may expose many atomic capabilities without being its own microservice.
