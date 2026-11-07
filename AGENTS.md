# EI-OS — instructions for coding agents and contributors
Applies to every change in this repository. Read docs/governance/PROJECT_CONSTITUTION.md and the linked project sources first.

## Before coding
1. Establish current source + last known build status; do not confuse proposed / implemented / offline verified / connected staging / production.
2. Name the owning bounded context and single source of truth.
3. Search existing domain modules, original ELYORA contracts and BUILD-23 for equivalent functionality; reuse official contracts rather than duplicate.
4. Predict effects on consumers, authorization, privacy, time boundaries, schema compatibility, cost and regression.
5. Specify input/output/event schemas, idempotency, retry/error policy, permissions and rollback **before** cross-domain implementation.

## During coding
- No browser authority: all operational commands must be authorized by a real server with tenant membership, actor, resource and permitted scope verified. The pure-domain functions in src/ are NOT a complete auth server.
- No shared mutable Learning/Assessment/Mastery/Progression state. ELYORA only through official versioned adapter and documented approvals.
- Never publish teacher-private notes or student-private data into management views; exceptional access is policy-bound/audited, never simply 'admin can see all'.
- Never silently turn AI recommendation into an action or action into outcome; require human approval where policy dictates.
- Never turn realtime presence into official attendance, or completion into mastery.
- Any external AI tool needs explicit allowlist, budget, actor/tenant scope, and side-effect approval.
- Every code change has negative security cases (cross-tenant, cross-student, revoked, expired, tampered input), not only happy-path tests.
- Do not weaken tests, contracts, protected baselines, or governance to get a green check.

## After coding
Run local tests and CI. Record commands, environment, source SHA and failures. Do not claim Connected PASS based on offline tests. Update ADR, domain owner, change log, and migration notes.

## Reuse owned agent/skill assets
Project Quality Engine (P QE) source: hypermindedd/Project-quallity-engine.
Its canonical agents: plugin/agents/pqe-auditor.md and plugin/agents/pqe-test-architect.md.
Its canonical skills: plugin/skills/pqe-onboard, pqe-run, pqe-fix.
Invoke through the external PQE workflow and tools rather than forking uncontrolled copies of those agents. See docs/audits/AGENTS_SKILLS_REUSE.md.
