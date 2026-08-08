export const webOverrides = {
  Reveal: `import { Reveal } from "__PACKAGE__";
import { Loading, createSignal, lazy } from "solid-js";
import { render } from "@solidjs/web";

let resolveFirst: (() => void) | undefined;
let resolveSecond: (() => void) | undefined;
const FirstSection = lazy(
  () =>
    new Promise<{ default: () => JSX.Element }>((resolve) => {
      resolveFirst = () => resolve({ default: () => <p>First section ready</p> });
    }),
);
const SecondSection = lazy(
  () =>
    new Promise<{ default: () => JSX.Element }>((resolve) => {
      resolveSecond = () => resolve({ default: () => <p>Second section ready</p> });
    }),
);

function App() {
  const [started, setStarted] = createSignal(false);
  return (
    <main>
      <h3>Sequential reveal</h3>
      <button type="button" disabled={started()} onClick={() => setStarted(true)}>
        Start sections
      </button>
      <button type="button" disabled={!started()} onClick={() => resolveSecond?.()}>
        Resolve second first
      </button>
      <button type="button" disabled={!started()} onClick={() => resolveFirst?.()}>
        Resolve first
      </button>
      {started() ? (
        <Reveal order="sequential">
          <Loading fallback={<p>First section pending</p>}>
            <FirstSection />
          </Loading>
          <Loading fallback={<p>Second section pending</p>}>
            <SecondSection />
          </Loading>
        </Reveal>
      ) : (
        <p>Sections idle</p>
      )}
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);`,
  "@solidjs/web/Dynamic": `import { createSignal } from "solid-js";
import { Dynamic, render } from "@solidjs/web";

function App() {
  const [element, setElement] = createSignal<"section" | "button">("section");
  return (
    <main>
      <h3>Dynamic element</h3>
      <button type="button" onClick={() => setElement((current) => (current === "section" ? "button" : "section"))}>
        Toggle element
      </button>
      <p>Current element: {element().toUpperCase()}</p>
      <Dynamic component={element()} data-kind="dynamic">
        Dynamic component content
      </Dynamic>
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);`,
  "@solidjs/web/Portal": `import { createSignal } from "solid-js";
import { Portal, render } from "@solidjs/web";

function App() {
  const modalRoot = document.getElementById("modal-root")!;
  const [open, setOpen] = createSignal(false);
  return (
    <main>
      <h3>Portal source position</h3>
      <button type="button" onClick={() => setOpen((value) => !value)}>
        Toggle portal
      </button>
      <p>Content is mounted in the target container.</p>
      {open() && (
        <Portal mount={modalRoot}>
          <aside>
            <strong>Portal content</strong>
          </aside>
        </Portal>
      )}
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);`,
  "@solidjs/web/render": `import { render } from "@solidjs/web";

const root = document.getElementById("root")!;
const mount = document.createElement("section");
const status = document.createElement("output");
root.append(mount, status);

// render returns the disposer for the Owner and DOM tree it mounts.
const dispose = render(
  () => (
    <main>
      <h1>Client render complete</h1>
      <p>This JSX is mounted in the nested target.</p>
      <button type="button">Dispose rendered tree</button>
    </main>
  ),
  mount,
);
mount.querySelector("button")!.addEventListener("click", () => {
  dispose();
  status.textContent = "Disposed: " + String(mount.childNodes.length === 0);
});`,
  "@solidjs/web/clientOnly": `import { clientOnly, render } from "@solidjs/web";

const ClientGreeting = clientOnly(
  () =>
    Promise.resolve({
      default: (props: { name: string }) => <p>Client module: {props.name}</p>,
    }),
  { lazy: true },
);

function App() {
  return (
    <main>
      <h3>Client-only component</h3>
      <ClientGreeting name="Ada" fallback={<p>Loading browser module</p>} />
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);`,
  "@solidjs/web/httpHeader": `import { httpHeader, renderToString, RequestContext } from "@solidjs/web";

const response = { status: 200, statusText: "OK", headers: new Headers(), committed: false };
(globalThis as any)[RequestContext] = { getStore: () => ({ response }) };

const html = renderToString(() => {
  httpHeader("cache-control", "private, max-age=60");
  httpHeader("vary", "accept-encoding");
  httpHeader("vary", "accept-language", { append: true });
  response.committed = true;
  return (
    <main>
      <h1>Response headers declared</h1>
      <p>Cache-Control: {response.headers.get("cache-control")}</p>
      <p>Vary: {response.headers.get("vary")}</p>
    </main>
  );
});

delete (globalThis as any)[RequestContext];
console.log(html);`,
  "@solidjs/web/httpStatus": `import { httpStatus, renderToString, RequestContext } from "@solidjs/web";

const response = { status: 200, statusText: "OK", headers: new Headers(), committed: false };
(globalThis as any)[RequestContext] = { getStore: () => ({ response }) };

const html = renderToString(() => {
  httpStatus(404, "Not Found");
  response.committed = true;
  return (
    <main>
      <h1>
        {response.status} {response.statusText}
      </h1>
      <p>The requested document was not found.</p>
    </main>
  );
});

delete (globalThis as any)[RequestContext];
console.log(html);`,
  "@solidjs/web/renderToString": `import { renderToString, useHead } from "@solidjs/web";

let head = "";
// onHead returns head-bound output when the host owns the outer document template.
const body = renderToString(
  () => {
    useHead({ tag: "title", props: { children: "Embedded Solid page" } });
    return (
      <main>
        <h1>Server-rendered HTML</h1>
        <p>renderToString completed</p>
      </main>
    );
  },
  { onHead: (value) => (head = value) },
);
console.log(\`<html><head>\${head}</head><body>\${body}</body></html>\`);`,
  "@solidjs/web/renderToStream": `import { renderToStream, useHead } from "@solidjs/web";

let head = "";
// onHead exposes first-flush head output before an embedded body stream is consumed.
const stream = renderToStream(
  () => {
    useHead({ tag: "title", props: { children: "Streamed Solid page" } });
    return (
      <main>
        <h1>Streaming server rendering</h1>
        <p>The server stream is complete</p>
      </main>
    );
  },
  { onHead: (value) => (head = value) },
);
const body = await new Promise<string>((resolve) => stream.then(resolve));
console.log(\`<html><head>\${head}</head><body>\${body}</body></html>\`);`,
};
