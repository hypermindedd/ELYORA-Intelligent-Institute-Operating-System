// Two-person, local text rehearsal. Fictional principals only, no network or recording.
import { createInterface } from "node:readline";
import { createTeacherRehearsal, rehearsalAnchors, openPrivateWorkshop, rehearsalTopics } from "../src/domain/teacher-rehearsal.mjs";

const variety = process.argv[2] ?? "fr-FR";
const input = createInterface({ input: process.stdin, output: process.stdout });
const lines = input[Symbol.asyncIterator]();
const tenantId = "demo-school";
const reviewer = { role: "qualification_reviewer", actorId: "demo-reviewer", tenantId, serverAuthenticated: true };
const manager = { role: "institute_manager", actorId: "demo-manager", tenantId, serverAuthenticated: true };

async function ask(prompt) {
  process.stdout.write(prompt + "\n> ");
  const response = await lines.next();
  if (response.done || response.value.trim() === "/stop") throw Error("STOPPED");
  return response.value.trim();
}
async function choose(prompt, options) {
  while (true) {
    const value = await ask(prompt);
    if (options.includes(value)) return value;
    console.log("Available choices:", options.join(" / "));
  }
}

async function run() {
  console.log("Elyora Institute · local rehearsal · fictional case. No audio or real personnel report. Use /stop anywhere.");
  if (await choose("Teacher: a simulated learner will sometimes make deliberate mistakes. Continue? yes/no", ["yes", "no"]) !== "yes") return;
  const mode = await choose("Choose private for solo practice, or reviewed for a separate fictional management case.", ["private", "reviewed"]);
  if (mode === "private") {
    const owner = { role: "teacher", actorId: "demo-teacher", tenantId, serverAuthenticated: true };
    const taskId = await choose("Choose a topic: " + rehearsalTopics.join(", "), rehearsalTopics);
    const workshop = openPrivateWorkshop({ owner, variety, taskId });
    let step = "opening";
    while (step !== "finish") {
      console.log(workshop.prompt(owner, step));
      const reply = await ask("Try an explanation or ask for a more demanding example. Your answer is not saved.");
      let next = workshop.challengeTurn(owner, reply);
      while (next?.kind === "challenge") {
        next = workshop.challengeTurn(owner, await ask(next.prompt));
      }
      if (next?.kind === "coaching") {
        if (next.why) console.log(`${next.why} I adapt the example and pace to what you show me as we work.`);
        await ask(`${next.coaching}\nTry a new example: ${next.retry}`);
      }
      step = await choose("Choose clarification, transfer, opening to retry, or finish.", ["clarification", "transfer", "opening", "finish"]);
    }
    return;
  }
  const session = createTeacherRehearsal({ tenantId, teacherId: "demo-teacher", managerId: manager.actorId,
    reviewerId: reviewer.actorId, variety, consent: true });
  while (true) {
    const turn = session.turn(reviewer);
    if (turn.stage === "complete") break;
    if (turn.stage === "observe") {
      const ratings = [];
      for (const [dimension, indicator] of Object.entries(turn.indicators)) {
        const anchor = await choose("Reviewer · " + dimension + " · " + indicator + "\n" +
          Object.entries(rehearsalAnchors).map(([id, label]) => id + " = " + label).join("\n") +
          "\nEnter anchor or skip:", [...Object.keys(rehearsalAnchors), "skip"]);
        if (anchor === "skip") continue;
        const observedBehavior = await ask("Describe one observed behavior (private reviewer note):");
        if (observedBehavior) ratings.push({ dimension, anchor, observedBehavior });
      }
      session.observe(reviewer, turn, ratings);
    } else {
      console.log("\nLearner · " + turn.learnerLine);
      while (!(await ask("Teacher · reply to the learner:"))) console.log("Enter a reply, or /stop.");
      const result = await choose("Reviewer · is the misconception resolved? understood/still_unclear", ["understood", "still_unclear"]);
      session.respond(reviewer, turn, result);
    }
  }
  if (await choose("Reviewer · release the fictional management preview? yes/no", ["yes", "no"]) === "yes") {
    session.release(reviewer);
    console.log(JSON.stringify(session.managementReport(manager), null, 2));
  }
}

try { await run(); } catch (error) {
  if (error.message === "STOPPED") console.log("\nStopped. Session discarded.");
  else { console.error(error.message); process.exitCode = 1; }
} finally { input.close(); }
