# EI-OS engine registry — 20 bounded capabilities (architectural, not 20 deployed services)
Each engine manifest must eventually define ID, owner, purpose, inbound/outbound contract, allowed effects, privacy scope, events, projections, dependencies, cost, idempotency, tests and evidence status.

| ID | Engine | Owner | Priority | Boundary |
|---|---|---|---|---|
| I01 | Policy & Authorization | Institute | P0 | backend tenant/resource/scope checks, not Clerk claims |
| I02 | Workflow Orchestration | Institute | P0 | authorized commands, retries, outbox |
| I03 | ELYORA Contracts & Integration | adapter | P0 | official contracts only; default fail closed |
| I04 | Tenant & Institutional Governance | Institute | P0 | membership, roles, configuration |
| I05 | Teacher Learning Scope & Directives | Institute policy + Teacher author | P0 | no student self-expansion |
| I06 | Calendar, Scheduling & Timebox | Institute | P0 | timezone, deadlines, expirations |
| I07 | Virtual Rooms & Presence | Institute | P0 | no attendance inference from presence |
| I08 | Academic Classroom Execution | Institute BUILD-23 | P0 | reuse protected baseline |
| I09 | Private Workspaces | Teacher/Student/Institute per role | P0 | private data stays segregated |
| I10 | Conversational Teacher Qualification | Institute | P1 | evidence and human adjudication |
| I11 | Multilingual Cultural Adaptation | Institute metadata/ELYORA contract | P1 | per-language validation |
| I12 | Continuous Intelligence | Institute Intelligence | P1 | derived confidence/evidence only |
| I13 | Recommendation & Intervention | Institute | P1 | recommendation/action/outcome separate |
| I14 | Warm Communications & Relationship | Institute | P1 | private, consensual, scoped |
| I15 | Workforce & Teacher Marketplace | Institute | P2 | eligibility and matching |
| I16 | Billing & Revenue | Institute | P2 | auditable ledger and refunds |
| I17 | QA, Evidence & Audit | Institute/independent QA | P0 | source SHA and genuine test evidence |
| I18 | AI Agent Orchestration | Institute tools policy | P1 | allowlist, human approval for effects |
| I19 | Executive & Operational Analytics | Institute derived projections | P1 | aggregate privacy-safe data |
| I20 | Multilingual Programs & Curriculum Catalog | Institute metadata | P1 | not a local mastery engine |

## Parent ELYORA reuse map — source registry E01–E15
E01 visual: shared brand DNA, distinct UI. E02 journey: only official compatible port. E03 diagnostic: authorized educational evidence. E04 assessment: read authorized evidence, no duplicate mastery. E05 lesson: invoke within permitted scope. E06 story: cultural modules after verification. E07 archive: authorized retrieval. E08 identity/relationship: warm persona/consent. E09 safety/governance: privacy principles + Institute enforcement. E10 runtime: session and conversation where verified. E11 prompt/context: historical source explicitly notes compiler NOT IMPLEMENTED; don't assume runtime. E12 tool integration: whitelist and audit. E13 QA: reuse test strategy. E14 observability: trace without private payload. E15 release: versioning and gates.

**Source:** hypermindedd/Elyora-EnglishMastery/docs/03-ENGINE-REGISTRY-FA.md. All E01–E15 availability marked UNVERIFIED in this repository unless direct integration evidence is attached.

## Machine-readable manifest
`engines/registry.v1.json` records owner, single source of truth, proposed inbound/outbound contract, allowed state writes, allowed engine dependencies, parent reuse, classification and explicit status for each I01–I20. Run `npm run check` to validate count, naming, mandatory fields, dependency DAG and ELYORA protected-state write prohibitions. **IN DESIGN means no claim of operational deployment.**

## P0 source audit and contract gaps — 2026-11-08

This section distinguishes code evidence at `ac8401b3c9ccab8e5cf0a52aea5ed00d4628f541` from the operational design statuses in the versioned manifest. The manifest is the source for dependency edges and the allowed-write list. An offline component can exist while the complete engine remains IN DESIGN / NOT_CONNECTED. [Audit and evidence](AS_IS_AUDIT.md) · [Source-of-truth map](SOURCE_OF_TRUTH_MAP.md)

| IDs | Evidence at the audited SHA | Required contract or dependency |
| --- | --- | --- |
| I01, I04, I05, I06 | IMPLEMENTED in part. Pure actor/tenant/assignment policy, directive scope and timebox functions. Operational identity and institutional data stores PLANNED. | Trusted server identity, membership and resource state, revocation/expiry, durable directive and authoritative time source. |
| I02, I03 | I03 has an IMPLEMENTED fail-closed adapter, verified by offline demo. Durable workflow/orchestration is PLANNED. | Official version-pinned ELYORA port and evidence, idempotent command/outbox and retry/error policy. Keep ELYORA closed until authorized staging verification. |
| I07, I08, I09 | I07 modeled offline, I09 cabin UX is an offline preview. I08 is a protected BUILD-23 reference and needs reconciliation. | Signed media access, room event and privacy contracts, authoritative academic session/attendance evidence and role-specific storage. |
| I10, I11, I20 | IMPLEMENTED in part. Offline human qualification decision, provisional language catalog, and activity scope checks. Live assessment and localized pedagogy are PLANNED. | Approved rubrics and voice/consent retention, human reviewer workflow, launch language selection and per-language ELYORA compatibility. |
| I12, I13, I19 | IMPLEMENTED in part. Offline recommendation/action/measurement functions and scoped aggregate projection. Connected analytics and intervention lifecycle are PLANNED. | Provenance and confidence for signals, durable assignments and measured outcomes, safe projections and cohort thresholds. |
| I14, I15, I16, I18 | PLANNED at operational level. Existing registry entries and dependency declarations describe design. | Consent and communication scope, eligibility/matching, ledger and payment controls, scoped tool approval, budget and audit. |
| I17 | VERIFIED offline within defined workflow scope. PQE ran in advisory mode with skips. | Ratified quality gates, complete security/contract regression evidence and separately scoped staging and production verification. |

### Integration and decision gates

- Institute owns the Institute-specific commands and records in the map. Only the official ELYORA boundary may change protected educational state. The Parent E01–E15 map above is a reuse inventory from the existing repository, with availability still UNVERIFIED.
- The observed six schemas are Institute drafts. Structural lint checks structure. Owner/version, realistic example validation, negative cases, compatibility policy and the official parent contract are still required before connected use. [Contract catalog](CONTRACT_CATALOG.md)
- The first handoff increment is already in open PR #14. Its evidence remains branch-scoped. Durable orchestration, Voice retention, live qualification, launch locale choices, deployment A/B, Guardian and financial flows remain gated. [Source register](../governance/SOURCE_REGISTER.md) · [PR #14](https://github.com/hypermindedd/ELYORA-Intelligent-Institute-Operating-System/pull/14)
