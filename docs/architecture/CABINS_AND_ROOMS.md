# Virtual institute spaces — rooms-first model (design)
Four first-class authorized spaces must exist in domain design before immersive UI:
1. **Student Private Cabin:** student-only journal, allowed learning scope, assignment, calendar, ELYORA activity launch, timebox, feedback.
2. **Teacher Private Cabin:** personal teaching plans, reflections, coaching, assigned learners' authorized evidence, feedback publishing with deliberate share.
3. **Live Classroom:** room metadata, lifecycle, tenant, roster, moderators, lessons, breakout policy, consent/recording; room presence != attendance.
4. **Institute Command Cabin:** governance and permission configuration, programs and finance, health/risk/retention aggregates, accountable interventions and audit.

Later modules: Cultural Commons (moderated), teacher collaboration, help desk, guardian access only when legal guardian consent model is approved.

Separations: workspace_id != user_id, room_id != session_id, session_id != attendance_id, activity_done != mastery. Every room join needs *fresh server authorization* based on tenant, enrollment/assignment, valid time and resource. Signed media credentials and retention are separate adapters, not implemented in the initial kernel. Deep links reauthorize; temporary disconnect does not silently mutate authoritative session state.
