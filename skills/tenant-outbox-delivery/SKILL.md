---
name: tenant-outbox-delivery
description: Build or audit a tenant-scoped transactional outbox with safe retries, lease recovery, and idempotent consumers. Use for durable database-backed event delivery across application modules.
---

# Tenant Outbox Delivery

Use this pattern when a domain update and its event must survive failures together. Inspect the repository's existing transaction boundary, tenant isolation, event envelope, consumer, and release evidence. Preserve compatible ports and versions.

## Design and implement

1. Name the authoritative writer, the event audience, and the consumer effect. Derive the tenant from trusted context. Define a versioned fact with the minimum routing data and a stable event ID. Use a separate opaque concurrency revision when a schema version also exists.
2. In one database transaction, reauthorize current state, apply the transition, and append the fact. A failed append rolls back the state change. A stale command or retry must not append a second fact. After an ambiguous commit, reconcile against the authoritative record before sending a new command.
3. Claim work in a short, tenant-scoped transaction. A lease has a unique token, expiry, and attempt number. Release the database connection before invoking the publisher. Acknowledge or reschedule only while the stored token still matches. Reclaim expired leases and define how an expired final lease reaches terminal state. Keep backoff, attempt limit, and publisher deadline configurable for the deployment.
4. Treat delivery as at least once. Deduplicate on tenant and event ID in the same transaction as the consumer effect. Use a minimal invalidation and re-read authorized current state when ordering or privacy matters. The consumer or transport may see the same fact after a publish succeeds but acknowledgement fails.
5. Separate command, delivery, consumer, and operator privileges. Keep raw errors and private payloads out of broad logs and projections. Define an authorized recovery path for terminal events. On rollback, stop delivery and preserve facts and delivery metadata.

## Verify and hand off

Use the [implementation and verification checklist](references/implementation-checklist.md) for storage design, concurrency tests, and release gates. For a new project, deliver a storage migration or compatible adapter, a versioned event contract, recovery tests, and an evidence record tied to the source revision. If the request is an audit, return findings and missing evidence without changing deployment state.

A mocked queue can prove control flow. Verify locks, tenant filtering, rollback, and lease fencing against the actual database engine before labeling them verified. Track deployment, provider, and operations evidence separately. Read the [Persian transfer note](references/handoff-fa.md) when installing the skill on another Mac or moving it to another account.
