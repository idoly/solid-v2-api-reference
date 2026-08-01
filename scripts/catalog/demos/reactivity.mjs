import { browserDemo } from "./builders.mjs";

export const reactiveDemos = {
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
    solid: ["createSignal", "createUniqueId"],
    setup: `// Each call returns a stable ID scoped to the current owner.
const labelId = createUniqueId();
const inputId = createUniqueId();
const [updates, setUpdates] = createSignal(0);
console.log("Generated IDs", { labelId, inputId });`,
    view: `<label id={labelId} for={inputId}>Email</label>
<input id={inputId} aria-labelledby={labelId} value="ada@example.com" />
<button type="button" onClick={() => setUpdates((count) => count + 1)}>Update component</button>
<output>Update {updates()} | Label ID: {labelId} | Input ID: {inputId}</output>`,
  }),
  "solid-js/isEqual": browserDemo({
    title: "isEqual",
    solid: ["createSignal", "isEqual"],
    setup: `const [left, setLeft] = createSignal("Ada");
const [right, setRight] = createSignal("Ada");
// Both parameters use the same equality semantics as Solid's reactive runtime.
const equal = () => isEqual(left(), right());`,
    view: `<label for="equal-left">Left value</label>
<input id="equal-left" value={left()} onInput={(event) => setLeft(event.currentTarget.value)} />
<label for="equal-right">Right value</label>
<input id="equal-right" value={right()} onInput={(event) => setRight(event.currentTarget.value)} />
<output>Equal values: {String(equal())}</output>`,
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
