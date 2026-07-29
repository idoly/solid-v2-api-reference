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
    solid: ["children", "createSignal"],
    setup: `const [name, setName] = createSignal("Ada");
// The accessor parameter may return nested arrays and reactive JSX.
const resolved = children(() => [<span>Hello {name()}</span>, [<em>Resolved once per read</em>]]);`,
    view: `<label for="child-name">Name</label>
<input id="child-name" value={name()} onInput={(event) => setName(event.currentTarget.value)} />
<div>{resolved()}</div>`,
  }),
  "solid-js/createComponent": browserDemo({
    title: "createComponent",
    solid: ["createComponent", "createSignal"],
    setup: `const [name, setName] = createSignal("Ada");
function Greeting(props: { name: string; role: string }) {
  return <p>{props.name} is a {props.role}</p>;
}
// Parameter 1 is the component; parameter 2 is its complete props object.
const greeting = createComponent(Greeting, { get name() { return name(); }, role: "programmer" });`,
    view: `<label for="component-name">Component prop</label>
<input id="component-name" value={name()} onInput={(event) => setName(event.currentTarget.value)} />
{greeting}`,
  }),
  "solid-js/createContext": browserDemo({
    title: "createContext",
    solid: ["createContext", "createSignal", "useContext"],
    setup: `// Parameter 1 is the fallback value; parameter 2 configures the context owner.
const Theme = createContext(() => "system", { name: "theme context" });
const [theme, setTheme] = createSignal("dark");
function CurrentTheme() {
  return <p>Context value: {useContext(Theme)()}</p>;
}`,
    view: `<label for="context-theme">Provided theme</label>
<select id="context-theme" value={theme()} onChange={(event) => setTheme(event.currentTarget.value)}>
  <option value="light">Light</option>
  <option value="dark">Dark</option>
  <option value="system">System</option>
</select>
<p>Default value: {Theme.defaultValue()}</p>
<Theme value={theme}><CurrentTheme /></Theme>`,
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
    solid: ["createSignal", "isEqual"],
    setup: `const [left, setLeft] = createSignal("Ada");
const [right, setRight] = createSignal("Ada");
// Both parameters are compared using Solid's structural equality rules.
const equal = () => isEqual({ name: left() }, { name: right() });`,
    view: `<label for="equal-left">Left value</label>
<input id="equal-left" value={left()} onInput={(event) => setLeft(event.currentTarget.value)} />
<label for="equal-right">Right value</label>
<input id="equal-right" value={right()} onInput={(event) => setRight(event.currentTarget.value)} />
<output>Equal structures: {String(equal())}</output>`,
  }),
  "solid-js/untrack": browserDemo({
    title: "untrack",
    solid: ["createEffect", "createSignal", "untrack"],
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
`,
    view: `<p>Snapshot: {snapshot}</p>
<p>Current source: {source()}</p>
<p>Effect runs: {effectRuns()}</p>
<button type="button" onClick={() => setSource((value) => value + 1)}>Update source</button>`,
  }),
  "solid-js/useContext": browserDemo({
    title: "useContext",
    solid: ["createContext", "createSignal", "useContext"],
    setup: `const Locale = createContext(() => "en-US");
const [locale, setLocale] = createSignal("fr-FR");
function LocaleReader(props: { label: string }) {
  // The context parameter selects the nearest matching Provider value.
  const locale = useContext(Locale);
  return <p>{props.label}: {locale()}</p>;
}`,
    view: `<button type="button" onClick={() => setLocale((value) => value === "fr-FR" ? "zh-CN" : "fr-FR")}>Switch locale</button>
<LocaleReader label="Fallback" />
<Locale value={locale}><LocaleReader label="Provided" /></Locale>`,
  }),
};

const storeDemos = {
  "solid-js/isWrappable": browserDemo({
    title: "isWrappable",
    solid: ["createSignal", "createStore", "isWrappable"],
    setup: `const [store] = createStore({ count: 1 });
const samples = { store, object: { count: 1 }, array: [1, 2], date: new Date(), primitive: 42 };
const [sample, setSample] = createSignal<keyof typeof samples>("store");`,
    view: `<label for="wrappable-sample">Value type</label>
<select id="wrappable-sample" value={sample()} onChange={(event) => setSample(event.currentTarget.value as keyof typeof samples)}>
  {Object.keys(samples).map((name) => <option value={name}>{name}</option>)}
</select>
<output>Wrappable: {String(isWrappable(samples[sample()]))}</output>`,
  }),
  "solid-js/merge": browserDemo({
    title: "merge",
    solid: ["createSignal", "merge"],
    setup: `const defaults = { theme: "system", pageSize: 20 };
const [theme, setTheme] = createSignal("dark");
const [pageSize, setPageSize] = createSignal(50);
// Every argument is a source; later sources override earlier properties.
const settings = () => merge(defaults, { theme: theme(), compact: true }, { pageSize: pageSize() });`,
    view: `<label for="merge-theme">Theme</label>
<select id="merge-theme" value={theme()} onChange={(event) => setTheme(event.currentTarget.value)}>
  <option value="light">Light</option><option value="dark">Dark</option><option value="system">System</option>
</select>
<label for="merge-size">Page size: {pageSize()}</label>
<input id="merge-size" type="range" min="10" max="100" step="10" value={pageSize()} onInput={(event) => setPageSize(event.currentTarget.valueAsNumber)} />
<pre>{JSON.stringify(settings(), null, 2)}</pre>`,
  }),
  "solid-js/omit": browserDemo({
    title: "omit",
    solid: ["createSignal", "omit"],
    setup: `const account = { id: 7, password: "secret", token: "private" };
const [name, setName] = createSignal("Ada");
// Parameter 1 is the source object; remaining parameters are keys to remove.
const publicAccount = () => omit({ ...account, name: name() }, "password", "token");`,
    view: `<label for="omit-name">Account name</label>
<input id="omit-name" value={name()} onInput={(event) => setName(event.currentTarget.value)} />
<p>Public account</p>
<pre>{JSON.stringify(publicAccount(), null, 2)}</pre>`,
  }),
  "solid-js/storePath": browserDemo({
    title: "storePath",
    solid: ["createStore", "storePath"],
    setup: `const [state, setState] = createStore({ profile: { name: "Ada", visits: 1 } });
// Path segments come first; the final parameter updates the selected value.
const rename = storePath("profile", "name", () => "Grace");
const incrementVisits = storePath("profile", "visits", (value) => value + 1);`,
    view: `<p>Name: {state.profile.name}</p>
<p>Visits: {state.profile.visits}</p>
<button type="button" onClick={() => setState(rename)}>Rename profile</button>
<button type="button" onClick={() => setState(incrementVisits)}>Add visit</button>`,
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
    solid: ["createSignal"],
    web: ["isHref"],
    setup: `const [value, setValue] = createSignal("/guide");`,
    view: `<label for="href-value">Navigation target</label>
<input id="href-value" value={value()} onInput={(event) => setValue(event.currentTarget.value)} />
<output>Valid href: {String(isHref(value()))}</output>`,
  }),
  "@solidjs/web/isResponseEnvelope": browserDemo({
    title: "isResponseEnvelope",
    solid: ["createSignal"],
    web: ["isResponseEnvelope", "respond"],
    setup: `const values = { envelope: respond({ saved: true }, { status: 201 }), response: new Response(), object: { saved: true } };
const [sample, setSample] = createSignal<keyof typeof values>("envelope");`,
    view: `<label for="envelope-sample">Value</label>
<select id="envelope-sample" value={sample()} onChange={(event) => setSample(event.currentTarget.value as keyof typeof values)}>
  <option value="envelope">Envelope</option><option value="response">Response</option><option value="object">Plain object</option>
</select>
<output>Response envelope: {String(isResponseEnvelope(values[sample()]))}</output>`,
  }),
  "@solidjs/web/redirect": browserDemo({
    title: "redirect",
    solid: ["createSignal"],
    web: ["redirect"],
    setup: `const [destination, setDestination] = createSignal("/login");
const [permanent, setPermanent] = createSignal(false);
const result = () => redirect(destination(), permanent() ? 308 : 302);`,
    view: `<label for="redirect-path">Destination</label>
<input id="redirect-path" value={destination()} onInput={(event) => setDestination(event.currentTarget.value)} />
<label><input type="checkbox" checked={permanent()} onChange={(event) => setPermanent(event.currentTarget.checked)} /> Permanent</label>
<output>{result().status} {"->"} {result().headers.get("location")}</output>`,
  }),
  "@solidjs/web/reload": browserDemo({
    title: "reload",
    solid: ["createSignal"],
    web: ["reload"],
    setup: `const [status, setStatus] = createSignal(200);
const response = () => reload({ status: status(), headers: { "x-refresh": "profile" } });`,
    view: `<label for="reload-status">Reload status: {status()}</label>
<input id="reload-status" type="range" min="200" max="299" value={status()} onInput={(event) => setStatus(event.currentTarget.valueAsNumber)} />
<output>Status: {response().status} | Header: {response().headers.get("x-refresh")}</output>`,
  }),
  "@solidjs/web/respond": browserDemo({
    title: "respond",
    solid: ["createSignal"],
    web: ["isResponseEnvelope", "respond"],
    setup: `const [name, setName] = createSignal("Ada");
const [status, setStatus] = createSignal(201);
const envelope = () => respond({ id: 7, name: name() }, { status: status(), headers: { location: "/users/7" } });`,
    view: `<label for="respond-name">Response name</label>
<input id="respond-name" value={name()} onInput={(event) => setName(event.currentTarget.value)} />
<label for="respond-status">Status</label>
<select id="respond-status" value={status()} onChange={(event) => setStatus(Number(event.currentTarget.value))}>
  <option value="200">200</option><option value="201">201</option><option value="202">202</option>
</select>
<output>Envelope: {String(isResponseEnvelope(envelope()))} | Status: {envelope().response.status}</output>`,
  }),
};

const domDemos = {
  "@solidjs/web/applyRef": browserDemo({
    title: "applyRef",
    solid: ["createSignal"],
    web: ["applyRef"],
    setup: `const button = document.createElement("button");
button.textContent = "Referenced button";
const [calls, setCalls] = createSignal(1);
// Parameter 1 accepts one callback or an array; parameter 2 is the element.
applyRef([() => {}, (element) => element.setAttribute("data-ready", "true")], button);
const apply = () => applyRef([() => setCalls((count) => count + 1)], button);`,
    view: `{button}
<button type="button" onClick={apply}>Apply refs again</button>
<output>Callback runs: {calls()} | Ready: {button.dataset.ready}</output>`,
  }),
  "@solidjs/web/assign": browserDemo({
    title: "assign",
    solid: ["createSignal"],
    web: ["assign"],
    setup: `const button = document.createElement("button");
// node, props, skipChildren, previous props, and skipRef are all explicit here.
assign(button, { id: "save", title: "Save", children: "Save record" }, false, {}, true);
const [updated, setUpdated] = createSignal(false);
const update = () => {
  assign(button, { id: "save", title: "Saved", children: "Record saved" }, false, { title: "Save" }, true);
  setUpdated(true);
};`,
    view: `{button}
<button type="button" onClick={update}>Apply new props</button>
<output>Title: {updated() ? button.title : "Save"}</output>`,
  }),
  "@solidjs/web/className": browserDemo({
    title: "className",
    solid: ["createSignal"],
    web: ["className"],
    setup: `const badge = document.createElement("span");
badge.textContent = "Status";
const [active, setActive] = createSignal(false);
const toggle = () => {
  const next = !active();
  // Parameter 3 supplies the previous class value for efficient reconciliation.
  className(badge, next ? "badge active" : "badge", next ? "badge" : "badge active");
  setActive(next);
};`,
    view: `{badge}
<button type="button" onClick={toggle}>Toggle class</button>
<output>class: {active() ? "badge active" : "badge"}</output>`,
  }),
  "@solidjs/web/createComponent": browserDemo({
    title: "createComponent",
    solid: ["createSignal"],
    web: ["createComponent"],
    setup: `const [code, setCode] = createSignal(200);
function Status(props: { code: number; label: string }) {
  return <p>{props.code}: {props.label}</p>;
}
// The component and its props are passed separately.
const status = createComponent(Status, { get code() { return code(); }, get label() { return code() < 400 ? "OK" : "Not found"; } });`,
    view: `<label for="component-code">Status code: {code()}</label>
<input id="component-code" type="range" min="200" max="500" step="100" value={code()} onInput={(event) => setCode(event.currentTarget.valueAsNumber)} />
{status}`,
  }),
  "@solidjs/web/dynamicProperty": browserDemo({
    title: "dynamicProperty",
    solid: ["createSignal"],
    web: ["dynamicProperty"],
    setup: `const [name, setName] = createSignal("Ada");
const props = {
  name,
  greeting: () => \`Hello \${name()}\`,
};
// Parameter 1 is a props object whose selected key is an accessor.
const enhanced = dynamicProperty(props, "name") as { name: string; greeting: () => string };
// Parameter 2 selects which accessor becomes a getter.
dynamicProperty(enhanced, "greeting");`,
    view: `<label for="dynamic-name">Name</label>
<input id="dynamic-name" value={name()} onInput={(event) => setName(event.currentTarget.value)} />
<p>Name: {enhanced.name}</p>
<output>{enhanced.greeting}</output>`,
  }),
  "@solidjs/web/insert": browserDemo({
    title: "insert",
    solid: ["createSignal"],
    web: ["insert"],
    setup: `const host = document.createElement("section");
const marker = document.createComment("slot");
host.append(marker);
const [message, setMessage] = createSignal("Initial content");
// parent, reactive content, marker, initial value, and scheduling options.
insert(host, message, marker, undefined, { host: () => host, schedule: false });`,
    view: `<label for="insert-message">Inserted content</label>
<input id="insert-message" value={message()} onInput={(event) => setMessage(event.currentTarget.value)} />
{host}`,
  }),
  "@solidjs/web/memo": browserDemo({
    title: "memo",
    solid: ["createSignal"],
    web: ["memo"],
    setup: `const [count, setCount] = createSignal(2);
let runs = 0;
// Parameter 1 computes the value; parameter 2 enables equality checks.
const doubled = memo(() => { runs += 1; return count() * 2; }, true);`,
    view: `<label for="memo-count">Count: {count()}</label>
<input id="memo-count" type="range" min="0" max="10" value={count()} onInput={(event) => setCount(event.currentTarget.valueAsNumber)} />
<output>Doubled: {doubled()}</output>`,
  }),
  "@solidjs/web/ref": browserDemo({
    title: "ref",
    solid: ["createSignal"],
    web: ["ref"],
    setup: `const input = document.createElement("input");
const [focused, setFocused] = createSignal(false);
let captured = "none";
// Parameter 1 returns the ref callback; parameter 2 is the target element.
ref(() => (element) => {
  captured = element.tagName;
  element.setAttribute("aria-label", "Name");
  element.addEventListener("focus", () => setFocused(true));
  element.addEventListener("blur", () => setFocused(false));
}, input);`,
    view: `{input}
<button type="button" onClick={() => input.focus()}>Focus referenced input</button>
<output>{captured} is {focused() ? "focused" : "not focused"}</output>`,
  }),
  "@solidjs/web/scope": browserDemo({
    title: "scope",
    solid: ["createSignal"],
    web: ["scope"],
    setup: `const [count, setCount] = createSignal(3);
// The function parameter is wrapped so reads execute in renderer scope.
const scopedCount = scope(() => count());
const scopedLabel = scope(() => \`Count: \${count()}\`);`,
    view: `<button type="button" onClick={() => setCount((value) => value + 1)}>Update scoped signal</button>
<p>{scopedLabel()}</p>
<output>Direct result: {scopedCount()}</output>`,
  }),
  "@solidjs/web/setAttribute": browserDemo({
    title: "setAttribute",
    solid: ["createSignal"],
    web: ["setAttribute"],
    setup: `const link = document.createElement("a");
link.textContent = "Documentation";
// Element, attribute name, and string value.
setAttribute(link, "href", "/docs");
setAttribute(link, "aria-label", "Open documentation");
setAttribute(link, "data-section", "api");
const [href, setHref] = createSignal("/docs");
const toggleHref = () => {
  const next = href() === "/docs" ? "/api" : "/docs";
  setAttribute(link, "href", next);
  setHref(next);
};`,
    view: `{link}
<button type="button" onClick={toggleHref}>Change href</button>
<output>href: {href()}</output>`,
  }),
  "@solidjs/web/setAttributeNS": browserDemo({
    title: "setAttributeNS",
    solid: ["createSignal"],
    web: ["setAttributeNS"],
    setup: `const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
const link = document.createElementNS("http://www.w3.org/2000/svg", "use");
svg.append(link);
const [icon, setIcon] = createSignal("check");
// Element, namespace URI, qualified name, and value.
setAttributeNS(link, "http://www.w3.org/1999/xlink", "xlink:href", "#check");
const applyIcon = (name: string) => {
  setAttributeNS(link, "http://www.w3.org/1999/xlink", "xlink:href", \`#\${name}\`);
  setIcon(name);
};`,
    view: `{svg}
<button type="button" onClick={() => applyIcon(icon() === "check" ? "close" : "check")}>Toggle icon reference</button>
<output>xlink:href: #{icon()}</output>`,
  }),
  "@solidjs/web/setProperty": browserDemo({
    title: "setProperty",
    solid: ["createSignal"],
    web: ["setProperty"],
    setup: `const input = document.createElement("input");
// Element, JavaScript property name, and value.
setProperty(input, "value", "Ada");
setProperty(input, "checked", true);
setProperty(input, "disabled", false);
const [disabled, setDisabled] = createSignal(false);
const toggleDisabled = () => {
  setProperty(input, "disabled", !disabled());
  setDisabled((value) => !value);
};`,
    view: `{input}
<button type="button" onClick={toggleDisabled}>Toggle disabled</button>
<output>Disabled: {String(disabled())}</output>`,
  }),
  "@solidjs/web/setStyleProperty": browserDemo({
    title: "setStyleProperty",
    solid: ["createSignal"],
    web: ["setStyleProperty"],
    setup: `const panel = document.createElement("section");
panel.textContent = "Styled panel";
// Element, CSS property, and value. Custom properties are supported.
setStyleProperty(panel, "color", "rgb(49, 94, 85)");
setStyleProperty(panel, "padding", "12px");
setStyleProperty(panel, "--accent", "#8db53f");
const [compact, setCompact] = createSignal(false);
const toggleSpacing = () => {
  const next = !compact();
  setStyleProperty(panel, "padding", next ? "4px" : "12px");
  setCompact(next);
};`,
    view: `{panel}
<button type="button" onClick={toggleSpacing}>Toggle spacing</button>
<output>Padding: {compact() ? "4px" : "12px"}</output>`,
  }),
  "@solidjs/web/spread": browserDemo({
    title: "spread",
    solid: ["createSignal"],
    web: ["spread"],
    setup: `const button = document.createElement("button");
const [disabled, setDisabled] = createSignal(false);
const props = {
  type: "button",
  get title() { return disabled() ? "Unavailable" : "Save"; },
  get disabled() { return disabled(); },
  children: "Save record",
};
// Parameter 1 is the element, parameter 2 is props, parameter 3 can skip children.
spread(button, props, false);
const apply = () => setDisabled((value) => !value);`,
    view: `{button}
<button type="button" onClick={apply}>Apply next props</button>
<output>Disabled: {String(disabled())}</output>`,
  }),
  "@solidjs/web/style": browserDemo({
    title: "style",
    solid: ["createSignal"],
    web: ["style"],
    setup: `const card = document.createElement("article");
card.textContent = "API card";
const compact = { color: "gray", padding: "4px" };
const spacious = { color: "green", padding: "12px", border: "1px solid currentColor" };
const [mode, setMode] = createSignal<"compact" | "spacious">("compact");
// Element, next style object, and previous style object.
style(card, compact, spacious);
const apply = (next: "compact" | "spacious") => {
  style(card, next === "compact" ? compact : spacious, next === "compact" ? spacious : compact);
  setMode(next);
};`,
    view: `{card}
<label for="style-mode">Style preset</label>
<select id="style-mode" value={mode()} onChange={(event) => apply(event.currentTarget.value as "compact" | "spacious")}>
  <option value="compact">Compact</option><option value="spacious">Spacious</option>
</select>
<output>Mode: {mode()}</output>`,
  }),
  "@solidjs/web/template": browserDemo({
    title: "template",
    solid: ["createSignal"],
    web: ["template"],
    setup: `// Parameter 1 is static HTML; the optional flag controls cloning behavior.
const makeArticle = template("<article><h4>Reusable template</h4><p>Static content</p></article>");
const host = document.createElement("section");
const [copies, setCopies] = createSignal(0);
const addCopy = () => {
  const copy = makeArticle();
  copy.setAttribute("data-copy", String(copies() + 1));
  host.append(copy);
  setCopies((count) => count + 1);
};`,
    view: `<button type="button" onClick={addCopy}>Clone template</button>
<button type="button" onClick={() => { host.replaceChildren(); setCopies(0); }}>Clear clones</button>
{host}
<output>Copies: {copies()}</output>`,
  }),
  "@solidjs/web/untrack": browserDemo({
    title: "untrack",
    solid: ["createSignal"],
    web: ["untrack"],
    setup: `const [count, setCount] = createSignal(1);
// The function parameter is executed without subscribing to reactive sources.
const snapshot = untrack(() => count());
const [latestSnapshot, setLatestSnapshot] = createSignal(snapshot);
const update = () => {
  setCount((value) => value + 1);
  setLatestSnapshot(untrack(() => count()));
};`,
    view: `<p>First snapshot: {snapshot}</p>
<p>Current accessor: {count()}</p>
<button type="button" onClick={update}>Update and read untracked</button>
<output>Latest snapshot: {latestSnapshot()}</output>`,
  }),
};

