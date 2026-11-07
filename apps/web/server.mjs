
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { catalogPath, generatedResources, staticResources } from "./preview-resources.mjs";

const root = fileURLToPath(new URL("./", import.meta.url));

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
    const generated = generatedResources.get(pathname === "/api/demo/languages" ? catalogPath : pathname);
    const match = staticResources.get(pathname);
    if (!generated && !match) return json(res, 404, { error: "NOT_FOUND", preview: true });
    try {
      const [type, bytes] = generated
        ? [generated[0], generated[1]()]
        : [match[1], await readFile(resolve(root, match[0]))];
      res.writeHead(200, { ...commonHeaders, "Content-Type": type });
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
