# ADR-EI-012 — Tenant-scoped delivery of learning scope events

**Status** Proposed. The worker runs against the existing PostgreSQL outbox in a disposable integration environment.  
**Depends on** [ADR-EI-010](ADR-EI-010.md) and [ADR-EI-011](ADR-EI-011.md).

The scheduler supplies an authorized tenant. Each invocation leases at most one pending event using a short row lock and a unique token. The transaction commits the lease before invoking the private publisher. An acknowledgement or retry must match the current token. A stale worker cannot alter a newer lease. Workers in the same tenant may compete without leasing the same event simultaneously.

A lease lasts 60 seconds. On a known publish failure, persist the next attempt using exponential backoff starting at 5 seconds. After five attempts, put the event in a terminal failed state. An expired fifth lease also becomes terminal when a worker checks that tenant again. Terminal events remain available to a separately authorized operator workflow. Store neither publisher exceptions nor raw tokens in the event envelope.

The worker provides at-least-once delivery. A crash or connection failure after publication and before acknowledgement can publish the same event again. The consumer must deduplicate by tenant and event ID in the same transaction as its side effect. A consumer that needs current scope must re-read the authoritative view. The internal invalidation consumer persists a single marker keyed by tenant and event ID. It stores the directive selector and omits the envelope, teacher and student identifiers. The marker instructs a future authorized reader to re-fetch current state. It does not contain a versioned scope or convey access. Queue order does not imply directive revision order. The publisher must be private and tenant-aware and enforce a deadline shorter than the lease. This is not a public, realtime, or browser feed.

Holding the database lock across publication would tie database capacity to external latency. Publishing without a lease would let competing workers claim the same row. The lease protocol releases connections during publication and gives explicit recovery semantics.

The migration is additive. On rollback, stop workers before reverting code and retain delivery metadata and events. Before enabling staging, provide the authorized tenant scheduler, the private consumer with reviewed grants and operations for monitoring, failed-event review and recovery. Review worker-role grants separately from API-role grants. Real identity-provider settings and staging access remain separate gates.

[Delivery migration](../../db/migrations/002_learning_scope_outbox_delivery.sql) · [Worker adapter](../../src/adapters/postgres-scope-outbox.mjs)
