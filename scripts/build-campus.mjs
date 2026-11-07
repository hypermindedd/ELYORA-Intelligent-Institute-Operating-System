import { copyFile, mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { generatedResources, staticResources } from "../apps/web/preview-resources.mjs";

const source = resolve(fileURLToPath(new URL("../apps/web/", import.meta.url)));
const output = resolve(process.argv[2] ?? "dist");
if (output === source || source.startsWith(output + sep) || output.startsWith(source + sep)) {
  throw Error("Choose a build destination outside the web source tree");
}

for (const [file] of staticResources.values()) {
  const target = resolve(output, file);
  await mkdir(dirname(target), {recursive:true});
  await copyFile(resolve(source, file), target);
}

for (const [route, [, render]] of generatedResources) {
  const target = resolve(output, route.slice(1));
  await mkdir(dirname(target), {recursive:true});
  await writeFile(target, render());
}
