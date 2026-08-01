export const flowOverrides = {
  "solid-js/lazy": `import { Show, createSignal, lazy } from "solid-js";
import { Loading, render } from "@solidjs/web";

let resolveModule: (() => void) | undefined;
const LazyMessage = lazy(
  () =>
    new Promise<{ default: () => JSX.Element }>((resolve) => {
      resolveModule = () => resolve({ default: () => <p>Lazy component loaded</p> });
    }),
);

function App() {
  const [mounted, setMounted] = createSignal(false);
  return (
    <main>
      <h3>Lazy module lifecycle</h3>
      <button type="button" disabled={mounted()} onClick={() => setMounted(true)}>
        Mount lazy component
      </button>
      <button type="button" disabled={!mounted()} onClick={() => resolveModule?.()}>
        Release module
      </button>
      <Show when={mounted()} fallback={<p>Module not requested</p>}>
        <Loading fallback={<p>Module request pending</p>}>
          <LazyMessage />
        </Loading>
      </Show>
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);`,
  For: `import { For } from "__PACKAGE__";
import { createSignal } from "solid-js";
import { render } from "@solidjs/web";

function App() {
  const [items, setItems] = createSignal(["Ada", "Grace"]);
  let nameInput!: HTMLInputElement;
  const addMember = (event: SubmitEvent) => {
    event.preventDefault();
    const name = nameInput.value.trim();
    if (!name) return;
    setItems((current) => [...current, name]);
    nameInput.value = "";
  };
  return (
    <main>
      <h3>Member list</h3>
      <form onSubmit={addMember}>
        <label for="member-name">Member name</label>
        <input id="member-name" ref={nameInput} placeholder="Lin" />
        <button type="submit">Add member</button>
      </form>
      <button type="button" onClick={() => setItems((current) => current.slice(0, -1))}>
        Remove last
      </button>
      <ul>
        <For each={items()}>{(item) => <li>{item}</li>}</For>
      </ul>
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);`,
  Hydration: `import { Hydration } from "__PACKAGE__";
import { NoHydration, renderToString } from "@solidjs/web";

const html = renderToString(() => (
  <main>
    <h1>Hydration boundary output</h1>
    <NoHydration>
      <p>Outer subtree stays static</p>
      <Hydration>
        <button type="button">Inner subtree can hydrate</button>
      </Hydration>
    </NoHydration>
  </main>
));
console.log(html);`,
  Loading: `import { Loading } from "__PACKAGE__";
import { Show, createSignal, lazy } from "solid-js";
import { render } from "@solidjs/web";

let resolveContent: (() => void) | undefined;
const AsyncContent = lazy(
  () =>
    new Promise<{ default: () => JSX.Element }>((resolve) => {
      resolveContent = () => resolve({ default: () => <p>State: content ready</p> });
    }),
);

function App() {
  const [started, setStarted] = createSignal(false);
  return (
    <main>
      <h3>Loading boundary</h3>
      <button type="button" disabled={started()} onClick={() => setStarted(true)}>
        Start loading
      </button>
      <button type="button" disabled={!started()} onClick={() => resolveContent?.()}>
        Resolve content
      </button>
      <Show when={started()} fallback={<p>State: idle</p>}>
        <Loading fallback={<p>State: loading</p>}>
          <AsyncContent />
        </Loading>
      </Show>
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);`,
  NoHydration: `import { NoHydration } from "__PACKAGE__";
import { renderToString } from "@solidjs/web";

const html = renderToString(() => (
  <main>
    <h1>NoHydration server output</h1>
    <NoHydration>
      <section>
        <h2>Static account summary</h2>
        <p>This subtree is emitted as HTML without client hydration bindings.</p>
      </section>
    </NoHydration>
  </main>
));
console.log(html);`,
};
