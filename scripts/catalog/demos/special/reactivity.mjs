export const reactivityOverrides = {
  "@solidjs/web/dynamic": `import { createSignal } from "solid-js";
import { dynamic, render } from "@solidjs/web";

function App() {
  const [multiline, setMultiline] = createSignal(false);
  const Field = dynamic(() => (multiline() ? "textarea" : "input"));
  return (
    <main>
      <h3>Dynamic form control</h3>
      <button type="button" onClick={() => setMultiline((value) => !value)}>
        Toggle field type
      </button>
      <p>Current element: {multiline() ? "TEXTAREA" : "INPUT"}</p>
      <Field value="Dynamic component value" />
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);`,
  "solid-js/createSignal": `import { createSignal } from "solid-js";
import { render } from "@solidjs/web";

function App() {
  // Parameter 1 is the initial value. Parameter 2 controls naming and equality.
  const [count, setCount] = createSignal(0, {
    name: "count",
    equals: (previous, next) => previous === next,
  });

  return (
    <main>
      <h3>createSignal</h3>
      <p>Accessor result: {count()}</p>
      <button type="button" onClick={() => setCount((previous) => previous - 1)} aria-label="Decrease count">
        Decrease
      </button>
      <button
        id="signal-increase"
        type="button"
        onClick={() => setCount((previous) => previous + 1)}
        aria-label="Increase count"
      >
        Increase
      </button>
      <button type="button" onClick={() => setCount(0)}>
        Reset
      </button>
      <label for="count-input">Set an exact value</label>
      <input
        id="count-input"
        type="number"
        value={count()}
        onInput={(event) => setCount(event.currentTarget.valueAsNumber || 0)}
      />
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);`,
  "solid-js/createMemo": `import { createMemo, createSignal } from "solid-js";
import { render } from "@solidjs/web";

function App() {
  const [price, setPrice] = createSignal(20);
  let computations = 0;

  // Parameter 1 computes the value; parameter 2 configures the memo.
  const total = createMemo(
    (previous) => {
      computations += 1;
      console.log("Previous total", previous ?? "none");
      return price() * 1.13;
    },
    { name: "total", equals: (previous, next) => previous === next },
  );

  return (
    <main>
      <h3>createMemo</h3>
      <label for="price">Source price: USD {price()}</label>
      <input
        id="price"
        type="range"
        min="0"
        max="100"
        value={price()}
        onInput={(event) => setPrice(event.currentTarget.valueAsNumber)}
      />
      <output>Cached total: USD {total().toFixed(2)}</output>
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);`,
  "solid-js/createEffect": `import { createEffect, createSignal } from "solid-js";
import { render } from "@solidjs/web";

function App() {
  const [count, setCount] = createSignal(0);
  const [records, setRecords] = createSignal<string[]>([]);

  createEffect(
    () => count(), // Parameter 1 tracks reactive reads and returns the next value.
    (next, previous) => {
      // Parameter 2 performs the untracked side effect and can return cleanup.
      setRecords((items) => [...items, \`\${previous ?? "Initial"} -> \${next}\`]);
      return () => console.log("Cleanup for", next);
    },
    { name: "count logger" }, // Parameter 3 configures the effect.
  );

  return (
    <main>
      <h3>createEffect</h3>
      <button id="effect-update" type="button" onClick={() => setCount((value) => value + 1)}>
        Update source ({count()})
      </button>
      <button type="button" onClick={() => setRecords([])}>
        Clear history
      </button>
      <ol>
        {records().map((record) => (
          <li>{record}</li>
        ))}
      </ol>
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);`,
  "solid-js/createRenderEffect": `import { createRenderEffect, createSignal } from "solid-js";
import { render } from "@solidjs/web";

function App() {
  const [text, setText] = createSignal("Initial render");
  const paragraph = document.createElement("p");
  createRenderEffect(
    () => text(),
    (value) => {
      paragraph.textContent = value;
    },
  );
  return (
    <main>
      <h3>Render Effect</h3>
      <label for="render-effect-text">Rendered text</label>
      <input id="render-effect-text" value={text()} onInput={(event) => setText(event.currentTarget.value)} />
      {paragraph}
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);`,
  "solid-js/createStore": `import { createStore } from "solid-js";
import { render } from "@solidjs/web";

function App() {
  // Parameter 1 is the initial object; parameter 2 configures the proxy.
  const [state, setState] = createStore(
    {
      user: { name: "Ada", age: 36 },
      todos: [] as { id: string; text: string }[],
    },
    { name: "app state", shallow: false },
  );

  let todoInput!: HTMLInputElement;
  const addTodo = (event: SubmitEvent) => {
    event.preventDefault();
    const text = todoInput.value.trim();
    if (!text) return;
    // The setter receives a draft that can be mutated in place.
    setState((draft) => draft.todos.push({ id: crypto.randomUUID(), text }));
    todoInput.value = "";
  };

  return (
    <main>
      <h3>createStore</h3>
      <label for="store-name">Name</label>
      <input
        id="store-name"
        value={state.user.name}
        onInput={(event) =>
          setState((draft) => {
            draft.user.name = event.currentTarget.value;
          })
        }
      />
      <p>
        {state.user.name}, age {state.user.age}
      </p>
      <button
        type="button"
        onClick={() =>
          setState((draft) => {
            draft.user.age += 1;
          })
        }
      >
        Birthday
      </button>
      <form onSubmit={addTodo}>
        <label for="store-todo">New todo</label>
        <input id="store-todo" ref={todoInput} placeholder="Learn createStore" />
        <button type="submit">Add todo</button>
      </form>
      <ul>
        {state.todos.map((todo) => (
          <li>{todo.text}</li>
        ))}
      </ul>
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);`,
  "solid-js/reconcile": `import { createSignal, createStore, reconcile, untrack } from "solid-js";
import { render } from "@solidjs/web";

const [rows, setRows] = createStore([
  { id: 1, name: "Ada" },
  { id: 2, name: "Grace" },
]);
const firstRow = untrack(() => rows[0]);
const [alternate, setAlternate] = createSignal(false);
const updateRows = () => {
  const next = !alternate();
  setAlternate(next);
  setRows(
    reconcile(
      next
        ? [
            { id: 1, name: "Ada Lovelace" },
            { id: 3, name: "Lin" },
          ]
        : [
            { id: 1, name: "Ada" },
            { id: 2, name: "Grace" },
          ],
    ),
  );
};

function App() {
  return (
    <main>
      <h3>Reconciliation result</h3>
      <p>First item identity: {rows[0] === firstRow ? "Preserved" : "Replaced"}</p>
      <button type="button" onClick={updateRows}>
        Reconcile dataset
      </button>
      <ul>
        {rows.map((row) => (
          <li>
            {row.id} | {row.name}
          </li>
        ))}
      </ul>
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);`,
  "solid-js/snapshot": `import { createSignal, createStore, snapshot } from "solid-js";
import { render } from "@solidjs/web";

function App() {
  const [state, setState] = createStore({ user: { name: "Ada" }, todos: [] as string[] });
  const [plain, setPlain] = createSignal(snapshot(state));
  return (
    <main>
      <h3>Plain object snapshot</h3>
      <label for="snapshot-name">Store name</label>
      <input
        id="snapshot-name"
        value={state.user.name}
        onInput={(event) =>
          setState((draft) => {
            draft.user.name = event.currentTarget.value;
          })
        }
      />
      <button type="button" onClick={() => setPlain(snapshot(state))}>
        Take snapshot
      </button>
      <pre>{JSON.stringify(plain(), null, 2)}</pre>
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);`,
  "solid-js/createReaction": `import { createReaction, createRoot, createSignal, untrack } from "solid-js";
import { render } from "@solidjs/web";

const [count, setCount] = createSignal(0);
const output = document.createElement("p");
const dispose = createRoot((dispose) => {
  const track = createReaction(() => {
    const current = untrack(() => count());
    output.textContent = \`Reacted to count = \${current}\`;
    track(() => count());
  });
  track(() => count());
  return dispose;
});

function App() {
  return (
    <main>
      <h3>Reaction state</h3>
      <button type="button" onClick={() => setCount((value) => value + 1)}>
        Update tracked signal
      </button>
      <button type="button" onClick={dispose}>
        Dispose reaction
      </button>
      {output}
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);`,
  "solid-js/createRoot": `import { createRoot, createSignal } from "solid-js";
import { render } from "@solidjs/web";

function App() {
  const scope = createRoot((dispose) => {
    const [value, setValue] = createSignal(0);
    return { value, setValue, dispose };
  });
  const [disposed, setDisposed] = createSignal(false);
  const dispose = () => {
    scope.dispose();
    setDisposed(true);
  };
  return (
    <main>
      <h3>Independent reactive scope</h3>
      <p>Scoped value: {scope.value()}</p>
      <button type="button" disabled={disposed()} onClick={() => scope.setValue((value) => value + 1)}>
        Update scope
      </button>
      <button type="button" disabled={disposed()} onClick={dispose}>
        Dispose scope
      </button>
      <output>Status: {disposed() ? "Disposed" : "Active"}</output>
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);`,
};
