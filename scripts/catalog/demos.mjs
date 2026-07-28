// Builds a complete browser program while keeping each API example focused on its own contract.
// Setup runs inside the component Owner; `after` is reserved for work that needs the mounted DOM.
function browserDemo({ title, solid = [], web = [], setup, view, after = "", renderId }) {
  const solidImport = solid.length ? `import { ${solid.join(", ")} } from "solid-js";\n` : "";
  const webNames = [...new Set([...web, "render"])];
  const renderOptions = renderId ? `, undefined, { renderId: "${renderId}" }` : "";
  return `${solidImport}import { ${webNames.join(", ")} } from "@solidjs/web";

function App() {
${setup
  .trim()
  .split("\n")
  .map((line) => `  ${line}`)
  .join("\n")}

  return (
    <main>
      <h3>${title}</h3>
${view
  .trim()
  .split("\n")
  .map((line) => `      ${line}`)
  .join("\n")}
    </main>
  );
}

render(() => <App />, document.getElementById("root")!${renderOptions});${after ? `\n${after.trim()}` : ""}`;
}

const reactiveDemos = {
  "solid-js/children": browserDemo({
    title: "children",
    solid: ["children", "createSignal", "flush"],
    setup: `const [name, setName] = createSignal("Ada");
// The accessor parameter may return nested arrays and reactive JSX.
const resolved = children(() => [<span>Hello {name()}</span>, [<em>Resolved once per read</em>]]);
queueMicrotask(() => {
  setName("Grace");
  flush();
  console.log("Resolved children", resolved());
});`,
    view: `<div>{resolved()}</div>`,
  }),
  "solid-js/createComponent": browserDemo({
    title: "createComponent",
    solid: ["createComponent"],
    setup: `function Greeting(props: { name: string; role: string }) {
  return <p>{props.name} is a {props.role}</p>;
}
// Parameter 1 is the component; parameter 2 is its complete props object.
const first = createComponent(Greeting, { name: "Ada", role: "programmer" });
const second = createComponent(Greeting, { name: "Grace", role: "engineer" });`,
    view: `{first}
{second}`,
  }),
  "solid-js/createContext": browserDemo({
    title: "createContext",
    solid: ["createContext", "useContext"],
    setup: `// Parameter 1 is the fallback value; parameter 2 configures the context owner.
const Theme = createContext("system", { name: "theme context" });
function CurrentTheme() {
  return <p>Context value: {useContext(Theme)}</p>;
}`,
    view: `<p>Default value: {Theme.defaultValue}</p>
<Theme value="dark">
  <CurrentTheme />
</Theme>`,
  }),
  "solid-js/createUniqueId": browserDemo({
    title: "createUniqueId",
    solid: ["createUniqueId"],
    setup: `// Each call returns a stable ID scoped to the current owner.
const labelId = createUniqueId();
const inputId = createUniqueId();
console.log("Generated IDs", { labelId, inputId });`,
    view: `<label id={labelId} for={inputId}>Email</label>
<input id={inputId} aria-labelledby={labelId} value="ada@example.com" />`,
  }),
  "solid-js/isEqual": browserDemo({
    title: "isEqual",
    solid: ["isEqual"],
    setup: `// Both parameters are compared using Solid's structural equality rules.
const sameObjects = isEqual({ id: 1, tags: ["api"] }, { id: 1, tags: ["api"] });
const changedObjects = isEqual({ id: 1 }, { id: 2 });
const sameReference = { id: 3 };
const sameIdentity = isEqual(sameReference, sameReference);`,
    view: `<p>Equal structures: {String(sameObjects)}</p>
<p>Different values: {String(changedObjects)}</p>
<p>Same identity: {String(sameIdentity)}</p>`,
  }),
  "solid-js/untrack": browserDemo({
    title: "untrack",
    solid: ["createEffect", "createSignal", "flush", "untrack"],
    setup: `const [source, setSource] = createSignal(1);
const [effectRuns, setEffectRuns] = createSignal(0);
// Parameter 1 executes without dependency tracking; false disables strict-read diagnostics.
const snapshot = untrack(() => source(), false);
createEffect(
  () => untrack(() => source()),
  () => {
    setEffectRuns((count) => count + 1);
  },
);
queueMicrotask(() => {
  setSource(2);
  flush();
  console.log("Untracked snapshot", { snapshot, current: source(), effectRuns: effectRuns() });
});`,
    view: `<p>Snapshot: {snapshot}</p>
<p>Current source: {source()}</p>
<p>Effect runs: {effectRuns()}</p>`,
  }),
  "solid-js/useContext": browserDemo({
    title: "useContext",
    solid: ["createContext", "useContext"],
    setup: `const Locale = createContext("en-US");
function LocaleReader(props: { label: string }) {
  // The context parameter selects the nearest matching Provider value.
  const locale = useContext(Locale);
  return <p>{props.label}: {locale}</p>;
}`,
    view: `<LocaleReader label="Fallback" />
<Locale value="fr-FR">
  <LocaleReader label="Provided" />
</Locale>`,
  }),
};

const storeDemos = {
  "solid-js/isWrappable": browserDemo({
    title: "isWrappable",
    solid: ["createStore", "isWrappable"],
    setup: `const [store] = createStore({ count: 1 });
const samples = {
  store: isWrappable(store),
  object: isWrappable({ count: 1 }),
  array: isWrappable([1, 2]),
  date: isWrappable(new Date()),
  primitive: isWrappable(42),
};`,
    view: `<pre>{JSON.stringify(samples, null, 2)}</pre>`,
  }),
  "solid-js/merge": browserDemo({
    title: "merge",
    solid: ["merge"],
    setup: `const defaults = { theme: "system", pageSize: 20 };
const user = { theme: "dark" as const, compact: true };
// Every argument is a source; later sources override earlier properties.
const settings = merge(defaults, user, { pageSize: 50 });`,
    view: `<pre>{JSON.stringify(settings, null, 2)}</pre>`,
  }),
  "solid-js/omit": browserDemo({
    title: "omit",
    solid: ["omit"],
    setup: `const account = { id: 7, name: "Ada", password: "secret", token: "private" };
// Parameter 1 is the source object; remaining parameters are keys to remove.
const publicAccount = omit(account, "password", "token");
const identityOnly = omit(account, "name", "password", "token");`,
    view: `<p>Public account</p>
<pre>{JSON.stringify(publicAccount, null, 2)}</pre>
<p>Identity only</p>
<pre>{JSON.stringify(identityOnly, null, 2)}</pre>`,
  }),
  "solid-js/storePath": browserDemo({
    title: "storePath",
    solid: ["createStore", "flush", "storePath"],
    setup: `const [state, setState] = createStore({ profile: { name: "Ada", visits: 1 } });
// Path segments come first; the final parameter updates the selected value.
const rename = storePath("profile", "name", () => "Grace");
const incrementVisits = storePath("profile", "visits", (value) => value + 1);
queueMicrotask(() => {
  setState(rename);
  setState(incrementVisits);
  flush();
  console.log("Updated profile", state.profile);
});`,
    view: `<p>Name: {state.profile.name}</p>
<p>Visits: {state.profile.visits}</p>`,
  }),
};

