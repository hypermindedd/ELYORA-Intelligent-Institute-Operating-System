# ADR-EI-009 — Versioned learning scope HTTP boundary

**Status** Proposed for connected use. The HTTP handler and port contract are exercised offline.  
**Date** 2026-11-08

## Decision

Expose three versioned operations over the existing Institute directive model. A student can read their effective scope. An assigned teacher can inspect lifecycle metadata and approve or revoke a directive. Institute Command remains an aggregate consumer. A verified bearer token is passed to a server-supplied authenticator that returns the actor, role and current tenant. Request identifiers select a resource within that tenant. Cookie-only authentication and browser-supplied role, tenant, assignment or directive content do not participate. Responses use no-store. Missing and unauthorized resources share the same 404.

The Institute repository port reads a consistent snapshot of the directive and its current assignment by tenant and ID. It supplies separate opaque revisions for each. The directive's existing version field remains unchanged and does not serve as the concurrency token. The teacher GET supplies a strong ETag. Writes require the corresponding If-Match and no request body. An expired proposal cannot be approved. An approved directive can still be revoked after expiry. Legacy directives continue on their existing path. This HTTP contract does not make them writable.

## Persistence contract

`loadScope({ tenantId, directiveId })` returns null or `{ directive, assignment, revision, assignmentRevision }`. Both revisions are nonempty tokens of 1–128 ASCII letters, digits, underscores or hyphens. The snapshot must resolve the currently active assignment for the directive. The handler reuses domain validation, teaching authority and the student allowlist. In a connected implementation, reads must enforce current membership and observe directive and assignment together at the read boundary.

`commitScope({ actorId, tenantId, directive, expectedRevision, expectedAssignmentRevision })` returns true on a committed transition and false on a lost precondition. Before persisting, recheck the actor's current tenant membership and teaching authority and both revisions in one transaction. Check approval expiry against the trusted commit-time clock. A successful commit must advance the revision without recycling it and atomically persist the state and its versioned outbox record. A stale retry does not perform a second write and returns 412, after which clients can re-read. Storage errors surface as a generic 503. Consumers must handle uncertain commits by re-reading and must deduplicate outbox delivery. No durable event is produced by the HTTP handler itself.

## Alternatives and release gates

Putting auth or persistence in the preview server would mix offline UI assets with authoritative operations. Passing actor or directive fields from the client would allow tenant and scope spoofing. An isolated injectable handler keeps preview and ELYORA ports unchanged while testing actual HTTP request/response semantics.

Before mounting the handler, verify token signature, audience, expiry and current membership with the official identity integration, implement the transaction and outbox, define durable event payload and privacy routing, verify retry and rollback against the authoritative store, and exercise cross-tenant/direct-link regressions in connected staging. There is no database migration or live endpoint in this increment.

[OpenAPI contract](../../contracts/openapi/learning-scope.v1.json) · [Shared scope policy](ADR-EI-008.md) · [A2](https://github.com/hypermindedd/ELYORA-Intelligent-Institute-Operating-System/issues/3) · [A3](https://github.com/hypermindedd/ELYORA-Intelligent-Institute-Operating-System/issues/4)

[ADR-EI-010](ADR-EI-010.md) provides the transaction-port implementation and the versioned outbox fact.
