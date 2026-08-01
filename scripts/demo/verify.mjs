import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { compileDemo } from "./compile.mjs";
import { loadDemoCatalog } from "./load.mjs";
import { exerciseInteractiveControls, hasInteractiveControls } from "./verify-interactions.mjs";
import { assertTargetedResult, targetedScenarios } from "./verify-scenarios.mjs";
const scriptPath = fileURLToPath(import.meta.url);
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
const [mode = "--all", selectedId] = process.argv.slice(2);

if (mode === "--all") await verifyAll();
else if (mode === "--server") await verifyServer(selectedId);
else await verifyBrowser(mode === "--browser" ? selectedId : mode);

async function verifyAll() {
  const docs = loadDemoCatalog();
  const browserIds = docs
    .filter((entry) => entry.codes.length && entry.execution === "browser")
    .map((entry) => entry.id);
  const serverIds = docs.filter((entry) => entry.codes.length && entry.execution === "server").map((entry) => entry.id);
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

  const total = browserIds.length + serverIds.length;
  const expected = docs.filter((entry) => entry.codes.length).length;
  if (total !== expected || total === 0) {
    throw new Error(`Verifier grouped ${total} of ${expected} generated demo API records`);
  }
  console.log(
    JSON.stringify(
      {
        apiGroups: total,
        browser: browserIds.length,
        server: serverIds.length,
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
  const { execute: executeServerDemo } = await import("./service.mjs");
  const docs = loadDemoCatalog();
  const doc = docs.find((entry) => entry.id === id);
  if (!doc?.codes.length) throw new Error(`No server demo source found for ${id}`);

  const failures = [];
  let passed = 0;

  for (let index = 0; index < doc.codes.length; index++) {
    try {
      const result = await executeServerDemo(id, index);
      const loggedError = result.logs.find((entry) => entry.level === "error");
      if (loggedError) throw new Error(loggedError.text);
      if (!result.html) throw new Error("Demo completed without producing SSR HTML");
      passed++;
    } catch (error) {
      failures.push({ example: index + 1, error: error instanceof Error ? error.message : String(error) });
    }
  }

  console.log(JSON.stringify({ id, passed, failed: failures.length, failures }));
  process.exit(failures.length ? 1 : 0);
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
    if (doc.execution === "server") continue;
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

        const targetedScenario = targetedScenarios[doc.id];
        if (targetedScenario?.run) {
          await targetedScenario.run({ document, window, Solid });
        } else if (hasInteractiveControls(doc.codes[index])) {
          await exerciseInteractiveControls(document, window, Solid);
        }
        assertNoRuntimeErrors(logs, frameworkDiagnostics, "after interaction");
        const renderedText = visibleText(document);
        if (!renderedText) throw new Error("Demo completed without producing visible page content");
        assertTargetedResult(doc.id, renderedText, logs);
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
  process.exit(failures.length ? 1 : 0);
}

function assertNoRuntimeErrors(logs, frameworkDiagnostics, phase = "during execution") {
  if (frameworkDiagnostics.length)
    throw new Error(`Framework diagnostics ${phase}: ${frameworkDiagnostics.join(" | ")}`);
  const loggedError = logs.find(([level]) => level === "error");
  if (loggedError) throw new Error(`Demo console.error ${phase}: ${loggedError.slice(1).map(String).join(" ")}`);
}

function visibleText(document) {
  return `${document.getElementById("root")?.textContent ?? ""}${document.getElementById("modal-root")?.textContent ?? ""}`.trim();
}

function timeout(milliseconds) {
  return new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), milliseconds));
}
