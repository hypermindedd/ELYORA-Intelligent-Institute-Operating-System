# Implementation and verification checklist

## Adapt the pattern

| Decision | What to establish |
| --- | --- |
| Atomic write | One owning transaction stores the domain state and the fact. Capture tenant, event ID, type, version, occurrence time, and the minimum payload. Recheck active authority and expected revisions at commit time. |
| Claim | Filter by tenant, ready time, terminal state, and lease expiry. Use a row-locking claim such as PostgreSQL `FOR UPDATE SKIP LOCKED` when available. Commit the claim before publishing. Set the lease and increment the attempt in the same statement or transaction. |
| Finish | Match tenant, event ID, and lease token. If the lease was reclaimed, return a stale result. Compute retry eligibility using the database clock and bound backoff and attempts. Use an index aligned with pending-by-tenant lookup. |
| Consumer | Insert a receipt keyed by tenant and event ID with the side effect in one transaction. If the sink is external, use its durable idempotency mechanism. For invalidation, store only a selector and let authorized reads fetch current state. |
| Privacy and recovery | Scope every read and mutation by tenant, including repair jobs. Apply database isolation where available and verify with a non-bypass application role. Separate runtime privileges. Record terminal facts for review and keep raw exception text out of shared metadata. |
| Rollout | Apply an additive migration in a disposable database first. Provide bounded publisher timeouts, scheduling, backlog and terminal counters, retention, replay approval, and data-preserving rollback before deployment. |

A PostgreSQL design can use a transaction-local tenant setting and row policies for accidental cross-tenant SQL access. The server still decides which tenant the caller is authorized to process. A worker supplied with arbitrary untrusted tenant selectors would bypass that responsibility.

## Evidence matrix

| Scenario | Required observation |
| --- | --- |
| Failed event insert | State and fact both roll back. |
| Stale or concurrent command | At most one committed transition and one fact. |
| Two workers, one ready fact | One active lease. The other worker cannot take it until expiry. |
| Acknowledgement lost after publish | A replay has the same event ID. Consumer effect happens once. |
| Expired lease recovered | A stale token cannot acknowledge or reschedule the new lease. |
| Known publish failure | Ready time advances. Retry retains event ID. Final failure or expired final lease reaches terminal state. |
| Tenant and role isolation | Same resource identifiers in separate tenants remain isolated. Worker and sink cannot read source records outside their grants. |
| Rollback and replay | Stopping the worker and rolling back code preserve facts and checkpoints. Validate restore and replay in the target environment before promotion. |

## Provenance

The reference implementation was verified on disposable PostgreSQL with distinct command, worker and consumer database roles. It used 60-second leases and five attempts as project-specific choices. See the [pinned EI-OS implementation](https://github.com/hypermindedd/ELYORA-Intelligent-Institute-Operating-System/tree/d6ca76d437b7fb8393122b37cf2145b331a39992/src/adapters), [ADR-EI-012](https://github.com/hypermindedd/ELYORA-Intelligent-Institute-Operating-System/blob/d6ca76d437b7fb8393122b37cf2145b331a39992/docs/adr/ADR-EI-012.md), and [8 PostgreSQL tests](https://github.com/hypermindedd/ELYORA-Intelligent-Institute-Operating-System/actions/runs/42459636377). Repository access is needed only for those examples. The workflow above is self-contained. That evidence does not establish a staging or production deployment.
