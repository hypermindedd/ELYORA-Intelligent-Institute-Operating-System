
import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import { createPreviewServer } from "../apps/web/server.mjs";

let server, base;
before(async () => {
  server = createPreviewServer();
  await new Promise((resolve) => server.listen(0,"127.0.0.1", resolve));
  base = "http://127.0.0.1:" + server.address().port;
});
after(async () => { if (server) await new Promise((resolve) => server.close(resolve)); });
test("offline campus home serves real HTML with navigation, design preview and CSP", async ()=>{
 const r=await fetch(base+"/");
 const body=await r.text();
 assert.equal(r.status,200);
 assert.match(r.headers.get("content-security-policy"),/default-src 'none'/);
 assert.match(body,/<html lang="fa-IR" dir="rtl">/);
 for(const room of ["student","teacher","classroom","command"]) assert.match(body, new RegExp('data-view="'+room+'"'));
 assert.match(body,/PREVIEW|پیش‌نمایش/);
});
test("language endpoint exposes all eleven provisional programs and no internal capabilities",async()=>{
 const r=await fetch(base+"/api/demo/languages");
 assert.equal(r.status,200);
 const j=await r.json();
 assert.equal(j.status,"PROVISIONAL_DEMO_SEED");
 assert.deepEqual(j.languages.map(({code})=>code),["en","fr","de","es","it","ar","zh-Hans","ja","fa","ko","ru"]);
 assert.equal(j.plannedLaunchLanguageCount,8);
 assert.deepEqual(j.confirmedLaunchLanguages,[]);
 assert.equal(j.languages.find((l)=>l.code==="ar").direction,"rtl");
 assert.equal(j.languages.find((l)=>l.code==="fa").direction,"rtl");
 assert.ok(j.languages.every((language)=>language.availability==="PLANNED"&&!Object.hasOwn(language,"capabilities")));
 const alias = await fetch(base+"/api/demo/languages.json");
 assert.equal(alias.status,200);
 assert.match(alias.headers.get("content-type"),/^application\/json\b/);
 assert.deepEqual(await alias.json(),j);
});
test("interface registry and each allowlisted dictionary are served as JavaScript",async()=>{
 const response = await fetch(base+"/locale-registry.mjs");
 assert.equal(response.status,200);
 assert.match(response.headers.get("content-type"),/^text\/javascript\b/);
 const module = /^export default (.+);\s*$/.exec(await response.text());
 assert.ok(module,"Locale registry must export a JSON-compatible default value");
 const registry = JSON.parse(module[1]);
 assert.deepEqual(registry.map(({code})=>code),["fa-IR","en-US","ar","it-IT","es-ES","ko-KR","de-DE","fr-FR","ru-RU"]);
 assert.deepEqual(registry.filter(({direction})=>direction==="rtl").map(({code})=>code),["fa-IR","ar"]);
 await Promise.all(registry.map(async ({code})=>{
  const dictionary = await fetch(base+"/messages/"+code.split("-")[0]+".mjs");
  assert.equal(dictionary.status,200,code);
  assert.match(dictionary.headers.get("content-type"),/^text\/javascript\b/);
  assert.equal(dictionary.headers.get("x-content-type-options"),"nosniff");
  assert.match(await dictionary.text(),/^export default \{/);
 }));
});
test("health reports no live ELYORA or real identity connection",async()=>{
 const r=await fetch(base+"/api/health");const j=await r.json();
 assert.equal(j.mode,"OFFLINE_PREVIEW");
 assert.equal(j.elyora,"BLOCKED_NOT_CONNECTED");
 assert.equal(j.liveAuth,false);
});
test("all four first-party interior image assets are served with SVG media type",async()=>{
 for(const room of ["student-studio","teacher-atelier","live-classroom","command-center"]){
  const r=await fetch(base+"/assets/"+room+".svg");
  assert.equal(r.status,200);
  assert.match(r.headers.get("content-type"),/svg/);
  assert.match(await r.text(),/<svg/);
 }
});
test("preview has no mutation endpoints and no unsafe file browsing",async()=>{
 assert.equal((await fetch(base+"/api/demo/languages",{method:"POST"})).status,405);
 assert.equal((await fetch(base+"/api/demo/languages.json",{method:"POST"})).status,405);
 assert.equal((await fetch(base+"/messages/unknown.mjs")).status,404);
 assert.equal((await fetch(base+"/.env")).status,404);
 assert.equal((await fetch(base+"/src/domain/policy.mjs")).status,404);
 assert.equal((await fetch(base+"/api/admin")).status,404);
});
test("UI source distinguishes language filter from actual student authority",async()=>{
 const r=await fetch(base+"/app.mjs"); const script=await r.text();
 assert.equal(r.status,200);
 assert.match(script,/program-language/);
 assert.match(script,/ui-locale/);
 assert.match(script,/PREVIEW|previewNotice/);
 assert.doesNotMatch(script,/setMastery|grantRole/);
});
