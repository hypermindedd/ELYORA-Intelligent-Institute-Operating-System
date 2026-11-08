# ADR-EI-011 — PostgreSQL scope persistence candidate

**Status** Proposed. Run the candidate against a disposable PostgreSQL instance before considering connected staging.  
**Depends on** [ADR-EI-009](ADR-EI-009.md) and [ADR-EI-010](ADR-EI-010.md).

A PostgreSQL adapter implements the existing Institute ports. It keeps membership, assignment, scope, and outbox under tenant keys. Directive details remain in the versioned document while scope and assignment relationships use composite keys. A single query reads a directive and current assignment and checks active membership. Writes lock membership and assignment, compare both revisions, and commit the scope and outbox together. Serializable/deadlock failures are failed preconditions; ambiguous connection failures require a fresh authorized read.

Row-level policies deny access without a transaction-local tenant context. The adapter sets the context only from the verified session or an internal trusted command. A connected database role must be non-superuser and lack BYPASSRLS. Row-level policies guard accidental cross-tenant queries; application authorization still governs actor, role and resource. The test role has the permissions needed for row locking. Before staging, review narrower runtime grants or an audited storage procedure, establish provisioning and retention, and validate the real identity and tenant mapping.

The verifier port accepts a bearer token and returns verified identity and tenant context. The server resolves membership and role from the database. An identity adapter must validate signature, issuer, audience, expiry and tenant mapping before returning context. No token issuer, production connection or migration target is chosen here.

A single transactional database avoids split writes between separate state and event stores. Keep this candidate additive under an isolated schema. For rollback, unmount the route and stop event consumers, preserve the stored data and outbox for recovery, then revert application code. Do not drop the schema during rollback. No migration runs at application startup.

[Migration](../../db/migrations/001_learning_scope.sql) · [Persistence and handler assembly](../../src/adapters/postgres-learning-scope.mjs) · [A3](https://github.com/hypermindedd/ELYORA-Intelligent-Institute-Operating-System/issues/4)
