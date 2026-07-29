import type { Connect, Plugin } from "vite";
import { handleRuntimeRequest, isRuntimePath } from "./http.mjs";

function send(response: Connect.ServerResponse, status: number, body: unknown) {
  response.statusCode = status;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.end(JSON.stringify(body));
}

function demoMiddleware(): Connect.NextHandleFunction {
  return async (request, response, next) => {
    const url = new URL(request.url ?? "/", "http://localhost");
    if (!isRuntimePath(url.pathname)) return next();

    const result = await handleRuntimeRequest(request, url);
    send(response, result.status, result.body);
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
