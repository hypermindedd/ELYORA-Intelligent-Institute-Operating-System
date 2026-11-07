
/**
 * Real Chromium smoke + visual evidence for four preview spaces.
 * Requires playwright as an ephemeral CI dependency. NO user secrets or
 * connected educational services; does not certify production.
 */
import assert from "node:assert/strict";
import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";

const base = "http://127.0.0.1:4173";
let browser;
const server = spawn(process.execPath, ["apps/web/server.mjs"], {
  cwd: process.cwd(), env: { ...process.env, PORT:"4173" }, stdio:["ignore","pipe","pipe"]
});
let serverOutput = "";
server.stdout.on("data", (c) => { serverOutput += c.toString(); });
server.stderr.on("data", (c) => { serverOutput += c.toString(); });
const issues = [];
async function waitForPreview() {
  for (let i = 0; i < 60; i++) {
    if (server.exitCode !== null) throw Error("Preview server exited: " + serverOutput);
    try {
      const res = await fetch(base + "/api/health");
      if (res.ok && (await res.json()).mode === "OFFLINE_PREVIEW") return;
    } catch { /* waiting for local server */ }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw Error("Preview server did not become ready: " + serverOutput);
}
async function checkRoom(page, view, expectedAsset) {
  await page.locator('.nav-item[data-view="' + view + '"]').click();
  await page.locator(".hero-image img").waitFor();
  const asset = await page.locator(".hero-image img").getAttribute("src");
  assert.equal(asset, "/assets/" + expectedAsset + ".svg");
  const width = await page.locator(".hero-image img").evaluate((img) => img.naturalWidth);
  assert.ok(width > 100, "Missing image for " + view);
  await page.screenshot({path:"screenshots/campus-" + view + "-fa-desktop.png",fullPage:true,animations:"disabled"});
}
try {
  await mkdir("screenshots", {recursive:true});
  await waitForPreview();
  browser = await chromium.launch({headless:true});
  const desktop = await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
  desktop.on("pageerror", (err) => issues.push("PAGE_ERROR " + err.message));
  desktop.on("console", (msg) => { if (msg.type() === "error") issues.push("CONSOLE_ERROR " + msg.text()); });
  const response = await desktop.goto(base + "/", {waitUntil:"networkidle"});
  assert.equal(response.status(), 200);
  await desktop.locator(".space-card").first().waitFor();
  assert.equal(await desktop.locator(".space-card").count(), 4);
  assert.equal(await desktop.locator(".language-card").count(), 8);
  assert.equal(await desktop.locator("html").getAttribute("dir"),"rtl");
  await desktop.screenshot({path:"screenshots/campus-home-fa-desktop.png",fullPage:true,animations:"disabled"});
  for (const [view,asset] of [
    ["student","student-studio"],["teacher","teacher-atelier"],
    ["classroom","live-classroom"],["command","command-center"]
  ]) await checkRoom(desktop,view,asset);
  await desktop.locator('.nav-item[data-view="teacher"]').click();
  await desktop.locator('button[data-action="preview"]').first().click();
  assert.equal(await desktop.locator("#preview-dialog").evaluate((dialog) => dialog.open),true);
  await desktop.locator("#dialog-close").click();
  await desktop.locator("#ui-locale").selectOption("en-US");
  assert.equal(await desktop.locator("html").getAttribute("dir"),"ltr");
  await desktop.locator(".section-title").first().waitFor();
  await desktop.screenshot({path:"screenshots/campus-teacher-en-desktop.png",fullPage:true,animations:"disabled"});
  await desktop.locator("#program-language").selectOption("ar");
  assert.equal(await desktop.locator(".language-card").count(),1);
  await desktop.locator("#ui-locale").selectOption("fa-IR");
  assert.equal(await desktop.locator("html").getAttribute("dir"),"rtl");
  const mobile = await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
  mobile.on("pageerror", (err) => issues.push("MOBILE_PAGE_ERROR " + err.message));
  await mobile.goto(base + "/", {waitUntil:"networkidle"});
  await mobile.locator(".space-card").first().waitFor();
  assert.equal(await mobile.locator(".space-card").count(),4);
  const overflow = await mobile.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2);
  assert.equal(overflow,false,"Unexpected horizontal document overflow at 390px");
  await mobile.screenshot({path:"screenshots/campus-home-fa-mobile.png",fullPage:true,animations:"disabled"});
  await mobile.locator('.nav-item[data-view="student"]').click();
  await mobile.locator(".hero-image img").waitFor();
  await mobile.screenshot({path:"screenshots/campus-student-fa-mobile.png",fullPage:true,animations:"disabled"});
  assert.deepEqual(issues,[],"Browser runtime errors");
  console.log("BROWSER_PREVIEW_SMOKE_PASS: 4 spaces, 8 languages, RTL/LTR, filtering, dialogue, responsive 390px.");
  console.log("Screenshots written: screenshots/");
} catch (err) {
  console.error("BROWSER_PREVIEW_SMOKE_FAILED", err);
  process.exitCode=1;
} finally {
  if(browser) await browser.close();
  server.kill("SIGTERM");
}
