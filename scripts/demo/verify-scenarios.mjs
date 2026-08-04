export const targetedScenarios = {
  "solid-js/createSignal": {
    run: runCreateSignalScenario,
    expectedText: ["Accessor result: 7"],
  },
  "solid-js/createMemo": {
    run: runCreateMemoScenario,
    expectedText: ["Cached total: USD 45.20"],
  },
  "solid-js/createEffect": {
    run: runCreateEffectScenario,
    expectedText: ["Initial -> 0", "0 -> 1"],
  },
  "solid-js/createUniqueId": {
    expectedText: ["Update 1", "Label ID:", "Input ID:"],
  },
  "solid-js/createOptimistic": {
    run: runCreateOptimisticScenario,
    expectedText: ["Optimistic phase: 2", "After settlement: 1"],
  },
  "solid-js/untrack": {
    run: runUntrackScenario,
    expectedText: ["Current source: 2", "Effect runs: 1"],
  },
  "solid-js/onCleanup": {
    run: runCleanupScenario,
    expectedText: ["Subscription released"],
  },
  "solid-js/mapArray": {
    run: runMapArrayScenario,
    expectedText: ["MEMBER 3"],
  },
  "solid-js/reconcile": {
    run: runReconcileScenario,
    expectedText: ["First item identity: Preserved", "Ada Lovelace", "Lin"],
  },
  "solid-js/action": {
    run: runActionScenario,
    expectedText: ["Result: 10"],
  },
  "@solidjs/web/hydrate": {
    expectedLogs: ['"reused":true'],
  },
  "solid-js/Loading": {
    run: runLoadingScenario,
    expectedText: ["State: content ready"],
  },
  "@solidjs/web/Loading": {
    run: runLoadingScenario,
    expectedText: ["State: content ready"],
  },
  "solid-js/lazy": {
    run: runLazyScenario,
    expectedText: ["Lazy component loaded"],
  },
  "solid-js/Reveal": {
    run: runRevealScenario,
    expectedText: ["First section ready", "Second section ready"],
  },
  "@solidjs/web/Reveal": {
    run: runRevealScenario,
    expectedText: ["First section ready", "Second section ready"],
  },
  "solid-js/Errored": {
    run: runErroredScenario,
    expectedText: ["Protected content rendered successfully"],
  },
  "@solidjs/web/Errored": {
    run: runErroredScenario,
    expectedText: ["Protected content rendered successfully"],
  },
  "@solidjs/web/useHead": {
    expectedHtml: [
      '<title data-dh="title">useHead reference</title>',
      'content="Head management API"',
      'href="https://example.com/docs/use-head"',
    ],
    expectedLogs: ["Registered head tags: title, description, canonical", "<html><head>"],
  },
};

function runCreateSignalScenario({ document, window, Solid }) {
  document.getElementById("signal-increase")?.click();
  Solid.flush();
  setInputValue(document.getElementById("count-input"), "7", window);
  Solid.flush();
}

function runCreateMemoScenario({ document, window, Solid }) {
  setInputValue(document.getElementById("price"), "40", window);
  Solid.flush();
}

function runCreateEffectScenario({ document, Solid }) {
  document.getElementById("effect-update")?.click();
  Solid.flush();
}

async function runCreateOptimisticScenario({ document, Solid }) {
  const buttons = [...document.querySelectorAll("button")];
  buttons.find((button) => button.textContent?.includes("Start"))?.click();
  Solid.flush();
  await new Promise((resolve) => setTimeout(resolve, 0));
  buttons.find((button) => button.textContent?.includes("Settle"))?.click();
  await new Promise((resolve) => setTimeout(resolve, 0));
  Solid.flush();
}

function clickButton(document, label) {
  [...document.querySelectorAll("button")].find((button) => button.textContent?.includes(label))?.click();
}

function runUntrackScenario({ document, Solid }) {
  clickButton(document, "Update source");
  Solid.flush();
}

function runCleanupScenario({ document, Solid }) {
  clickButton(document, "Subscribe");
  Solid.flush();
  clickButton(document, "Dispose");
  Solid.flush();
}

function runMapArrayScenario({ document, Solid }) {
  clickButton(document, "Add item");
  Solid.flush();
}

function runReconcileScenario({ document, Solid }) {
  clickButton(document, "Reconcile dataset");
  Solid.flush();
}

async function runActionScenario({ document, window, Solid }) {
  setInputValue(document.getElementById("action-value"), "5", window);
  Solid.flush();
  clickButton(document, "Run action");
  await new Promise((resolve) => setTimeout(resolve, 0));
  Solid.flush();
}

function runErroredScenario({ document, Solid }) {
  clickButton(document, "Toggle error");
  Solid.flush();
  if (!document.body.textContent?.includes("Triggered from the demo")) {
    throw new Error("Errored did not render the thrown error through its accessor");
  }
  clickButton(document, "Recover content");
  Solid.flush();
}

async function runRevealScenario({ document, Solid }) {
  clickButton(document, "Start sections");
  Solid.flush();
  await Promise.resolve();
  if (!document.body.textContent?.includes("First section pending")) {
    throw new Error("Reveal did not expose the first pending boundary");
  }
  clickButton(document, "Resolve second first");
  await Promise.resolve();
  Solid.flush();
  if (document.body.textContent?.includes("Second section ready")) {
    throw new Error("Reveal exposed the second section before the first section resolved");
  }
  clickButton(document, "Resolve first");
  await Promise.resolve();
  await new Promise((resolve) => setTimeout(resolve, 0));
  Solid.flush();
}

async function runLazyScenario({ document, Solid }) {
  clickButton(document, "Mount lazy component");
  Solid.flush();
  await Promise.resolve();
  if (!document.body.textContent?.includes("Module request pending")) {
    throw new Error("lazy did not expose the module-loading phase");
  }
  clickButton(document, "Release module");
  await Promise.resolve();
  await new Promise((resolve) => setTimeout(resolve, 0));
  Solid.flush();
}

async function runLoadingScenario({ document, Solid }) {
  clickButton(document, "Start loading");
  Solid.flush();
  await Promise.resolve();
  if (!document.body.textContent?.includes("State: loading")) {
    throw new Error("Loading boundary did not expose its pending fallback");
  }
  clickButton(document, "Resolve content");
  await Promise.resolve();
  await new Promise((resolve) => setTimeout(resolve, 0));
  Solid.flush();
}

function setInputValue(input, value, window) {
  if (!(input instanceof window.HTMLInputElement)) return;
  input.value = value;
  input.dispatchEvent(new window.Event("input", { bubbles: true }));
}

export function assertServerResult(id, html, logs) {
  const scenario = targetedScenarios[id];
  if (scenario?.expectedHtml?.some((text) => !html.includes(text))) {
    throw new Error(`${id} did not produce the expected SSR HTML: ${html}`);
  }
  const serializedLogs = JSON.stringify(logs);
  if (scenario?.expectedLogs?.some((text) => !serializedLogs.includes(text))) {
    throw new Error(`${id} did not produce the expected SSR log evidence: ${serializedLogs}`);
  }
}

export function assertTargetedResult(id, renderedText, logs) {
  const scenario = targetedScenarios[id];
  if (scenario?.expectedText?.some((text) => !renderedText.includes(text))) {
    throw new Error(`${id} did not produce the expected interactive result: ${renderedText}`);
  }
  const serializedLogs = JSON.stringify(logs);
  if (scenario?.expectedLogs?.some((text) => !serializedLogs.includes(text))) {
    throw new Error(`${id} did not produce the expected log evidence: ${serializedLogs}`);
  }
}
