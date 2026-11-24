import test from "node:test";
import assert from "node:assert/strict";
import { createTeacherRehearsal } from "../src/domain/teacher-rehearsal.mjs";
const fields = { tenantId:"s1", teacherId:"t", reviewerId:"r", managerId:"m", variety:"fr-FR", consent:true };
const actor = (role, actorId) => ({ role, actorId, tenantId:"s1", serverAuthenticated:true });
const r = actor("qualification_reviewer","r"), m = actor("institute_manager","m"), teacher = actor("teacher","t");
const create = overrides => createTeacherRehearsal({...fields,...overrides});

for (const variety of ["fr-FR","en-GB"]) {
  test(variety + " · bounded learner turns and evidence-limited reviewed projection", () => {
    const s = create({variety});
    assert.throws(() => s.managementReport(m), /UNAVAILABLE/);
    const excerpts = [];
    while (s.turn(r).stage !== "complete") {
      const turn = s.turn(r);
      s.respond(r, turn, "still_unclear");
      assert.throws(() => s.respond(r, turn, "still_unclear"), /STALE/);
      const follow = s.turn(r);
      assert.equal(follow.stage, "clarify");
      s.respond(r, follow, "still_unclear");
      const transfer = s.turn(r);
      assert.equal(transfer.stage, "transfer");
      s.respond(r, transfer, "still_unclear");
      const observation = s.turn(r);
      assert.equal(observation.stage, "observe");
      excerpts.push(turn.learnerLine);
      const dimension = Object.keys(observation.indicators)[0];
      const row = {dimension, anchor:"WITH_PROMPT", observedBehavior:"Private detail"};
      assert.throws(() => s.observe(r,observation,[row,row]), /INVALID_OBSERVATION/);
      assert.throws(() => s.observe(r,observation,[{...row,dimension:"prosody"}]), /INVALID_OBSERVATION/);
      s.observe(r, observation, [row]);
    }
    assert.equal(new Set(excerpts).size, 5);
    assert.throws(() => s.managementReport(m), /UNAVAILABLE/);
    s.release(r);
    const report = s.managementReport(m);
    assert.equal(report.dimensions.length, 15);
    assert.equal(report.dimensions.filter(d => d.status === "AUDIO_REQUIRED").length, 5);
    assert.ok(report.dimensions.some(d => d.status === "NOT_OBSERVED"));
    assert.equal(report.professionalLevel, "NOT_ISSUED");
    assert.doesNotMatch(JSON.stringify(report), /Private detail/);
    report.dimensions[0].evidence.length = 0;
    assert.ok(s.managementReport(m).dimensions[0].evidence.length);
    for (const bad of [{...m,tenantId:"s2"}, {...m,actorId:"other-manager"},teacher,{...m,serverAuthenticated:false}])
      assert.throws(() => s.managementReport(bad), /DENIED/);
    assert.throws(() => s.withdraw({...teacher,actorId:"other-teacher"}), /DENIED/);
    s.withdraw(teacher);
    assert.throws(() => s.managementReport(m), /UNAVAILABLE/);
  });
}
test("consent, pack, independent assigned reviewer and early stop", () => {
  for (const override of [{consent:false},{reviewerId:"t"},{tenantId:""},{variety:"ar"},{variety:"constructor"}]) assert.throws(() => create(override));
  const s = create();
  for (const bad of [teacher,{...r,tenantId:"s2"},{...r,actorId:"other"},{...r,serverAuthenticated:false}])
    assert.throws(() => s.turn(bad), /DENIED/);
  assert.throws(() => s.release(r), /INVALID_STAGE/);
  s.respond(r,s.turn(r),"understood");
  assert.equal(s.turn(r).stage,"transfer");
  assert.throws(() => s.respond(r,s.turn(r),"approve"), /INVALID_TURN/);
  s.withdraw(teacher);
  assert.throws(() => s.turn(r), /WITHDRAWN/);
  assert.throws(() => s.release(r), /WITHDRAWN/);
});

test("private workshop supports voluntary replay without management access or release", async () => {
  const { openPrivateWorkshop } = await import("../src/domain/teacher-rehearsal.mjs");
  const session = openPrivateWorkshop({ owner: teacher, variety: "fr-FR", taskId: "rule" });
  assert.ok(session.prompt(teacher, "transfer"));
  assert.equal(session.prompt(teacher,"opening"), session.prompt(teacher,"opening"));
  for (const actor of [m, r, {...teacher,actorId:"another"}, {...teacher,tenantId:"other"}]) {
    assert.throws(() => session.prompt(actor,"opening"), /DENIED/);
  }
  assert.equal(session.release, undefined);
  assert.equal(session.managementReport, undefined);
});
test("an empty reviewed case is routed to a specific evidence owner and due date", () => {
  const due = "2026-12-01T12:00:00Z";
  const s = create({followUpDueAt:due});
  while (s.turn(r).stage !== "complete") {
    const t = s.turn(r);
    if (t.stage === "observe") s.observe(r,t,[]);
    else s.respond(r,t,"understood");
  }
  s.release(r);
  const { reviewQueue, followUp } = s.managementReport(m);
  assert.equal(reviewQueue,"COLLECT_EVIDENCE");
  assert.equal(followUp.assignedTo,r.actorId);
  assert.equal(followUp.dueAt,due);
  assert.equal(followUp.items.filter(x => x.action === "COLLECT_AUDIO").length,5);
  assert.ok(followUp.items.filter(x => x.action === "OBSERVE_TASK").every(x => x.taskIds.length));
});
