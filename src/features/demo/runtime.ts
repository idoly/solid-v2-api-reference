import * as Solid from "solid-js";
import * as Web from "@solidjs/web";
import { runtimeError } from "../i18n/runtime";
import { createScopedDocument } from "./dom";
import { formatValue } from "./format";
import type { Log, Result } from "./model";
import { compileBrowserDemo, requestServerDemo } from "./service-client";

const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor as new (
  ...args: string[]
) => (...values: unknown[]) => Promise<unknown>;
const CLIENT_EXECUTION_TIMEOUT = 8_000;

type Input = {
  id: string;
  index: number;
  source: string;
  server: boolean;
  mount: HTMLElement;
  onUpdate?: (result: Result) => void;
};

export function execute(request: Input): Promise<Result> {
  let timer: number | undefined;
  const timeout = new Promise<never>((_resolve, reject) => {
    timer = window.setTimeout(() => reject(runtimeError("executionTimedOut")), CLIENT_EXECUTION_TIMEOUT);
  });
  return Promise.race([executeRequest(request), timeout]).finally(() => {
    if (timer) window.clearTimeout(timer);
  });
}

async function executeRequest(request: Input): Promise<Result> {
  if (request.server) {
    const result = await requestServerDemo(request.id, request.index);
    if (result.html) request.mount.innerHTML = result.html;
    return result;
  }

  const compiled = await compileBrowserDemo(request.source);
  return executeBrowserDemo(compiled, request.mount, request.onUpdate);
}

function createPublisher(logs: Log[], mount: HTMLElement, onUpdate?: (result: Result) => void) {
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
  const publish = createPublisher(logs, mount, onUpdate);
  const write = (level: Log["level"], values: unknown[]) => {
    logs.push({ level, text: values.map((value) => formatValue(value)).join(" ") });
    publish();
  };
  const demoConsole = Object.fromEntries(
    (["log", "info", "warn", "error"] as const).map((level) => [level, (...values: unknown[]) => write(level, values)]),
  );

  try {
    if (!compiled) throw runtimeError("missingOutput");
    const requireModule = (name: string) => {
      if (name === "solid-js") return Solid;
      if (name === "@solidjs/web") return Web;
      throw runtimeError("importDenied", name);
    };
    const module = { exports: {} as Record<string, unknown> };
    const run = new AsyncFunction("require", "module", "exports", "console", "document", "window", compiled);
    const result = await run(requireModule, module, module.exports, demoConsole, createScopedDocument(mount), window);
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