const responseDemos = {
  "@solidjs/web/getRequestEvent": browserDemo({
    title: "getRequestEvent",
    web: ["getRequestEvent"],
    setup: `// No parameters: reads the request associated with the current execution context.
const firstRead = getRequestEvent();
const secondRead = getRequestEvent();
console.log("Request context", firstRead);`,
    view: `<p>Available in browser: {String(Boolean(firstRead))}</p>
<p>Stable read: {String(firstRead === secondRead)}</p>`,
  }),
  "@solidjs/web/isHref": browserDemo({
    title: "isHref",
    web: ["isHref"],
    setup: `// The value parameter accepts unknown input and narrows valid navigation targets.
const samples: unknown[] = ["/guide", new URL("https://example.com/docs"), 42, null];
const results = samples.map((value) => ({ value: String(value), isHref: isHref(value) }));`,
    view: `<pre>{JSON.stringify(results, null, 2)}</pre>`,
  }),
  "@solidjs/web/isResponseEnvelope": browserDemo({
    title: "isResponseEnvelope",
    web: ["isResponseEnvelope", "respond"],
    setup: `const envelope = respond({ saved: true }, { status: 201 });
// The value parameter accepts unknown input and acts as a type guard.
const checks = {
  envelope: isResponseEnvelope(envelope),
  response: isResponseEnvelope(new Response()),
  plainObject: isResponseEnvelope({ saved: true }),
};`,
    view: `<pre>{JSON.stringify(checks, null, 2)}</pre>`,
  }),
  "@solidjs/web/redirect": browserDemo({
    title: "redirect",
    web: ["redirect"],
    setup: `// Parameter 1 is the destination; parameter 2 accepts a status or response options.
const temporary = redirect("/login", 302);
const permanent = redirect("/docs", { status: 308, headers: { "x-reason": "moved" } });`,
    view: `<p>Temporary: {temporary.status} {"->"} {temporary.headers.get("location")}</p>
<p>Permanent: {permanent.status} {"->"} {permanent.headers.get("location")}</p>`,
  }),
  "@solidjs/web/reload": browserDemo({
    title: "reload",
    web: ["reload"],
    setup: `// The optional init parameter configures status and headers.
const standard = reload();
const accepted = reload({ status: 202, headers: { "x-refresh": "profile" } });`,
    view: `<p>Standard status: {standard.status}</p>
<p>Configured status: {accepted.status}</p>
<p>Header: {accepted.headers.get("x-refresh")}</p>`,
  }),
  "@solidjs/web/respond": browserDemo({
    title: "respond",
    web: ["isResponseEnvelope", "respond"],
    setup: `// Parameter 1 is the transported value; parameter 2 supplies response metadata.
const created = respond({ id: 7, name: "Ada" }, { status: 201, headers: { location: "/users/7" } });
const accepted = respond(null, { status: 202 });`,
    view: `<p>Created envelope: {String(isResponseEnvelope(created))}</p>
<p>Created status: {created.response.status}</p>
<p>Location: {created.response.headers.get("location")}</p>
<p>Accepted status: {accepted.response.status}</p>`,
  }),
};

