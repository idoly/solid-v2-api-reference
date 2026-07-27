import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { compile, execute, format } from "./service.mjs";

const root = path.resolve(process.env.STATIC_DIR ?? "dist");
const port = Number(process.env.PORT ?? 9000);
const limit = Number(process.env.DEMO_RATE_LIMIT ?? 30);
const windows = new Map();
const mime = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".map", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".webp", "image/webp"],
  [".woff2", "font/woff2"],
]);

function send(response, status, body, type = "application/json; charset=utf-8") {
  response.writeHead(status, { "Content-Type": type, "Cache-Control": "no-store" });
  response.end(type.startsWith("application/json") ? JSON.stringify(body) : body);
}

function clientIp(request) {
  return String(request.headers["x-forwarded-for"] ?? request.socket.remoteAddress ?? "unknown")
    .split(",")[0]
    .trim();
}

function allowed(request) {
  const now = Date.now();
  if (windows.size > 1000) {
    for (const [ip, window] of windows) {
      if (now - window.start >= 60_000) windows.delete(ip);
    }
  }
  const ip = clientIp(request);
  const current = windows.get(ip);
  if (!current || now - current.start >= 60_000) {
    windows.set(ip, { start: now, count: 1 });
    return true;
  }
  current.count += 1;
  return current.count <= limit;
}

async function readJson(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 100_000) throw new Error("Request exceeds the 100 KB limit");
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

async function api(request, response, url) {
  if (!allowed(request)) {
    response.setHeader("Retry-After", "60");
    send(response, 429, { error: "Too many demo requests" });
    return;
  }
  if (url.pathname === "/__solid_api_compile") {
    if (request.method !== "POST") return send(response, 405, { error: "Method not allowed" });
    try {
      const { source } = await readJson(request);
      send(response, 200, { code: compile(source) });
    } catch (error) {
      send(response, 400, { error: format(error) });
    }
    return;
  }
  try {
    const id = url.searchParams.get("id") ?? "";
    const index = Number(url.searchParams.get("index") ?? 0);
    send(response, 200, await execute(id, index));
  } catch (error) {
    const message = format(error);
    send(response, 400, { logs: [{ level: "error", text: message }], html: "", error: message });
  }
}

async function file(response, pathname, head) {
  let relative;
  try {
    relative = decodeURIComponent(pathname).replace(/^\/+/, "");
  } catch {
    return send(response, 400, "Bad request", "text/plain; charset=utf-8");
  }
  let target = path.resolve(root, relative || "index.html");
  if (target !== root && !target.startsWith(`${root}${path.sep}`)) {
    return send(response, 403, "Forbidden", "text/plain; charset=utf-8");
  }
  let info;
  try {
    info = await stat(target);
    if (!info.isFile()) throw new Error("Not a file");
  } catch {
    if (path.extname(relative)) return send(response, 404, "Not found", "text/plain; charset=utf-8");
    target = path.join(root, "index.html");
    info = await stat(target);
  }
  const extension = path.extname(target);
  response.writeHead(200, {
    "Content-Type": mime.get(extension) ?? "application/octet-stream",
    "Content-Length": info.size,
    "Cache-Control": target.includes(`${path.sep}assets${path.sep}`)
      ? "public, max-age=31536000, immutable"
      : "no-cache",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
  });
  if (head) response.end();
  else createReadStream(target).pipe(response);
}

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);
    if (url.pathname === "/health") return send(response, 200, { status: "ok" });
    if (url.pathname === "/__solid_api_compile" || url.pathname === "/__solid_api_demo") {
      return await api(request, response, url);
    }
    if (request.method !== "GET" && request.method !== "HEAD") {
      return send(response, 405, { error: "Method not allowed" });
    }
    await file(response, url.pathname, request.method === "HEAD");
  } catch (error) {
    console.error(error);
    if (!response.headersSent) send(response, 500, { error: "Internal server error" });
    else response.destroy();
  }
});

server.requestTimeout = 10_000;
server.headersTimeout = 10_000;
server.listen(port, "0.0.0.0", () => console.log(`Server listening on ${port}`));

process.on("SIGTERM", () => server.close(() => process.exit(0)));
