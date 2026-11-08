# EI-OS contract proposals

Institute contracts are drafts and cannot authorize writes to ELYORA educational state. The official ELYORA interface requires separate source-owner verification.

- [Learning Scope API v1](openapi/learning-scope.v1.json) covers reading, approving and revoking an existing directive. The [HTTP handler](../src/http/learning-scope.mjs) uses server-supplied identity and persistence ports. [ADR-EI-009](../docs/adr/ADR-EI-009.md) describes the transaction, retry, privacy and staging gates.
- [Schema inventory](schemas/) includes versioned Institute drafts. The repository check runs structural lint and targeted request/response tests. Full JSON Schema conformance, event payload validation and connected integration remain A2/A3 work.
