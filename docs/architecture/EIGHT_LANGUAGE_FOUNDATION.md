
# Multilingual ecosystem foundation (A1/A2) — 2026-11-07

**Initial requirement:** build one virtual institute with an extensible foundation and eight launch slots.

**Preview catalog:** `packages/language-catalog/catalog.v1.json` includes the original English, French, German, Spanish, Italian, Arabic, Simplified Chinese and Japanese programs plus Persian, Korean and Russian. Eleven preview entries coexist with the historical eight-slot launch plan. Launch selection remains pending in `confirmedLaunchLanguages: []`.

| Added preview program | Script | Direction | Planned variant | Specialist review focus |
| --- | --- | --- | --- | --- |
| Persian | `Arab` | Right to left | `fa-IR` | Persian orthography and half-spaces, formal and conversational usage |
| Korean | `Kore` | Left to right | `ko-KR` | Hangul, spacing and speech levels |
| Russian | `Cyrl` | Left to right | `ru-RU` | Cyrillic, word stress and pronunciation |

## Correct domain separation
- User-interface locale `uiLocale` and target language `targetLanguage` are chosen independently.
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

## Language-specific Institute directives — proposed v2
`contracts/schemas/learning-scope-directive.v2.schema.json` and `src/domain/language-scoped-activity.mjs` add explicit target language, locale variant, instruction locale, curriculum version and negative tests. These use existing v1 authorization functions without duplicating educational state. Both schema and code are **offline design** only; an authorized server must authenticate actors, persist versioned directive decisions, enforce accumulated learning time, sign provider requests and verify official ELYORA contracts before any real exercise.
