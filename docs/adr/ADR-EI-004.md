# ADR-EI-004 — Private cabins and rooms-first composition
**Status:** PROPOSED / awaiting explicit owner approval. **Date:** 2026-11-07.
## Context and problem
New multilingual Institute requires replaceable, auditable components while preserving ELYORA owner boundaries and protected BUILD-23.
## Proposed decision
Design Student/Teacher/Command workspaces and classroom resource ownership as durable bounded domains before UI; room presence not attendance.
## Alternatives considered
Single cross-domain unstructured service: rejected (coupling). Immediate microservices: deferred (operations and consistency cost). Silent duplication of ELYORA engines: prohibited.
## Consequences and affected contracts
Deep links, recording consent, tenant isolation, private notes and media tokens.
Affected: Institute source-of-truth matrix; Authorization, LearningScopeDirective, VirtualRoom, event/projection contracts as applicable. Security, privacy, migration and regression gates must be recorded before implementation release.
## Approval
No implied ratification. Owner review / accepted-by / date: PENDING.
