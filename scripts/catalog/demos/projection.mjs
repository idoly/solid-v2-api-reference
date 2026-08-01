import { browserDemo } from "./builders.mjs";

export const projectionDemos = {
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
