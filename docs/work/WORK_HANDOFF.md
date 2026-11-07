
# Work-mode execution handoff — EI-OS campus v0.2
**To launch a cloud-computer Work session:** choose **Work** in ChatGPT, then point it to the GitHub repo below. A standard chat cannot switch itself into Work.

Repository: `hypermindedd/ELYORA-Intelligent-Institute-Operating-System`
Feature branch: `feat/eight-language-campus-preview`
Read: `AGENTS.md`, `docs/governance/PROJECT_CONSTITUTION.md`, `docs/architecture/REFERENCE_ARCHITECTURE.md`, `docs/architecture/EIGHT_LANGUAGE_FOUNDATION.md`, `docs/architecture/UX_TOKENS.md`, and this file.

## Work-mode continuation brief
Use the cloud computer/browser to clone this repo and run `npm run check`, then `npm run web`. Visit http://localhost:4173. Verify 4 campus spaces, 8 language cards, Persian RTL/English LTR, mobile/desktop layout, keyboard navigation, warm Tiffany/orange/coral/yellow/ivory vector assets. Capture screenshots of all cabins, fix tangible issues in the feature branch, update tests and CI. Do not treat the browser preview selector as authentication, and never mark ELYORA live/voice/certification as connected. Use the existing Project Quality Engine and its canonical QA agents/skills without weakening gates. Follow owner-ratification for exact 8 languages and protected ADR/BUILD-23 changes.

## Evidence required
Browser screenshots at desktop 1440px and mobile 390px, accessibility checks, Node and PQE CI run links, code SHA, failure log where applicable. Separate OFFLINE VISUAL PREVIEW from CONNECTED STAGING and PRODUCTION.

## Asset provenance
Previous four imagery references were illustrative remote query results, not committed/licensed immutable source assets. The project web preview uses **original first-party SVG scene assets** matching their warm spatial design language until exact official licensed artwork is obtained. Do not claim pixel identity with those search references. Use placeholders only in explicitly marked PREVIEW mode.

## Exact local Work runbook
1. Git checkout `feat/eight-language-campus-preview`; run `npm run check` and `npm run web`.
2. Visit `http://127.0.0.1:4173` in Work's browser and check all `data-view` destinations.
3. Switch `#ui-locale` to English and confirm LTR; switch back to Persian and confirm RTL. Filter eight `#program-language` cards; test narrow screen 390px.
4. Review the four original scene SVGs for consistency with the visual references; take screenshots, record visual defects without silently changing owner-directed palette.
5. Existing offline authority checks are NOT sufficient for live use. Do not deploy an auth backend or hook up ELYORA until the relevant contracts are verified.

## Automated browser evidence (GitHub Actions)
The feature branch adds `.github/workflows/campus-browser.yml` and `scripts/browser-visual-smoke.mjs`. On PR, GitHub Actions installs an isolated Playwright/Chromium runner to exercise 4 cabins, eight catalog cards, interface switching, language filtering and mobile 390px, then archives PNG screenshots. This is actual browser preview verification, **not** a substitute for Work's full visual/UX review or connected-staging tests.
