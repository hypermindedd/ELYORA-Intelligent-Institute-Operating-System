# Next engineering increment: A2/A3 contract and backend foundation
1. Obtain authorized canonical ELYORA interface and version evidence; if unavailable continue with a strictly blocked adapter.
2. Define server-trusted actor context and real resource membership lookup; remove any reliance on an externally forgeable `serverAuthenticated` flag at API boundary.
3. Add real persistence design (PostgreSQL suggested, not yet approved): tenant/assignments/directives/session rooms, transactional outbox, tenant isolation, audit.
4. Implement versioned OpenAPI for directive proposal/approval/revoke, room eligibility and student-scoped read model; reject tenant/role/resource from client as an authority claim.
5. Add complete JSON Schema Draft-2020-12 instance validation, event versioning tests, property-based negative authorization tests, threat review, reconnect cursor model.
6. Integrate Institute Command, Teacher Leader, Guided Student BFF only after server authorization connected staging passes.
7. Derive ELYORA test adapter from **official** contract without rewriting protected education engines.

### Exit gates
- all negative cross-tenant/student/private access tests pass in a connected staging backend;
- durable publish / idempotency / replay verified;
- direct deep-link and client-header impersonation blocked;
- role projections contain only whitelisted fields;
- security audit and migration / rollback evidence attached;
- no claim of real education until official ELYORA adapter is connected and tested.

### Current blockers
Canonical parent live API and actual inherited BUILD-23 code location unknown; legal privacy/retention and identity backend configuration not yet approved. No secrets should be stored in this repository.
