import { browserDemo } from "./builders.mjs";

export const storeDemos = {
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
