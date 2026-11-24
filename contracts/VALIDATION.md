# Offline validation for EI-OS draft contracts

These contracts are Institute design drafts (`PROPOSED_NON_CANONICAL`). Any integration with ELYORA Core requires an independently verified, versioned agreement from its owner. The schemas describe records entering an Institute boundary. Domain policy verifies who may act and whether the action is valid in context.

## Offline verification

`npm run check` checks the schema inventory, engine registry and Node domain tests. The offline CI workflow also validates each schema against Draft 2020-12 and checks representative records, including RFC 3339 date-times.

```sh
python -m venv /tmp/ei-os-contract-tests
/tmp/ei-os-contract-tests/bin/python -m pip install -r scripts/requirements-contract-tests.txt
/tmp/ei-os-contract-tests/bin/python scripts/check-draft-contract-examples.py
```

## Conditional requirements

| Draft record | Validation |
| --- | --- |
| Learning scope v2 | An approved directive identifies the approving actor. A revoked directive records the revocation time. |
| Teacher qualification v1 | An approval requires recorded consent, verified credentials and at least one item of evidence. Reviewer independence and evidence sufficiency remain domain decisions. |
| Virtual room v1 | A classroom identifies its class. A private student or teacher cabin identifies its owner. |

Existing records should be classified before a connected consumer adopts the tightened drafts. Records that lack evidence of an approval, revocation or owner need authoritative reconciliation. Authorization, time-window ordering, tenant membership, version negotiation and API/event conformance have separate acceptance gates.
