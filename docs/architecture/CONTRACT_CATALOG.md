# Contract catalog v0.1 — source-aware
All schemas in contracts/schemas are **Institute proposals**, version 1, not a claim of an approved ELYORA or public production API.

| Contract | Writer | Reader | Non-negotiable guard |
|---|---|---|---|
| LearningScopeDirective v1 | Institute after teacher authorization | Student, ELYORA adapter | tenant/resource/time/topic bounds |
| VirtualRoom v1 | Institute | authorized participant | join credential is NOT attendance |
| EventEnvelope v1 | owning domain | scoped event router/projection | durable event, version/privacy metadata |
| TeacherQualification v1 | Institute eligibility domain | designated reviewer | evidence != certification; human sign-off |
| ELYORA Educational Port (pending) | ELYORA | Institute adapter | no invented endpoint, all protected states ELYORA-owned |
| Privacy Projection v1 (pending) | projection workers | role-specific BFF | approved allowed-fields, no raw private leak |
| Intervention Lifecycle v1 (pending) | Institute | authorized staff | recommendation != action != measured outcome |
| Room Join Credential (pending) | signed media gateway | room client | signed expiry and scope, never client-generated |

## Integration admission
Before enabling an external service: obtain official exact contract/owner/version, compare against proposed source schemas, install contract tests, negative authorization tests, server-side credentials, idempotency and regression, produce staging evidence. If absent, adapter returns BLOCKED_NOT_CONNECTED.

Parent references:
- hypermindedd/Elyora-EnglishMastery/contracts/README.md — PROPOSED_NON_CANONICAL.
- hypermindedd/Elyora-EnglishMastery/contracts/schemas/teacher-directive.schema.json — proposal, not live API.
