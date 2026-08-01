import { browserDemo } from "./builders.mjs";

export const asyncDemos = {
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
