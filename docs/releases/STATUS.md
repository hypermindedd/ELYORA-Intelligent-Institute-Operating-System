# Release and evidence ledger
**2026-11-07 bootstrap scope:** new EI-OS repository only. Parent BUILD-23 is not migrated or altered.

| Area | Status | Evidence/limitation |
|---|---|---|
| Architecture proposal | IN DESIGN | docs/architecture, ADRs awaiting approval |
| Existing source inventory | PARTIAL | docs/audits/SOURCE_AUDIT_2026-11-07.md |
| Offline domain kernel | OFFLINE VERIFIED (23 tests) | CI workflow run 42382969215 on a12da0c; limited to pure-domain unit tests |
| Parent ELYORA API connectivity | BLOCKED | official runtime contract not verified |
| Actor identity and authoritative storage | PLANNED | pure domain functions cannot replace backend auth |
| UI private cabins | PLANNED | room and permissions modeled, no UI shipped |
| Virtual audio/video | PLANNED | provider and signed credentials pending |
| PQE advisory workflow | EXECUTED, COVERAGE INCOMPLETE | run 42383168460 succeeded, but many checks SKIPPED and fail-on=never |
| Connected staging | NOT VERIFIED | no connected system |
| Connected production | NOT VERIFIED | no production deployment |

Never update status to PASS based solely on authored tests or documentation.

## Evidence update — 2026-11-07
- Run: https://github.com/hypermindedd/ELYORA-Intelligent-Institute-Operating-System/actions/runs/42382969215
- Commit: `a12da0ca9c5525234ce988ffc0f6f7ba9087498b`.
- Node 22: `npm run check` succeeded: 4 schema **structural lint** results; 23 Node built-in unit tests, 23 pass, 0 fail.
- `npm run demo` succeeded; ELYORA integration correctly returns `BLOCKED_NOT_CONNECTED`.
- Scope: **OFFLINE VERIFIED** for pure domain kernel only. No full JSON Schema conformance, no server auth, datastore, live classroom, voice/AI, staging or production test.

## PQE first run (advisory only)
Workflow https://github.com/hypermindedd/ELYORA-Intelligent-Institute-Operating-System/actions/runs/42383168460 completed SUCCESS on `28a332aefbc27f02ef37e02eb02658c440329536`; this is NOT a release gate. Secrets scan PASS for 53 files, but API/UI/browser/security dependency and architecture boundary checks were among SKIPPED suites. It reported `GO` because no ratified hard-gate goals and `fail-on: never` (not proof of production readiness). SARIF upload reported an integration-access error despite continue-on-error, requiring code-scanning permission review. Full findings: docs/audits/PQE_FIRST_RUN_2026-11-07.md.

## Eight-language warm campus preview — browser/CI evidence
- Feature baseline code SHA: `1c42b37fb397de34a2a78623dde0dcdd63928670`.
- Real CI: https://github.com/hypermindedd/ELYORA-Intelligent-Institute-Operating-System/actions/runs/42387402158 — Node 22, **40/40 tests**, Chromium browser smoke SUCCESS, 4 scenes + 8 provisional language cards + UI RTL/LTR + filter + modal + 390px no horizontal overflow. PNG evidence artifact `ei-os-campus-visual-evidence`, ID `13580008651`.
- PREVIEW status: **OFFLINE VERIFIED and BROWSER PREVIEW VERIFIED**, not Work human visual sign-off or connected classroom/staging/production verification.
- Language choices are PROVISIONAL, not 8 owner-confirmed target languages. Real voice, assessment, live ELYORA educational states remain NOT_CONNECTED.
- Project Quality Engine remains advisory until owner-approved hard gates and full coverage.


## Multilingual warm campus v0.3 — preview scope

- Interface: Persian and English retained. Arabic, Italian, Spanish, Korean, German, French and Russian added. Persian stays the default.
- Catalog: the previous eight entries plus Persian, Korean and Russian. All eleven remain provisional. The eight-program launch plan remains unconfirmed.
- Local verification: Node 24 `npm run check` and real Chromium browser smoke. The browser suite checks all nine locales, four rooms, eleven programs, preview notices, direction, keyboard filtering, preference persistence and narrow mobile viewports.
- Quality Engine is advisory. Its offline configuration checks the public preview contracts, access boundaries and response headers. Connected identity, teaching, assessment and voice require their own staging and per-language evidence.
- Migration: the previous two locale identifiers remain valid. The new browser preference is optional, device-local and validated against the allowlist. Existing API consumers can continue using `/api/demo/languages`.
- Rollback: revert the v0.3 changeset and regenerate the campus preview from the prior verified source. For the hosted site, restore its previous saved version if the new campus route needs to be withdrawn.

## Institute modular foundation — offline verification

- GitHub base: `ac8401b3c9ccab8e5cf0a52aea5ed00d4628f541`. The [modular blueprint](../architecture/INSTITUTE_MODULAR_BLUEPRINT_FA.md) uses the registered 02T authorities with partial source coverage.
- `npm run check` on Node 24.22.1: six structural schema checks, one 20-engine registry check and 62 native tests passed. Eighteen tests cover the new guided-practice composition, including revoked assignments, tampered approvals, invalid versions and cross-tenant access.
- `npm run demo`: teacher approval and student scope resolve within the simulated assignment. The parent integration is `BLOCKED_NOT_CONNECTED`. Its scope is offline policy simulation.
- This increment runs in memory through an internal application entry point. The version-two policy now rejects version-one data decorated with version-two fields. The existing version-one policy is still available to its original callers. Connected migration remains subject to a reviewed mapping.
