# ELYORA ENGLISH MASTERY
# INSTITUTE ECOSYSTEM — MASTER PROJECT INSTRUCTION

**Document Type:** Project Constitution / Master Source of Truth  
**Authority:** Highest project-level architectural instruction  
**Applies To:** All chats, branches, builds, implementations, audits, debugging sessions, architecture sessions, UI sessions, API sessions and documentation within this Project  
**Current Baseline:** BUILD-23 completed / BUILD-24 in progress

---

# 0. PURPOSE OF THIS DOCUMENT

این سند مرجع اصلی و الزام‌آور پروژه است.

تمام Chatها، Branchها و Buildهای این Project باید از این سند تبعیت کنند.

هیچ Chat، پاسخ قبلی، implementation جدید، UI decision، API decision، database decision یا پیشنهاد معماری نباید برخلاف این سند عمل کند؛ مگر اینکه یک Architecture Decision صریحاً ثبت و تأیید شود و این سند یا Baseline پروژه به‌روزرسانی گردد.

در صورت تعارض:

1. این Master Project Instruction
2. Architecture Decisions ثبت‌شده
3. Source-of-Truth Map
4. آخرین Build رسمی و PASS شده
5. Contractهای رسمی
6. Implementation موجود
7. پیشنهاد یا فرض Chat فعلی

به همین ترتیب اولویت دارند.

---

# 1. PROJECT IDENTITY

پروژه مادر:

**ELYORA English Mastery**

Engineهای اصلی ELYORA شامل موارد زیر و هر Engine آموزشی authoritative دیگر، خارج از این Project هستند:

- Learning Engine
- Assessment Engine
- Mastery Engine
- Progression Engine
- Adaptive Learning
- Learning State
- سایر Core Educational Engines

این Engineها **authoritative** هستند.

این Project حق ندارد آنها را بازنویسی، duplicate، replace یا به‌صورت موازی recreate کند.

---

# 2. PRODUCTS

این Project شامل سه محصول مستقل اما متصل است:

## 2.1 Teacher Leader

محصول مخصوص Teacher.

هدف:

- افزایش Teaching Leadership
- افزایش کیفیت تصمیم‌گیری Teacher
- Teaching Adaptation
- Teaching Planning
- Student Support
- Coaching Intelligence
- Learning Leadership
- Teacher Growth
- Teacher-private workspace

Teacher حذف نمی‌شود.

Teacher همچنان یک Actor انسانی و آموزشی اصلی است.

Teacher Leader جایگزین Teacher نیست؛ بلکه توانمندی Teacher را افزایش می‌دهد.

---

## 2.2 Guided Student

محصول مخصوص Student.

Student فقط به:

- داده‌های خودش
- Learning Scope مجاز خودش
- تجربه آموزشی مجاز خودش
- Assignmentهای مجاز
- اطلاعاتی که طبق Authorization برای او مجاز است

دسترسی دارد.

Student نباید بتواند:

- Scope خود را افزایش دهد
- Role خود را تغییر دهد
- Tenant خود را تغییر دهد
- به Student دیگر دسترسی پیدا کند
- Teacher-private data ببیند
- Institute-private data ببیند
- Management data ببیند

Browser هرگز authority ایجاد نمی‌کند.

---

## 2.3 Institute Command / Institute Ecosystem

مرکز:

- Governance
- Organizational Operations
- Enrollment
- Assignment
- Class
- Session lifecycle
- Attendance
- Intervention
- Management Intelligence
- Organizational Analytics
- Operational Intelligence

است.

Institute مالک Organizational State است.

---

# 3. CORE ARCHITECTURAL PRINCIPLE

معماری کلی:

```text
                    ELYORA
        ┌─────────────────────────┐
        │ Learning                │
        │ Assessment              │
        │ Mastery                 │
        │ Progression             │
        │ Adaptive Learning       │
        └────────────┬────────────┘
                     │
              Official Contracts
                     │
                     ▼
        ┌─────────────────────────┐
        │ INSTITUTE ECOSYSTEM     │
        │                         │
        │ Teacher Leader          │
        │ Guided Student          │
        │ Institute Command       │
        └─────────────────────────┘
```

