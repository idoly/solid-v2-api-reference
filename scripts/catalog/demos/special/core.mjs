const webOwnerDemo = `import { createSignal } from "solid-js";
import { getOwner, render } from "@solidjs/web";

function App() {
  const owner = getOwner();
  const [eventOwner, setEventOwner] = createSignal("Not checked");
  console.log("Web Owner", { exists: Boolean(owner) });
  return (
    <main>
      <h3>Web Owner</h3>
      <button type="button" onClick={() => setEventOwner(getOwner() ? "Available" : "Unavailable")}>
        Check from event
      </button>
      <p>{owner ? "The current component has an Owner" : "Owner not found"}</p>
      <output>Event owner: {eventOwner()}</output>
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);`;

const optimisticDemo = `import { action, createOptimistic, flush } from "solid-js";
import { render } from "@solidjs/web";

const [value, setValue] = createOptimistic(1);
const history = document.createElement("ol");
let release!: () => void;
const gate = new Promise<void>((resolve) => {
  release = resolve;
});
const update = action(function* () {
  setValue(2);
  yield gate;
});
let pending: Promise<unknown> | undefined;
const start = () => {
  pending = update();
  flush();
  history.insertAdjacentHTML("beforeend", \`<li>Optimistic phase: \${value()}</li>\`);
};
const settle = async () => {
  release();
  await pending;
  flush();
  history.insertAdjacentHTML("beforeend", \`<li>After settlement: \${value()}</li>\`);
};

function App() {
  return (
    <main>
      <h3>Optimistic Signal</h3>
      <p>Current value: {value()}</p>
      <button type="button" onClick={start}>
        Start optimistic update
      </button>
      <button type="button" onClick={() => void settle()}>
        Settle action
      </button>
      {history}
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);`;

const hydrationToggleDemo = `import { enableHydration } from "solid-js";
import { render } from "@solidjs/web";

function App() {
  enableHydration();
  console.log("Hydration", { enabled: true });
  return (
    <main>
      <h3>Hydration enabled</h3>
      <p>Subsequent renders can access the hydration context.</p>
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);`;

const runtimeEffectDemo = `import { createSignal } from "solid-js";
import { effect, render } from "@solidjs/web";

function App() {
  const [value, setValue] = createSignal(1);
  const output = document.createElement("p");
  effect(
    () => value(),
    (next) => {
      output.textContent = \`Observed value: \${next}\`;
    },
  );
  return (
    <main>
      <h3>Runtime effect</h3>
      <button type="button" onClick={() => setValue((current) => current + 1)}>
        Update runtime source
      </button>
      {output}
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);`;

const externalSourceDemo = `import { createMemo, createSignal, enableExternalSource } from "solid-js";
import { render } from "@solidjs/web";

function App() {
  let disposed = false;
  enableExternalSource({
    factory: (compute) => ({
      track: (previous) => compute(previous),
      dispose: () => {
        disposed = true;
      },
    }),
    untrack: (fn) => fn(),
  });
  const [value, setValue] = createSignal(2);
  const doubled = createMemo(() => value() * 2);
  return (
    <main>
      <h3>External reactive source bridge</h3>
      <button type="button" onClick={() => setValue((current) => current + 1)}>
        Update external source
      </button>
      <p>Value: {value()}</p>
      <p>Derived: {doubled()}</p>
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);`;

const hydrateDemo = `import { createRenderEffect, createSignal } from "solid-js";
import { hydrate } from "@solidjs/web";

const root = document.getElementById("root")!;
root.innerHTML =
  '<main><h3>Hydration reuses server DOM</h3><button type="button">Increase</button><output>Count: 0</output></main>';
const serverMain = root.querySelector("main")!;
const previousHydration = (globalThis as any)._$HY;
(globalThis as any)._$HY = { done: false, r: {}, events: [], completed: new Set() };

hydrate(
  () => {
    const [count, setCount] = createSignal(0);
    const button = serverMain.querySelector("button")!;
    const output = serverMain.querySelector("output")!;
    button.addEventListener("click", () => setCount((value) => value + 1));
    createRenderEffect(
      () => count(),
      (value) => {
        output.textContent = \`Count: \${value}\`;
      },
    );
    return serverMain;
  },
  root,
  { renderId: "api-demo" },
);

(globalThis as any)._$HY = previousHydration;
console.log("hydrate", { reused: root.querySelector("main") === serverMain });`;

export const coreOverrides = {
  "@solidjs/web/hydrate": hydrateDemo,
  "solid-js/enableExternalSource": externalSourceDemo,
  "@solidjs/web/effect": runtimeEffectDemo,
  "solid-js/createOptimistic": optimisticDemo,
  "solid-js/enableHydration": hydrationToggleDemo,
  "@solidjs/web/getOwner": webOwnerDemo,
  "solid-js/createTrackedEffect": `import { createSignal, createTrackedEffect } from "solid-js";
import { render } from "@solidjs/web";

function App() {
  const [count, setCount] = createSignal(0);
  const [events, setEvents] = createSignal<string[]>([]);
  createTrackedEffect(() => {
    const value = count();
    setEvents((items) => [...items, \`Tracked value: \${value}\`]);
    return () => {
      setEvents((items) => [...items, \`Cleanup value: \${value}\`]);
    };
  });
  return (
    <main>
      <h3>Tracked Effect</h3>
      <button type="button" onClick={() => setCount((value) => value + 1)}>
        Update source ({count()})
      </button>
      <button type="button" onClick={() => setEvents([])}>
        Clear events
      </button>
      <ol>
        {events().map((item) => (
          <li>{item}</li>
        ))}
      </ol>
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);`,
};
