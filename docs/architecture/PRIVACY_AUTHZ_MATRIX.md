# Authorization, privacy and negative-case matrix — design draft
Assume actor identity is authenticated by server and membership/assignments are fetched from authoritative storage; browser-supplied actor context is never trusted.

| View/action | Student | Assigned teacher | Institute manager | Platform operator |
|---|---|---|---|---|
| Own student cabin, directives and learning projection | own only | authorized share only | permitted aggregate only | default deny |
| Another student's private journal | deny | deny unless explicit consent/contract | deny | deny |
| Teacher-private reflection/coaching | deny | own only | deny unless extraordinary purpose-bound approved policy | deny |
| Student exercise evidence | own only | assigned resource and scope | only approved projection | deny |
| Define learning focus / narrow scope | deny | assigned teacher and policy | governance workflow, not covert teacher impersonation | deny |
| Expand AI proposed scope | deny | explicit teacher/authorized policy approval | explicit policy route | deny |
| Join live class | enrolled and time-valid | assigned and time-valid | assigned moderator only | deny |
| Set institute roles and configuration | deny | scoped tenant admin only if granted | authenticated authorized manager | operator support under explicit limits |
| Teacher qualification adjudication | deny | cannot self-approve | authorized independent reviewer | deny |
| Aggregated intelligence | own progress only | assigned class projection | aggregate scoped tenant | deny |

Required negative tests: cross-tenant, cross-student, no membership, revoked enrollment, expired directive, forged actor, browser role editing, direct deep link, unauthorized event, stale projection, replayed message, private field injection, invalid approval, low-cell-count aggregation, lost reconnect cursor, missing consent. Exceptional access requires reason, expiry, approval and immutable audit. EU/GDPR and minors' consent/legal requirements require jurisdictional legal review before launch.
