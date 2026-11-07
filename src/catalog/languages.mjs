
import { readFileSync } from "node:fs";

export const languageCatalog = Object.freeze(JSON.parse(
  readFileSync(new URL("../../packages/language-catalog/catalog.v1.json", import.meta.url), "utf8")
));

const BCP47 = /^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/;
const RTL_SCRIPTS = new Set(["Arab", "Hebr", "Syrc", "Thaa", "Nkoo", "Adlm"]);

export function validateLanguageCatalog(catalog = languageCatalog) {
  const errors = [];
  if (!catalog || catalog.schemaVersion !== 1 || !Array.isArray(catalog.languages)) {
    return { valid: false, errors: ["INVALID_CATALOG_STRUCTURE"] };
  }
  if (catalog.plannedLaunchLanguageCount !== 8) errors.push("EIGHT_SLOT_PLAN_MISSING");
  if (catalog.languages.length !== 8) errors.push("PROVISIONAL_SEED_MUST_HAVE_EIGHT_SLOTS");
  if (catalog.status !== "PROVISIONAL_DEMO_SEED") errors.push("SEED_MUST_NOT_CLAIM_APPROVAL");
  if (!Array.isArray(catalog.confirmedLaunchLanguages)) errors.push("CONFIRMATION_FIELD_MISSING");
  const codes = new Set(), ids = new Set();
  for (const entry of catalog.languages) {
    if (ids.has(entry.id)) errors.push("DUPLICATE_LANGUAGE_ID");
    if (codes.has(entry.code)) errors.push("DUPLICATE_LANGUAGE_CODE");
    ids.add(entry.id); codes.add(entry.code);
    if (!BCP47.test(entry.code)) errors.push("INVALID_BCP47_CODE:" + entry.code);
    else {
      try {
        if (Intl.getCanonicalLocales(entry.code)[0] !== entry.code) errors.push("NONCANONICAL_TAG:" + entry.code);
      } catch { errors.push("INVALID_BCP47_CODE:" + entry.code); }
    }
    if (!entry.autonym || !entry.displayNameFa || !entry.displayNameEn || !entry.script) errors.push("MISSING_LANGUAGE_DISPLAY_METADATA");
    if (!["ltr", "rtl"].includes(entry.direction)) errors.push("INVALID_DIRECTION");
    if (RTL_SCRIPTS.has(entry.script) && entry.direction !== "rtl") errors.push("RTL_SCRIPT_DIRECTION_MISMATCH");
    if (!Array.isArray(entry.plannedLocaleVariants) || entry.plannedLocaleVariants.length === 0) errors.push("MISSING_PLANNED_VARIANTS");
    else if (entry.plannedLocaleVariants.some((v) => !BCP47.test(v))) errors.push("INVALID_VARIANT");
    if (entry.program?.status !== "PLANNED") errors.push("PROGRAM_MUST_BE_PLANNED");
    if (!entry.capabilities || Object.values(entry.capabilities).some((v) => !["NOT_CONNECTED","NOT_VERIFIED","PLANNED"].includes(v))) {
      errors.push("CAPABILITY_MUST_NOT_CLAIM_UNVERIFIED_SUPPORT");
    }
  }
  if (!Array.isArray(catalog.uiLocales) || !catalog.uiLocales.some((l) => l.code === "fa-IR" && l.direction === "rtl") ||
      !catalog.uiLocales.some((l) => l.code === "en-US" && l.direction === "ltr")) errors.push("UI_LOCALES_REQUIRED");
  if (catalog.confirmedLaunchLanguages?.some((code) => !codes.has(code))) errors.push("UNREGISTERED_CONFIRMED_LANGUAGE");
  return { valid: errors.length === 0, errors };
}
export function resolveLanguage(code, catalog = languageCatalog) {
  return catalog.languages.find((x) => x.code === code) ?? null;
}
export function publicCatalogProjection(catalog = languageCatalog) {
  const check = validateLanguageCatalog(catalog);
  if (!check.valid) throw Error("Language catalog invalid: " + check.errors.join(","));
  return {
    schemaVersion: catalog.schemaVersion,
    status: catalog.status,
    plannedLaunchLanguageCount: catalog.plannedLaunchLanguageCount,
    confirmedLaunchLanguages: [...catalog.confirmedLaunchLanguages],
    languages: catalog.languages.map((item) => ({
      id: item.id, code: item.code, autonym: item.autonym,
      displayNameFa: item.displayNameFa, displayNameEn: item.displayNameEn,
      script: item.script, direction: item.direction,
      plannedLocaleVariants: [...item.plannedLocaleVariants],
      availability: item.program.status
    }))
  };
}
