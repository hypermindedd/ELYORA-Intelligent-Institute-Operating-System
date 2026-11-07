
import { validateDirective, approveDirective, evaluatePracticeAccess } from "./learning-scope.mjs";
import { languageCatalog, resolveLanguage } from "../catalog/languages.mjs";

/**
 * Institute directive v2 — scoped to exact target language and program version.
 * It reuses the already-authorized v1 core instead of recreating an educational engine.
 */
const deny = (reason) => ({ allowed: false, reason });
export function validateLanguageScopedDirective(directive, catalog = languageCatalog) {
  const basic = validateDirective(directive);
  if (!basic.allowed) return basic;
  if (!directive.targetLanguageCode || !resolveLanguage(directive.targetLanguageCode, catalog)) {
    return deny("UNREGISTERED_TARGET_LANGUAGE");
  }
  if (typeof directive.programVersion !== "string" || directive.programVersion.trim().length === 0) {
    return deny("PROGRAM_VERSION_REQUIRED");
  }
  const language = resolveLanguage(directive.targetLanguageCode, catalog);
  if (typeof directive.localeVariant !== "string" || !language.plannedLocaleVariants.includes(directive.localeVariant)) {
    return deny("LANGUAGE_VARIANT_NOT_IN_CATALOG");
  }
  if (typeof directive.instructionLocale !== "string") return deny("INSTRUCTION_LOCALE_REQUIRED");
  try { Intl.getCanonicalLocales(directive.instructionLocale); }
  catch { return deny("INVALID_INSTRUCTION_LOCALE"); }
  return { allowed: true, reason: "VALID_LANGUAGE_SCOPED_DIRECTIVE" };
}
export function approveLanguageScopedDirective({ directive, actor, assignment }) {
  const basic = validateLanguageScopedDirective(directive);
  if (!basic.allowed) return basic;
  return approveDirective({ directive, actor, assignment });
}
export function evaluateLanguageScopedPractice({ directive, actor, activity, at }) {
  const basic = validateLanguageScopedDirective(directive);
  if (!basic.allowed) return basic;
  if (!activity || activity.targetLanguageCode !== directive.targetLanguageCode) return deny("LANGUAGE_BOUNDARY_DENIED");
  if (activity.localeVariant !== directive.localeVariant) return deny("LANGUAGE_VARIANT_DENIED");
  if (activity.programVersion !== directive.programVersion) return deny("PROGRAM_VERSION_DENIED");
  return evaluatePracticeAccess({ directive, actor, activity, at });
}