const domDemos = {
  "@solidjs/web/applyRef": browserDemo({
    title: "applyRef",
    web: ["applyRef"],
    setup: `const button = document.createElement("button");
button.textContent = "Referenced button";
const calls: string[] = [];
// Parameter 1 accepts one callback or an array; parameter 2 is the element.
applyRef([(element) => calls.push(element.tagName), (element) => element.setAttribute("data-ready", "true")], button);`,
    view: `{button}
<p>Callbacks: {calls.join(", ")}</p>
<p>Ready: {button.dataset.ready}</p>`,
  }),
  "@solidjs/web/assign": browserDemo({
    title: "assign",
    web: ["assign"],
    setup: `const button = document.createElement("button");
// node, props, skipChildren, previous props, and skipRef are all explicit here.
assign(button, { id: "save", title: "Save", children: "Save record" }, false, {}, true);
assign(button, { id: "save", title: "Saved", children: "Save record" }, true, { title: "Save" }, true);`,
    view: `{button}
<p>Title: {button.title}</p>`,
  }),
  "@solidjs/web/className": browserDemo({
    title: "className",
    web: ["className"],
    setup: `const badge = document.createElement("span");
badge.textContent = "Active";
// Parameter 3 supplies the previous class value for efficient reconciliation.
className(badge, "badge active", "badge");`,
    view: `{badge}
<p>class: {badge.className}</p>`,
  }),
  "@solidjs/web/createComponent": browserDemo({
    title: "createComponent",
    web: ["createComponent"],
    setup: `function Status(props: { code: number; label: string }) {
  return <p>{props.code}: {props.label}</p>;
}
// The component and its props are passed separately.
const success = createComponent(Status, { code: 200, label: "OK" });
const missing = createComponent(Status, { code: 404, label: "Not found" });`,
    view: `{success}
{missing}`,
  }),
  "@solidjs/web/dynamicProperty": browserDemo({
    title: "dynamicProperty",
    web: ["dynamicProperty"],
    setup: `const props = {
  name: () => "Ada",
  greeting: () => "Hello Ada",
};
// Parameter 1 is a props object whose selected key is an accessor.
const enhanced = dynamicProperty(props, "name") as { name: string; greeting: () => string };
// Parameter 2 selects which accessor becomes a getter.
dynamicProperty(enhanced, "greeting");`,
    view: `<p>Name: {enhanced.name}</p>
<p>Greeting: {enhanced.greeting}</p>`,
  }),
  "@solidjs/web/insert": browserDemo({
    title: "insert",
    solid: ["createSignal", "flush"],
    web: ["insert"],
    setup: `const host = document.createElement("section");
const marker = document.createComment("slot");
host.append(marker);
const [message, setMessage] = createSignal("Initial content");
// parent, reactive content, marker, initial value, and scheduling options.
insert(host, message, marker, undefined, { host: () => host, schedule: false });
queueMicrotask(() => {
  setMessage("Updated content");
  flush();
});`,
    view: `{host}`,
  }),
  "@solidjs/web/memo": browserDemo({
    title: "memo",
    solid: ["createSignal", "flush"],
    web: ["memo"],
    setup: `const [count, setCount] = createSignal(2);
let runs = 0;
// Parameter 1 computes the value; parameter 2 enables equality checks.
const doubled = memo(() => { runs += 1; return count() * 2; }, true);
queueMicrotask(() => {
  setCount(3);
  flush();
  console.log("Memoized value", { doubled: doubled(), runs });
});`,
    view: `<p>Doubled: {doubled()}</p>
<p>Computations: {runs}</p>`,
  }),
  "@solidjs/web/ref": browserDemo({
    title: "ref",
    web: ["ref"],
    setup: `const input = document.createElement("input");
let captured = "none";
// Parameter 1 returns the ref callback; parameter 2 is the target element.
ref(() => (element) => { captured = element.tagName; element.setAttribute("aria-label", "Name"); }, input);`,
    view: `{input}
<p>Captured: {captured}</p>`,
  }),
  "@solidjs/web/scope": browserDemo({
    title: "scope",
    solid: ["createSignal"],
    web: ["scope"],
    setup: `const [count] = createSignal(3);
// The function parameter is wrapped so reads execute in renderer scope.
const scopedCount = scope(() => count());
const scopedLabel = scope(() => \`Count: \${count()}\`);`,
    view: `<p>{scopedLabel()}</p>
<p>Direct result: {scopedCount()}</p>`,
  }),
  "@solidjs/web/setAttribute": browserDemo({
    title: "setAttribute",
    web: ["setAttribute"],
    setup: `const link = document.createElement("a");
link.textContent = "Documentation";
// Element, attribute name, and string value.
setAttribute(link, "href", "/docs");
setAttribute(link, "aria-label", "Open documentation");
setAttribute(link, "data-section", "api");`,
    view: `{link}
<pre>{link.outerHTML}</pre>`,
  }),
  "@solidjs/web/setAttributeNS": browserDemo({
    title: "setAttributeNS",
    web: ["setAttributeNS"],
    setup: `const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
const link = document.createElementNS("http://www.w3.org/2000/svg", "use");
svg.append(link);
// Element, namespace URI, qualified name, and value.
setAttributeNS(link, "http://www.w3.org/1999/xlink", "xlink:href", "#check");`,
    view: `{svg}
<pre>{svg.outerHTML}</pre>`,
  }),
  "@solidjs/web/setProperty": browserDemo({
    title: "setProperty",
    web: ["setProperty"],
    setup: `const input = document.createElement("input");
// Element, JavaScript property name, and value.
setProperty(input, "value", "Ada");
setProperty(input, "checked", true);
setProperty(input, "disabled", false);`,
    view: `{input}
<p>Value: {input.value}</p>
<p>Checked: {String(input.checked)}</p>`,
  }),
  "@solidjs/web/setStyleProperty": browserDemo({
    title: "setStyleProperty",
    web: ["setStyleProperty"],
    setup: `const panel = document.createElement("section");
panel.textContent = "Styled panel";
// Element, CSS property, and value. Custom properties are supported.
setStyleProperty(panel, "color", "rgb(49, 94, 85)");
setStyleProperty(panel, "padding", "12px");
setStyleProperty(panel, "--accent", "#8db53f");`,
    view: `{panel}
<pre>{panel.getAttribute("style")}</pre>`,
  }),
  "@solidjs/web/spread": browserDemo({
    title: "spread",
    web: ["spread"],
    setup: `const button = document.createElement("button");
const props = { type: "button", title: "Save", disabled: false, children: "Save record" };
// Parameter 1 is the element, parameter 2 is props, parameter 3 can skip children.
spread(button, props, false);`,
    view: `{button}
<pre>{button.outerHTML}</pre>`,
  }),
  "@solidjs/web/style": browserDemo({
    title: "style",
    web: ["style"],
    setup: `const card = document.createElement("article");
card.textContent = "API card";
const previous = { color: "gray", padding: "4px" };
const next = { color: "green", padding: "12px", border: "1px solid currentColor" };
// Element, next style object, and previous style object.
style(card, next, previous);`,
    view: `{card}
<pre>{card.getAttribute("style")}</pre>`,
  }),
  "@solidjs/web/template": browserDemo({
    title: "template",
    web: ["template"],
    setup: `// Parameter 1 is static HTML; the optional flag controls cloning behavior.
const makeArticle = template("<article><h4>Reusable template</h4><p>Static content</p></article>");
const first = makeArticle();
const second = makeArticle();
second.setAttribute("data-copy", "second");`,
    view: `{first}
{second}
<p>Distinct nodes: {String(first !== second)}</p>`,
  }),
  "@solidjs/web/untrack": browserDemo({
    title: "untrack",
    solid: ["createSignal", "flush"],
    web: ["untrack"],
    setup: `const [count, setCount] = createSignal(1);
// The function parameter is executed without subscribing to reactive sources.
const snapshot = untrack(() => count());
queueMicrotask(() => {
  setCount(2);
  flush();
  const latestSnapshot = untrack(() => count());
  console.log("Untracked reads", { snapshot, latestSnapshot });
});`,
    view: `<p>First snapshot: {snapshot}</p>
<p>Current accessor: {count()}</p>`,
  }),
};

const ownerDemos = {
  "solid-js/onCleanup": browserDemo({
    title: "onCleanup",
    solid: ["createRoot", "onCleanup"],
    setup: `const events: string[] = [];
const dispose = createRoot((dispose) => {
  // The callback parameter runs when this Owner is disposed.
  const cleanup = onCleanup(() => events.push("subscription released"));
  events.push(String(cleanup === cleanup));
  return dispose;
});
dispose();`,
    view: `<ul>{events.map((event) => <li>{event}</li>)}</ul>`,
  }),
  "solid-js/onSettled": browserDemo({
    title: "onSettled",
    solid: ["createSignal", "onSettled"],
    setup: `const [status, setStatus] = createSignal("waiting");
// The callback runs after the current Owner's reactive graph settles.
onSettled(() => {
  setStatus("settled");
  console.log("Owner settled");
});`,
    view: `<p>Status: {status()}</p>`,
  }),
  "solid-js/getObserver": browserDemo({
    title: "getObserver",
    solid: ["createEffect", "createSignal", "getObserver"],
    setup: `const [value] = createSignal(1);
const outside = getObserver();
let inside: ReturnType<typeof getObserver>;
createEffect(
  () => {
    value();
    inside = getObserver();
    return Boolean(inside);
  },
  (tracked) => console.log("Observer captured", tracked),
);`,
    view: `<p>Outside tracking: {String(Boolean(outside))}</p>
<p>Inside tracking: {String(Boolean(inside!))}</p>`,
  }),
  "solid-js/getOwner": browserDemo({
    title: "getOwner",
    solid: ["getOwner"],
    setup: `// No parameters: returns the Owner for the current component scope.
const first = getOwner();
const second = getOwner();`,
    view: `<p>Owner available: {String(Boolean(first))}</p>
<p>Stable in this scope: {String(first === second)}</p>`,
  }),
  "solid-js/isDisposed": browserDemo({
    title: "isDisposed",
    solid: ["createRoot", "getOwner", "isDisposed"],
    setup: `let owner!: NonNullable<ReturnType<typeof getOwner>>;
const dispose = createRoot((dispose) => {
  owner = getOwner()!;
  return dispose;
});
// The Owner parameter can be checked before and after disposal.
const before = isDisposed(owner);
dispose();
const after = isDisposed(owner);`,
    view: `<p>Before dispose: {String(before)}</p>
<p>After dispose: {String(after)}</p>`,
  }),
  "solid-js/runWithOwner": browserDemo({
    title: "runWithOwner",
    solid: ["createRoot", "getOwner", "onCleanup", "runWithOwner"],
    setup: `const events: string[] = [];
let owner!: NonNullable<ReturnType<typeof getOwner>>;
const dispose = createRoot((dispose) => {
  owner = getOwner()!;
  return dispose;
});
// Parameter 1 restores an Owner; parameter 2 runs in that lifecycle scope.
const result = runWithOwner(owner, () => {
  onCleanup(() => events.push("owned cleanup"));
  return "owned result";
});
dispose();`,
    view: `<p>Result: {result}</p>
<p>Events: {events.join(", ")}</p>`,
  }),
};

