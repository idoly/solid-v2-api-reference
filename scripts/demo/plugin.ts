import type { Connect, Plugin } from "vite";
import { compile, execute, format } from "./service.mjs";
import { DemoError, message, normalizeLocale } from "./i18n.mjs";

function send(response: Connect.ServerResponse, status: number, body: unknown) {
  response.statusCode = status;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.end(JSON.stringify(body));
}

async function readPayload(request: Connect.IncomingMessage) {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of request) {
    const buffer = Buffer.from(chunk);
    size += buffer.length;
    if (size > 100_000) throw new DemoError("requestTooLarge");
    chunks.push(buffer);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8")) as { source?: unknown; locale?: unknown };
  } catch {
    throw new DemoError("invalidJson");
  }
}

function demoMiddleware(): Connect.NextHandleFunction {
  return async (request, response, next) => {
    const url = new URL(request.url ?? "/", "http://localhost");
    const requestedLocale = url.searchParams.get("locale") ?? request.headers["accept-language"];
    if (url.pathname === "/__solid_api_compile") {
      let locale = normalizeLocale(requestedLocale);
      if (request.method !== "POST") return send(response, 405, { error: message(locale, "methodNotAllowed") });
      try {
        const payload = await readPayload(request);
        locale = normalizeLocale(payload.locale ?? requestedLocale);
        send(response, 200, { code: compile(payload.source) });
      } catch (error) {
        send(response, 400, { error: format(error, locale) });
      }
      return;
    }
    if (url.pathname === "/__solid_api_demo") {
      const locale = normalizeLocale(requestedLocale);
      try {
        const id = url.searchParams.get("id") ?? "";
        const index = Number(url.searchParams.get("index") ?? 0);
        send(response, 200, await execute(id, index));
      } catch (error) {
        const errorMessage = format(error, locale);
        send(response, 400, { logs: [{ level: "error", text: errorMessage }], html: "", error: errorMessage });
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
    configureServer(server) {
      install(server.middlewares);
    },
    configurePreviewServer(server) {
      install(server.middlewares);
    },
  };
}
