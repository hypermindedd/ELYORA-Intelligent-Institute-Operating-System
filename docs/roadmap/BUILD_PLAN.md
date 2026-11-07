# EI-OS phased build plan — dependencies and acceptance gates
| Stage | Deliverable | Acceptance gate | Status |
|---|---|---|---|
| A0 | source and BUILD-23/24 audit, QA/agent inventory | sources/unknowns recorded | PARTIAL |
| A1 | domain ownership, engines, ADRs, role/cabin architecture | owners approve ADRs, no parent contradictions | IN DESIGN |
| A2 | contracts/schema/events/version compatibility | schema validation and failure-path tests | IN IMPLEMENTATION (offline kernel only) |
| A3 | authenticated backend, tenant isolation, transactional outbox | connected server auth, persistence, rollback integration tests | PLANNED |
| A4 | three private cabins, live classroom lifecycle | real role isolation, media and BUILD-23 regression | PLANNED |
| A5 | teacher scope/timebox, student guidance and ELYORA adapter | official ELYORA staging contract; scope non-bypass | PLANNED |
| A6 | conversational qualification/teach-back | expert rubrics, independent review, bias/error checks | PLANNED |
| A7 | BUILD-24 continuous intelligence | explainable risk, authorized recommendation/action/outcome | PLANNED |
| A8 | multilingual/cultural commons | per-language and moderation certification | PLANNED |
| A9 | monetization, partner/school operations | accounting, compliance, unit economics | PLANNED |
| A10 | 300-student/50-teacher controlled pilot target | tested peak load, reliability, cost, connected release | PLANNED |

## Implementation sequence within each stage
Audit -> explicit owner -> source of truth -> data/policy contracts -> events -> projections -> auth/privacy -> API -> backend -> UI -> tests -> regression -> status/evidence. Never start by patching a UI permission condition.

## First offline vertical slice
Teacher scope proposal and approval -> student practice access decision -> room entry eligibility -> private/aggregate read models -> blocked ELYORA port by default. No fake external API or claims of instructor/student live product.

For the three-product design, dependencies and build sequence, see [the modular blueprint](../architecture/INSTITUTE_MODULAR_BLUEPRINT_FA.md). This proposal supplements the existing A0–A10 gates.