const ownerDemos = {
  "solid-js/onCleanup": browserDemo({
    title: "onCleanup",
    solid: ["createRoot", "onCleanup"],
    setup: `const status = document.createElement("output");
status.textContent = "No subscription";
let dispose: (() => void) | undefined;
const subscribe = () => {
  dispose?.();
  dispose = createRoot((dispose) => {
    status.textContent = "Subscription active";
    // The callback parameter runs when this Owner is disposed.
    onCleanup(() => { status.textContent = "Subscription released"; });
    return dispose;
  });
};`,
    view: `<button type="button" onClick={subscribe}>Subscribe</button>
<button type="button" onClick={() => dispose?.()}>Dispose</button>
{status}`,
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
    setup: `const [value, setValue] = createSignal(1);
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
    view: `<button type="button" onClick={() => setValue((current) => current + 1)}>Retrigger observer ({value()})</button>
<p>Outside tracking: {String(Boolean(outside))}</p>
<p>Inside tracking: {String(Boolean(inside!))}</p>`,
  }),
  "solid-js/getOwner": browserDemo({
    title: "getOwner",
    solid: ["createSignal", "getOwner"],
    setup: `// No parameters: returns the Owner for the current component scope.
const first = getOwner();
const second = getOwner();
const [eventOwner, setEventOwner] = createSignal<string>("Not checked");`,
    view: `<button type="button" onClick={() => setEventOwner(getOwner() ? "Available" : "Unavailable")}>Check from event</button>
<p>Owner available: {String(Boolean(first))}</p>
<p>Stable in this scope: {String(first === second)}</p>
<output>Event owner: {eventOwner()}</output>`,
  }),
  "solid-js/isDisposed": browserDemo({
    title: "isDisposed",
    solid: ["createRoot", "getOwner", "isDisposed"],
    setup: `let owner!: NonNullable<ReturnType<typeof getOwner>>;
const status = document.createElement("output");
const dispose = createRoot((dispose) => {
  owner = getOwner()!;
  return dispose;
});
status.textContent = \`Disposed: \${String(isDisposed(owner))}\`;
const checkAfterDispose = () => {
  dispose();
  status.textContent = \`Disposed: \${String(isDisposed(owner))}\`;
};`,
    view: `<button type="button" onClick={checkAfterDispose}>Dispose owner</button>
{status}`,
  }),
  "solid-js/runWithOwner": browserDemo({
    title: "runWithOwner",
    solid: ["createRoot", "getOwner", "onCleanup", "runWithOwner"],
    setup: `const status = document.createElement("output");
status.textContent = "Owner ready";
let owner!: NonNullable<ReturnType<typeof getOwner>>;
const dispose = createRoot((dispose) => {
  owner = getOwner()!;
  return dispose;
});
const runOwned = () => {
  // Parameter 1 restores an Owner; parameter 2 runs in that lifecycle scope.
  const result = runWithOwner(owner, () => {
    onCleanup(() => { status.textContent = "Owned cleanup ran"; });
    return "owned result";
  });
  status.textContent = result;
};`,
    view: `<button type="button" onClick={runOwned}>Run with owner</button>
<button type="button" onClick={dispose}>Dispose owner</button>
{status}`,
  }),
};

