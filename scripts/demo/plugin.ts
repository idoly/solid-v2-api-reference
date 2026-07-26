import path from "node:path";
import type { Connect, Plugin } from "vite";
import * as Solid from "solid-js";
import * as Web from "@solidjs/web";
import { compileDemo } from "./compile.mjs";
import { loadDemoCatalog } from "./load.mjs";

const serverDemoIds = new Set([
  "@solidjs/web/renderToString",
  "@solidjs/web/renderToStringAsync",
  "@solidjs/web/renderToStream",
]);
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor as new (
  ...args: string[]
) => (...values: unknown[]) => Promise<unknown>;

function formatValue(value: unknown): string {
  if (value instanceof Error) return `${value.name}: ${value.message}`;
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(
      value,
      (_key, nested) => (typeof nested === "function" ? `[函数 ${nested.name || "anonymous"}]` : nested),
      2,
    );
  } catch {
    return String(value);
  }
}

async function executeServerDemo(id: string, index: number) {
  if (!serverDemoIds.has(id)) throw new Error("该 API 不允许在服务端执行器中运行");
  const catalogPath = path.resolve(process.cwd(), "data/catalog.json");
  const catalog = loadDemoCatalog(catalogPath) as Array<{ id: string; codes: string[] }>;
  const source = catalog.find((item) => item.id === id)?.codes[index];
  if (!source) throw new Error("没有找到对应的服务端示例源码");
  const compiled = compileDemo(source, {
    filename: `${id.replace(/[^a-zA-Z0-9_-]/g, "_")}.tsx`,
    generate: "ssr",
  });

  const logs: Array<{ level: string; text: string }> = [];
  const demoConsole = Object.fromEntries(
    ["log", "info", "warn", "error"].map((level) => [
      level,
      (...values: unknown[]) => {
        logs.push({ level, text: values.map(formatValue).join(" ") });
      },
    ]),
  );
  const requireModule = (name: string) => {
    if (name === "solid-js") return Solid;
    if (name === "@solidjs/web") return Web;
    throw new Error(`案例不允许导入未声明的模块：${name}`);
  };
  const module = { exports: {} as Record<string, unknown> };
  const run = new AsyncFunction("require", "module", "exports", "console", compiled);
  const result = await Promise.race([
    run(requireModule, module, module.exports, demoConsole),
    new Promise((_, reject) => setTimeout(() => reject(new Error("服务端案例执行超时")), 5000)),
  ]);
  if (result !== undefined) logs.push({ level: "result", text: formatValue(result) });
  const htmlIndex = logs.findLastIndex((entry) => /^\s*</.test(entry.text));
  return { logs, html: htmlIndex >= 0 ? logs.splice(htmlIndex, 1)[0].text : "" };
}

function serverDemoMiddleware(): Connect.NextHandleFunction {
  return async (request, response, next) => {
    const url = new URL(request.url ?? "/", "http://localhost");
    if (url.pathname !== "/__solid_api_demo") return next();
    response.setHeader("Content-Type", "application/json; charset=utf-8");
    try {
      const id = url.searchParams.get("id") ?? "";
      const index = Number(url.searchParams.get("index") ?? 0);
      response.statusCode = 200;
      response.end(JSON.stringify(await executeServerDemo(id, index)));
    } catch (error) {
      const message = formatValue(error);
      response.statusCode = 400;
      response.end(JSON.stringify({ logs: [{ level: "error", text: message }], html: "", error: message }));
    }
  };
}

function browserCompileMiddleware(): Connect.NextHandleFunction {
  return async (request, response, next) => {
    const url = new URL(request.url ?? "/", "http://localhost");
    if (url.pathname !== "/__solid_api_compile") return next();
    response.setHeader("Content-Type", "application/json; charset=utf-8");
    if (request.method !== "POST") {
      response.statusCode = 405;
      response.end(JSON.stringify({ error: "只允许 POST 请求" }));
      return;
    }
    try {
      const chunks: Buffer[] = [];
      let size = 0;
      for await (const chunk of request) {
        const buffer = Buffer.from(chunk);
        size += buffer.length;
        if (size > 100_000) throw new Error("示例代码超过 100 KB 限制");
        chunks.push(buffer);
      }
      const { source } = JSON.parse(Buffer.concat(chunks).toString("utf8")) as { source?: unknown };
      if (typeof source !== "string") throw new Error("缺少示例源代码");
      const code = compileDemo(source, { filename: "editable-solid-demo.tsx", generate: "dom" });
      response.statusCode = 200;
      response.end(JSON.stringify({ code }));
    } catch (error) {
      response.statusCode = 400;
      response.end(JSON.stringify({ error: formatValue(error) }));
    }
  };
}

export function createDemoRuntimePlugin(): Plugin {
  const installMiddleware = (middlewares: Connect.Server) => {
    middlewares.use(browserCompileMiddleware());
    middlewares.use(serverDemoMiddleware());
  };
  return {
    name: "solid-api-demo-runtime",
    configureServer: (server) => installMiddleware(server.middlewares),
    configurePreviewServer: (server) => installMiddleware(server.middlewares),
  };
}
