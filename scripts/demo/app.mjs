import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { handleRuntimeRequest, isRuntimePath } from "./http.mjs";
import { message, normalizeLocale } from "./i18n.mjs";

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

export function createDemoServer({ root = path.resolve("dist"), rateLimit = 30 } = {}) {
  const staticRoot = path.resolve(root);
  const windows = new Map();

  const allowed = (request) => {
    const now = Date.now();
    if (windows.size > 1000) {
      for (const [ip, window] of windows) {
        if (now - window.start >= 60_000) windows.delete(ip);
      }
    }
    const ip = String(request.headers["x-forwarded-for"] ?? request.socket.remoteAddress ?? "unknown")
      .split(",")[0]
      .trim();
    const current = windows.get(ip);
    if (!current || now - current.start >= 60_000) {
      windows.set(ip, { start: now, count: 1 });
      return true;
    }
    current.count += 1;
    return current.count <= rateLimit;
  };

  const server = createServer(async (request, response) => {
    try {
      const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);
      if (url.pathname === "/health") return send(response, 200, { status: "ok" });
      if (isRuntimePath(url.pathname)) {
        if (!allowed(request)) {
          const locale = normalizeLocale(url.searchParams.get("locale") ?? request.headers["accept-language"]);
          response.setHeader("Retry-After", "60");
          return send(response, 429, { error: message(locale, "tooManyRequests") });
        }
        const result = await handleRuntimeRequest(request, url);
        return send(response, result.status, result.body);
      }
      if (request.method !== "GET" && request.method !== "HEAD") {
        return send(response, 405, { error: "Method not allowed" });
      }
      await sendFile(response, staticRoot, url.pathname, request.method === "HEAD");
    } catch (error) {
      console.error(error);
      if (!response.headersSent) send(response, 500, { error: "Internal server error" });
      else response.destroy();
    }
  });

  server.requestTimeout = 10_000;
  server.headersTimeout = 10_000;
  return server;
}

function send(response, status, body, type = "application/json; charset=utf-8") {
  response.writeHead(status, { "Content-Type": type, "Cache-Control": "no-store" });
  response.end(type.startsWith("application/json") ? JSON.stringify(body) : body);
}

async function sendFile(response, root, pathname, head) {
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
  if (head) return response.end();

  const stream = createReadStream(target);
  stream.on("error", (error) => {
    console.error(error);
    response.destroy();
  });
  stream.pipe(response);
}