Institute Ecosystem باید از ELYORA استفاده کند، نه اینکه ELYORA را بازسازی کند.

---

# 4. SOURCE-OF-TRUTH RULE

هر Domain فقط یک Source of Truth دارد.

## 4.1 ELYORA owns

- Learning State
- Assessment State
- Mastery
- Progression
- Core adaptive educational logic
- Educational engine state

## 4.2 Institute owns

- Tenant
- Organization
- Enrollment
- Student organizational membership
- Teacher organizational membership
- Assignment
- Class
- Session lifecycle
- Attendance
- Organizational state
- Intervention lifecycle
- Institute operational state

## 4.3 Teacher Leader owns

- Teacher-private teaching adaptation
- Teacher-private planning
- Teacher-private reflection
- Teacher Learning Leadership
- Teacher coaching context
- Teacher-private derived workspace

## 4.4 Guided Student owns

Only Student-scoped experience and projections that are explicitly permitted.

## 4.5 Intelligence Layer owns

Derived intelligence such as:

- Signals
- Health
- Risk
- Recommendations
- Intervention intelligence
- Outcome measurement
- Trends

Intelligence is DERIVED STATE.

It is never authoritative Learning State.

---

# 5. NEVER DUPLICATE ELYORA ENGINES

Forbidden:

```text
Institute Mastery Engine
Teacher Mastery Engine
Student Mastery Engine
Retention Engine that mutates Mastery
Local Progression Engine
Parallel Learning Engine
```

All are prohibited.

Correct:

```text
ELYORA
   ↓
Official Contract
   ↓
Institute Ecosystem
   ↓
Projection / Intelligence
```

---

# 6. ROLE OF TEACHER

Teacher remains essential.

Teacher:

- determines Student learning scope
- determines focus
- guides learning priorities
- interprets educational context
- performs human intervention
- provides teaching adaptation
- leads learning

ELYORA performs deep adaptive:

- teaching
- practice
- assessment
- adaptation
- learning progression

within the authorized scope.

Correct relationship:

```text
Teacher
   ↓
Scope + Focus + Human Guidance
   ↓
ELYORA
   ↓
Adaptive Learning
   ↓
Student
```

---

# 7. AUTHORIZATION

## 7.1 Clerk

Clerk is used only for Authentication / Identity.

Clerk is NOT the final authority for:

- Tenant authorization
- Workspace authorization
- Role authorization
- Resource authorization
- Domain authorization
- Student scope authorization

Server-side Ecosystem authorization is authoritative.

---

# 8. BROWSER AUTHORITY RULE

Browser must NEVER create:

- Role
- Tenant
- Teacher authority
- Student authority
- Management authority
- Workspace authority
- Resource ownership

Browser may request an action.

Server decides whether the action is permitted.

Correct:

```text
Browser
  ↓
Request
  ↓
Server Authentication
  ↓
Server Authorization
  ↓
Tenant Resolution
  ↓
Scope Resolution
  ↓
Domain Command
```

Incorrect:

```text
Browser
  ↓
role === "teacher"
  ↓
allow
```

---

# 9. WORKSPACE SWITCHING

Workspace switching must always be server-authorized.

Changing a client-side workspace selector must NOT grant access.

Correct:

```text
Select Workspace
      ↓
Server Request
      ↓
Authorize Workspace Membership
      ↓
Authorize Role
      ↓
Authorize Scope
      ↓
Issue Authorized Context
```

---

# 10. DEEP LINKS

Every Deep Link must be authorized again at destination.

A notification, URL or deep link must NEVER grant access.

Correct:

```text
Notification
    ↓
Deep Link
    ↓
Target Resolver
    ↓
Fresh Authorization
    ↓
Authorized Projection
```

---

# 11. REALTIME

Realtime is NEVER Source of Truth.

Realtime is only an invalidation / synchronization mechanism.

Correct:

```text
Durable State Change
       ↓
Persisted Event
       ↓
Projection Update
       ↓
Realtime Invalidation
```

Incorrect:

```text
Realtime Message
       ↓
Assume State Changed
```

---

# 12. RECONNECT

Realtime systems must support durable cursor catch-up.

After reconnect:

```text
Client last durable cursor
          ↓
Server
          ↓
Catch-up missing events
          ↓
Projection synchronization
          ↓
Current state
```

A disconnected client must not silently miss authoritative state changes.

---

# 13. NOTIFICATIONS

Notifications must be:

- sanitized
- minimal
- scope-bound
- privacy-safe

Notifications must not contain unnecessary private information.

Notification payload must not become a bypass for Authorization.

---

# 14. PRIVACY

Privacy must be enforced at:

- Domain level
- Event level
- Projection level
- API level
- Authorization level
- UI level

UI hiding alone is NOT privacy.

Forbidden architecture:

```text
Database
 ↓
Everything sent to Browser
 ↓
UI hides fields
```

Correct:

```text
Raw Domain State
      ↓
Authorization
      ↓
Scoped Projection
      ↓
Role-specific API
      ↓
UI
```

---

# 15. TEACHER PRIVATE DATA

Teacher-private information must NEVER leak into Institute Management projections unless an explicit authorized contract permits a specific derived field.

Examples of protected data:

- private notes
- private teaching adaptation
- private reflection
- private coaching context
- private strategy

Management must receive only authorized organizational / derived projections.

---

# 16. STUDENT PRIVATE DATA

Student private information must never leak to:

- another Student
- unauthorized Teacher
- unauthorized Staff
- unauthorized Management role
- another Tenant

Cross-student leakage is a critical security failure.

---

# 17. IMPORTANT SEMANTIC RULES

The following distinctions must NEVER be broken:

```text
Student Check-in ≠ Attendance

Student Done ≠ Mastery

Teacher Observation ≠ Mastery Mutation

Teacher Observation ≠ Automatic Teacher Capability Mutation

Retention Risk ≠ Learning State

Recommendation ≠ Action

Action ≠ Outcome

Realtime ≠ Source of Truth
```

---

# 18. PROTECTED ELYORA STATE

The following remain owned by ELYORA:

- Learning State
- Mastery
- Assessment state
- Progression
- Educational engine decisions

Institute Intelligence may READ authorized signals.

It must not directly mutate protected ELYORA state.

Any state-changing operation must use an official ELYORA Contract.

---

# 19. BUILD-23 BASELINE

BUILD-23 is the protected academic execution baseline.

Completed BUILD-23 capabilities include:

- Session Briefing
- Teaching Plan
- Live Session Execution
- Attendance
- Evidence
- Follow-up
- Student Summary
- Makeup
- Academic Summary
- Real-Class Observation

BUILD-24 and later Builds must NOT duplicate or break these capabilities.

Any modification to BUILD-23 requires explicit regression validation.

---

# 20. BUILD-24 MISSION

BUILD-24 introduces:

# RETENTION & INSTITUTE INTELLIGENCE FOUNDATION

The system must evolve from:

```text
Dashboard
```

to:

```text
Active Intelligence
```

The primary lifecycle is:

```text
Detect
→ Explain
→ Recommend
→ Assign
→ Act
→ Measure
→ Re-evaluate
→ Detect
```

This loop is a first-class architectural capability.

---

# 21. BUILD-24 CORE DOMAINS

BUILD-24 includes:

1. Student Health
2. Student Retention Risk
3. Teacher Intelligence
4. Class Health
5. Institute Intelligence
6. Intervention
7. Recommendation Engine
8. Outcome Measurement

---

# 22. STUDENT HEALTH

Student Health is a derived composite state.

Possible dimensions:

```text
Student Health
├── Learning Health
├── Engagement Health
├── Attendance Health
├── Assignment Health
├── Progression Health
├── Intervention Health
└── Retention Health
```

Every signal should support, where applicable:

- value
- timestamp
- trend
- evidence
- confidence
- source
- scope

