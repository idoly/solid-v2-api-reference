import * as Solid from "solid-js";
import * as Web from "@solidjs/web";

export type Log = {
  level: "log" | "info" | "warn" | "error" | "result";
  text: string;
};

export type Result = {
  logs: Log[];
  html: string;
  error?: string;
};

const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor as new (
  ...args: string[]
) => (...values: unknown[]) => Promise<unknown>;

function formatValue(value: unknown, seen = new WeakSet<object>()): string {
  if (value instanceof Error) return `${value.name}: ${value.message}`;
  if (value instanceof Node) return value instanceof Element ? value.outerHTML : (value.textContent ?? value.nodeName);
  if (typeof value === "string") return value;
  if (typeof value === "function") return `[函数 ${value.name || "anonymous"}]`;
  if (typeof value === "symbol") return value.toString();
  if (value && typeof value === "object") {
    if (seen.has(value)) return "[循环引用]";
    seen.add(value);
    try {
      return JSON.stringify(
        value,
        (_key, nested) => {
          if (typeof nested === "function") return `[函数 ${nested.name || "anonymous"}]`;
          if (typeof nested === "symbol") return nested.toString();
          return nested;
        },
        2,
      );
    } catch {
      return Object.prototype.toString.call(value);
    }
  }
  return String(value);
}

function sandboxDocument(mount: HTMLElement): Document {
  // Redirect common document targets into the preview so demos cannot replace the application shell.
  const targets = new Map<string, HTMLElement>();
  const targetFor = (id: string) => {
    if (id === "app" || id === "root") return mount;
    let target = targets.get(id);
    if (!target) {
      target = document.createElement("div");
      target.id = id;
      mount.append(target);
      targets.set(id, target);
    }
    return target;
  };

  return new Proxy(document, {
    get(target, property) {
      if (property === "body") return mount;
      if (property === "getElementById") return (id: string) => targetFor(id);
      if (property === "querySelector")
        return (selector: string) => mount.querySelector(selector) ?? target.querySelector(selector);
      const value = Reflect.get(target, property, target);
      return typeof value === "function" ? value.bind(target) : value;
    },
  });
}

const serverDemoIds = new Set([
  "@solidjs/web/renderToString",
  "@solidjs/web/renderToStringAsync",
  "@solidjs/web/renderToStream",
]);

type Input = {
  id: string;
  index: number;
  source: string;
  mount: HTMLElement;
};

export async function execute(request: Input): Promise<Result> {
  if (isServer(request.id)) {
    const result = await executeServerDemo(request.id, request.index);
    if (result.html) request.mount.innerHTML = result.html;
    return result;
  }

  const compiled = await compileBrowserDemo(request.source);
  return executeBrowserDemo(compiled, request.mount);
}

async function compileBrowserDemo(source: string): Promise<string> {
  const response = await fetch("/__solid_api_compile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ source }),
  });
  const result = (await response.json()) as { code?: string; error?: string };
  if (!response.ok || !result.code) throw new Error(result.error || "代码编译失败");
  return result.code;
}

async function executeServerDemo(id: string, index: number): Promise<Result> {
  try {
    const response = await fetch(`/__solid_api_demo?id=${encodeURIComponent(id)}&index=${index}`);
    const result = (await response.json()) as Result;
    return result;
  } catch (error) {
    const message = formatValue(error);
    return { logs: [{ level: "error", text: message }], html: "", error: message };
  }
}

export function isServer(id: string) {
  return serverDemoIds.has(id);
}

async function executeBrowserDemo(compiled: string, mount: HTMLElement): Promise<Result> {
  mount.replaceChildren();
  const logs: Log[] = [];
  const write = (level: Log["level"], values: unknown[]) => {
    logs.push({ level, text: values.map((value) => formatValue(value)).join(" ") });
  };
  const demoConsole = {
    log: (...values: unknown[]) => write("log", values),
    info: (...values: unknown[]) => write("info", values),
    warn: (...values: unknown[]) => write("warn", values),
    error: (...values: unknown[]) => write("error", values),
  };

  try {
    if (!compiled) throw new Error("该案例没有可执行的编译产物");

    const requireModule = (name: string) => {
      if (name === "solid-js") return Solid;
      if (name === "@solidjs/web") return Web;
      throw new Error(`案例不允许导入未声明的模块：${name}`);
    };
    const module = { exports: {} as Record<string, unknown> };
    const run = new AsyncFunction("require", "module", "exports", "console", "document", "window", compiled);
    let result: unknown;
    result = await run(requireModule, module, module.exports, demoConsole, sandboxDocument(mount), window);
    Solid.flush();
    await Promise.resolve();
    Solid.flush();
    if (result !== undefined) write("result", [result]);
    return { logs, html: mount.innerHTML };
  } catch (error) {
    const message = formatValue(error);
    logs.push({ level: "error", text: message });
    return { logs, html: mount.innerHTML, error: message };
  }
}
