---
name: audited-owner-access
description: Build or audit product-owner controls for tenant-scoped access grants, suspension, revocation, and safe re-grant. Use when privileged API changes need enforceable authorization and transactional audit.
---

# Audited Owner Access

Find the authoritative identity binding, tenant and resource owners, role policy, existing reads and writes, and historical data before designing the owner route. Follow the target project's approved privacy and ownership rules. Treat product-wide governance and permission to read private records as separate capabilities.

## Authority and API

- Resolve identity on the server from the verified provider subject. Keep owner binding separate from ordinary membership, display identity, request headers, and provider role claims. Apply the project's fresh step-up policy. Keep a controlled recovery path outside ordinary role mutation. Never store login secrets in the skill or owner policy.
- Resolve tenant and target as selectors after verifying the privileged actor. Route to the owning domain command. Return an allowlisted view and a server-generated request ID. Keep authentication failure, unavailable resource, stale revision, invalid transition, and dependency failure distinguishable as policy permits.
- Use an explicit create-only precondition for a new grant and a strong opaque expected revision for changes. Require one intent. Recheck participants, role, status, and current revision in the transaction. Commit the authority change and an append-only audit entry together. Keep operator permissions to read the audit separate from permissions to write it.

## Lifecycle and verification

- Define reversible suspension separately from permanent grant revocation. If re-grant is supported, give it a new authority generation. Bind dependent grants, views, or directives to the original generation and check it on every read and write. Retain old records for evidence without restoring access. A schema version, optimistic revision, and grant generation serve different purposes.
- Reuse established tenant isolation and role-specific projection. Keep raw private records, tokens and database errors outside owner responses. Roll back both policy and audit on failure. On a stale retry, re-read authoritative state rather than applying another write.
- Run the [implementation and acceptance checklist](references/implementation-checklist.md). Verify storage and race behavior on the real database engine before claiming it is verified. Keep connected identity, account recovery and deployment evidence distinct from disposable integration tests.

For installation and transfer to other accounts, use the [Persian handoff](references/handoff-fa.md).
