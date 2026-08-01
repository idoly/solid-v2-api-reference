export const collectionsOverrides = {
  "solid-js/deep": `import { createEffect, createSignal, createStore, deep } from "solid-js";
import { render } from "@solidjs/web";

function App() {
  const [state, setState] = createStore({ profile: { name: "Ada", score: 1 } });
  const [view, setView] = createSignal({ name: "", score: 0 });
  createEffect(
    () => deep(state),
    (plain) => {
      setView(plain.profile);
    },
  );
  return (
    <main>
      <h3>Deep snapshot</h3>
      <label for="deep-name">Profile name</label>
      <input
        id="deep-name"
        value={state.profile.name}
        onInput={(event) =>
          setState((draft) => {
            draft.profile.name = event.currentTarget.value;
          })
        }
      />
      <button
        type="button"
        onClick={() =>
          setState((draft) => {
            draft.profile.score += 1;
          })
        }
      >
        Add point
      </button>
      <p>
        {view().name} | {view().score} points
      </p>
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);`,
  "solid-js/flush": `import { createSignal, flush } from "solid-js";
import { render } from "@solidjs/web";

function App() {
  const [count, setCount] = createSignal(0);
  const updateNow = () => {
    setCount((value) => value + 1);
    flush();
    console.log("Flushed value", count());
  };
  return (
    <main>
      <h3>Synchronous flush result</h3>
      <p>Current value: {count()}</p>
      <button type="button" onClick={updateNow}>
        Update and flush
      </button>
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);`,
  "solid-js/mapArray": `import { createSignal, mapArray } from "solid-js";
import { render } from "@solidjs/web";

function App() {
  const [items, setItems] = createSignal([
    { id: 1, name: "Ada" },
    { id: 2, name: "Grace" },
  ]);
  const mapped = mapArray(items, (item) => ({ ...item, label: item.name.toUpperCase() }));
  const addItem = () => setItems((current) => [...current, { id: Date.now(), name: \`Member \${current.length + 1}\` }]);
  return (
    <main>
      <h3>Mapped result</h3>
      <button type="button" onClick={addItem}>
        Add item
      </button>
      <button type="button" onClick={() => setItems((current) => current.slice(0, -1))}>
        Remove last
      </button>
      <ul>
        {mapped().map((item) => (
          <li>
            {item.id} | {item.label}
          </li>
        ))}
      </ul>
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);`,
  "solid-js/repeat": `import { createSignal, repeat } from "solid-js";
import { render } from "@solidjs/web";

function App() {
  const [count, setCount] = createSignal(2);
  const rows = repeat(count, (index) => <li>Item {index + 1}</li>);
  return (
    <main>
      <h3>Repeated items</h3>
      <label for="repeat-items">Items: {count()}</label>
      <input
        id="repeat-items"
        type="range"
        min="0"
        max="10"
        value={count()}
        onInput={(event) => setCount(event.currentTarget.valueAsNumber)}
      />
      <ul>{rows()}</ul>
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);`,
  "solid-js/action": `import { action, createSignal, flush } from "solid-js";
import { render } from "@solidjs/web";

function App() {
  const [value, setValue] = createSignal(3);
  const [result, setResult] = createSignal<number>();
  const [pending, setPending] = createSignal(false);
  const save = action(function* (value: number) {
    const doubled = yield Promise.resolve(value * 2);
    return doubled as number;
  });
  const run = async () => {
    setPending(true);
    setResult(await save(value()));
    setPending(false);
    flush();
  };
  return (
    <main>
      <h3>Action result</h3>
      <label for="action-value">Value</label>
      <input
        id="action-value"
        type="number"
        value={value()}
        onInput={(event) => setValue(event.currentTarget.valueAsNumber)}
      />
      <button type="button" disabled={pending()} onClick={() => void run()}>
        {pending() ? "Running" : "Run action"}
      </button>
      <output>Result: {result() ?? "Not run"}</output>
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);`,
  "solid-js/resolve": `import { createSignal, flush, resolve } from "solid-js";
import { render } from "@solidjs/web";

function App() {
  const [value, setValue] = createSignal<number>();
  const [pending, setPending] = createSignal(false);
  const run = async () => {
    setPending(true);
    const result = await resolve(() => ({ ready: true, value: Math.floor(Math.random() * 100) }));
    setValue(result.value);
    setPending(false);
    flush();
  };
  return (
    <main>
      <h3>Resolved result</h3>
      <button type="button" disabled={pending()} onClick={() => void run()}>
        {pending() ? "Resolving" : "Resolve value"}
      </button>
      <output>Value: {value() ?? "Not run"}</output>
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);`,
};