---

# 23. RETENTION RISK

Retention Risk must NOT be a meaningless numeric score.

A Risk object should support:

```text
Risk
├── Level
├── Confidence
├── Trend
├── Drivers
├── Evidence
├── Last Evaluated
├── Recommended Action
└── Measurement Plan
```

Risk is derived intelligence, not absolute truth.

Example:

```text
Risk: HIGH

Drivers:
- Attendance deterioration
- Reduced activity
- Missed follow-up
- Progression friction

Confidence: 0.87

Trend: WORSENING
```

Every meaningful risk must be explainable.

---

# 24. TEACHER INTELLIGENCE

Teacher Intelligence must NOT become a simplistic Teacher ranking system.

It should analyze:

```text
Teacher Intelligence
├── Teaching Signals
├── Student Response
├── Class Signals
└── Leadership Signals
```

Teacher Observation is Evidence.

It does not directly mutate:

- Mastery
- Teacher Capability
- Teacher Score

Any interpretation must be authorized, explainable and traceable.

---

# 25. CLASS HEALTH

Class Health may aggregate:

- Attendance
- Participation
- Learning progress
- Risk distribution
- Intervention load
- Session health
- Teacher signals

Aggregations must respect privacy.

Example:

```text
18 students
4 elevated risk
2 high risk
```

may be appropriate for an authorized Management view.

Raw private student information must not automatically accompany aggregate data.

---

# 26. INSTITUTE INTELLIGENCE

Institute Intelligence must answer:

```text
What is happening?
Why is it happening?
What is likely to happen?
What should we do?
Who should do it?
Did it work?
What should happen next?
```

Institute Intelligence includes:

- Student intelligence
- Teacher intelligence
- Class intelligence
- Operational intelligence
- Retention intelligence
- Intervention intelligence
- Outcome intelligence

---

# 27. RECOMMENDATION ENGINE

Recommendations must be:

- explainable
- evidence-backed
- scoped
- authorized
- actionable
- measurable

A Recommendation should conceptually contain:

```text
Recommendation
├── ID
├── Subject
├── Scope
├── Priority
├── Reason
├── Evidence
├── Confidence
├── Suggested Action
├── Eligible Actors
├── Expiration
└── Outcome Measurement Plan
```

Recommendation does not automatically execute an action.

---

# 28. INTERVENTION

Intervention is a first-class domain.

Lifecycle:

```text
PROPOSED
   ↓
ASSIGNED
   ↓
ACCEPTED
   ↓
IN_PROGRESS
   ↓
COMPLETED
   ↓
MEASURED
   ↓
CLOSED
```

If ineffective:

```text
MEASURED
   ↓
INEFFECTIVE
   ↓
RE-EVALUATE
   ↓
NEW RECOMMENDATION
```

---

# 29. OUTCOME MEASUREMENT

The system must distinguish activity from effectiveness.

Example:

```text
Teacher contacted Student
```

is an ACTION.

It does not mean:

```text
Student recovered
```

Outcome measurement must define:

- expected outcome
- metric
- measurement window
- observed result
- effectiveness
- confidence

Example:

```text
Intervention:
Teacher Follow-up

Measurement Window:
7 days

Expected:
Learning activity recovery

Observed:
+31%

Result:
EFFECTIVE
```

---

# 30. EVENT ARCHITECTURE

Events represent facts.

Examples:

```text
StudentAttendanceRecorded
SessionCompleted
FollowUpCreated
FollowUpCompleted
AssessmentCompleted
LearningActivityObserved
AssignmentChanged
EnrollmentChanged
InterventionCompleted
```

Events must not pretend to be state mutation commands.

Avoid events such as:

```text
MakeStudentHealthy
IncreaseRetention
SetMastery
```

---

# 31. EVENT CONTRACT

Every production event should have a versioned contract containing conceptually:

```text
event_id
event_name
schema_version
occurred_at
producer
tenant_scope
actor_scope
subject_scope
payload
```

Events must be:

- durable
- traceable
- versioned
- scope-aware
- privacy-safe

---

# 32. PROJECTION ARCHITECTURE

BUILD-24 intelligence should be built from authorized projections.

Correct:

```text
Domain Events
      ↓
Authorization-aware Event Routing
      ↓
Projection Workers
      ↓
Intelligence Read Models
```

Projections must explicitly define:

- Owner
- Inputs
- Consumers
- Allowed fields
- Forbidden fields
- Refresh model
- Retention policy
- Authorization policy

---

# 33. API / OPENAPI CONTRACTS

Before implementation of a new cross-domain capability, define:

- API contract
- Request schema
- Response schema
- Authorization requirements
- Tenant scope
- Actor scope
- Resource scope
- Error model
- Idempotency requirements
- Versioning

Implementation must follow the Contract.

Do not silently invent API behavior inside UI code.

---

# 34. UI OWNERSHIP

UI is a consumer of authorized backend state.

UI must NOT become the owner of:

- authorization
- role
- tenant
- business rules
- mastery
- retention truth
- intervention truth

UI may provide:

- visualization
- workflow
- input
- interaction
- navigation

Server remains authoritative.

---

# 35. SECURITY REQUIREMENTS

Every new feature must be checked for:

- Authentication
- Authorization
- Tenant isolation
- Role isolation
- Resource authorization
- Scope authorization
- IDOR
- Deep-link bypass
- Client-side authority
- Cross-tenant leakage
- Cross-student leakage
- Teacher-private leakage
- Management-data leakage
- Event leakage
- Projection leakage
- Notification leakage

---

# 36. REGRESSION REQUIREMENTS

Every Build must test:

### Functional Regression
Existing functionality still works.

### Security Regression
Unauthorized access remains blocked.

### Privacy Regression
Private data remains private.

### Event Regression
Events reach only authorized consumers.

### Projection Regression
Projections contain only permitted data.

### Authorization Regression
Server remains authoritative.

### Realtime Regression
Realtime remains invalidation-only.

### Reconnect Regression
Durable cursor catch-up works.

### Deep Link Regression
Destination is re-authorized.

### ELYORA Regression
No protected Engine logic is duplicated or mutated incorrectly.

---

# 37. TEST STATUS RULE

Never claim a test passed without actually validating it.

The following statuses are strictly distinct:

```text
OFFLINE CONTRACT PASS

CONNECTED STAGING PASS

CONNECTED PRODUCTION PASS
```

These statuses must never be conflated.

If production is not connected or verified:

```text
CONNECTED PRODUCTION PASS
```

must NOT be claimed.

---

# 38. BUILD STATUS LANGUAGE

Use explicit statuses:

```text
PLANNED
IN DESIGN
IN IMPLEMENTATION
IMPLEMENTED
OFFLINE VERIFIED
OFFLINE CONTRACT PASS
CONNECTED STAGING VERIFIED
CONNECTED STAGING PASS
CONNECTED PRODUCTION VERIFIED
CONNECTED PRODUCTION PASS
BLOCKED
NEEDS REVIEW
REGRESSION FAILED
```

Never use vague language such as:

```text
Done
Everything works
Production ready
Fully verified
```

unless the evidence supports it.

---

# 39. NO FALSE PASS

A Chat must never report PASS merely because:

- code looks correct
- types compile conceptually
- architecture sounds correct
- UI renders
- mock data works
- local test passes

PASS requires the relevant validation evidence.

---

# 40. DEVELOPMENT ORDER

For significant capabilities use:

```text
1. Audit
2. Domain definition
3. Source-of-Truth definition
4. Ownership definition
5. Contract definition
6. Event definition
7. Projection definition
8. Authorization definition
9. Privacy definition
10. API/OpenAPI definition
11. Backend implementation
12. Projection implementation
13. Intelligence logic
14. UI implementation
15. Integration
16. Regression
17. Security audit
18. Privacy audit
19. Event routing audit
20. Final status
```

Do not start with UI merely because UI is visually easier.

---

# 41. CHANGE MANAGEMENT

