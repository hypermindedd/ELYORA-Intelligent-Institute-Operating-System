import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
const directory = new URL("../contracts/schemas/", import.meta.url);
const entries = readdirSync(directory).filter((f) => f.endsWith(".json"));
if (entries.length < 4) throw Error("Missing schema inventory");
for (const filename of entries) {
  const schema = JSON.parse(readFileSync(new URL(filename, directory), "utf8"));
  if (schema.$schema !== "https://json-schema.org/draft/2020-12/schema" ||
      schema.type !== "object" || schema.additionalProperties !== false ||
      !Array.isArray(schema.required) || !schema.properties) {
    throw Error("Invalid schema metadata: " + filename);
  }
  for (const property of schema.required) {
    if (!Object.hasOwn(schema.properties, property)) throw Error("Missing property " + property + " in " + filename);
  }
  console.log("STRUCTURAL_SCHEMA_LINT_PASS", join("contracts/schemas", filename));
}
