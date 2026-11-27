import assert from "node:assert/strict";
import test from "node:test";
import { openPrivateWorkshop } from "../src/domain/teacher-rehearsal.mjs";

const owner = { role: "teacher", actorId: "teacher", tenantId: "institute", serverAuthenticated: true };
const open = (taskId = "rule", variety = "en-GB") => openPrivateWorkshop({ owner, variety, taskId });

test("a clear invitation presents a harder question, then teaches with a second example", () => {
  const workshop = open();
  const challenge = workshop.challengeTurn(owner, "Go on, challenge me.");
  assert.equal(challenge.kind, "challenge");
  assert.match(challenge.prompt, /would just bear with me/);
  assert.equal(challenge.coaching, undefined);
  const answer = "It asks for willingness to cooperate.";
  const after = workshop.challengeTurn(owner, answer);
  assert.equal(after.kind, "coaching");
  assert.match(after.coaching, /willingness/);
  assert.match(after.retry, /two new sentences/);
  assert.doesNotMatch(JSON.stringify(after), /willingness to cooperate/);
  assert.equal(workshop.challengeTurn(owner, "I have another thought."), null);
});

test("pushback, slang, accent and pace requests select relevant teaching material", () => {
  const workshop = open("meaning");
  for (const [reply, pattern] of [
    ["That's too basic.", /went entirely to plan/],
    ["I disagree. What about an exception?", /would just bear/],
    ["Give me some slang.", /knackered/],
    ["Compare a regional accent.", /regional pronunciation/],
    ["Could you speak faster?", /written listening-drill/],
  ]) {
    assert.match(workshop.challengeTurn(owner, reply).prompt, pattern);
  }
});

test("quoting a learner, ambiguous status, slowing down and other languages keep the regular flow", () => {
  const workshop = open();
  for (const reply of ["I am an English teacher.", "My student said: challenge me.",
    "‘Challenge me’ is an imperative.", "What about the examples?", "Challenge me.".repeat(250)]) {
    assert.equal(workshop.challengeTurn(owner, reply), null, reply.slice(0, 80));
  }
  assert.equal(workshop.challengeTurn(owner, "Challenge me.").kind, "challenge");
  assert.deepEqual(workshop.challengeTurn(owner, "Please slow down."), { kind: "regular" });
  assert.deepEqual(workshop.challengeTurn(owner, "Challenge me. Please keep it simple."), { kind: "regular" });
  assert.deepEqual(workshop.challengeTurn(owner, "Please slow down; I missed ‘bear with me’."), { kind: "regular" });
  assert.equal(workshop.challengeTurn(owner, "Here is my next answer."), null);
  assert.equal(open("rule", "fr-FR").challengeTurn(owner, "Challenge me."), null);
});

test("an unfinished challenge can be skipped and stays private to the workshop owner", () => {
  const workshop = open();
  assert.equal(workshop.challengeTurn(owner, "Test me.").kind, "challenge");
  for (const actor of [{ ...owner, actorId: "other" }, { ...owner, tenantId: "foreign" },
    { ...owner, role: "institute_manager" }, { ...owner, serverAuthenticated: false }]) {
    assert.throws(() => workshop.challengeTurn(actor, "Test me."), /PRIVATE_WORKSHOP_DENIED/);
  }
  assert.equal(workshop.challengeTurn(owner, "   "), null);
  assert.equal(workshop.challengeTurn(owner, "That is my answer."), null);
});

test("an unprompted counterexample starts a fresh pupil scenario in the same turn", () => {
  const workshop = open("class");
  const first = workshop.challengeTurn(owner, "Would that still hold if the speaker were making a polite appeal?");
  assert.equal(first.kind, "challenge");
  assert.match(first.prompt, /I’m your learner.*You said ‘could’/);
  const coaching = workshop.challengeTurn(owner, "Your example only works when the option is open to the speaker.");
  assert.equal(coaching.kind, "coaching");
  assert.match(coaching.why, /You questioned where the rule stops applying/);
  assert.match(coaching.coaching, /present suggestion/);
  assert.notEqual(coaching.retry, first.prompt);

  const second = workshop.challengeTurn(owner, "That rule only applies if I am talking to a client.");
  assert.equal(second.kind, "challenge");
  assert.match(second.prompt, /coaching session at work.*reported question/);
  assert.notEqual(second.prompt, first.prompt);
});

test("implicit signals change the modality and ignore quotes and ordinary questions", () => {
  const workshop = open();
  for (const text of [
    "My learner said, ‘Would that still hold if it were a request?’",
    "I don't understand. Can you explain which example to use?",
    "I speak great English and have taught for twenty years.",
    "The phrase 'That only works with friends' is on the board.",
  ]) assert.equal(workshop.challengeTurn(owner, text), null, text);

  const register = workshop.challengeTurn(owner, "It’s grammatical, but it sounds rude in an email to a client.");
  assert.match(register.prompt, /client update/);
  assert.match(workshop.challengeTurn(owner, "I’d say I was disappointed.").why, /correct sentence can still land badly/);
  const listening = workshop.challengeTurn(owner, "In connected speech I hear that stress pattern differently.");
  assert.match(listening.prompt, /written script to prepare a fast listening/);
  assert.deepEqual(workshop.challengeTurn(owner, "Could you just slow down?"), { kind: "regular" });
  assert.equal(workshop.challengeTurn(owner, "I need a little time."), null);
});
