# ADR-EI-008 — Shared scope policy and role-specific Institute views

**Status** PROPOSED for connected operation. The review branch exercises the student read path offline.  
**Date** 2026-11-08  
**Dependencies** [ADR-EI-002](ADR-EI-002.md), [ADR-EI-005](ADR-EI-005.md), [ADR-EI-006](ADR-EI-006.md), [ADR-EI-007](ADR-EI-007.md), and A2/A3/A5 release gates.

## Context

EI-OS has three product surfaces and existing offline domain modules. A student-facing list of allowed work and a practice command can drift when they independently interpret approval, time or current assignment. Institute Command owns organizational operations and consumes authorized aggregate intelligence. It has no general access to private teacher or student records. The ELYORA parent remains the sole owner of educational execution, evidence and protected educational state.

## Project source and continuity

The three turns in [طراحی معماری انستیتو](chatgpt-conversation://6aef313c-03f4-83eb-a325-be373c5c86ba) set independent domains, contract-based composition, impact review before changes and an instructor-led scope. The assistant's Master Architecture V1.0 in that chat was presented as a proposal. The standalone attachment was unavailable in this review. The source trail for the existing code includes the initial architecture commit, the later Campus Preview merge, and the current branch's [modular blueprint](../architecture/INSTITUTE_MODULAR_BLUEPRINT_FA.md).

ELYORA can propose changes to scope. Assigned-instructor approval remains the authorization step. Broad authorized organizational configuration and operational oversight are separate from access to confidential teacher or student records. Preserve the four product spaces and the warm Tiffany/orange/coral/yellow/ivory design direction. Student cabin, teacher cabin, classroom and Institute Command will consume scoped data through the shared backend boundary after authorization gates pass. Keep the eight-language launch requirement separate from approved launch languages, and represent interface locale, target language, curriculum version and language-specific capabilities independently. [Visual reference lock](../architecture/VISUAL_REFERENCE_LOCK.md) · [Language foundation](../architecture/EIGHT_LANGUAGE_FOUNDATION.md)

## Proposed composition

| Boundary | Owns | Consumes and exposes |
| --- | --- | --- |
| Teacher Leader | Instructor intent and private teaching workspace | Submits scoped intent to the Institute command boundary. Teacher-authorized approval uses current assignment. Private coaching and notes stay in their own workspace. |
| Institute | Assignment and directive lifecycle, tenant/role/resource policy, audit and organizational action | Resolves authoritative context for each request. Operator workflows consume Institute records and explicitly approved aggregates. |
| Guided Student | Student experience and scoped view | Reads the effective approved directive through a field allowlist. Practice rechecks the current scope and the narrower activity constraints before calling the official adapter. |
| ELYORA and Intelligence | ELYORA owns learning evidence. Intelligence owns derived risk, recommendation and measurement. | Read authorized evidence through versioned boundaries. Evidence, recommendation, action and outcome are separate facts. |

First offline increment: compose the existing language and student-identity checks, timebox, approval ownership and active assignment checks into a student read path. Return only directive ID/version, program/version, language/variant, instruction locale, available topic IDs, activity types, per-session limit and validity window. Omit exclusions, actor/tenant identifiers and arbitrary fields. The read has no adapter call, event or side effect. The practice path uses the same policy primitives and keeps its existing response and fail-closed adapter.

## Execution sequence and failure handling

1. **A2.** Version the server-facing read and command contracts after reviewing this internal interface. Resolve trusted identity, tenant, current assignment, current directive and authoritative clock on the server. Student-supplied IDs are selectors, never evidence of identity or access. Recheck on deep links and after reconnect. Denial and not-found responses must follow the same disclosure policy.
2. **A3.** Persist one authoritative directive version with an atomic command receipt and outbox under the owning Institute boundary. Scope command keys by tenant and intent. A replay with the same key and identical intent returns the prior result. A changed intent fails. Reject or reconcile stale expected versions. Send minimized versioned facts to authorized projections. Deduplicate deliveries, detect ordering gaps, and reauthorize before rebuild/replay. Realtime invalidates views, and the durable cursor plus scoped query restores them.
3. **A5.** Connect only after official contract and staging evidence. Recheck assignment, directive version, time and usage at the execution boundary. Reserve duration atomically before invoking the adapter. Reconcile uncertain remote results using the same operation key. Retain raw private evidence within its authorized owner. Feed only allowed evidence to Institute projections.
4. **Reuse.** After this pattern passes connected tests, extract the project-neutral contract checklist, responsibility and data-flow template, and quality gates into a reusable skill. Keep ELYORA IDs, schemas, assets and business rules as project-local examples. A second project should exercise the skill before it is considered reusable.

## Alternatives and consequences

- Shared policy within the existing modular process preserves current code paths and keeps roles testable without network access. It requires disciplined ownership and a separate durable workflow for production.
- Direct UI-to-core integration reduces wiring but couples views to provider behavior and cannot safely enforce current organizational authority. Independent policy in each product risks divergent access decisions.
- Independent services may help after isolation or scaling needs are measured. They introduce distributed consistency and additional recovery work for the current offline scope.

The read projection is additive. Existing v1 directives remain untouched and are excluded from the v2 view. Remove the additive entry point and demo wiring to roll back the offline slice. Production migrations and compensating commands require a separate review. Before promotion require contract validation, tenant and student isolation, revoked/expired/stale scope, idempotency and recovery, privacy review, and SHA-linked evidence. The existing PQE workflow provides advisory review evidence alongside deterministic tests.
