import fs from "node:fs";
import path from "node:path";
import { defineConfig, type Connect, type Plugin } from "vite";
import solid from "vite-plugin-solid";
import Babel from "@babel/standalone";
import presetSolid from "babel-preset-solid";
import * as Solid from "solid-js";
import * as Web from "@solidjs/web";

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
    return JSON.stringify(value, (_key, nested) => typeof nested === "function" ? `[函数 ${nested.name || "anonymous"}]` : nested, 2);
  } catch {
    return String(value);
  }
}

async function executeServerDemo(id: string, index: number) {
  if (!serverDemoIds.has(id)) throw new Error("该 API 不允许在服务端执行器中运行");
  const catalogPath = path.resolve(process.cwd(), "src/generated-api-catalog.json");
  const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8")) as Array<{ id: string; compiledCodes: string[] }>;
  const entry = catalog.find((item) => item.id === id);
  const compiled = entry?.compiledCodes[index];
  if (!compiled) throw new Error("没有找到对应的服务端编译产物");

  const logs: Array<{ level: string; text: string }> = [];
  const demoConsole = Object.fromEntries(["log", "info", "warn", "error"].map((level) => [
    level,
    (...values: unknown[]) => { logs.push({ level, text: values.map(formatValue).join(" ") }); },
  ]));
  const requireModule = (name: string) => {
    if (name === "solid-js") return Solid;
    if (name === "@solidjs/web" || name === "solid-js/web") return Web;
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
  const html = htmlIndex >= 0 ? logs.splice(htmlIndex, 1)[0].text : "";
  return { logs, html };
}

function demoMiddleware(): Connect.NextHandleFunction {
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

function compileMiddleware(): Connect.NextHandleFunction {
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
      const code = Babel.transform(source, {
        filename: "editable-solid-demo.tsx",
        sourceType: "module",
        presets: [[presetSolid, { moduleName: "@solidjs/web", generate: "dom" }], "typescript"],
        plugins: ["transform-modules-commonjs"],
      }).code;
      response.statusCode = 200;
      response.end(JSON.stringify({ code }));
    } catch (error) {
      response.statusCode = 400;
      response.end(JSON.stringify({ error: formatValue(error) }));
    }
  };
}

function serverDemoPlugin(): Plugin {
  return {
    name: "solid-api-server-demo",
    configureServer(server) {
      server.middlewares.use(compileMiddleware());
      server.middlewares.use(demoMiddleware());
    },
    configurePreviewServer(server) {
      server.middlewares.use(compileMiddleware());
      server.middlewares.use(demoMiddleware());
    },
  };
}

export default defineConfig({
  plugins: [solid(), serverDemoPlugin()],
  server: {
    host: "0.0.0.0",
  },
  build: {
    target: "esnext",
  },
});