const asyncDemos = {
  "solid-js/affects": browserDemo({
    title: "affects",
    solid: ["affects", "createSignal", "createStore"],
    setup: `const [count] = createSignal(1);
const [profile] = createStore({ name: "Ada", visits: 2 });
// Accessors affect as a whole; stores can optionally target one key.
affects(count);
affects(profile);
affects(profile, "visits");`,
    view: `<p>Signal: {count()}</p>
<p>Profile: {profile.name}, {profile.visits} visits</p>`,
  }),
  "solid-js/flatten": browserDemo({
    title: "flatten",
    solid: ["flatten"],
    setup: `const nested = [<span>A</span>, [null, <span>B</span>], () => <span>C</span>];
// Parameter 1 is nested children; options control empty values and accessor unwrapping.
const rendered = flatten(nested, { skipNonRendered: true, doNotUnwrap: false });
const preserved = flatten(nested, { skipNonRendered: false, doNotUnwrap: true });`,
    view: `<div>Rendered: {rendered}</div>
<p>Preserved entries: {String(Array.isArray(preserved))}</p>`,
  }),
  "solid-js/isPending": browserDemo({
    title: "isPending",
    solid: ["isPending"],
    setup: `const synchronous = isPending(() => 42);
const asynchronous = isPending(() => Promise.resolve("ready"));
const nested = isPending(() => Promise.resolve(Promise.resolve("ready")));`,
    view: `<p>Synchronous pending: {String(synchronous)}</p>
<p>Promise pending: {String(asynchronous)}</p>
<p>Nested promise pending: {String(nested)}</p>`,
  }),
  "solid-js/latest": browserDemo({
    title: "latest",
    solid: ["createMemo", "createSignal", "flush", "latest"],
    setup: `const [value, setValue] = createSignal("first");
// The function parameter is evaluated in a tracked memo; the latest settled value is returned.
const newest = createMemo(() => latest(() => value()));
queueMicrotask(() => {
  setValue("second");
  flush();
  console.log("Latest after update", newest());
});`,
    view: `<p>Latest value: {newest()}</p>
<p>Current source: {value()}</p>`,
  }),
};

function flowImports(packageName, names) {
  return packageName === "solid-js" ? { solid: names } : { web: names };
}

function flowDemo(packageName, name) {
  const imports = flowImports(
    packageName,
    name === "Match" ? ["Match", "Switch"] : name === "Switch" ? ["Match", "Switch"] : [name],
  );
  if (name === "Show")
    return browserDemo({
      title: "Show",
      ...imports,
      setup: `const user = { id: 7, name: "Ada" };`,
      view: `<Show when={user} keyed fallback={<p>No user</p>}>
  {(value) => <p>Keyed user: {value.name}</p>}
</Show>
<Show when={false} fallback={<p>Fallback rendered</p>}>
  <p>Hidden content</p>
</Show>`,
    });
  if (name === "Match")
    return browserDemo({
      title: "Match",
      ...imports,
      setup: `const status = "ready" as "idle" | "loading" | "ready";`,
      view: `<Switch fallback={<p>Unknown</p>}>
  <Match when={status === "loading"}><p>Loading</p></Match>
  <Match when={status === "ready"} keyed>{(matched) => <p>Ready: {String(matched)}</p>}</Match>
</Switch>`,
    });
  if (name === "Switch")
    return browserDemo({
      title: "Switch",
      ...imports,
      setup: `const score = 82;`,
      view: `<Switch fallback={<p>No grade</p>}>
  <Match when={score >= 90}><p>Grade A</p></Match>
  <Match when={score >= 80}><p>Grade B</p></Match>
  <Match when={score >= 70}><p>Grade C</p></Match>
</Switch>`,
    });
  if (name === "Repeat")
    return browserDemo({
      title: "Repeat",
      ...imports,
      setup: `const start = 5;`,
      view: `<ol>
  <Repeat count={3} from={start} fallback={<li>No rows</li>}>
    {(index) => <li>Row {index}</li>}
  </Repeat>
</ol>
<Repeat count={0} fallback={<p>Empty repeat</p>}>{(index) => <span>{index}</span>}</Repeat>`,
    });
  return browserDemo({
    title: "Errored",
    ...imports,
    setup: `const fallback = (error: unknown) => <p>Error: {String(error)}</p>;`,
    view: `<Errored fallback={fallback}>
  <p>Protected content rendered successfully</p>
</Errored>`,
  });
}

const flowDemos = Object.fromEntries(
  ["solid-js", "@solidjs/web"].flatMap((packageName) =>
    ["Errored", "Match", "Repeat", "Show", "Switch"].map((name) => [
      `${packageName}/${name}`,
      flowDemo(packageName, name),
    ]),
  ),
);

