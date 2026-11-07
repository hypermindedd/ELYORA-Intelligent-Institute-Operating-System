# EI-OS warm campus v0.2 — execution evidence
**Evidence date:** 2026-11-07
**Tested SHA:** `1c42b37fb397de34a2a78623dde0dcdd63928670`
**PR:** https://github.com/hypermindedd/ELYORA-Intelligent-Institute-Operating-System/pull/10

## Verified
- Node.js 22 `npm run check`: **40 tests passed, 0 failed**; 6 draft JSON Schema structural checks, 20-engine registry lint under existing separate CI.
- GitHub Actions real Chromium workflow: https://github.com/hypermindedd/ELYORA-Intelligent-Institute-Operating-System/actions/runs/42387402158 — SUCCESS.
- Browser flows: render 4 preview spaces and first-party SVGs, show 8 provisional language cards, Persian RTL / English LTR switching, target-language filter, not-connected dialogue and 390px mobile viewport without horizontal document overflow.
- PNG screenshots uploaded in artifact **ei-os-campus-visual-evidence**, artifact ID **13580008651**, downloadable from the GitHub Actions run.
- Server preview continues fail-closed for any live educational action, with ELYORA backend `BLOCKED_NOT_CONNECTED`.

## Not verified
- Human design approval and semantic match to the earlier remote image reference results (original SVGs are thematically consistent, not exact prior photos).
- Real production authentication, privacy/authorization at API level, database persistence and multi-tenant server implementation.
- Real synchronous classroom/audio/video, teacher/student AI interaction or learning outcomes.
- Connected ELYORA E03/E04/E05 educational API, multilingual ASR/TTS, teacher eligibility certification.
- Release-quality PQE hard gates; PQE advisory may report GO with skipped suites and `fail-on: never`.
- Owner approval of exact eight launch languages and regional variants.

## First browser run failure / remediation
Initial browser workflow run 42387321720 failed **before browser execution** because Ubuntu 26.04 is unsupported by pinned Playwright 1.57.0. Runner pinned to `ubuntu-24.04`; corrected browser run passed. Failure history remains part of trace, not hidden.

**Verdict: OFFLINE VERIFIED + BROWSER PREVIEW VERIFIED. NOT CONNECTED STAGING PASS / NOT PRODUCTION PASS.**
