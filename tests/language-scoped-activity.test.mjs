
import test from "node:test";
import assert from "node:assert/strict";
import { approveLanguageScopedDirective, evaluateLanguageScopedPractice, validateLanguageScopedDirective } from "../src/domain/language-scoped-activity.mjs";
const teacher = { actorId:"t1",role:"teacher",tenantId:"inst1",serverAuthenticated:true };
const student = { actorId:"s1",role:"student",tenantId:"inst1",serverAuthenticated:true };
const assignment={teacherId:"t1",studentId:"s1",tenantId:"inst1",status:"active"};
const directive={
 directiveId:"v2-d1",tenantId:"inst1",studentId:"s1",teacherId:"t1",programId:"german-beginners",
 version:2,status:"proposed",allowedTopics:["greetings"],excludedTopics:[],
 allowedActivityTypes:["conversation"],maxSessionMinutes:15,
 startsAt:"2026-11-07T12:00:00Z",expiresAt:"2026-11-07T14:00:00Z",
 targetLanguageCode:"de",localeVariant:"de-DE",instructionLocale:"fa-IR",programVersion:"curriculum-de-a1-draft"
};
const activity={programId:"german-beginners",topicId:"greetings",activityType:"conversation",minutes:10,
 targetLanguageCode:"de",localeVariant:"de-DE",programVersion:"curriculum-de-a1-draft"};
test("v2 language-scoped directive allows exact program, dialect and approved topic in offline policy simulation",()=>{
 const approval=approveLanguageScopedDirective({directive,actor:teacher,assignment});
 assert.equal(approval.allowed,true);
 assert.equal(evaluateLanguageScopedPractice({directive:approval.directive,actor:student,activity,at:"2026-11-07T13:00:00Z"}).allowed,true);
});
test("language substitution cannot expand teacher-approved scope",()=>{
 const result=approveLanguageScopedDirective({directive,actor:teacher,assignment});
 assert.equal(evaluateLanguageScopedPractice({directive:result.directive,actor:student,activity:{...activity,targetLanguageCode:"fr"},at:"2026-11-07T13:00:00Z"}).reason,"LANGUAGE_BOUNDARY_DENIED");
});
test("locale variant substitution cannot bypass teacher approved variant",()=>{
 const result=approveLanguageScopedDirective({directive,actor:teacher,assignment});
 assert.equal(evaluateLanguageScopedPractice({directive:result.directive,actor:student,activity:{...activity,localeVariant:"de-AT"},at:"2026-11-07T13:00:00Z"}).reason,"LANGUAGE_VARIANT_DENIED");
});
test("program version mismatch fails closed",()=>{
 const result=approveLanguageScopedDirective({directive,actor:teacher,assignment});
 assert.equal(evaluateLanguageScopedPractice({directive:result.directive,actor:student,activity:{...activity,programVersion:"unapproved"},at:"2026-11-07T13:00:00Z"}).reason,"PROGRAM_VERSION_DENIED");
});
test("unknown target language and invalid instruction locale rejected",()=>{
 assert.equal(validateLanguageScopedDirective({...directive,targetLanguageCode:"xx"}).reason,"UNREGISTERED_TARGET_LANGUAGE");
 assert.equal(validateLanguageScopedDirective({...directive,instructionLocale:"not_a_locale"}).reason,"INVALID_INSTRUCTION_LOCALE");
});
test("added preview programs accept only their own planned regional variant",()=>{
 for (const [targetLanguageCode, localeVariant] of [["fa","fa-IR"],["ko","ko-KR"],["ru","ru-RU"]]) {
  const candidate = {...directive,targetLanguageCode,localeVariant,instructionLocale:"en-US"};
  assert.equal(validateLanguageScopedDirective(candidate).allowed,true);
  assert.equal(validateLanguageScopedDirective({...candidate,localeVariant:"de-DE"}).reason,"LANGUAGE_VARIANT_NOT_IN_CATALOG");
 }
});
test("client-forged teacher or cross tenant authorization stays denied",()=>{
 assert.equal(approveLanguageScopedDirective({directive,actor:{...teacher,serverAuthenticated:false},assignment}).allowed,false);
 assert.equal(approveLanguageScopedDirective({directive,actor:{...teacher,tenantId:"other"},assignment}).allowed,false);
});