const claimDemos = {
  "@solidjs/web/registerElementClaim": browserDemo({
    title: "registerElementClaim",
    web: ["claimElement", "registerElementClaim"],
    setup: `const claimed: string[] = [];
// The handler parameter observes claimed elements; the return value unregisters it.
const unregister = registerElementClaim((element) => claimed.push(element.tagName));
const link = document.createElement("a");
claimElement(link);
unregister();
claimElement(document.createElement("form"));`,
    view: `{link}
<p>Observed claims: {claimed.join(", ")}</p>`,
  }),
  "@solidjs/web/claimElement": browserDemo({
    title: "claimElement",
    web: ["claimElement", "registerElementClaim"],
    setup: `const claimed: string[] = [];
const unregister = registerElementClaim((element) => claimed.push(element.tagName));
const link = document.createElement("a");
link.href = "/docs";
// The element parameter is returned unchanged after claim handlers run.
const result = claimElement(link);
unregister();`,
    view: `{result}
<p>Same element: {String(result === link)}</p>
<p>Handler input: {claimed.join(", ")}</p>`,
  }),
  "@solidjs/web/claimElementTree": browserDemo({
    title: "claimElementTree",
    web: ["claimElementTree", "registerElementClaim"],
    setup: `const claimed: string[] = [];
const unregister = registerElementClaim((element) => claimed.push(element.tagName));
const section = document.createElement("section");
section.innerHTML = "<a href='/docs'>Docs</a><form><button>Save</button></form>";
// The root parameter and its relevant descendants are traversed and returned.
const result = claimElementTree(section);
unregister();`,
    view: `{result}
<p>Same root: {String(result === section)}</p>
<p>Claims: {claimed.join(", ")}</p>`,
  }),
};

const hydrationDemos = {
  "@solidjs/web/Assets": browserDemo({
    title: "Assets",
    web: ["Assets"],
    setup: `const assetName = "api-demo";`,
    view: `<Assets>
  <meta name={assetName} content="registered" />
</Assets>
<p>Asset component: {assetName}</p>`,
  }),
  "@solidjs/web/HydrationScript": browserDemo({
    title: "HydrationScript",
    web: ["HydrationScript"],
    setup: `const eventNames = ["click", "input"];`,
    view: `<HydrationScript nonce="api-nonce" eventNames={eventNames} />
<p>Hydration events: {eventNames.join(", ")}</p>`,
  }),
  "@solidjs/web/generateHydrationScript": browserDemo({
    title: "generateHydrationScript",
    web: ["generateHydrationScript"],
    setup: `// Options become attributes and delegated-event metadata in the generated bootstrap script.
const generated = generateHydrationScript({ nonce: "api-nonce", eventNames: ["click"] });
const script = generated ?? "No script outside an SSR request";`,
    view: `<p>Generated characters: {script.length}</p>
<pre>{script.slice(0, 120)}</pre>`,
  }),
  "@solidjs/web/acquireAsset": browserDemo({
    title: "acquireAsset",
    web: ["acquireAsset", "getAssets"],
    setup: `// The returned function releases this descriptor from the current asset registry.
const release = acquireAsset({
  type: "inline-style",
  id: "api-acquired-style",
  content: ".acquired{color:green}",
});
const registered = (getAssets() ?? "").includes("api-acquired-style");
queueMicrotask(release);`,
    view: `<p>Asset acquired: {String(registered)}</p>`,
  }),
  "@solidjs/web/getAssets": browserDemo({
    title: "getAssets",
    web: ["getAssets", "useAssets"],
    setup: `useAssets(() => <meta name="api-assets" content="ready" />);
// getAssets serializes everything registered in the active asset context.
const serialized = getAssets() ?? "No active SSR asset registry";`,
    view: `<p>Serialized assets: {String(serialized.includes("api-assets"))}</p>
<pre>{serialized}</pre>`,
  }),
  "@solidjs/web/getHydrationKey": browserDemo({
    title: "getHydrationKey",
    solid: ["enableHydration"],
    web: ["getHydrationKey"],
    setup: `enableHydration();
// A key is derived from the keyed Owner created by render's renderId option.
const key = getHydrationKey();`,
    view: `<p>Hydration key: {key ?? "No active key"}</p>`,
    renderId: "api-demo",
  }),
  "@solidjs/web/getNextElement": browserDemo({
    title: "getNextElement",
    solid: ["enableHydration"],
    web: ["getNextElement"],
    setup: `enableHydration();
// The template callback supplies a fresh element when no hydratable node can be claimed.
const element = getNextElement(() => document.createElement("section"));
element.textContent = "Resolved element";`,
    view: `{element}
<p>Tag name: {element.tagName}</p>`,
  }),
  "@solidjs/web/getNextMarker": browserDemo({
    title: "getNextMarker",
    web: ["getNextMarker"],
    setup: `const host = document.createElement("div");
host.innerHTML = "<span>Before marker</span><!--/-->";
// The start node anchors marker lookup; the second tuple item contains traversed nodes.
const [marker, collected] = getNextMarker(host.lastChild!);`,
    view: `{host}
<p>Marker: {marker.nodeName}</p>
<p>Collected nodes: {collected.length}</p>`,
  }),
  "@solidjs/web/getNextMatch": browserDemo({
    title: "getNextMatch",
    web: ["getNextMatch"],
    setup: `const host = document.createElement("div");
host.innerHTML = "<i>Skip</i><span>Matched element</span>";
// Search begins at the supplied sibling and advances to the requested tag name.
const match = getNextMatch(host.firstChild!, "span");`,
    view: `{host}
<p>Matched tag: {match.tagName}</p>`,
  }),
  "@solidjs/web/runHydrationEvents": browserDemo({
    title: "runHydrationEvents",
    web: ["runHydrationEvents"],
    setup: `// Replays hydration events queued by the bootstrap script; an empty queue is valid.
runHydrationEvents();
const replayed = true;`,
    view: `<p>Hydration event queue processed: {String(replayed)}</p>`,
  }),
  "@solidjs/web/useAssets": browserDemo({
    title: "useAssets",
    web: ["getAssets", "useAssets"],
    setup: `// The callback is evaluated by the active asset registry rather than rendered into this component.
useAssets(() => <link rel="preload" href="/api-demo.js" as="script" />);
const registered = (getAssets() ?? "").includes("api-demo.js");`,
    view: `<p>Preload registered: {String(registered)}</p>`,
  }),
};

