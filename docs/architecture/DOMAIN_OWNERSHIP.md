# Domain ownership and source-of-truth map
| Domain | Authoritative owner | Consumers | Prohibition |
|---|---|---|---|
| Learning, Assessment, Mastery, Progression, adaptive decisions | ELYORA parent | authorized teacher/student/institute projections | duplicate Institute engines or direct state mutation |
| Tenant, org membership, enrollment, class, assignment | Institute | role-specific APIs | client-created membership/role |
| Scope directive approval, classroom timetable | Institute policy workflow (teacher authors instructional scope) | guided student, teacher, ELYORA adapter | student enlarging scope |
| Live room metadata/presence | Institute; external transport for media | authorized room UI | equating presence with attendance |
| Official attendance and academic session lifecycle | Institute protected BUILD-23 | Teacher, aggregate Institute | reimplement without audit |
| Teacher-private reflection and planning | Teacher Leader | teacher only unless explicit share | admin raw private read by default |
| Student-private journal and experience | Student private domain | student unless explicit allowed share | cross-student/tenant leakage |
| Teacher credentialing/eligibility | Institute qualification | personnel/teacher | autonomous certification by AI |
| Derived student/teacher/class signals and recommendations | Institute intelligence | scoped staff views | writing ELYORA learning truth |
| Intervention assignment/action/outcome | Institute | authorized staff | treating an action as improvement |
| Payments, settlements, catalog, commercialization | Institute | authorized finance/program roles | uncontrolled ledger mutation |
| Official ELYORA contracts / licensed educational capabilities | ELYORA parent | ELYORA adapter | guessing live endpoints from proposed schema |

Every newly added table, event or API must extend this map with a single writer, privacy class and contract. Where the historic BUILD-23 implementation cannot be located, maintain NEEDS_REVIEW rather than rebuilding it.