const asyncDemos = {
  "solid-js/affects": browserDemo({
    title: "affects",
    solid: ["affects", "createSignal", "createStore"],
    setup: `const [count, setCount] = createSignal(1);
const [profile, setProfile] = createStore({ name: "Ada", visits: 2 });
// Accessors affect as a whole; stores can optionally target one key.
affects(count);
affects(profile);
affects(profile, "visits");`,
    view: `<button type="button" onClick={() => setCount((value) => value + 1)}>Update affected signal</button>
<button type="button" onClick={() => setProfile((draft) => { draft.visits += 1; })}>Update affected store key</button>
<p>Signal: {count()}</p>
<p>Profile: {profile.name}, {profile.visits} visits</p>`,
  }),
  "solid-js/flatten": browserDemo({
    title: "flatten",
    solid: ["createSignal", "flatten"],
    setup: `const nested = [<span>A</span>, [null, <span>B</span>], () => <span>C</span>];
const [skipEmpty, setSkipEmpty] = createSignal(true);
const [preserveAccessors, setPreserveAccessors] = createSignal(false);
// Parameter 1 is nested children; options control empty values and accessor unwrapping.
const rendered = () => flatten(nested, { skipNonRendered: skipEmpty(), doNotUnwrap: preserveAccessors() });`,
    view: `<label><input type="checkbox" checked={skipEmpty()} onChange={(event) => setSkipEmpty(event.currentTarget.checked)} /> Skip empty values</label>
<label><input type="checkbox" checked={preserveAccessors()} onChange={(event) => setPreserveAccessors(event.currentTarget.checked)} /> Preserve accessors</label>
<div>Rendered entries: {String(Array.isArray(rendered()) ? rendered().length : 1)}</div>`,
  }),
  "solid-js/isPending": browserDemo({
    title: "isPending",
    solid: ["createSignal", "isPending"],
    setup: `const [mode, setMode] = createSignal<"sync" | "promise" | "nested">("sync");
const pending = () => isPending(() => mode() === "sync" ? 42 : mode() === "promise" ? Promise.resolve("ready") : Promise.resolve(Promise.resolve("ready")));`,
    view: `<label for="pending-mode">Return type</label>
<select id="pending-mode" value={mode()} onChange={(event) => setMode(event.currentTarget.value as "sync" | "promise" | "nested")}>
  <option value="sync">Synchronous</option><option value="promise">Promise</option><option value="nested">Nested promise</option>
</select>
<output>Pending: {String(pending())}</output>`,
  }),
  "solid-js/latest": browserDemo({
    title: "latest",
    solid: ["createMemo", "createSignal", "latest"],
    setup: `const [value, setValue] = createSignal("first");
// The function parameter is evaluated in a tracked memo; the latest settled value is returned.
const newest = createMemo(() => latest(() => value()));`,
    view: `<label for="latest-value">Current source</label>
<input id="latest-value" value={value()} onInput={(event) => setValue(event.currentTarget.value)} />
<output>Latest value: {newest()}</output>`,
  }),
};

