
import test from "node:test";
import assert from "node:assert/strict";
import { languageCatalog, validateLanguageCatalog, resolveLanguage, publicCatalogProjection } from "../src/catalog/languages.mjs";
const clone = () => JSON.parse(JSON.stringify(languageCatalog));
const expectedProgramCodes = ["en", "fr", "de", "es", "it", "ar", "zh-Hans", "ja", "fa", "ko", "ru"];

test("all original and requested target-language programs remain provisional", () => {
  assert.deepEqual(languageCatalog.languages.map(({ code }) => code), expectedProgramCodes);
  assert.equal(languageCatalog.plannedLaunchLanguageCount, 8);
  assert.deepEqual(languageCatalog.confirmedLaunchLanguages, []);
  assert.equal(languageCatalog.status, "PROVISIONAL_DEMO_SEED");
  assert.equal(validateLanguageCatalog().valid, true);
  for (const { program, capabilities } of languageCatalog.languages) {
    assert.equal(program.status, "PLANNED");
    assert.ok(Object.values(capabilities).every((value) => ["NOT_CONNECTED", "NOT_VERIFIED"].includes(value)));
  }
});
test("UI locale and educational target language are different concerns", () => {
  assert.deepEqual(languageCatalog.uiLocales.map(({ code, direction }) => [code, direction]), [
    ["fa-IR", "rtl"], ["en-US", "ltr"], ["ar", "rtl"], ["it-IT", "ltr"], ["es-ES", "ltr"],
    ["ko-KR", "ltr"], ["de-DE", "ltr"], ["fr-FR", "ltr"], ["ru-RU", "ltr"],
  ]);
  assert.equal(resolveLanguage("fa-IR"), null);
  assert.equal(resolveLanguage("ar").direction, "rtl");
  assert.equal(resolveLanguage("ja").script, "Jpan");
  assert.equal(resolveLanguage("xx"), null);
});
test("new programs preserve their own native names, scripts, directions and planned variants", () => {
  const { languages } = publicCatalogProjection();
  for (const [code, autonym, script, direction, variant] of [
    ["fa", "فارسی", "Arab", "rtl", "fa-IR"],
    ["ko", "한국어", "Kore", "ltr", "ko-KR"],
    ["ru", "Русский", "Cyrl", "ltr", "ru-RU"],
  ]) {
    const item = languages.find((language) => language.code === code);
    assert.equal(item.autonym, autonym);
    assert.equal(item.script, script);
    assert.equal(item.direction, direction);
    assert.deepEqual(item.plannedLocaleVariants, [variant]);
    assert.equal(item.availability, "PLANNED");
  }
});
test("duplicate codes, invalid locales and RTL direction errors fail validation", () => {
  const x = clone(); x.languages[1].code = "en";
  assert.ok(validateLanguageCatalog(x).errors.includes("DUPLICATE_LANGUAGE_CODE"));
  const y = clone(); y.languages[5].direction = "ltr";
  assert.ok(validateLanguageCatalog(y).errors.includes("RTL_SCRIPT_DIRECTION_MISMATCH"));
  const z = clone(); z.languages[0].code = "Bad_code!";
  assert.ok(validateLanguageCatalog(z).errors.some((e) => e.startsWith("INVALID_BCP47_CODE")));
});
test("public catalog projection strips sensitive future/internal qualification fields", () => {
  const raw = clone(); raw.languages[0].internalReviewNotes = "PRIVATE";
  const proj = publicCatalogProjection(raw);
  assert.deepEqual(proj.languages.map(({ code }) => code), expectedProgramCodes);
  assert.equal(Object.hasOwn(proj.languages[0], "internalReviewNotes"), false);
  assert.equal(Object.hasOwn(proj.languages[0], "capabilities"), false);
});

test("an additional provisional program does not require changing the launch plan",()=>{
 const x=clone();
 x.languages.push({
  ...x.languages[0],
  id:"LANG-12",code:"pt",autonym:"Português",displayNameFa:"پرتغالی",
  displayNameEn:"Portuguese",script:"Latn",direction:"ltr",plannedLocaleVariants:["pt-PT","pt-BR"]
 });
 assert.equal(validateLanguageCatalog(x).valid,true);
 assert.equal(publicCatalogProjection(x).languages.length,expectedProgramCodes.length + 1);
 assert.equal(publicCatalogProjection(x).plannedLaunchLanguageCount,8);
});
