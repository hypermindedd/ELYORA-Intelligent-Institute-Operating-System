
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { publicCatalogProjection } from "../../src/catalog/languages.mjs";

const root = fileURLToPath(new URL("./", import.meta.url));
const allowed = new Map([
  ["/", ["index.html", "text/html; charset=utf-8"]],
  ["/styles.css", ["styles.css", "text/css; charset=utf-8"]],
  ["/app.mjs", ["app.mjs", "text/javascript; charset=utf-8"]],
  ["/assets/student-studio.svg", ["assets/student-studio.svg", "image/svg+xml"]],
  ["/assets/teacher-atelier.svg", ["assets/teacher-atelier.svg", "image/svg+xml"]],
  ["/assets/live-classroom.svg", ["assets/live-classroom.svg", "image/svg+xml"]],
  ["/assets/command-center.svg", ["assets/command-center.svg", "image/svg+xml"]]
]);

const commonHeaders = Object.freeze({
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
  "Cross-Origin-Resource-Policy": "same-origin",
  "Content-Security-Policy": "default-src 'none'; img-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; font-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'"
});
const json = (res, status, data) => {
  res.writeHead(status, { ...commonHeaders, "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
};

export function createPreviewServer() {
  return createServer(async (req, res) => {
    if (req.method !== "GET") return json(res, 405, { error: "METHOD_NOT_ALLOWED", preview: true });
    let pathname;
    try { pathname = new URL(req.url, "http://localhost").pathname; }
    catch { return json(res, 400, { error: "INVALID_REQUEST" }); }
    if (pathname === "/api/health") {
      return json(res, 200, { status: "ok", mode: "OFFLINE_PREVIEW", liveAuth: false, elyora: "BLOCKED_NOT_CONNECTED" });
    }
    if (pathname === "/api/demo/languages") return json(res, 200, publicCatalogProjection());
    const match = allowed.get(pathname);
    if (!match) return json(res, 404, { error: "NOT_FOUND", preview: true });
    try {
      const file = resolve(root, match[0]);
      const bytes = await readFile(file);
      res.writeHead(200, { ...commonHeaders, "Content-Type": match[1] });
      res.end(bytes);
    } catch {
      return json(res, 500, { error: "PREVIEW_ASSET_UNAVAILABLE" });
    }
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT ?? 4173);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw Error("Invalid PORT");
  createPreviewServer().listen(port, "127.0.0.1", () => {
    console.log("ELYORA CAMPUS OFFLINE PREVIEW: http://127.0.0.1:" + port);
    console.log("NOT A LIVE AUTHENTICATION OR EDUCATIONAL SERVICE.");
  });
}