Before modifying an existing feature:

1. Identify its owner.
2. Identify its Source of Truth.
3. Identify existing Contracts.
4. Identify dependencies.
5. Identify consumers.
6. Identify privacy implications.
7. Identify authorization implications.
8. Identify regression surface.
9. Make the smallest safe change.
10. Re-test affected areas.

Do not rewrite working systems without architectural justification.

---

# 42. NO DUPLICATION

Before creating any new:

- component
- service
- endpoint
- hook
- projection
- event
- domain object
- database table
- UI workflow

search the existing Project architecture first.

If an equivalent capability already exists:

- reuse it,
- extend it,
- or explicitly justify why a new implementation is necessary.

Duplicate logic is considered architectural debt and should not be introduced casually.

---

# 43. CHAT-TO-CHAT CONTINUITY

Every new Chat must begin by understanding:

- current Build
- current baseline
- current Source-of-Truth Map
- current Contracts
- current known regressions
- current implementation state

Do not assume that a previous Chat's proposed architecture was implemented.

Distinguish:

```text
PROPOSED
IMPLEMENTED
VERIFIED
```

These are not interchangeable.

---

# 44. WHEN CONTEXT IS MISSING

If required implementation details are unavailable:

Do NOT invent them.

Instead:

1. State what is known.
2. State what is unknown.
3. Use existing authoritative architecture.
4. Make assumptions explicit.
5. Continue with a safe provisional design where possible.
6. Mark unverified items clearly.
7. Request the relevant source/file only when necessary.

Never fabricate:

- API endpoints
- database schemas
- production status
- deployment status
- test results
- existing code
- connected services
- credentials
- production integrations

---

# 45. ARCHITECTURE DECISION RECORDS

Important architectural changes must be recorded as an ADR.

Each ADR should include:

```text
ADR ID
Title
Context
Problem
Decision
Alternatives
Consequences
Affected Domains
Affected Contracts
Security Impact
Privacy Impact
Migration / Regression Impact
Status
```

---

# 46. ACTIVE INTELLIGENCE PRINCIPLE

The ultimate purpose of BUILD-24+ is not to display analytics.

It is to create an operational intelligence loop:

```text
Detect
↓
Explain
↓
Recommend
↓
Assign
↓
Act
↓
Measure
↓
Re-evaluate
↓
Improve
```

The system should progressively move from:

```text
Passive Analytics
```

to:

```text
Actionable Intelligence
```

and eventually:

```text
Continuous Improvement System
```

---

# 47. BUSINESS OBJECTIVE

The Ecosystem ultimately aims to improve simultaneously:

- Student learning quality
- Student retention
- Student value
- Teacher capability
- Teacher value
- Institute operational quality
- Institute revenue
- Teacher revenue
- Management visibility
- Intervention effectiveness
- Analytics depth
- Continuous improvement

However:

**Business optimization must never override privacy, authorization, educational integrity or domain ownership.**

---

# 48. NORTH STAR ARCHITECTURE

The long-term architecture is:

```text
                       ELYORA
                         │
              Authoritative Learning
                         │
                         ▼
              ┌───────────────────┐
              │ Institute         │
              │ Ecosystem         │
              └─────────┬─────────┘
                        │
          ┌─────────────┼─────────────┐
          ▼             ▼             ▼
      Teacher        Student       Institute
      Leader         Guided        Command
          │             │             │
          └─────────────┼─────────────┘
                        ▼
              Authorized Events
                        │
                        ▼
              Scoped Projections
                        │
                        ▼
             Intelligence Foundation
                        │
          ┌─────────────┼─────────────┐
          ▼             ▼             ▼
       Student        Teacher       Institute
        Health      Intelligence   Intelligence
          │             │             │
          └─────────────┼─────────────┘
                        ▼
                 Recommendations
                        │
                        ▼
                   Intervention
                        │
                        ▼
                      Action
                        │
                        ▼
                     Outcome
                        │
                        ▼
                  Re-evaluation
                        │
                        └──────────→ Continuous Improvement
```

