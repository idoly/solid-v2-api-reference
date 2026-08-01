import { browserDemo } from "./builders.mjs";

export const claimDemos = {
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
