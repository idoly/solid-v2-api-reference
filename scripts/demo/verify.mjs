import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { compileDemo } from "./compile.mjs";
import { loadDemoCatalog } from "./load.mjs";

const serverIds = new Set([
  "@solidjs/web/renderToString",
  "@solidjs/web/renderToStringAsync",
  "@solidjs/web/renderToStream",
]);
const scriptPath = fileURLToPath(import.meta.url);
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
const [mode = "--all", selectedId] = process.argv.slice(2);

if (mode === "--all") await verifyAll();
else if (mode === "--server") await verifyServer(selectedId);
else await verifyBrowser(mode === "--browser" ? selectedId : mode);

async function verifyAll() {
  const docs = loadDemoCatalog();
  const browserIds = docs.filter((entry) => entry.codes.length && !serverIds.has(entry.id)).map((entry) => entry.id);
  const failures = [];

  for (const id of browserIds) {
    const result = spawnSync(
      process.execPath,
      ["--conditions=development", "--conditions=browser", scriptPath, "--browser", id],
      {
        cwd: process.cwd(),
        encoding: "utf8",
        timeout: 10000,
      },
    );
    if (result.status !== 0) failures.push({ id, output: `${result.stdout}\n${result.stderr}`.trim() });
  }

  for (const id of serverIds) {
    const result = spawnSync(process.execPath, [scriptPath, "--server", id], {
      cwd: process.cwd(),
      encoding: "utf8",
      timeout: 10000,
    });
    if (result.status !== 0) failures.push({ id, output: `${result.stdout}\n${result.stderr}`.trim() });
  }

  const total = browserIds.length + serverIds.size;
  console.log(
    JSON.stringify(
      {
        apiGroups: total,
        browser: browserIds.length,
        server: serverIds.size,
        passed: total - failures.length,
        failed: failures.length,
      },
      null,
      2,
    ),
  );
  if (failures.length) {
    for (const failure of failures) console.error(`\n### ${failure.id}\n${failure.output}`);
    process.exitCode = 1;
  }
}

async function verifyServer(id) {
  const docs = loadDemoCatalog();
  const doc = docs.find((entry) => entry.id === id);
  if (!doc?.codes.length) throw new Error(`No server demo source found for ${id}`);

  const Solid = await import("solid-js");
  const Web = await import("@solidjs/web");
  const failures = [];
  let passed = 0;

  for (let index = 0; index < doc.codes.length; index++) {
    const logs = [];
    const demoConsole = Object.fromEntries(
      ["log", "info", "warn", "error"].map((level) => [
        level,
        (...values) => logs.push({ level, text: values.map(String).join(" ") }),
      ]),
    );
    const requireModule = (name) => {
      if (name === "solid-js") return Solid;
      if (name === "@solidjs/web") return Web;
      throw new Error(`unsupported import ${name}`);
    };

    try {
      const module = { exports: {} };
      const compiled = compileDemo(doc.codes[index], {
        filename: `${id.replace(/[^a-zA-Z0-9_-]/g, "_")}.tsx`,
        generate: "ssr",
      });
      const run = new AsyncFunction("require", "module", "exports", "console", compiled);
      await Promise.race([run(requireModule, module, module.exports, demoConsole), timeout(5000)]);
      const html = logs.find((entry) => /^\s*</.test(entry.text))?.text ?? "";
      const loggedError = logs.find((entry) => entry.level === "error");
      if (loggedError) throw new Error(loggedError.text);
      if (!html) throw new Error("Demo completed without producing SSR HTML");
      passed++;
    } catch (error) {
      failures.push({ example: index + 1, error: error instanceof Error ? error.message : String(error) });
    }
  }

  console.log(JSON.stringify({ id, passed, failed: failures.length, failures }));
  if (failures.length) process.exitCode = 1;
}

async function verifyBrowser(onlyId) {
  const { Window } = await import("happy-dom");
  const window = new Window({ url: "http://localhost/" });
  Object.defineProperties(globalThis, {
    window: { configurable: true, value: window },
    document: { configurable: true, value: window.document },
    navigator: { configurable: true, value: window.navigator },
  });
  for (const key of Reflect.ownKeys(window)) {
    if (key in globalThis) continue;
    try {
      Object.defineProperty(globalThis, key, { configurable: true, get: () => window[key] });
    } catch {}
  }

  const Solid = await import("solid-js");
  const Web = await import("@solidjs/web");
  const docs = loadDemoCatalog();
  const failures = [];
  let passed = 0;

  for (const doc of docs) {
    if (onlyId && doc.id !== onlyId) continue;
    if (serverIds.has(doc.id)) continue;
    for (let index = 0; index < doc.codes.length; index++) {
      document.body.innerHTML = '<div id="root"></div><div id="app"></div><div id="modal-root"></div>';
      const module = { exports: {} };
      const logs = [];
      const frameworkDiagnostics = [];
      const originalWarn = console.warn;
      const originalError = console.error;
      console.warn = (...values) => {
        frameworkDiagnostics.push(`[warn] ${values.map(String).join(" ")}`);
      };
      console.error = (...values) => {
        frameworkDiagnostics.push(`[error] ${values.map(String).join(" ")}`);
      };
      const consoleProxy = Object.fromEntries(
        ["log", "info", "warn", "error"].map((level) => [
          level,
          (...values) => {
            logs.push([level, ...values]);
          },
        ]),
      );
      const requireModule = (name) =>
        name === "solid-js"
          ? Solid
          : name === "@solidjs/web"
            ? Web
            : (() => {
                throw new Error(`unsupported import ${name}`);
              })();

      try {
        const compiled = compileDemo(doc.codes[index], {
          filename: `${doc.id.replace(/[^a-zA-Z0-9_-]/g, "_")}.tsx`,
          generate: "dom",
        });
        const run = new AsyncFunction("require", "module", "exports", "console", "document", "window", compiled);
        await Promise.race([run(requireModule, module, module.exports, consoleProxy, document, window), timeout(1500)]);
        Solid.flush();
        await new Promise((resolve) => setTimeout(resolve, 0));
        await Promise.resolve();
        Solid.flush();
        const loggedError = logs.find(([level]) => level === "error");
        if (loggedError) throw new Error(`Demo console.error: ${loggedError.slice(1).map(String).join(" ")}`);
        if (frameworkDiagnostics.length)
          throw new Error(`Framework console diagnostics: ${frameworkDiagnostics.join(" | ")}`);
        const renderedText =
          `${document.getElementById("root")?.textContent ?? ""}${document.getElementById("modal-root")?.textContent ?? ""}`.trim();
        if (!renderedText) throw new Error("Demo completed without producing visible page content");
        if (
          doc.id === "solid-js/createOptimistic" &&
          (!renderedText.includes("Optimistic phase: 2") || !renderedText.includes("After settlement: 1"))
        )
          throw new Error("createOptimistic did not render optimistic value 2 and reverted value 1");
        if (
          doc.id === "solid-js/createEffect" &&
          (!renderedText.includes("Initial -> 0") || !renderedText.includes("0 -> 1"))
        )
          throw new Error("createEffect did not render the complete initial and updated records");
        passed++;
      } catch (error) {
        failures.push({
          id: doc.id,
          example: index + 1,
          error: error instanceof Error ? error.message : String(error),
        });
      } finally {
        console.warn = originalWarn;
        console.error = originalError;
      }
    }
  }

  console.log(JSON.stringify({ passed, failed: failures.length, failures }, null, 2));
  if (failures.length) process.exitCode = 1;
}

function timeout(milliseconds) {
  return new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), milliseconds));
}
