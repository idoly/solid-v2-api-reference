import { browserDemo } from "./builders.mjs";

export const hydrationDemos = {
  "@solidjs/web/Assets": `import { Assets, renderToString } from "@solidjs/web";

const html = renderToString(() => (
  <>
    <Assets>
      <meta name="demo-asset" content="registered" />
      <link rel="preload" href="/api-demo.js" as="script" />
    </Assets>
    <main>
      <h1>Collected SSR assets</h1>
      <p>The document contains metadata and a preload link registered by Assets.</p>
    </main>
  </>
));
console.log(html);`,
  "@solidjs/web/HydrationScript": `import { HydrationScript, renderToString } from "@solidjs/web";

const html = renderToString(() => (
  <main>
    <h1>Hydration bootstrap output</h1>
    <HydrationScript nonce="api-nonce" eventNames={["click", "input"]} />
    <p>The generated script installs replay support for click and input events.</p>
  </main>
));
console.log(html);`,
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
