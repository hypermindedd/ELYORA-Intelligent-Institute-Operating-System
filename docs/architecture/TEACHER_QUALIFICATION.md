# Teacher Conversational Qualification (I10) — evidence-first design
Never replace a teacher with AI or turn a single automated score into professional eligibility. Conversation-first, warm and adaptive: consent -> professional dialog -> explain-back / teach-back -> subject error diagnosis -> scenario/class leadership -> safeguarding and cultural competence -> evidence and uncertainty -> independent reviewer -> scoped eligibility -> longitudinal re-evaluation.

Evidence spans language proficiency, domain expertise, pedagogical accuracy, delivery skills, correction quality, student adaptation, leadership, safeguarding, digital facilitation and multilingual/cultural fit. Each rubric has ID/version/language, observable indicators, critical errors, confidence, optional independent verification and expiry. Critical errors require review, never silent approval. Accommodation, bias checks, appeal, retention, and privacy are mandatory.

E03 Diagnostic and E04 Assessment from ELYORA are educational owner capabilities; teacher-specific professional eligibility is organizational and must be separately adjudicated. Integration requires verified parent contracts. Initial kernel intentionally offers only **review-gated eligibility**, not adaptive voice interview or certification.

## I10 rehearsal and live pilot

The text role-play can be run with `npm run demo:teacher -- fr-FR` or `npm run demo:teacher -- en-GB`. A teacher responds to the learner and a second person moderates and records observations locally. Use fictional cases. The pack, observable indicators and anchors live together in `packages/teacher-qualification/rehearsal.v1.json`. See [the Persian protocol and pilot acceptance criteria](TEACHER_LIVE_ASSESSMENT_FA.md). The demo performs no external calls and writes no personnel records. Existing eligibility consumers and the v1 case schema are unchanged.

A private, teacher-owned solo rehearsal is available from the same demo entry point. The teacher selects a topic, retries or asks for transfer examples and can finish at any time. It has no publication operation. A separately opened reviewed rehearsal carries missing evidence, its assigned reviewer and an optional scheduling deadline into the management projection. A missing deadline stays unassigned in time. The rehearsal never issues eligibility.
