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
