# Reference architecture — A1 proposal
**Recommendation:** modular monolith for organizational domains initially, strict domain boundaries, one durable transactional store per organization boundary, transactional outbox, separate background workers/media provider, and provider-neutral ELYORA integration. Physical microservices are not an atomicity requirement.

```text
Teacher Leader        Guided Student          Institute Command
      \                     |                       /
                Role-specific BFF / APIs
                           |
    Authenticated server context + authorization policy
                           |
Tenancy | Enrollment | Directive | Schedule | Rooms | Workspaces
Sessions | Teacher qualification | Interventions | Commercial
                           |
      Durable commands + outbox + scoped projections
                /                         \
     ELYORA contract adapter          Derived intelligence
         (default BLOCKED)            recommendations/outcomes
                |
     ELYORA authoritative engines (outside repository)
```

## Dependency rules
- UI -> role-specific API -> policy/command boundary -> bounded domain; UI cannot import persistence or create authority.
- Institute modules must not import ELYORA Mastery/Progression internals; only official versioned ports.
- Intelligence may read authorized evidence but cannot mutate authoritative academic state.
- Teacher-private domain -> explicit student-share projection; otherwise private.
- Room credentials and recordings require isolated media/signature/retention service, not trust in realtime events.
- Event consumers are idempotent; realtime merely invalidates a durable authorized projection.
- Each domain concept is versioned, testable and replaceable; do **not** create a microservice or database table per UI widget.

## First accepted vertical slice (planned end-to-end)
Teacher authored scope -> server verifies actor, tenant, assignment, time and permissions -> durable directive -> student is shown only allowed scope -> official ELYORA activity -> authorized evidence projection -> teacher review -> authorized aggregate management view.
The first committed code includes a pure, offline and deliberately incomplete kernel; ELYORA integration, database, identity provider, BFF, media and realtime are NOT connected.

## Capacity and expansion
Initial design scenario: 300 students and 50 teachers (historical project target); actual peak concurrency and live-room load must be measured. Support multiple languages/cultures as metadata and contracts now; release each language only after language-specific educational and safety tests.
