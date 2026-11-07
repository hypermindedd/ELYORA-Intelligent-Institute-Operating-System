
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
 assert.match(body,/lang="fa" dir="rtl"/);
 for(const room of ["student","teacher","classroom","command"]) assert.match(body, new RegExp('data-view="'+room+'"'));
 assert.match(body,/PREVIEW|پیش‌نمایش/);
});
test("language endpoint exposes eight provisional language records and no internal capabilities",async()=>{
 const r=await fetch(base+"/api/demo/languages");
 assert.equal(r.status,200);
 const j=await r.json();
 assert.equal(j.status,"PROVISIONAL_DEMO_SEED");
 assert.equal(j.languages.length,8);
 assert.deepEqual(j.confirmedLaunchLanguages,[]);
 assert.equal(j.languages.find((l)=>l.code==="ar").direction,"rtl");
 assert.equal(Object.hasOwn(j.languages[0],"capabilities"),false);
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
