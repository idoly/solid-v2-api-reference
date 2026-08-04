import * as Solid from "solid-js";
import * as Web from "@solidjs/web";
import { compileDemo } from "./compile.mjs";
import { DEMO_EXECUTION_TIMEOUT, DEMO_SOURCE_LIMIT, serverDemoIds } from "./config.mjs";
import { DemoError, formatError } from "./i18n.mjs";
import { loadDemoCatalog } from "./load.mjs";

const demosById = new Map(loadDemoCatalog().map((demo) => [demo.id, demo.codes]));
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

export function format(value, locale = "en") {
  return formatError(value, locale);
}

export function compile(source) {
  if (typeof source !== "string") throw new DemoError("missingDemoSource");
  if (Buffer.byteLength(source) > DEMO_SOURCE_LIMIT) throw new DemoError("sourceTooLarge");
  return compileDemo(source, { filename: "editable-solid-demo.tsx", generate: "dom" });
}

export async function execute(id, index) {
  if (!serverDemoIds.has(id)) throw new DemoError("demoNotAllowed");
  const source = demosById.get(id)?.[index];
  if (!source) throw new DemoError("serverDemoNotFound");
  const compiled = compileDemo(source, {
    filename: `${id.replace(/[^a-zA-Z0-9_-]/g, "_")}.tsx`,
    generate: "ssr",
  });

  const logs = [];
  const demoConsole = Object.fromEntries(
    ["log", "info", "warn", "error"].map((level) => [
      level,
      (...values) => logs.push({ level, text: values.map((value) => format(value)).join(" ") }),
    ]),
  );
  const requireModule = (name) => {
    if (name === "solid-js") return Solid;
    if (name === "@solidjs/web") return Web;
    throw new DemoError("demoImportDenied", { name });
  };
  const module = { exports: {} };
  const run = new AsyncFunction("require", "module", "exports", "console", compiled);
  const result = await withTimeout(run(requireModule, module, module.exports, demoConsole));
  if (result !== undefined) logs.push({ level: "result", text: format(result) });
  const htmlIndex = logs.findLastIndex((entry) => /^\s*</.test(entry.text));
  return { logs, html: htmlIndex >= 0 ? logs[htmlIndex].text : "" };
}

async function withTimeout(promise) {
  let timer;
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new DemoError("serverDemoTimedOut")), DEMO_EXECUTION_TIMEOUT);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}
