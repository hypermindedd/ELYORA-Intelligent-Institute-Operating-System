# EI-OS project constitution — complementary registration, v0.1
**Status: IN DESIGN.** This file records inherited non-negotiable constraints; it does not silently approve or replace the existing Master Project Instruction or 02 / 02T / 02S locked rules.

## Precedence
Existing highest-authority project constitution > approved ADRs > approved source-of-truth map > protected last verified build > official contracts > current implementation > this proposal. A newly authored document is never a substitute for ratification.

## Products and ownership
- ELYORA English Mastery outside this repository is authoritative for Learning State, Assessment, Mastery, Progression and adaptive educational decisions.
- Institute Command owns tenant, enrollment, assignment, class, session lifecycle, attendance, intervention lifecycle and organization operations.
- Teacher Leader owns private planning, reflection, adaptation and professional coaching context. Teachers lead student scope and focus.
- Guided Student may only consume student-scoped authorized projections and ELYORA learning within authorized teacher/policy scope. The inherited 02S status remains PLANNED until formal approval.
- Intelligence owns **derived** signals, risk, recommendations and measurement, not learning truth.

## Invariants
1. Source of truth: one per domain. No Institute/Teacher/Student Mastery engine and no local Learning/Progression replica.
2. Clerk is authentication in inherited baseline, not final authorization. Server-side authorization determines tenant, workspace, role, resource and student scope.
3. Browser controls, URLs, notifications, room presence and realtime updates grant no authority.
4. Deep links reauthorize. Reconnect uses durable server cursors. Realtime is invalidation/synchronization, not truth.
5. Raw private student/teacher material is not shared through generic management dashboards. Admin configuration power does not equal unrestricted access to confidential content.
6. Student check-in != attendance; Student done != Mastery; observation != Mastery or automatic teacher capability; retention risk != learning state; recommendation != action != outcome.
7. Event facts are immutable, versioned, scope-aware and privacy-safe. Projections explicitly enumerate allowed and forbidden fields.
8. For each significant change: audit -> owner -> source-of-truth -> contracts -> events -> projections -> authorization/privacy -> OpenAPI -> implementation -> tests -> security/privacy/ELYORA regression -> evidence.
9. No claimed PASS without evidence; statuses are distinct: PLANNED, IN DESIGN, IMPLEMENTED, OFFLINE VERIFIED/CONTRACT PASS, CONNECTED STAGING PASS, CONNECTED PRODUCTION PASS, BLOCKED, NEEDS REVIEW.
10. BUILD-23 remains protected; BUILD-24's detect -> explain -> recommend -> assign -> act -> measure -> re-evaluate cycle is retained.
11. The parent 15-engine registry E01-E15 consists of architectural documents unless runtime evidence proves executable availability.
12. Per-language support, teaching qualifications and formal certification must have their own evidence gates.

## Change control
Record important architectural changes in ADR with alternatives, affected contracts, threat/privacy/regression assessment, status, explicit sign-off and rollback.
