
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
const localeStorageKey = "elyora-institute.ui-locale";
const localeDirections = new Map([
  ["fa-IR", "rtl"], ["en-US", "ltr"], ["ar", "rtl"],
  ["it-IT", "ltr"], ["es-ES", "ltr"], ["ko-KR", "ltr"],
  ["de-DE", "ltr"], ["fr-FR", "ltr"], ["ru-RU", "ltr"],
]);
const programs = ["en", "fr", "de", "es", "it", "ar", "zh-Hans", "ja", "fa", "ko", "ru"];
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
  assert.equal(new URL(asset, page.url()).pathname, "/assets/" + expectedAsset + ".svg");
  const width = await page.locator(".hero-image img").evaluate(async (img) => {
    await img.decode();
    return img.naturalWidth;
  });
  assert.ok(width > 100, "Missing image for " + view);
  await page.screenshot({path:"screenshots/campus-" + view + "-fa-desktop.png",fullPage:true,animations:"disabled"});
}

async function checkLocale(page, locale) {
  const html = page.locator("html");
  const localeSelect = page.locator("#ui-locale");
  await localeSelect.selectOption(locale);
  assert.equal(await localeSelect.inputValue(), locale);
  assert.equal(await html.getAttribute("lang"), locale);
  assert.equal(await html.getAttribute("dir"), localeDirections.get(locale));
}

async function checkProgram(page, code) {
  const filter = page.locator("#program-language");
  await filter.selectOption(code);
  assert.equal(await filter.inputValue(), code);
  const card = page.locator(".language-card");
  assert.equal(await card.count(), 1);
  assert.equal(await card.getAttribute("data-program"), code);
  assert.equal(await card.locator("strong").getAttribute("lang"), code);
  assert.equal(await card.locator("strong bdi").getAttribute("dir"), ["ar", "fa"].includes(code) ? "rtl" : "ltr");
}

async function checkViewport(page, label) {
  const width = page.viewportSize().width;
  const scrollWidth = await page.locator("html").evaluate((html) => html.scrollWidth);
  assert.ok(scrollWidth <= width + 2, `${label}: document width ${scrollWidth}px at ${width}px`);
  const locale = await page.locator("#ui-locale").boundingBox();
  assert.ok(locale && locale.x >= -2 && locale.x + locale.width <= width + 2,
    `${label}: language selector must stay inside the viewport`);
}

async function checkCjkFonts(page) {
  await page.evaluate(() => document.fonts.ready);
  const session = await page.context().newCDPSession(page);
  try {
    await session.send("DOM.enable");
    await session.send("CSS.enable");
    const {root} = await session.send("DOM.getDocument");
    for (const selector of ["h1", '.language-card[data-program="zh-Hans"] bdi', '.language-card[data-program="ja"] bdi']) {
      const {nodeId} = await session.send("DOM.querySelector", {nodeId: root.nodeId, selector});
      const {fonts} = await session.send("CSS.getPlatformFontsForNode", {nodeId});
      const content = await page.locator(selector).textContent();
      const expectedGlyphs = [...content].filter((character) => /[\p{Script=Hangul}\p{Script=Han}]/u.test(character)).length;
      const customGlyphs = fonts.filter(({familyName, isCustomFont}) => isCustomFont && familyName.startsWith("Elyora Campus CJK"))
        .reduce((total, {glyphCount}) => total + glyphCount, 0);
      assert.ok(expectedGlyphs > 0 && customGlyphs >= expectedGlyphs,
        `${selector}: rendered ${customGlyphs} custom font glyphs for ${expectedGlyphs} CJK characters`);
    }
  } finally {
    await session.detach();
  }
}

