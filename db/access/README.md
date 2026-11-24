# PostgreSQL service roles

Provision the four non-login groups in `001_runtime_groups.sql` once per cluster. Apply the five schema migrations through `005_owner_assignment_grant.sql`, then apply `002_scope_grants.sql` to each Institute database as the schema owner. Both scripts run in transactions. An existing group name causes group creation to stop before changing any roles. For another database in the same cluster, reuse the verified groups and apply its database-local grants.

Bind each service login to its single group through the environment's credential provisioning. Logins must inherit group permissions, be subject to row-level security and have no ownership or administrative privileges. The grants are additive. When adopting them for existing logins, check and retire prior direct privileges and inherited memberships before switching traffic. To roll back a binding, revoke the group from the affected login and restore its previously verified binding.

| Group | Service |
| --- | --- |
| `ei_scope_api` | Scope reads, authorized transitions and atomic outbox insertion |
| `ei_scope_delivery` | Private outbox leasing and delivery state |
| `ei_scope_projection` | Invalidation marker insertion |
| `ei_scope_governance` | Membership, assignment lifecycle and audit insertion |

The integration suite provisions disposable logins and applies these same SQL files. Tenant context is established by the trusted server inside each transaction. Group membership alone supplies no application-level authorization.
