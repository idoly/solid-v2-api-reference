import * as Solid from "solid-js";
import * as Web from "@solidjs/web";
import { compileDemo } from "./compile.mjs";
import { DemoError, formatError } from "./i18n.mjs";
import { loadDemoCatalog } from "./load.mjs";

const serverIds = new Set([
  "@solidjs/web/renderToString",
  "@solidjs/web/renderToStringAsync",
  "@solidjs/web/renderToStream",
]);
const demos = loadDemoCatalog();
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

export function format(value, locale = "en") {
  return formatError(value, locale);
}

export function compile(source) {
  if (typeof source !== "string") throw new DemoError("missingDemoSource");
  if (Buffer.byteLength(source) > 100_000) throw new DemoError("sourceTooLarge");
  return compileDemo(source, { filename: "editable-solid-demo.tsx", generate: "dom" });
}

export async function execute(id, index) {
  if (!serverIds.has(id)) throw new DemoError("demoNotAllowed");
  const source = demos.find((item) => item.id === id)?.codes[index];
  if (!source) throw new DemoError("serverDemoNotFound");
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
    throw new DemoError("demoImportDenied", { name });
  };
  const module = { exports: {} };
  const run = new AsyncFunction("require", "module", "exports", "console", compiled);
  const result = await Promise.race([
    run(requireModule, module, module.exports, demoConsole),
    new Promise((_, reject) => setTimeout(() => reject(new DemoError("serverDemoTimedOut")), 5000)),
  ]);
  if (result !== undefined) logs.push({ level: "result", text: format(result) });
  const htmlIndex = logs.findLastIndex((entry) => /^\s*</.test(entry.text));
  return { logs, html: htmlIndex >= 0 ? logs.splice(htmlIndex, 1)[0].text : "" };
}
