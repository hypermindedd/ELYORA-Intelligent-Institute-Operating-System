import argparse
import json
from pathlib import Path

from jsonschema import Draft202012Validator, FormatChecker


def load_validators(directory):
    format_checker = FormatChecker()
    if "date-time" not in format_checker.checkers:
        raise RuntimeError("Install the contract test requirements to enable date-time validation")
    validators = {}
    for path in sorted(directory.glob("*.schema.json")):
        with path.open(encoding="utf-8") as schema_file:
            schema = json.load(schema_file)
        Draft202012Validator.check_schema(schema)
        validators[path.name] = Draft202012Validator(schema, format_checker=format_checker)
    return validators


def scope_examples():
    proposed = {
        "directiveId": "scope-example", "tenantId": "tenant-example", "studentId": "student",
        "teacherId": "teacher", "programId": "english-a1", "version": 2,
        "allowedTopics": ["greetings"], "excludedTopics": [], "allowedActivityTypes": ["conversation"],
        "maxSessionMinutes": 15, "startsAt": "2026-11-18T08:00:00Z", "expiresAt": "2026-11-18T09:00:00Z",
        "status": "proposed", "targetLanguageCode": "en", "localeVariant": "en-US",
        "instructionLocale": "fa-IR", "programVersion": "example-v1",
    }
    approved = dict(proposed, status="approved", approvedBy="teacher")
    return [
        ("proposed", proposed, True),
        ("approved", approved, True),
        ("revoked", dict(approved, status="revoked", revokedAt="2026-11-18T08:30:00Z"), True),
        ("approved without approving actor", dict(proposed, status="approved"), False),
        ("revoked without time", dict(approved, status="revoked"), False),
        ("revoked with a malformed time", dict(approved, status="revoked", revokedAt="yesterday"), False),
    ]


def qualification_examples():
    approved = {
        "teacherId": "teacher", "tenantId": "tenant-example", "consentRecorded": True,
        "credentialsVerified": True,
        "evidence": [{"rubricVersion": "example-v1", "observedBehavior": "Example observation"}],
        "reviewerDecision": "approve", "expiresAt": "2026-11-18T09:00:00Z",
    }
    return [
        ("approved", approved, True),
        ("more evidence requested", dict(approved, reviewerDecision="request_more_evidence",
                                         consentRecorded=False, credentialsVerified=False, evidence=[]), True),
        ("approved without consent", dict(approved, consentRecorded=False), False),
        ("approved without verified credentials", dict(approved, credentialsVerified=False), False),
        ("approved without evidence", dict(approved, evidence=[]), False),
    ]


def room_examples():
    room = {"roomId": "room-example", "tenantId": "tenant-example", "status": "active",
            "startsAt": "2026-11-18T08:00:00Z", "expiresAt": "2026-11-18T09:00:00Z"}
    return [
        ("command room", dict(room, roomType="institute_command"), True),
        ("classroom with class", dict(room, roomType="classroom", classId="class-example"), True),
        ("student cabin with owner", dict(room, roomType="student_private", ownerId="student"), True),
        ("teacher cabin with owner", dict(room, roomType="teacher_private", ownerId="teacher"), True),
        ("classroom without class", dict(room, roomType="classroom"), False),
        ("student cabin without owner", dict(room, roomType="student_private"), False),
        ("teacher cabin without owner", dict(room, roomType="teacher_private"), False),
        ("classroom with empty class ID", dict(room, roomType="classroom", classId=""), False),
        ("teacher cabin with empty owner ID", dict(room, roomType="teacher_private", ownerId=""), False),
    ]


def main():
    parser = argparse.ArgumentParser(description="Verify proposed EI-OS schemas against synthetic examples")
    parser.add_argument("schema_directory", nargs="?", type=Path,
                        default=Path(__file__).resolve().parents[1] / "contracts" / "schemas")
    validators = load_validators(parser.parse_args().schema_directory)
    examples = {
        "learning-scope-directive.v2.schema.json": scope_examples(),
        "teacher-qualification.v1.schema.json": qualification_examples(),
        "virtual-room.v1.schema.json": room_examples(),
    }
    failures = 0
    for filename, cases in examples.items():
        for title, instance, expected in cases:
            actual = validators[filename].is_valid(instance)
            if actual != expected:
                print(f"FAIL {filename} / {title}: expected valid={expected}, got {actual}")
                failures += 1
    total = sum(len(cases) for cases in examples.values())
    print(f"{len(validators)} schemas checked against Draft 2020-12; {total - failures}/{total} example outcomes matched")
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
