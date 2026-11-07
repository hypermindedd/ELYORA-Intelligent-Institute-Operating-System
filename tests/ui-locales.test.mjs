import assert from "node:assert/strict";
import { test } from "node:test";
import { languageCatalog } from "../src/catalog/languages.mjs";
import english from "../apps/web/messages/en.mjs";

test("each configured UI locale has a complete, normalized dictionary", async () => {
  const keys = Object.keys(english).sort();
  for (const {code, direction, autonym} of languageCatalog.uiLocales) {
    assert.equal(Intl.getCanonicalLocales(code)[0], code);
    assert.equal(direction, ["ar", "fa-IR"].includes(code) ? "rtl" : "ltr");
    assert.ok(autonym.trim(), code);
    const {default:dictionary} = await import("../apps/web/messages/" + code.split("-")[0] + ".mjs");
    assert.deepEqual(Object.keys(dictionary).sort(), keys, code);
    for (const [key, message] of Object.entries(dictionary)) {
      assert.ok(typeof message === "string" && message.trim(), code + ":" + key);
      assert.equal(message, message.normalize("NFC"), code + ":" + key);
    }
  }
});
