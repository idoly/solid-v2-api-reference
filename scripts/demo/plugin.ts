import type { Connect, Plugin } from "vite";
import { compile, execute, format } from "./service.mjs";

function send(response: Connect.ServerResponse, status: number, body: unknown) {
  response.statusCode = status;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.end(JSON.stringify(body));
}

async function readSource(request: Connect.IncomingMessage) {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of request) {
    const buffer = Buffer.from(chunk);
    size += buffer.length;
    if (size > 100_000) throw new Error("Demo source exceeds the 100 KB limit");
    chunks.push(buffer);
  }
  const { source } = JSON.parse(Buffer.concat(chunks).toString("utf8")) as { source?: unknown };
  return source;
}

function demoMiddleware(): Connect.NextHandleFunction {
  return async (request, response, next) => {
    const url = new URL(request.url ?? "/", "http://localhost");
    if (url.pathname === "/__solid_api_compile") {
      if (request.method !== "POST") return send(response, 405, { error: "Method not allowed" });
      try {
        send(response, 200, { code: compile(await readSource(request)) });
      } catch (error) {
        send(response, 400, { error: format(error) });
      }
      return;
    }
    if (url.pathname === "/__solid_api_demo") {
      try {
        const id = url.searchParams.get("id") ?? "";
        const index = Number(url.searchParams.get("index") ?? 0);
        send(response, 200, await execute(id, index));
      } catch (error) {
        const message = format(error);
        send(response, 400, { logs: [{ level: "error", text: message }], html: "", error: message });
      }
      return;
    }
    next();
  };
}

export function createDemoRuntimePlugin(): Plugin {
  const install = (middlewares: Connect.Server) => middlewares.use(demoMiddleware());
  return {
    name: "solid-api-demo-runtime",
    configureServer: (server) => install(server.middlewares),
    configurePreviewServer: (server) => install(server.middlewares),
  };
}