const delegatedEventDemos = {
  "@solidjs/web/addEvent": browserDemo({
    title: "addEvent",
    web: ["addEvent"],
    setup: `const button = document.createElement("button");
button.textContent = "Dispatch click";
let clicks = 0;
// The final argument chooses direct registration (false) or delegated registration (true).
addEvent(button, "click", () => clicks++, false);
button.click();`,
    view: `{button}
<p>Handled clicks: {clicks}</p>`,
  }),
  "@solidjs/web/delegateEvents": browserDemo({
    title: "delegateEvents",
    web: ["delegateEvents"],
    setup: `const eventNames = ["click", "input"];
// Registers the event types handled by Solid's delegated event dispatcher.
delegateEvents(eventNames);`,
    view: `<p>Delegated events: {eventNames.join(", ")}</p>`,
  }),
  "@solidjs/web/getDelegatedRoot": browserDemo({
    title: "getDelegatedRoot",
    web: ["getDelegatedRoot", "registerDelegatedContainer", "registerDelegatedRoot", "unregisterDelegatedRoot"],
    setup: `const root = document.getElementById("root")!;
const child = document.createElement("button");
root.append(child);
registerDelegatedRoot(root);
registerDelegatedContainer(root);
// Lookup walks from the node to its nearest registered delegated root.
const delegatedRoot = getDelegatedRoot(child);
queueMicrotask(() => unregisterDelegatedRoot(root));`,
    view: `<p>Root found: {String(delegatedRoot === root)}</p>`,
  }),
  "@solidjs/web/registerDelegatedContainer": browserDemo({
    title: "registerDelegatedContainer",
    web: [
      "registerDelegatedContainer",
      "registerDelegatedRoot",
      "unregisterDelegatedContainer",
      "unregisterDelegatedRoot",
    ],
    setup: `const root = document.getElementById("root")!;
const container = document.createElement("section");
registerDelegatedRoot(root);
// The optional owner lets nested containers share another mount's delegated root.
registerDelegatedContainer(container, root);
queueMicrotask(() => {
  unregisterDelegatedContainer(container, root);
  unregisterDelegatedRoot(root);
});`,
    view: `{container}
<p>Delegated container registered</p>`,
  }),
  "@solidjs/web/registerDelegatedRoot": browserDemo({
    title: "registerDelegatedRoot",
    web: ["getDelegatedRoot", "registerDelegatedRoot", "unregisterDelegatedRoot"],
    setup: `const root = document.getElementById("root")!;
registerDelegatedRoot(root);
const found = getDelegatedRoot(root);
queueMicrotask(() => unregisterDelegatedRoot(root));`,
    view: `<p>Root registration visible: {String(found === root)}</p>`,
  }),
  "@solidjs/web/unregisterDelegatedContainer": browserDemo({
    title: "unregisterDelegatedContainer",
    web: [
      "registerDelegatedContainer",
      "registerDelegatedRoot",
      "unregisterDelegatedContainer",
      "unregisterDelegatedRoot",
    ],
    setup: `const root = document.getElementById("root")!;
const container = document.createElement("section");
registerDelegatedRoot(root);
registerDelegatedContainer(container, root);
// Unregister with the same container-owner pair used during registration.
unregisterDelegatedContainer(container, root);
unregisterDelegatedRoot(root);`,
    view: `{container}
<p>Delegated container unregistered</p>`,
  }),
  "@solidjs/web/unregisterDelegatedRoot": browserDemo({
    title: "unregisterDelegatedRoot",
    web: ["getDelegatedRoot", "registerDelegatedRoot", "unregisterDelegatedRoot"],
    setup: `const root = document.getElementById("root")!;
registerDelegatedRoot(root);
unregisterDelegatedRoot(root);
// Lookup returns undefined after the root registration is removed.
const found = getDelegatedRoot(root);`,
    view: `<p>Root removed: {String(found === undefined)}</p>`,
  }),
};

const projectionDemos = {
  "solid-js/createOptimisticStore": browserDemo({
    title: "createOptimisticStore",
    solid: ["createOptimisticStore", "flush"],
    setup: `// Parameter 1 seeds the optimistic Store; the setter mutates a transaction-aware draft.
const [profile, setProfile] = createOptimisticStore({ name: "Ada", visits: 1 });
setProfile((draft) => {
  draft.visits += 1;
});
flush();`,
    view: `<p>{profile.name} visits: {profile.visits}</p>`,
  }),
  "solid-js/createProjection": browserDemo({
    title: "createProjection",
    solid: ["createProjection"],
    setup: `// Parameter 1 updates the draft; parameter 2 supplies the initial projected shape.
const totals = createProjection(
  (draft) => {
    draft.subtotal = 40;
    draft.tax = 4;
  },
  { subtotal: 0, tax: 0 },
);`,
    view: `<p>Subtotal: {totals.subtotal}</p>
<p>Total: {totals.subtotal + totals.tax}</p>`,
  }),
  "solid-js/refresh": `import { createProjection, flush, refresh } from "solid-js";
import { render } from "@solidjs/web";

let source = 1;
const projection = createProjection(
  (draft) => {
    draft.value = source;
  },
  { value: 0 },
);
const before = projection.value;
source = 2;
// refresh writes to its target, so it must run outside a component or computation Owner.
refresh(projection);
flush();

function App() {
  return (
    <main>
      <h3>refresh</h3>
      <p>Before refresh: {before}</p>
      <p>After refresh: {projection.value}</p>
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);`,
};

const dedicatedDemoOverrides = {
  ...hydrationDemos,
  ...delegatedEventDemos,
  ...projectionDemos,
  ...reactiveDemos,
  ...storeDemos,
  ...responseDemos,
  ...domDemos,
  ...ownerDemos,
  ...asyncDemos,
  ...flowDemos,
  ...claimDemos,
};

const webOwnerDemo = `import { getOwner, render } from "@solidjs/web";

function App() {
  const owner = getOwner();
  console.log("Web Owner", { exists: Boolean(owner) });
  return (
    <main>
      <h3>Web Owner</h3>
      <p>{owner ? "The current component has an Owner" : "Owner not found"}</p>
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);`;

const optimisticDemo = `import { action, createOptimistic, flush, untrack } from "solid-js";
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

function App() {
  return (
    <main>
      <h3>Optimistic Signal</h3>
      <p>Current value: {value()}</p>
      {history}
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);
const pending = update();
flush();
const optimistic = untrack(() => value());
history.insertAdjacentHTML("beforeend", \`<li>Optimistic phase: \${optimistic}</li>\`);
release();
await pending;
flush();
const settled = untrack(() => value());
history.insertAdjacentHTML("beforeend", \`<li>After settlement: \${settled}</li>\`);
console.log("Optimistic Signal", { optimistic, settled });`;

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

const runtimeEffectDemo = `import { createSignal, flush } from "solid-js";
import { effect, render } from "@solidjs/web";

function App() {
  const [value, setValue] = createSignal(1);
  const output = document.createElement("p");
  let observed = 0;
  effect(
    () => value(),
    (next) => {
      observed = next;
      output.textContent = \`Observed value: \${next}\`;
    },
  );
  queueMicrotask(() => {
    setValue(2);
    flush();
    console.log("Runtime effect", { observed });
  });
  return (
    <main>
      <h3>Runtime effect</h3>
      {output}
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);`;

