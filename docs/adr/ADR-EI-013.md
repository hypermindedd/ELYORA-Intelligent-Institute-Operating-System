# ADR-EI-013 — Product owner control plane and response routing

**Status** Proposed for connected use. Membership administration and assignment revocation are executable slices.  
**Authority** Master Project Instruction §§7–10, 14–16, 35 and 45.

## Authority model

The product owner has a dedicated control plane across Institute tenants. Authenticate with the owner's regular identity-provider account and require verified recent step-up before entering this plane. Pin the immutable verified subject in server configuration for each environment. Passwords, role assignment and recovery remain with their respective authorities. Institute membership, client headers and identity-provider role claims cannot confer product ownership. The owner binding can be changed only through an authorized server configuration change and audited recovery.

| Control area | Owner capability and boundary | State |
| --- | --- | --- |
| Institute membership | Inspect role and active status for an existing member. Change the role or suspend and restore access for a selected tenant. | Implemented in this branch |
| Institute assignments | Inspect and revoke an existing teacher-to-student assignment in the selected tenant. Restoration requires an explicit future grant flow with new authority. | Implemented in this branch |
| Institute policies and operations | Govern tenant provisioning, role policies, rooms, schedules, integrations and feature entitlements through their owning commands. Separate reversible settings from destructive or high-impact operations. | Planned, each command has its own contract |
| Privacy and learning | Govern which approved policy and contracts apply. Protected teacher/student records remain in their owners' authorized views. ELYORA Core alone writes educational state and teacher authorization remains the authority for learning scope. | Inherited boundary |
| Owner recovery | Recover or rotate the trusted binding through an administrative configuration process. A membership command cannot delegate or change product ownership. | Deployment gate |

Suspension and a change away from the required role remove the member's operational authority on the next scope request. An inactive author or student also makes their existing scope unavailable. Reactivation restores only otherwise eligible assignments and directives that remain current. Permanent assignment revocation has a dedicated lifecycle command. It increments the assignment revision and appends one audit entry atomically. The existing scope read and commit paths deny against the revoked assignment, including after membership restoration. The command emits no new educational fact and changes no directive document. Directive revocation retains its own lifecycle command. This preserves the distinction between suspending an account and revoking an educational directive.

## Request and response routing

1. The browser submits a bearer token, HTTP method and explicit tenant/resource selectors. The server generates a request ID, validates the route and input, and never uses caller-supplied role, owner or audit identity.
2. A trusted verifier validates token and step-up. The router compares the immutable subject with the configured owner. The selected tenant is then passed to the dedicated PostgreSQL control-plane connection. Tenant isolation still applies to its SQL.
3. GET returns the membership or assignment view and a strong ETag. POST to the assignment revocation route requires If-Match and no body. PUT requires that ETag in If-Match plus exactly `role` and `active`. The command locks the record, checks its revision, writes the new policy and appends one audit entry in the same transaction. An unchanged request at the current revision returns the same view without creating a change entry.
4. The response dispatcher returns only the allowed owner projection with a request ID and ETag. Bad input, unauthorized resource, stale state and storage failure have distinct HTTP statuses. Resource absence and non-owner access share 404. Raw database errors and bearer tokens never enter the response or audit. An uncertain write is reconciled with a fresh GET and its request/audit ID.
5. Operational requests continue through the existing tenant and role route. A teacher or student gets the scoped view, Institute Command gets authorized aggregates, and the owner route gets control metadata. Projection and invalidation carry no new authority. Future control operations follow this dispatch pattern through their owning domain.

Audit records contain the owner subject, target membership, old and new role/active state, request ID and server time. Grant audit insert permission separately from authorized review; the command role has no audit update or delete privilege. Before connected use, configure the trusted owner binding and Clerk step-up verification, test recovery and least privilege, and capture staging evidence. To roll back, unmount the owner route and retain policy state and audit records.

[Versioned owner API](../../contracts/openapi/product-owner.v1.json) · [Migration](../../db/migrations/003_product_owner_membership.sql)
