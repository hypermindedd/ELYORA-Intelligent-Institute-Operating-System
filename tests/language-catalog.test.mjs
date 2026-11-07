
import test from "node:test";
import assert from "node:assert/strict";
import { languageCatalog, validateLanguageCatalog, resolveLanguage, publicCatalogProjection } from "../src/catalog/languages.mjs";
const clone = () => JSON.parse(JSON.stringify(languageCatalog));

test("eight provisional target-language programs are modeled, not falsely activated", () => {
  assert.equal(languageCatalog.languages.length, 8);
  assert.equal(languageCatalog.confirmedLaunchLanguages.length, 0);
  assert.equal(validateLanguageCatalog().valid, true);
  assert.ok(languageCatalog.languages.every((x) => x.program.status === "PLANNED"));
});
test("UI locale and educational target language are different concerns", () => {
  assert.deepEqual(languageCatalog.uiLocales.map((x) => x.code), ["fa-IR", "en-US"]);
  assert.equal(resolveLanguage("ar").direction, "rtl");
  assert.equal(resolveLanguage("ja").script, "Jpan");
  assert.equal(resolveLanguage("xx"), null);
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
  assert.equal(proj.languages.length, 8);
  assert.equal(Object.hasOwn(proj.languages[0], "internalReviewNotes"), false);
  assert.equal(Object.hasOwn(proj.languages[0], "capabilities"), false);
});

test("future ninth or additional language does not require platform redesign",()=>{
 const x=clone();
 x.languages.push({
  ...x.languages[0],
  id:"LANG-09",code:"pt",autonym:"Português",displayNameFa:"پرتغالی",
  displayNameEn:"Portuguese",script:"Latn",direction:"ltr",plannedLocaleVariants:["pt-PT","pt-BR"]
 });
 assert.equal(validateLanguageCatalog(x).valid,true);
 assert.equal(publicCatalogProjection(x).languages.length,9);
});
