import { browserDemo } from "./builders.mjs";

export const domDemos = {
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
