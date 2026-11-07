import { languageCatalog, publicCatalogProjection } from "../../src/catalog/languages.mjs";

const text = "text/javascript; charset=utf-8";
const roomAssets = ["student-studio", "teacher-atelier", "live-classroom", "command-center"];
const messageFiles = languageCatalog.uiLocales.map(({code}) => "messages/" + code.split("-")[0] + ".mjs");

export const staticResources = new Map([
  ["/", ["index.html", "text/html; charset=utf-8"]],
  ["/styles.css", ["styles.css", "text/css; charset=utf-8"]],
  ["/app.mjs", ["app.mjs", text]],
  ["/assets/fonts/vazirmatn-arabic.woff2", ["assets/fonts/vazirmatn-arabic.woff2", "font/woff2"]],
  ["/assets/fonts/OFL-Vazirmatn.txt", ["assets/fonts/OFL-Vazirmatn.txt", "text/plain; charset=utf-8"]],
  ["/assets/fonts/elyora-campus-cjk.woff2", ["assets/fonts/elyora-campus-cjk.woff2", "font/woff2"]],
  ["/assets/fonts/OFL-ElyoraCampusCJK.txt", ["assets/fonts/OFL-ElyoraCampusCJK.txt", "text/plain; charset=utf-8"]],
  ...messageFiles.map((path) => ["/" + path, [path, text]]),
  ...roomAssets.map((name) => {
    const path = "assets/" + name + ".svg";
    return ["/" + path, [path, "image/svg+xml"]];
  })
]);

export const catalogPath = "/api/demo/languages.json";
export const generatedResources = new Map([
  ["/locale-registry.mjs", [text, () => "export default " + JSON.stringify(languageCatalog.uiLocales) + ";\n"]],
  [catalogPath, ["application/json; charset=utf-8", () => JSON.stringify(publicCatalogProjection())]]
]);