const externalSourceDemo = `import { createMemo, createSignal, enableExternalSource, flush } from "solid-js";
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
  queueMicrotask(() => {
    setValue(3);
    flush();
    console.log("External reactive source", { value: value(), doubled: doubled(), disposed });
  });
  return (
    <main>
      <h3>External reactive source bridge</h3>
      <p>Value: {value()}</p>
      <p>Derived: {doubled()}</p>
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);`;

const hydrateDemo = `import { hydrate } from "@solidjs/web";

function App() {
  return (
    <main>
      <h3>Hydration complete</h3>
      <p>The existing server-rendered DOM is now managed by the client.</p>
    </main>
  );
}

const root = document.getElementById("root")!;
root.innerHTML =
  "<main><h3>Hydration complete</h3><p>The existing server-rendered DOM is now managed by the client.</p></main>";
const previousHydration = (globalThis as any)._$HY;
(globalThis as any)._$HY = { done: true };
hydrate(() => <App />, root, { renderId: "api-demo" });
(globalThis as any)._$HY = previousHydration;
console.log("hydrate", { reused: true, html: root.innerHTML });`;

export const demoOverrides = {
  "@solidjs/web/hydrate": hydrateDemo,
  "solid-js/enableExternalSource": externalSourceDemo,
  "@solidjs/web/effect": runtimeEffectDemo,
  "solid-js/createOptimistic": optimisticDemo,
  "solid-js/enableHydration": hydrationToggleDemo,
  "@solidjs/web/getOwner": webOwnerDemo,
  "solid-js/createTrackedEffect": `import { createSignal, createTrackedEffect, flush } from "solid-js";
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
  queueMicrotask(() => {
    setCount(1);
    flush();
  });
  return (
    <main>
      <h3>Tracked Effect</h3>
      <ol>
        {events().map((item) => (
          <li>{item}</li>
        ))}
      </ol>
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);`,

  "solid-js/deep": `import { createEffect, createSignal, createStore, deep, flush } from "solid-js";
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
  queueMicrotask(() => {
    setState((draft) => {
      draft.profile.score = 2;
    });
    flush();
  });
  return (
    <main>
      <h3>Deep snapshot</h3>
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
  queueMicrotask(() => {
    setCount(3);
    flush();
  });
  return (
    <main>
      <h3>Synchronous flush result</h3>
      <strong>Current value: {count()}</strong>
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);`,

  "solid-js/mapArray": `import { createSignal, flush, mapArray } from "solid-js";
import { render } from "@solidjs/web";

function App() {
  const [items, setItems] = createSignal([
    { id: 1, name: "Ada" },
    { id: 2, name: "Grace" },
  ]);
  const mapped = mapArray(items, (item) => ({ ...item, label: item.name.toUpperCase() }));
  queueMicrotask(() => {
    setItems([{ id: 1, name: "Ada Lovelace" }]);
    flush();
  });
  return (
    <main>
      <h3>Mapped result</h3>
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

  "solid-js/repeat": `import { createSignal, flush, repeat } from "solid-js";
import { render } from "@solidjs/web";

function App() {
  const [count, setCount] = createSignal(2);
  const rows = repeat(count, (index) => <li>Item {index + 1}</li>);
  queueMicrotask(() => {
    setCount(4);
    flush();
  });
  return (
    <main>
      <h3>Repeated items</h3>
      <ul>{rows()}</ul>
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);`,

  "solid-js/action": `import { action, createSignal, flush } from "solid-js";
import { render } from "@solidjs/web";

function App() {
  const [result, setResult] = createSignal<number>();
  const save = action(function* (value: number) {
    const doubled = yield Promise.resolve(value * 2);
    return doubled as number;
  });
  queueMicrotask(async () => {
    setResult(await save(3));
    flush();
  });
  return (
    <main>
      <h3>Action result</h3>
      <strong>{result() ?? "Pending"}</strong>
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);`,

  "solid-js/resolve": `import { resolve } from "solid-js";
import { render } from "@solidjs/web";

function App() {
  return (
    <main>
      <h3>Resolved result</h3>
      <p id="resolve-status">Status: pending</p>
      <strong id="resolve-value">0</strong>
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);
const result = await resolve(() => ({ ready: true, value: 42 }));
document.getElementById("resolve-status")!.textContent = result.ready ? "Status: ready" : "Status: pending";
document.getElementById("resolve-value")!.textContent = String(result.value);
console.log("resolve", result);`,

  "solid-js/lazy": `import { lazy } from "solid-js";
import { Loading, render } from "@solidjs/web";

const LazyMessage = lazy(() =>
  Promise.resolve({
    default: () => <p>Lazy component loaded</p>,
  }),
);

function App() {
  return (
    <main>
      <h3>Lazy component</h3>
      <Loading fallback={<p>Loading</p>}>
        <LazyMessage />
      </Loading>
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);`,

  For: `import { For } from "__PACKAGE__";
import { createSignal, flush } from "solid-js";
import { render } from "@solidjs/web";

function App() {
  const [items, setItems] = createSignal(["Ada", "Grace"]);
  queueMicrotask(() => {
    setItems(["Ada", "Lin"]);
    flush();
    console.log("List updated", items());
  });
  return (
    <main>
      <h3>Member list</h3>
      <ul>
        <For each={items()}>{(item) => <li>{item}</li>}</For>
      </ul>
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);`,

  Hydration: `import { Hydration } from "__PACKAGE__";
import { render } from "@solidjs/web";

function App() {
  return (
    <main>
      <h3>Hydration boundary</h3>
      <Hydration>
        <p>Hydrated subtree</p>
      </Hydration>
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);`,

  Loading: `import { Loading } from "__PACKAGE__";
import { render } from "@solidjs/web";

function App() {
  return (
    <main>
      <h3>Content state</h3>
      <Loading fallback={<p>Loading</p>}>
        <p>Content ready</p>
      </Loading>
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);`,

  NoHydration: `import { NoHydration } from "__PACKAGE__";
import { render } from "@solidjs/web";

function App() {
  return (
    <main>
      <h3>Non-hydrated region</h3>
      <NoHydration>
        <p>Static subtree</p>
      </NoHydration>
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);`,

  Reveal: `import { Reveal } from "__PACKAGE__";
import { Loading } from "solid-js";
import { render } from "@solidjs/web";

function App() {
  return (
    <main>
      <h3>Sequential reveal</h3>
      <Reveal order="sequential">
        <Loading fallback="Pending">
          <p>First section</p>
        </Loading>
        <Loading fallback="Pending">
          <p>Second section</p>
        </Loading>
      </Reveal>
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);`,

  "@solidjs/web/Dynamic": `import { Dynamic, render } from "@solidjs/web";

function App() {
  return (
    <main>
      <h3>Dynamic element</h3>
      <Dynamic component="section" data-kind="dynamic">
        Dynamic component content
      </Dynamic>
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);`,

  "@solidjs/web/Portal": `import { Portal, render } from "@solidjs/web";

function App() {
  const modalRoot = document.getElementById("modal-root")!;
  return (
    <main>
      <h3>Portal source position</h3>
      <p>Content is mounted in the target container.</p>
      <Portal mount={modalRoot}>
        <aside>
          <strong>Portal content</strong>
        </aside>
      </Portal>
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);`,

  "@solidjs/web/render": `import { render } from "@solidjs/web";

function App() {
  return (
    <main>
      <h1>Client render complete</h1>
      <p>This JSX is mounted on the page.</p>
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);`,

  "@solidjs/web/renderToString": `import { renderToString } from "@solidjs/web";

const App = () => (
  <main>
    <h1>Server-rendered HTML</h1>
    <p>renderToString completed</p>
  </main>
);
const html = renderToString(() => <App />);
console.log(html);`,

  "@solidjs/web/renderToStringAsync": `import { renderToStringAsync } from "@solidjs/web";

const App = () => (
  <main>
    <h1>Async server rendering</h1>
    <p>All content is ready</p>
  </main>
);
const html = await renderToStringAsync(() => <App />);
console.log(html);`,

  "@solidjs/web/renderToStream": `import { renderToStream } from "@solidjs/web";

const App = () => (
  <main>
    <h1>Streaming server rendering</h1>
    <p>The server stream is complete</p>
  </main>
);
const stream = renderToStream(() => <App />);
const html = await new Promise<string>((resolve) => stream.then(resolve));
console.log(html);`,

  "@solidjs/web/dynamic": `import { createSignal, flush } from "solid-js";
import { dynamic, render } from "@solidjs/web";

function App() {
  const [multiline, setMultiline] = createSignal(false);
  const Field = dynamic(() => (multiline() ? "textarea" : "input"));
  queueMicrotask(() => {
    setMultiline(true);
    flush();
  });
  return (
    <main>
      <h3>Dynamic form control</h3>
      <p>Current element: {multiline() ? "TEXTAREA" : "INPUT"}</p>
      <Field value="Dynamic component value" />
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);`,

  "solid-js/createSignal": `import { createSignal, flush } from "solid-js";
import { render } from "@solidjs/web";

function App() {
  // Parameter 1 is the initial value. Parameter 2 controls naming and equality.
  const [count, setCount] = createSignal(0, {
    name: "count",
    equals: (previous, next) => previous === next,
  });

  queueMicrotask(() => {
    setCount(1); // Pass a value to replace the current state.
    setCount((previous) => previous + 1); // Pass an updater to derive the next state.
    flush();
    console.log("Current count", count());
  });

  return (
    <main>
      <h3>createSignal</h3>
      <p>Accessor result: {count()}</p>
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);`,

  "solid-js/createMemo": `import { createMemo, createSignal, flush } from "solid-js";
import { render } from "@solidjs/web";

function App() {
  const [price, setPrice] = createSignal(20);
  let computations = 0;

  // Parameter 1 computes the value; parameter 2 configures the memo.
  const total = createMemo(
    (previous) => {
      computations += 1;
      console.log("Previous total", previous);
      return price() * 1.13;
    },
    { name: "total", equals: (previous, next) => previous === next },
  );

  queueMicrotask(() => {
    setPrice(40);
    flush();
    console.log("Memo result", { total: total(), computations });
  });

  return (
    <main>
      <h3>createMemo</h3>
      <p>Source price: USD {price()}</p>
      <p>Cached total: USD {total().toFixed(2)}</p>
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);`,

  "solid-js/createEffect": `import { createEffect, createSignal, flush } from "solid-js";
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

  queueMicrotask(() => {
    setCount(1);
    flush();
    console.log("Effect records", records());
  });

  return (
    <main>
      <h3>createEffect</h3>
      <ol>
        {records().map((record) => (
          <li>{record}</li>
        ))}
      </ol>
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);`,

  "solid-js/createRenderEffect": `import { createRenderEffect, createSignal, flush } from "solid-js";
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
  queueMicrotask(() => {
    setText("Reactive update complete");
    flush();
  });
  return (
    <main>
      <h3>Render Effect</h3>
      {paragraph}
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);`,

  "solid-js/createStore": `import { createStore, flush } from "solid-js";
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

  queueMicrotask(() => {
    // The setter receives a draft that can be mutated in place.
    setState((draft) => {
      draft.user.age = 37;
      draft.todos.push({ id: "1", text: "Learn createStore" });
    });
    flush();
    console.log("Updated store", state);
  });

  return (
    <main>
      <h3>createStore</h3>
      <p>
        {state.user.name}, age {state.user.age}
      </p>
      <ul>
        {state.todos.map((todo) => (
          <li>{todo.text}</li>
        ))}
      </ul>
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);`,

  "solid-js/reconcile": `import { createStore, reconcile, untrack } from "solid-js";
import { render } from "@solidjs/web";

const [rows, setRows] = createStore([
  { id: 1, name: "Ada" },
  { id: 2, name: "Grace" },
]);
const firstRow = untrack(() => rows[0]);
setRows(
  reconcile([
    { id: 1, name: "Ada Lovelace" },
    { id: 3, name: "Lin" },
  ]),
);
const identityPreserved = untrack(() => rows[0] === firstRow);

function App() {
  return (
    <main>
      <h3>Reconciliation result</h3>
      <p>First item identity: {identityPreserved ? "Preserved" : "Replaced"}</p>
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

  "solid-js/snapshot": `import { createStore, snapshot } from "solid-js";
import { render } from "@solidjs/web";

function App() {
  const [state] = createStore({ user: { name: "Ada" }, todos: [] as string[] });
  const plain = snapshot(state);
  return (
    <main>
      <h3>Plain object snapshot</h3>
      <pre>{JSON.stringify(plain, null, 2)}</pre>
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);`,

  "solid-js/createReaction": `import { createReaction, createRoot, createSignal, flush, untrack } from "solid-js";
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
      {output}
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);
setCount(1);
flush();
dispose();`,

  "solid-js/createRoot": `import { createRoot, createSignal, flush } from "solid-js";
import { render } from "@solidjs/web";

function App() {
  const scope = createRoot((dispose) => {
    const [value, setValue] = createSignal(0);
    return { value, setValue, dispose };
  });
  queueMicrotask(() => {
    scope.setValue(2);
    flush();
    scope.dispose();
  });
  return (
    <main>
      <h3>Independent reactive scope</h3>
      <strong>Scoped value: {scope.value()}</strong>
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);`,

  ...dedicatedDemoOverrides,
};
