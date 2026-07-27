import * as Solid from "solid-js";
import * as Web from "@solidjs/web";
import { compileDemo } from "./compile.mjs";
import { loadDemoCatalog } from "./load.mjs";

const serverIds = new Set([
  "@solidjs/web/renderToString",
  "@solidjs/web/renderToStringAsync",
  "@solidjs/web/renderToStream",
]);
const demos = loadDemoCatalog();
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

export function format(value) {
  if (value instanceof Error) return `${value.name}: ${value.message}`;
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(
      value,
      (_key, nested) => (typeof nested === "function" ? `[function ${nested.name || "anonymous"}]` : nested),
      2,
    );
  } catch {
    return String(value);
  }
}

export function compile(source) {
  if (typeof source !== "string") throw new Error("Missing demo source");
  if (Buffer.byteLength(source) > 100_000) throw new Error("Demo source exceeds the 100 KB limit");
  return compileDemo(source, { filename: "editable-solid-demo.tsx", generate: "dom" });
}

export async function execute(id, index) {
  if (!serverIds.has(id)) throw new Error("This API is not allowed in the server executor");
  const source = demos.find((item) => item.id === id)?.codes[index];
  if (!source) throw new Error("Server demo source was not found");
  const compiled = compileDemo(source, {
    filename: `${id.replace(/[^a-zA-Z0-9_-]/g, "_")}.tsx`,
    generate: "ssr",
  });

  const logs = [];
  const demoConsole = Object.fromEntries(
    ["log", "info", "warn", "error"].map((level) => [
      level,
      (...values) => logs.push({ level, text: values.map(format).join(" ") }),
    ]),
  );
  const requireModule = (name) => {
    if (name === "solid-js") return Solid;
    if (name === "@solidjs/web") return Web;
    throw new Error(`Demo cannot import undeclared module: ${name}`);
  };
  const module = { exports: {} };
  const run = new AsyncFunction("require", "module", "exports", "console", compiled);
  const result = await Promise.race([
    run(requireModule, module, module.exports, demoConsole),
    new Promise((_, reject) => setTimeout(() => reject(new Error("Server demo timed out")), 5000)),
  ]);
  if (result !== undefined) logs.push({ level: "result", text: format(result) });
  const htmlIndex = logs.findLastIndex((entry) => /^\s*</.test(entry.text));
  return { logs, html: htmlIndex >= 0 ? logs.splice(htmlIndex, 1)[0].text : "" };
}