function flowImports(packageName, names) {
  return packageName === "solid-js" ? { solid: [...names, "createSignal"] } : { solid: ["createSignal"], web: names };
}

function flowDemo(packageName, name) {
  const imports = flowImports(
    packageName,
    name === "Match"
      ? ["Match", "Switch"]
      : name === "Switch"
        ? ["Match", "Switch"]
        : name === "Errored"
          ? ["Errored", "Show"]
          : [name],
  );
  if (name === "Show")
    return browserDemo({
      title: "Show",
      ...imports,
      setup: `const [user, setUser] = createSignal<{ id: number; name: string }>();`,
      view: `<button type="button" onClick={() => setUser((current) => current ? undefined : { id: 7, name: "Ada" })}>
  Toggle user
</button>
<Show when={user()} keyed fallback={<p>No user</p>}>
  {(value) => <p>Keyed user: {value.name}</p>}
</Show>`,
    });
  if (name === "Match")
    return browserDemo({
      title: "Match",
      ...imports,
      setup: `const [status, setStatus] = createSignal<"idle" | "loading" | "ready">("idle");`,
      view: `<button type="button" onClick={() => setStatus("loading")}>Loading</button>
<button type="button" onClick={() => setStatus("ready")}>Ready</button>
<Switch fallback={<p>Idle</p>}>
  <Match when={status() === "loading"}><p>Loading</p></Match>
  <Match when={status() === "ready"} keyed>{(matched) => <p>Ready: {String(matched)}</p>}</Match>
</Switch>`,
    });
  if (name === "Switch")
    return browserDemo({
      title: "Switch",
      ...imports,
      setup: `const [score, setScore] = createSignal(82);`,
      view: `<label for="switch-score">Score: {score()}</label>
<input id="switch-score" type="range" min="0" max="100" value={score()} onInput={(event) => setScore(event.currentTarget.valueAsNumber)} />
<Switch fallback={<p>No grade</p>}>
  <Match when={score() >= 90}><p>Grade A</p></Match>
  <Match when={score() >= 80}><p>Grade B</p></Match>
  <Match when={score() >= 70}><p>Grade C</p></Match>
</Switch>`,
    });
  if (name === "Repeat")
    return browserDemo({
      title: "Repeat",
      ...imports,
      setup: `const [count, setCount] = createSignal(3);
const start = 5;`,
      view: `<label for="repeat-count">Rows: {count()}</label>
<input id="repeat-count" type="range" min="0" max="8" value={count()} onInput={(event) => setCount(event.currentTarget.valueAsNumber)} />
<ol>
  <Repeat count={count()} from={start} fallback={<li>No rows</li>}>
    {(index) => <li>Row {index}</li>}
  </Repeat>
</ol>`,
    });
  return browserDemo({
    title: "Errored",
    ...imports,
    setup: `const [fail, setFail] = createSignal(false);
const fallback = (error: unknown) => <p>Error: {String(error)}</p>;
function BrokenContent() { throw new Error("Triggered from the demo"); }`,
    view: `<button type="button" onClick={() => setFail((value) => !value)}>Toggle error</button>
<Show when={!fail()} fallback={<Errored fallback={fallback}><BrokenContent /></Errored>}>
  <p>Protected content rendered successfully</p>
</Show>`,
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
    solid: ["createSignal"],
    web: ["claimElement", "registerElementClaim"],
    setup: `const [claims, setClaims] = createSignal(0);
let unregister: (() => void) | undefined;
const register = () => {
  unregister?.();
  // The handler parameter observes claimed elements; the return value unregisters it.
  unregister = registerElementClaim(() => setClaims((count) => count + 1));
};`,
    view: `<button type="button" onClick={register}>Register handler</button>
<button type="button" onClick={() => claimElement(document.createElement("a"))}>Claim element</button>
<button type="button" onClick={() => unregister?.()}>Unregister</button>
<output>Observed claims: {claims()}</output>`,
  }),
  "@solidjs/web/claimElement": browserDemo({
    title: "claimElement",
    solid: ["createSignal"],
    web: ["claimElement", "registerElementClaim"],
    setup: `const [lastClaim, setLastClaim] = createSignal("none");
const unregister = registerElementClaim((element) => setLastClaim(element.tagName));
const claim = (tag: "a" | "form") => {
  const element = document.createElement(tag);
  // The element parameter is returned unchanged after claim handlers run.
  return claimElement(element);
};`,
    view: `<button type="button" onClick={() => claim("a")}>Claim link</button>
<button type="button" onClick={() => claim("form")}>Claim form</button>
<button type="button" onClick={unregister}>Unregister handler</button>
<output>Handler input: {lastClaim()}</output>`,
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
    solid: ["createSignal"],
    web: ["addEvent"],
    setup: `const button = document.createElement("button");
button.textContent = "Dispatch click";
const [clicks, setClicks] = createSignal(0);
// The final argument chooses direct registration (false) or delegated registration (true).
addEvent(button, "click", () => setClicks((count) => count + 1), false);`,
    view: `{button}
<output>Handled clicks: {clicks()}</output>`,
  }),
  "@solidjs/web/delegateEvents": browserDemo({
    title: "delegateEvents",
    solid: ["createSignal"],
    web: ["delegateEvents"],
    setup: `const [eventNames, setEventNames] = createSignal(["click"]);
const [applied, setApplied] = createSignal("none");
const toggle = (name: string, enabled: boolean) => setEventNames((current) => enabled ? [...current, name] : current.filter((item) => item !== name));
const apply = () => {
  // Registers the event types handled by Solid's delegated event dispatcher.
  delegateEvents(eventNames());
  setApplied(eventNames().join(", "));
};`,
    view: `<label><input type="checkbox" checked={eventNames().includes("click")} onChange={(event) => toggle("click", event.currentTarget.checked)} /> Click</label>
<label><input type="checkbox" checked={eventNames().includes("input")} onChange={(event) => toggle("input", event.currentTarget.checked)} /> Input</label>
<button type="button" onClick={apply}>Delegate selected events</button>
<output>Applied: {applied()}</output>`,
  }),
  "@solidjs/web/getDelegatedRoot": browserDemo({
    title: "getDelegatedRoot",
    solid: ["createSignal"],
    web: ["getDelegatedRoot", "registerDelegatedContainer", "registerDelegatedRoot", "unregisterDelegatedRoot"],
    setup: `const root = document.getElementById("root")!;
const child = document.createElement("span");
child.textContent = "Delegated child";
const [registered, setRegistered] = createSignal(false);
const toggleRoot = () => {
  if (registered()) unregisterDelegatedRoot(root);
  else { registerDelegatedRoot(root); registerDelegatedContainer(root); }
  setRegistered((value) => !value);
};`,
    view: `{child}
<button type="button" onClick={toggleRoot}>Toggle delegated root</button>
<output>Root found: {String(registered() && getDelegatedRoot(child) === root)}</output>`,
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
    solid: ["createSignal"],
    web: ["getDelegatedRoot", "registerDelegatedRoot", "unregisterDelegatedRoot"],
    setup: `const root = document.getElementById("root")!;
const [registered, setRegistered] = createSignal(false);
const register = () => {
  registerDelegatedRoot(root);
  setRegistered(true);
};`,
    view: `<button type="button" onClick={register}>Register root</button>
<button type="button" onClick={() => { unregisterDelegatedRoot(root); setRegistered(false); }}>Unregister root</button>
<output>Registration visible: {String(registered() && getDelegatedRoot(root) === root)}</output>`,
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
    solid: ["createSignal"],
    web: ["getDelegatedRoot", "registerDelegatedRoot", "unregisterDelegatedRoot"],
    setup: `const root = document.getElementById("root")!;
const [removed, setRemoved] = createSignal(false);
registerDelegatedRoot(root);
const unregister = () => {
  unregisterDelegatedRoot(root);
  setRemoved(true);
};`,
    view: `<button type="button" onClick={unregister}>Unregister root</button>
<output>Phase: {removed() ? "Unregister called" : "Registered"} | Lookup empty: {String(getDelegatedRoot(root) === undefined)}</output>`,
  }),
};

