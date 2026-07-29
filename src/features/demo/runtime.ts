import * as Solid from "solid-js";
import * as Web from "@solidjs/web";
import { runtimeError, runtimeLocale, runtimeMessage } from "../i18n/runtime";

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
  if (typeof value === "function") return runtimeMessage("functionValue", value.name || "anonymous");
  if (typeof value === "symbol") return value.toString();
  if (value && typeof value === "object") {
    if (seen.has(value)) return runtimeMessage("circular");
    seen.add(value);
    try {
      return JSON.stringify(
        value,
        (_key, nested) => {
          if (typeof nested === "function") return runtimeMessage("functionValue", nested.name || "anonymous");
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
        return (selector: string) =>
          selector === "#app" || selector === "#root" ? mount : mount.querySelector(selector);
      if (property === "querySelectorAll") return (selector: string) => mount.querySelectorAll(selector);
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
  onUpdate?: (result: Result) => void;
};

export async function execute(request: Input): Promise<Result> {
  if (isServer(request.id)) {
    const result = await executeServerDemo(request.id, request.index);
    if (result.html) request.mount.innerHTML = result.html;
    return result;
  }

  const compiled = await compileBrowserDemo(request.source);
  return executeBrowserDemo(compiled, request.mount, request.onUpdate);
}

async function requestRuntime<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<{ response: Response; data: T }> {
  let response: Response;
  try {
    response = await fetch(input, init);
  } catch {
    throw runtimeError("runtimeUnavailable");
  }

  if ([404, 405, 501].includes(response.status) || response.status >= 500) {
    throw runtimeError("runtimeUnavailable");
  }
  if (!response.headers.get("content-type")?.toLowerCase().includes("application/json")) {
    throw runtimeError("runtimeUnavailable");
  }

  try {
    return { response, data: (await response.json()) as T };
  } catch {
    throw runtimeError("runtimeUnavailable");
  }
}

async function compileBrowserDemo(source: string): Promise<string> {
  const { response, data: result } = await requestRuntime<{ code?: string; error?: string }>("/__solid_api_compile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ source, locale: runtimeLocale() }),
  });
  if (!response.ok || !result.code) throw result.error ? new Error(result.error) : runtimeError("compileFailed");
  return result.code;
}

function isResult(value: unknown): value is Result {
  if (!value || typeof value !== "object") return false;
  const result = value as Partial<Result>;
  return Array.isArray(result.logs) && typeof result.html === "string";
}

async function executeServerDemo(id: string, index: number): Promise<Result> {
  try {
    const { data } = await requestRuntime<unknown>(
      `/__solid_api_demo?id=${encodeURIComponent(id)}&index=${index}&locale=${encodeURIComponent(runtimeLocale())}`,
    );
    if (isResult(data)) return data;
    const error = (data as { error?: unknown } | null)?.error;
    if (typeof error === "string") throw new Error(error);
    throw runtimeError("runtimeUnavailable");
  } catch (error) {
    const message = error instanceof Error ? error.message : runtimeMessage("runtimeUnavailable");
    return { logs: [{ level: "error", text: message }], html: "", error: message };
  }
}

export function isServer(id: string) {
  return serverDemoIds.has(id);
}

function createResultPublisher(logs: Log[], mount: HTMLElement, onUpdate?: (result: Result) => void) {
  let queued = false;
  let pendingError: string | undefined;

  return (error?: string) => {
    if (!onUpdate) return;
    if (error !== undefined) pendingError = error;
    if (queued) return;
    queued = true;
    queueMicrotask(() => {
      queued = false;
      const publishedError = pendingError;
      pendingError = undefined;
      onUpdate({ logs: [...logs], html: mount.innerHTML, error: publishedError });
    });
  };
}

async function executeBrowserDemo(
  compiled: string,
  mount: HTMLElement,
  onUpdate?: (result: Result) => void,
): Promise<Result> {
  mount.replaceChildren();
  const logs: Log[] = [];
  const publish = createResultPublisher(logs, mount, onUpdate);
  const write = (level: Log["level"], values: unknown[]) => {
    logs.push({ level, text: values.map((value) => formatValue(value)).join(" ") });
    publish();
  };
  const demoConsole = {
    log: (...values: unknown[]) => write("log", values),
    info: (...values: unknown[]) => write("info", values),
    warn: (...values: unknown[]) => write("warn", values),
    error: (...values: unknown[]) => write("error", values),
  };

  try {
    if (!compiled) throw runtimeError("missingOutput");

    const requireModule = (name: string) => {
      if (name === "solid-js") return Solid;
      if (name === "@solidjs/web") return Web;
      throw runtimeError("importDenied", name);
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
    publish(message);
    return { logs, html: mount.innerHTML, error: message };
  }
}
