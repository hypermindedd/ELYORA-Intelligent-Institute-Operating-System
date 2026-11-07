# ELYORA Intelligent Institute Operating System (EI-OS)
**02T / Teacher Leader · Guided Student · Institute Command**

AI-native multilingual and multicultural virtual institute, with human-led teaching and ELYORA-authoritative learning. This repository is **Institute-only**; it is not a replacement for ELYORA English Mastery.

## Status, 2026-11-07
- **Architecture:** IN DESIGN; proposed supplement, not an approved replacement of earlier instructions.
- **BUILD-23:** historically reported protected baseline; no code copied or modified here.
- **BUILD-24:** Retention & Institute Intelligence foundation planned/in progress per inherited project instructions.
- **This repository:** A0/A1 source audit, architecture registration, and P0 offline domain kernel bootstrap. No connected ELYORA integration, backend deployment, or production verification is claimed.
- **02S Guided Student:** source repository still describes branch as PLANNED; documentation of intended interfaces is not approval to release it.

## Read in this order
1. [Project constitution](docs/governance/PROJECT_CONSTITUTION.md)
2. [Architecture and source-of-truth](docs/architecture/REFERENCE_ARCHITECTURE.md)
3. [Engine registry I01–I20](docs/architecture/ENGINE_REGISTRY.md)
4. [Source audit and unresolved evidence](docs/audits/SOURCE_AUDIT_2026-11-07.md)
5. [Build plan and acceptance gates](docs/roadmap/BUILD_PLAN.md)
6. [Agent instructions](AGENTS.md)

## Product zones
- Teacher Leader: teacher-private cabin, authorized student supervision, teaching plans and qualification.
- Guided Student: student-private cabin, teacher-governed learning scope, authorized ELYORA practice.
- Institute Command: multi-tenant governance, organizational operations, intelligence, interventions and business tools.
- Shared virtual rooms: signed media access later; presence is not attendance and learning completion is not mastery.

## Engineer quick start
Node.js 22+; no production secrets or external service required for the initial pure-domain test kernel:
```sh
npm test
node examples/vertical-slice.mjs
```
The example is explicitly **offline simulation** and never calls ELYORA.

## Authoritative sources and reuse
- ELYORA core: https://github.com/hypermindedd/Elyora-EnglishMastery
- Quality engine: https://github.com/hypermindedd/Project-quallity-engine
- [Source audit](docs/audits/SOURCE_AUDIT_2026-11-07.md) separates source evidence from interpretation.

Do not introduce a second Mastery/Learning/Progression engine, grant role/scope from browser input, infer success from documentation, or expose private teacher/student records in management projections.