const projectionDemos = {
  "solid-js/createOptimisticStore": browserDemo({
    title: "createOptimisticStore",
    solid: ["action", "createOptimisticStore", "flush"],
    setup: `// Parameter 1 seeds the optimistic Store; the setter mutates a transaction-aware draft.
const [profile, setProfile] = createOptimisticStore({ name: "Ada", visits: 1 });
const addVisit = action(function* () {
  setProfile((draft) => { draft.visits += 1; });
  flush();
  yield new Promise((resolve) => setTimeout(resolve, 500));
});`,
    view: `<p>{profile.name} visits: {profile.visits}</p>
<button type="button" onClick={() => void addVisit()}>Add optimistic visit</button>`,
  }),
  "solid-js/createProjection": browserDemo({
    title: "createProjection",
    solid: ["createProjection", "createSignal"],
    setup: `const [subtotal, setSubtotal] = createSignal(40);
const [tax, setTax] = createSignal(4);
// Parameter 1 updates the draft; parameter 2 supplies the initial projected shape.
const totals = createProjection(
  (draft) => {
    draft.subtotal = subtotal();
    draft.tax = tax();
  },
  { subtotal: 0, tax: 0 },
);`,
    view: `<label for="projection-subtotal">Subtotal: {subtotal()}</label>
<input id="projection-subtotal" type="range" min="0" max="100" value={subtotal()} onInput={(event) => setSubtotal(event.currentTarget.valueAsNumber)} />
<label for="projection-tax">Tax: {tax()}</label>
<input id="projection-tax" type="number" value={tax()} onInput={(event) => setTax(event.currentTarget.valueAsNumber)} />
<output>Total: {totals.subtotal + totals.tax}</output>`,
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
// refresh writes to its target, so this helper is declared outside a component Owner.
const updateProjection = () => {
  source += 1;
  refresh(projection);
  flush();
};

function App() {
  return (
    <main>
      <h3>refresh</h3>
      <button type="button" onClick={updateProjection}>
        Refresh projection
      </button>
      <output>Projected value: {projection.value}</output>
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
let pending: Promise<unknown> | undefined;
const start = () => {
  pending = update();
  flush();
  history.insertAdjacentHTML("beforeend", \`<li>Optimistic phase: \${untrack(() => value())}</li>\`);
};
const settle = async () => {
  release();
  await pending;
  flush();
  history.insertAdjacentHTML("beforeend", \`<li>After settlement: \${untrack(() => value())}</li>\`);
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

  "@solidjs/web/Portal": `import { Show, createSignal } from "solid-js";
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
      <Show when={open()}>
        <Portal mount={modalRoot}>
          <aside>
            <strong>Portal content</strong>
          </aside>
        </Portal>
      </Show>
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
      console.log("Previous total", previous);
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

  ...dedicatedDemoOverrides,
};
