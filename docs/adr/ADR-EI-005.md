# ADR-EI-005 — Configuration privilege versus confidential data
**Status:** PROPOSED / awaiting explicit owner approval. **Date:** 2026-11-07.
## Context and problem
New multilingual Institute requires replaceable, auditable components while preserving ELYORA owner boundaries and protected BUILD-23.
## Proposed decision
Allow authorized institute operators broad configuration rights, but private raw access requires separate policy, purpose, approval and audit.
## Alternatives considered
Single cross-domain unstructured service: rejected (coupling). Immediate microservices: deferred (operations and consistency cost). Silent duplication of ELYORA engines: prohibited.
## Consequences and affected contracts
Unbounded admin reads, staff impersonation, lack of retention/consent.
Affected: Institute source-of-truth matrix; Authorization, LearningScopeDirective, VirtualRoom, event/projection contracts as applicable. Security, privacy, migration and regression gates must be recorded before implementation release.
## Approval
No implied ratification. Owner review / accepted-by / date: PENDING.
