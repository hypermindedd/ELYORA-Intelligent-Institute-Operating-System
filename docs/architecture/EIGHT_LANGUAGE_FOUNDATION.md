
# Eight-language ecosystem foundation (A1/A2) — 2026-11-07

**Requirement from owner:** build one virtual institute for eight foreign languages, with an extensible foundation from day one.

**Important unresolved decision:** The owner specified the number **eight**, but has not formally selected the exact language list. `packages/language-catalog/catalog.v1.json` therefore provides **eight demonstration seeds only**: English, French, German, Spanish, Italian, Arabic, Simplified Chinese, Japanese. They are NOT locked launch languages; `confirmedLaunchLanguages: []`. Replacing demo seeds before launch is configuration/versioned migration, not an architectural rewrite.

## Correct domain separation
- User-interface locale `uiLocale` (currently preview Persian RTL + English LTR) is **different** from target language `targetLanguage`.
- Source/native/instruction language is **different** from target language (future user preference + policy).
- Language tag BCP 47, script ISO 15924, explicit direction RTL/LTR, spoken variant and dialect belong in metadata. A country flag is **not** a language identifier.
- `program` holds a language-specific curriculum and approved proficiency framework version; one shared Mastery implementation is prohibited.
- `capabilities` are per language (voice, ASR, TTS, AI practice, assessment) and are **NOT_CONNECTED/NOT_VERIFIED** until language- and vendor-specific evidence exists.
- Teacher competency must be specialized by language, variant, subject, pedagogy and child/adult/safeguarding jurisdiction; only independent human reviewer may grant Institute eligibility.
- Catalog can later include >8 languages, multiple curricula per language, domain specialization and cultural modules. Eight is the initial product requirement, **not** a hardcoded platform capacity.
- Student learning scope must reference exact target `languageCode`, `programId`, allowed units/topics and deadlines, with server-verified teacher assignment. Existing v1 directives require a future additive `targetLanguageCode` contract and migration; do not silently mutate protected parent ELYORA schemas.

## Release gates per language
1. Owner approval of exact language and regional variant(s).
2. Verified teacher qualification rubric and expert review panel.
3. Curriculum and task taxonomy reviewed by native/domain experts.
4. Verified ELYORA educational contract or formally approved alternative core owner; do not replicate Mastery.
5. Separate AI/voice evaluation for dialect, accent and code-switching, plus student privacy/safety checks.
6. Unicode normalization, right-to-left/bidirectional text, text segmentation, font fallback, accessibility, timezones.
7. Measured pedagogical outcomes, costs, content moderation and legal/localization checks.
8. Connected staging/production evidence and rollback plan for that language.

**Current status:** model + public projection + structural/negative tests implemented; educational runtimes and selected launch languages remain PLANNED.
