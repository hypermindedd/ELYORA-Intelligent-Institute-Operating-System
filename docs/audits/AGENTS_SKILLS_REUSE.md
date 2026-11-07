# Agent and Skill reuse plan — inspected in GitHub
## Existing owned assets
- PQE canonical audit agent `Project-quallity-engine/plugin/agents/pqe-auditor.md`: independent changeset reviewer and evidence verdict.
- PQE test-design agent `plugin/agents/pqe-test-architect.md`: generate missing negative-path tests from documented goals, not implementation behavior.
- PQE Skills `plugin/skills/pqe-onboard`, `pqe-run`, `pqe-fix`: project enrollment, test evidence interpretation, bounded remediation.
- Parent ELYORA E13 QA, E14 Observability, E15 Release are architectural reference responsibilities, not assumed live agent processes.

## Concrete integration
- `.github/workflows/pqe.yml` uses the existing reusable PQE workflow; it starts as manual, advisory and with **no secrets inherited**. Inspect the resulting plan and calibrate/approve hard gates before promotion to required main check.
- `.github/workflows/ci.yml` runs deterministic Node tests first; it is separate from optional AI-assisted PQE and requires no paid token.
- Contributors should use the canonical PQE agents/skills from their source repo; do not create divergent copies or let an agent rewrite tests/contracts to make tests pass.
- Quality test artifacts need commit, environment, command and pass/fail/skip classification. No mock-only production PASS.

## Current limitation
Inspecting agent text and connecting workflow is NOT the same as invoking those agents or completing an end-to-end PQE run; execution remains pending GitHub Actions evidence.
