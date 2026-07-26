import { Window } from "happy-dom";
import fs from "node:fs";

const window = new Window({ url: "http://localhost/" });
Object.defineProperties(globalThis, {
  window: { configurable: true, value: window },
  document: { configurable: true, value: window.document },
  navigator: { configurable: true, value: window.navigator },
});
for (const key of Reflect.ownKeys(window)) {
  if (key in globalThis) continue;
  try { Object.defineProperty(globalThis, key, { configurable: true, get: () => window[key] }); } catch {}
}

const Solid = await import("solid-js");
const Web = await import("@solidjs/web");
const docs = JSON.parse(fs.readFileSync("src/generated-api-catalog.json", "utf8"));
const onlyId = process.argv[2];
const serverIds = new Set(["@solidjs/web/renderToString", "@solidjs/web/renderToStringAsync", "@solidjs/web/renderToStream"]);
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
const failures = [];
let passed = 0;

for (const doc of docs) {
  if (onlyId && doc.id !== onlyId) continue;
  if (serverIds.has(doc.id)) continue;
  for (let index = 0; index < doc.compiledCodes.length; index++) {
    document.body.innerHTML = '<div id="root"></div><div id="app"></div><div id="modal-root"></div>';
    const module = { exports: {} };
    const logs = [];
    const consoleProxy = Object.fromEntries(["log", "info", "warn", "error"].map(level => [level, (...values) => { logs.push([level, ...values]); }]));
    const requireModule = name => name === "solid-js" ? Solid : name === "@solidjs/web" || name === "solid-js/web" ? Web : (() => { throw new Error(`unsupported import ${name}`); })();
    try {
      const run = new AsyncFunction("require", "module", "exports", "console", "document", "window", doc.compiledCodes[index]);
      await Promise.race([
        run(requireModule, module, module.exports, consoleProxy, document, window),
        new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 1500)),
      ]);
      Solid.flush();
      const renderedText = `${document.getElementById("root")?.textContent ?? ""}${document.getElementById("modal-root")?.textContent ?? ""}`.trim();
      if (!renderedText) throw new Error("示例执行成功，但没有产生可见页面内容");
      if (doc.id === "solid-js/createEffect" && (!renderedText.includes("初始 → 0") || !renderedText.includes("0 → 1"))) {
        throw new Error("createEffect 没有渲染完整的初始与更新记录");
      }
      passed++;
    } catch (error) {
      failures.push({ id: doc.id, example: index + 1, error: error instanceof Error ? error.message : String(error) });
    }
  }
}

console.log(JSON.stringify({ passed, failed: failures.length, failures }, null, 2));
process.exit(failures.length ? 1 : 0);
