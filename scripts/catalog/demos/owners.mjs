import { browserDemo } from "./builders.mjs";

export const ownerDemos = {
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
