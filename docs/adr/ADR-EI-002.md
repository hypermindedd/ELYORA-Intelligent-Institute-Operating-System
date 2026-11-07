# ADR-EI-002 — Teacher-governed student learning scope
**Status:** PROPOSED / awaiting explicit owner approval. **Date:** 2026-11-07.
## Context and problem
New multilingual Institute requires replaceable, auditable components while preserving ELYORA owner boundaries and protected BUILD-23.
## Proposed decision
Teacher authors/enforces scope through Institute server; ELYORA may propose, not silently expand; student has no grant authority.
## Alternatives considered
Single cross-domain unstructured service: rejected (coupling). Immediate microservices: deferred (operations and consistency cost). Silent duplication of ELYORA engines: prohibited.
## Consequences and affected contracts
Stale directives, revoked permissions, timing and cross-tenant bypass; versioned audit required.
Affected: Institute source-of-truth matrix; Authorization, LearningScopeDirective, VirtualRoom, event/projection contracts as applicable. Security, privacy, migration and regression gates must be recorded before implementation release.
## Approval
No implied ratification. Owner review / accepted-by / date: PENDING.
