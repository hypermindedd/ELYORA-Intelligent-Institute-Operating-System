# Owner control plane checklist

## Implementation decisions

| Topic | Expected design |
| --- | --- |
| Identity | Stable verified subject, server-owned owner binding, separate bootstrap/recovery, appropriate fresh step-up. A role edited by a user or tenant administrator cannot confer product ownership. |
| Requests and responses | Route with explicit tenant and resource selectors. Minimize editable fields. Validate input bounds. Return only the permitted projection, safe reason codes and a request identifier. |
| Mutation | Lock or serialize authoritative state. Check active membership and intent at commit time. Use a create-only precondition and compare existing revisions. An already-applied no-op produces no second change audit. |
| Audit | Include server owner identity, target, prior and new policy or revisions, request ID and trusted time. Keep sensitive content and tokens out. Roll back both changes if either write fails. |
| Re-grant | New, unpredictable generation. Backfill only when the original grant is verifiable. If provenance is unclear, preserve the record for authorized review and keep dependent access closed until separately reauthorized. Require a generation binding on new records and enforce it on all existing entry points. Retain earlier scopes as history. |
| Migration and rollback | Verify backfill on preexisting data and test a previously revoked grant. Keep authorization that checks generations enabled during rollback, or stop affected traffic before reverting. Preserve audit and authority history. |

## Acceptance tests

- A signed-in tenant manager cannot become the owner by setting request headers, role claims or tenant fields. Missing or stale step-up cannot change policy.
- Two institutions may reuse resource identifiers. Confirm isolation in queries, updates and audit with non-bypass database roles.
- Race an operational write against revocation and verify no authorization/write gap. Two simultaneous creates produce one grant and one audit entry. A stale update returns a conflict. An audit failure leaves policy unchanged.
- Suspension blocks the affected operational reads and writes. Restoration follows the approved suspension semantics. Revocation stays effective after membership restoration.
- Re-grant does not restore a historical dependent resource. A newly authorized resource binds to the new generation and becomes available through the normal route.
- Existing authenticated clients keep compatible responses. Test role-specific outputs and verify no private record is embedded. Test live identity and step-up separately before deployment.

## Reference implementation

[EI-OS owner API and generation migration at a fixed revision](https://github.com/hypermindedd/ELYORA-Intelligent-Institute-Operating-System/tree/be5caef37111c52bdee7e77915d037be3c7f8463) and [ADR-EI-013](https://github.com/hypermindedd/ELYORA-Intelligent-Institute-Operating-System/blob/be5caef37111c52bdee7e77915d037be3c7f8463/docs/adr/ADR-EI-013.md) show membership and assignment controls. [PostgreSQL integration evidence](https://github.com/hypermindedd/ELYORA-Intelligent-Institute-Operating-System/actions/runs/42472770798) is scoped to a disposable database. The skill does not require access to this private example.