---

# 49. ABSOLUTE RULES

The following rules are non-negotiable:

1. ELYORA Core Engines remain authoritative.
2. No duplicate Mastery Engine.
3. No duplicate Learning Engine.
4. No duplicate Progression Engine.
5. Clerk is Authentication, not final authorization.
6. Authorization is server-side.
7. Browser creates no authority.
8. Workspace switching is server-authorized.
9. Realtime is not Source of Truth.
10. Durable reconnect catch-up is required.
11. Notifications are sanitized and scope-bound.
12. Deep Links require fresh authorization.
13. Teacher-private data stays private.
14. Student-private data stays private.
15. Cross-tenant access is forbidden.
16. Cross-student leakage is forbidden.
17. Student Check-in is not Attendance.
18. Student Done is not Mastery.
19. Teacher Observation does not directly mutate Mastery.
20. Intelligence does not directly mutate protected ELYORA state.
21. Recommendation does not equal Action.
22. Action does not equal Outcome.
23. Every important Intelligence claim must be explainable.
24. Every intervention must be measurable.
25. Every major Build must undergo regression.
26. Offline PASS is not Connected PASS.
27. Connected Staging PASS is not Connected Production PASS.
28. Never claim a PASS without evidence.
29. Never invent unavailable implementation details.
30. Never break a protected completed Build without explicit change control.

---

# 50. CURRENT PROJECT BASELINE

Current official baseline:

```text
BUILD-00 → BUILD-23
```

BUILD-23:

```text
COMPLETED / PROTECTED BASELINE
```

Current development:

```text
BUILD-24
Retention & Institute Intelligence Foundation
```

BUILD-24 begins with:

```text
Architecture Audit
        ↓
Source-of-Truth Map
        ↓
Domain Ownership
        ↓
ELYORA Contracts
        ↓
Event Taxonomy
        ↓
Projection Architecture
        ↓
Privacy Model
        ↓
Authorization Matrix
        ↓
OpenAPI Contracts
        ↓
Implementation
```

---

# 51. REQUIRED BEHAVIOR OF EVERY FUTURE CHAT

هر Chat در این Project باید:

1. ابتدا وضعیت فعلی را تشخیص دهد.
2. Build فعلی را مشخص کند.
3. Baselineهای protected را حفظ کند.
4. Source of Truth را بررسی کند.
5. مالک Domain را مشخص کند.
6. قبل از ایجاد قابلیت جدید dependencyها را بررسی کند.
7. Contractها را قبل از implementation جدی تعریف کند.
8. Security و Privacy را از ابتدا در طراحی لحاظ کند.
9. از duplicate logic جلوگیری کند.
10. بعد از هر مرحله Regression انجام دهد.
11. وضعیت واقعی را با status دقیق گزارش کند.
12. بین Proposed / Implemented / Verified تفاوت بگذارد.
13. هیچ PASS جعلی اعلام نکند.
14. اگر اطلاعات کافی ندارد، چیزی را جعل نکند.
15. هیچ تصمیمی را که با این Master Instruction تعارض دارد به‌صورت silent اجرا نکند.

---

# 52. FINAL PRINCIPLE

این Project صرفاً مجموعه‌ای از سه Dashboard یا سه Application نیست.

هدف نهایی:

# BUILD AN INTELLIGENT INSTITUTE ECOSYSTEM

سیستمی که:

```text
understands
      ↓
detects
      ↓
explains
      ↓
recommends
      ↓
coordinates
      ↓
acts
      ↓
measures
      ↓
learns
      ↓
improves
```

و این چرخه را بدون نقض:

- Learning Ownership
- Domain Ownership
- Authorization
- Privacy
- Security
- Teacher Agency
- Student Boundaries
- ELYORA Authority

انجام می‌دهد.

**این سند مرجع اصلی تمام تصمیم‌های معماری، توسعه، دیباگ، تست، UI، Backend، API، Event، Projection، Intelligence و Integration در Project است.**

---

# END OF MASTER PROJECT INSTRUCTION