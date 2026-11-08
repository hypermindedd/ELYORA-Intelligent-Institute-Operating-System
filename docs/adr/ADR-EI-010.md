# ADR-EI-010 — Scope transition and outbox in one transaction

**Status** Proposed for connected use. Tested against a transactional fixture.  
**Depends on** [ADR-EI-009](ADR-EI-009.md)

The Institute owns directive lifecycle. At commit time, re-read active tenant membership, the directive and its assignment under one serializable or equivalently locked transaction. Compare the two revisions and recompute the legal transition from the authoritative records and the trusted clock. A losing precondition performs no write. Treat the incoming directive as intent only.

The transaction replaces the directive with a fresh, opaque revision and appends exactly one restricted outbox fact. If either operation fails, roll back both. The transaction host must resolve only after commit and must roll back on a rejected callback. Store implementations must protect actor, directive and assignment reads from concurrent revocation until commit, and translate known serialization conflicts to a failed precondition. An uncertain result is reconciled by reading the directive; delivery is at least once and consumers deduplicate by event ID. Provision no outbox data through public endpoints or realtime.

The fact uses the existing [Institute event envelope](../../contracts/schemas/event-envelope.v1.schema.json). It uses student-private classification and a closed payload of directive ID, directive version and the new revision. No topic, content, private notes, or adapter data appears. A consumer must enforce tenant, role and allowed purpose, and resolve current authorization before projecting any data.

Writing first and publishing later outside a transaction risks missing facts; publishing first risks a false fact after rollback. The transaction port defines atomicity without selecting a database or connecting a service. A concrete adapter, durable recovery, tenant isolation and provider configuration still require connected evidence.

[Event contract](../../contracts/events/learning-scope-transition.v1.schema.json) · [A3](https://github.com/hypermindedd/ELYORA-Intelligent-Institute-Operating-System/issues/4)
