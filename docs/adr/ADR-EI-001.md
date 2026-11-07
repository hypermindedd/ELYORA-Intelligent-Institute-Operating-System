# ADR-EI-001 — Bounded modular monolith
**Status:** PROPOSED / awaiting explicit owner approval. **Date:** 2026-11-07.
## Context and problem
New multilingual Institute requires replaceable, auditable components while preserving ELYORA owner boundaries and protected BUILD-23.
## Proposed decision
Organizational bounded contexts in one deployable backend initially; separate slow workers and media providers; expand by observed need.
## Alternatives considered
Single cross-domain unstructured service: rejected (coupling). Immediate microservices: deferred (operations and consistency cost). Silent duplication of ELYORA engines: prohibited.
## Consequences and affected contracts
Domain leakage, eventual consistency, migrations; contract tests and outbox required.
Affected: Institute source-of-truth matrix; Authorization, LearningScopeDirective, VirtualRoom, event/projection contracts as applicable. Security, privacy, migration and regression gates must be recorded before implementation release.
## Approval
No implied ratification. Owner review / accepted-by / date: PENDING.
