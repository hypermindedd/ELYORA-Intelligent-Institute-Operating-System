# ADR-EI-007 — Guided practice handoff and current assignment

Status: proposed for connected use. The offline composition is implemented under the existing Institute policy boundary.

The Institute assigns a teacher to a student and owns directive approval. Guided Student may request practice inside that directive. The parent ELYORA service alone owns education execution, assessment and mastery.

Compose the existing policy and language-scoped directive checks in one application entry point. An approved directive alone is insufficient when the current assignment is inactive, belongs to a different institution, or points to another teacher or student. The request to the adapter uses a field allowlist. This proposal defines an internal interface. The external adapter stays closed until a verified official contract exists.

A browser-owned handoff would make client state authoritative. Calling the parent directly from the directive domain would mix policy with transport. Separate services would add a deployment and consistency boundary before there is evidence of independent scaling needs.

Consumers must treat a permitted scope, a successful external start and educational evidence as distinct outcomes. The offline increment runs in memory behind the application boundary. For connected operation use a transaction that rechecks assignment and directive version, reserves time, persists the command key and emits an outbox record. Retry uncertain remote outcomes only after reconciling the same operation key. Require version-compatible parent evidence, revocation behavior, role isolation and redaction before deployment.

Rollback the offline composition by removing its application wiring. Connected rollback requires a compensating cancellation, preserved evidence and a versioned migration plan. Owner approval for a canonical promotion remains pending.
