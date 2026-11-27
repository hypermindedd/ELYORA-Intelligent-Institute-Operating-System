import { readFileSync } from "node:fs";

const pack = JSON.parse(readFileSync(new URL("../../packages/teacher-qualification/challenges.en-GB.v2.json", import.meta.url), "utf8"));
const segments = /[.!?;\n]+/u;
const quotations = /"[^"\n]*"|“[^”\n]*”|‘(?:[^’\n]|’(?=\p{L}))*’|(?<!\p{L})'(?:[^'\n]|'(?=\p{L}))*'(?!\p{L})|`[^`\n]*`/gu;
const reported = /\b(?:quot(?:e|ed|ing)|student|learner|classmate)\s+(?:says?|asks?|said|wrote)\b/u;
const ease = /^(?:please )?(?:(?:can|could|would) you )?(?:just )?(?:slow down|speak (?:more slowly|slower)|not so fast|make it easier|keep it simple|stop(?: the challenge)?|let's pause|no thanks|(?:don't|do not) (?:challenge|test) me)\b/u;
const invitation = /^(?:go on[,: ]+)?(?:please )?(?:(?:can|could|would) you )?(?:(?:try to )?(?:challenge|test|quiz|stump) me|(?:give|show) me (?:something harder|a harder (?:one|example|question|challenge))|make it (?:harder|more challenging)|is that all you've got)\b/u;
const easyTask = /^(?:this|that)(?:'s| is) (?:too (?:easy|basic)|a very basic (?:example|question))\b/u;
const pushback = /^(?:i (?:disagree|don't buy that)[,: ]+)?(?:what about (?:an? |the )?(?:exception|counterexample)|(?:show|give) me (?:an? |the )?(?:exception|counterexample)|justify (?:that|your) (?:rule|correction)|i (?:think|believe) (?:there is|there's) an exception)\b/u;
const pace = /^(?:please )?(?:(?:can|could|would) you )?(?:speak faster|talk faster|say it faster|give me (?:a )?(?:faster|fast) listening (?:task|challenge))\b/u;
const register = /^(?:please )?(?:(?:can|could|would) you )?(?:use|give me|try|show me) (?:some )?(?:british )?(?:slang|idioms|colloquial english)\b/u;
const dialect = /^(?:please )?(?:(?:can|could|would) you )?(?:use|try|compare|give me|show me) (?:an? |the |some )?(?:different |british |regional )?(?:accent|pronunciation|regional (?:variety|variants?))\b/u;
const implicitBoundary = /\b(?:would (?:that|the (?:same )?rule|your (?:rule|correction)) (?:still |also )?(?:hold|work|apply) (?:if|when|in|with|outside)\b|(?:that|(?:your|the|that) (?:rule|correction|example|explanation)) (?:only (?:holds|works|applies|covers)\b|(?:wouldn't|doesn't) (?:hold|work|apply) (?:if|when|in|with|outside)\b|assumes\b))/u;
const teachingContrast = /\b(?:grammatical|technically correct|well-formed)\b.*\b(?:but|whereas|yet)\b.*\b(?:rude|formal|informal|stiff|spoken|colloquial|idiomatic|natural|polite|audience|client)\b/u;
const accentContrast = /\b(?:accent|pronunciation|vowel|stress|intonation|rhythm)\b.*\b(?:regional|variet(?:y|ies)|intelligib(?:le|ility)|contrast|change(?:s)? (?:the )?meaning)\b/u;
const pragmaticProbe = /\b(?:how would (?:a|the) (?:client|colleague|listener|speaker) (?:hear|take|interpret)|what changes (?:if|when) (?:the speaker|you) (?:mean|stress|say))\b/u;
const listeningProbe = /\b(?:at (?:full|natural|normal) speed|in (?:fast|connected|natural) speech)\b.*\b(?:sound|hear|stress|meaning|phrase|word|tell)\b/u;
const situation = /\b(?:client|customer|interview|meeting|colleague|workplace|team|manager)\b/u;
const challengeReasons = {
  boundary: "You questioned where the rule stops applying. The next situation tests that boundary.",
  register: "You noticed that a correct sentence can still land badly. Let's test the same idea with two audiences.",
  variety: "You raised a difference in how people speak. Let's see whether it actually changes what the listener understands.",
  meaning: "You asked what the listener would infer. This new situation changes the context while keeping that distinction in view.",
  listening: "You raised how this sounds at natural speed. This script gives you a new meaning contrast to listen for when it is recorded.",
};

export function matchTeacherChallenge(taskId, reply) {
  if (typeof reply !== "string" || reply.length > 2000) return null;
  if (/^\s*[/`>]/u.test(reply)) return null;
  const text = reply.toLowerCase().replace(quotations, " ").replaceAll("’", "'");
  const clauses = text.split(segments).map(clause => clause.trim()).filter(clause => clause && !reported.test(clause));
  if (clauses.some(clause => ease.test(clause))) return { kind: "regular" };
  const first = clauses[0] ?? "";
  if (pace.test(first)) return { kind: "challenge", taskId: "listening" };
  if (register.test(first)) return { kind: "challenge", taskId: "register" };
  if (dialect.test(first)) return { kind: "challenge", taskId: "class" };
  if (clauses.some(clause => pushback.test(clause))) return { kind: "challenge", taskId: "rule" };
  if (invitation.test(first) || easyTask.test(first)) return { kind: "challenge", taskId };

  for (const [reason, target, pattern] of [
    ["listening", "listening", listeningProbe], ["variety", "class", accentContrast],
    ["register", "register", teachingContrast], ["meaning", "meaning", pragmaticProbe],
    ["boundary", "rule", implicitBoundary],
  ]) {
    if (clauses.some(clause => pattern.test(clause))) {
      return { kind: "challenge", taskId: target, reason, workContext: clauses.some(clause => situation.test(clause)) };
    }
  }
  return null;
}

export function teacherChallenge(signal, round) {
  const { taskId, reason, workContext } = signal;
  const task = pack.tasks[taskId];
  if (!reason && round === 0) return { ...task, why: "You asked for a change in challenge. Let’s practise that skill with a targeted example." };
  const samples = pack.scenarios[taskId];
  const cases = samples[round % samples.length];
  const contexts = workContext ? pack.contexts.work : pack.contexts.practice;
  const setting = contexts[Math.floor(round / samples.length) % contexts.length];
  return {
    ...cases,
    prompt: `${setting} ${cases.prompt}`,
    why: challengeReasons[reason] ?? "This new situation lets us try the same skill with a different example.",
  };
}