async function checkFailureRecovery(browser) {
  const blockedStorage = await browser.newPage();
  blockedStorage.on("pageerror", (error) => issues.push("BLOCKED_STORAGE_ERROR " + error.message));
  await blockedStorage.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() { throw new DOMException("Storage is disabled", "SecurityError"); },
    });
  });
  await blockedStorage.goto(base + "/");
  await blockedStorage.locator(".space-card").first().waitFor();
  assert.equal(await blockedStorage.locator("#ui-locale").inputValue(), "fa-IR");
  await checkLocale(blockedStorage, "ar");
  assert.equal(await blockedStorage.locator(".language-card").count(), programs.length);
  await blockedStorage.reload();
  await blockedStorage.locator(".space-card").first().waitFor();
  assert.equal(await blockedStorage.locator("#ui-locale").inputValue(), "fa-IR");
  await blockedStorage.close();

  const outage = await browser.newPage();
  outage.on("pageerror", (error) => issues.push("CATALOG_OUTAGE_ERROR " + error.message));
  await outage.route("**/api/demo/languages.json", (route) => route.fulfill({status: 503, body: "{}"}));
  await outage.goto(base + "/");
  const alert = outage.getByRole("alert");
  await alert.waitFor();
  assert.equal(await outage.locator(".language-card").count(), 0);
  const persian = await alert.textContent();
  await checkLocale(outage, "de-DE");
  const german = await alert.textContent();
  assert.ok(persian?.trim() && german?.trim());
  assert.notEqual(persian, german, "The error must stay visible and relocalize after a locale change");
  assert.ok((await outage.locator("main").getByRole("heading", {level: 1}).textContent())?.trim());
  await outage.close();
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
  assert.deepEqual(new Set(await desktop.locator(".language-card").evaluateAll(
    (cards) => cards.map((card) => card.dataset.program))), new Set(programs));
  assert.equal(await desktop.locator(".language-card").count(), programs.length);
  assert.equal(await desktop.locator("html").getAttribute("lang"), "fa-IR");
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
  await checkLocale(desktop, "en-US");
  await desktop.locator(".section-title").first().waitFor();
  await desktop.screenshot({path:"screenshots/campus-teacher-en-desktop.png",fullPage:true,animations:"disabled"});
  const localeOptions = await desktop.locator("#ui-locale option").evaluateAll(
    (options) => options.map(({value, lang, dir}) => [value, lang, dir]));
  assert.equal(localeOptions.length, localeDirections.size);
  assert.deepEqual(new Set(localeOptions.map(([value]) => value)), new Set(localeDirections.keys()));
  for (const [value, lang, dir] of localeOptions) {
    assert.equal(lang, value, `Language metadata for option ${value}`);
    assert.equal(dir, localeDirections.get(value), `Direction metadata for option ${value}`);
  }

  await checkProgram(desktop, "ar");
  const textBySurface = {
    title: new Set(), description: new Set(), hero: new Set(), catalog: new Set(),
    dialog: new Set(), navigationLabel: new Set(),
  };
  for (const locale of localeDirections.keys()) {
    await checkLocale(desktop, locale);
    assert.equal(await desktop.locator('.nav-item[aria-current="page"]').getAttribute("data-view"), "teacher");
    assert.equal(await desktop.locator("#program-language").inputValue(), "ar");
    assert.equal(await desktop.locator(".language-card").getAttribute("data-program"), "ar");
    textBySurface.title.add(await desktop.title());
    textBySurface.description.add(await desktop.locator('meta[name="description"]').getAttribute("content"));
    textBySurface.hero.add(await desktop.locator("h1").textContent());
    textBySurface.catalog.add(await desktop.locator(".language-status").textContent());
    textBySurface.dialog.add(await desktop.locator("#dialog-title").textContent());
    textBySurface.navigationLabel.add(await desktop.locator("#space-navigation").getAttribute("aria-label"));
  }
  for (const [surface, messages] of Object.entries(textBySurface)) {
    assert.ok([...messages].every((message) => message?.trim()), `${surface}: empty localized text`);
    assert.equal(messages.size, localeDirections.size, `${surface}: expected localized text in every interface`);
  }

  await checkLocale(desktop, "en-US");
  for (const code of ["zh-Hans", "ja", "fa", "ko", "ru"]) await checkProgram(desktop, code);
  const filter = desktop.locator("#program-language");
  const firstProgram = await filter.locator("option").nth(1).getAttribute("value");
  await filter.selectOption("all");
  await filter.focus();
  await desktop.keyboard.press("ArrowDown");
  assert.equal(await filter.inputValue(), firstProgram);
  assert.equal(await desktop.locator(".language-card").getAttribute("data-program"), firstProgram);
  assert.equal(await filter.evaluate((element) => document.activeElement === element), true,
    "Keyboard focus must remain on the learning-language filter after filtering");
  await desktop.keyboard.press("Home");
  assert.equal(await filter.inputValue(), "all");
  assert.equal(await desktop.locator(".language-card").count(), programs.length);

  await checkLocale(desktop, "ru-RU");
  await desktop.reload({waitUntil: "networkidle"});
  assert.equal(await desktop.locator("html").getAttribute("lang"), "ru-RU");
  assert.equal(await desktop.locator("#ui-locale").inputValue(), "ru-RU");
  for (const invalidLocale of ["xx-XZ", "constructor"]) {
    await desktop.evaluate(([key, value]) => localStorage.setItem(key, value), [localeStorageKey, invalidLocale]);
    await desktop.reload({waitUntil: "networkidle"});
    assert.equal(await desktop.locator("html").getAttribute("lang"), "fa-IR");
    assert.equal(await desktop.locator("html").getAttribute("dir"), "rtl");
    assert.equal(await desktop.locator("#ui-locale").inputValue(), "fa-IR");
    assert.equal(await desktop.locator(".space-card").count(), 4);
  }

  const mobile = await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
  mobile.on("pageerror", (err) => issues.push("MOBILE_PAGE_ERROR " + err.message));
  mobile.on("console", (msg) => { if (msg.type() === "error") issues.push("MOBILE_CONSOLE_ERROR " + msg.text()); });
  await mobile.goto(base + "/", {waitUntil:"networkidle"});
  await mobile.locator(".space-card").first().waitFor();
  assert.equal(await mobile.locator(".space-card").count(),4);
  await checkViewport(mobile, "Persian campus");
  await mobile.screenshot({path:"screenshots/campus-home-fa-mobile.png",fullPage:true,animations:"disabled"});
  await mobile.locator('.nav-item[data-view="student"]').click();
  await mobile.locator(".hero-image img").waitFor();
  await mobile.screenshot({path:"screenshots/campus-student-fa-mobile.png",fullPage:true,animations:"disabled"});
  await mobile.setViewportSize({width:320,height:760});
  for (const locale of ["ar", "de-DE", "ru-RU", "ko-KR"]) {
    await checkLocale(mobile, locale);
    await mobile.locator('.nav-item[data-view="campus"]').click();
    await checkViewport(mobile, `${locale} campus`);
    await mobile.locator('.nav-item[data-view="teacher"]').click();
    await checkViewport(mobile, `${locale} teacher atelier`);
    if (locale === "ko-KR") await checkCjkFonts(mobile);
    await mobile.screenshot({path:`screenshots/campus-teacher-${locale}-mobile.png`,fullPage:true,animations:"disabled"});
  }
  await checkFailureRecovery(browser);
  assert.deepEqual(issues,[],"Browser runtime errors");
  console.log(`BROWSER_PREVIEW_SMOKE_PASS: 4 spaces, ${localeDirections.size} interface locales, ${programs.length} preview programs, RTL/LTR, keyboard filtering, persistence and outage recovery, dialogue, CJK glyph rendering, responsive 320px/390px.`);
  console.log("Screenshots written: screenshots/");
} catch (err) {
  console.error("BROWSER_PREVIEW_SMOKE_FAILED", err);
  process.exitCode=1;
} finally {
  if(browser) await browser.close();
  server.kill("SIGTERM");
}
