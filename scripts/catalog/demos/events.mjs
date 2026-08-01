import { browserDemo } from "./builders.mjs";

export const delegatedEventDemos = {
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
