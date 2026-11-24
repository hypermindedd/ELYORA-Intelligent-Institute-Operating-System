// Developer fixture: serves three static files only on loopback, separate from the campus preview.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
const assets = new Map([["/",["index.html","text/html; charset=utf-8"]],["/call.mjs",["call.mjs","text/javascript; charset=utf-8"]]]);
const port = Number(process.env.PORT ?? 4184);
const server = createServer(async (req,res) => {
  const asset = assets.get(req.url);
  if (req.method !== "GET" || !asset) { res.writeHead(404).end(); return; }
  try {
    const bytes = await readFile(new URL(asset[0],import.meta.url));
    res.writeHead(200,{"Content-Type":asset[1],"Cache-Control":"no-store","Referrer-Policy":"no-referrer",
      "Permissions-Policy":"microphone=(self), camera=()", "Content-Security-Policy":"default-src 'none'; script-src 'self'; media-src 'self' blob:; frame-ancestors 'none'; base-uri 'none'"}).end(bytes);
  } catch { res.writeHead(500).end(); }
});
server.listen(port,"127.0.0.1",() => console.log("Local audio lab: http://127.0.0.1:" + server.address().port));
