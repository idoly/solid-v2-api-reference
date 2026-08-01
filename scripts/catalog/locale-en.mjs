import { resolveFallbackUseCase } from "./generator/locale-resolver.mjs";

// Complete en definitions and use cases for every catalog API.
export const apiContent = {
  "solid-js/children": [
    "Resolves a `children` accessor and exposes the result as an accessor with a `.toArray()` helper.",
    "Use this when a component needs to inspect or iterate over its children rather than just render them through.",
  ],
  "solid-js/createComponent": [
    "Invokes a component with the supplied props while preserving Solid's component execution semantics.",
    "Compiled JSX normally calls this helper; call it manually only when implementing a JSX factory or renderer.",
  ],
  "solid-js/createContext": [
    "Creates a Context for sharing state with descendants of a Provider in the component tree.",
    "The returned `Context` is itself a provider component — pass it a `value` prop to scope a value to its children.",
  ],
  "solid-js/createEffect": [
    "Creates a reactive effect with **separate compute and effect phases**.",
    "`compute(prev)` runs reactively — *put all reactive reads here*.",
  ],
  "solid-js/createMemo": [
    "Creates a readonly derived reactive memoized signal.",
    "`compute(prev)` runs reactively — every reactive read inside it is tracked, and the returned value becomes the memo's current value.",
  ],
  "solid-js/createOptimistic": [
    "Creates an optimistic signal — a `Signal<T>` whose writes are tentative inside an `action` transition: they show up immediately, then auto-revert (or reconcile to the action's resolved value) once the transition settles.",
    "Use it when one value should reflect an action immediately while retaining automatic confirmation or rollback when the asynchronous transition settles.",
  ],
  "solid-js/createReaction": [
    "Creates a reactive computation that runs after the render phase with flexible tracking.",
    "Use it when an external trigger should rerun a callback against an explicitly refreshed set of reactive dependencies.",
  ],
  "solid-js/createRenderEffect": [
    "Creates a reactive computation that runs during the render phase as DOM elements are created and updated but not necessarily connected.",
    "Same compute/effect split as `createEffect` (`compute(prev)` tracks, `effect(next, prev?)` runs imperatively), but scheduled inside the render queue rather than after it.",
  ],
  "solid-js/createSignal": [
    "Creates a simple reactive state with a getter and setter.",
    "**Plain form** — `createSignal(value, options?: SignalOptions<T>)`: stores a value; the setter writes a new value or applies an updater `(prev) => next`.",
  ],
  "solid-js/createTrackedEffect": [
    "Creates a tracked reactive effect where dependency tracking and side effects happen in the same scope.",
    "WARNING: Because tracking and effects happen in the same scope, this primitive may run multiple times for a single change or show tearing (reading inconsistent state).",
  ],
  "solid-js/createUniqueId": [
    "Returns a stable id string that matches between server-rendered and client-hydrated trees.",
    "Use it for `<label for>`, `aria-labelledby`, and other attributes that need consistent ids across SSR.",
  ],
  "solid-js/enableHydration": [
    "Enables hydration-aware behavior for the current Solid runtime.",
    "Use it when a custom renderer or integration initializes hydration outside the standard web bootstrap.",
  ],
  "solid-js/flush": [
    "Synchronously processes the pending reactive queue, or runs `fn` in a synchronous flush scope before draining the queue.",
    "Reactive updates are normally batched onto the microtask queue, so multiple writes in a row collapse into a single update pass.",
  ],
  "solid-js/isEqual": [
    "Compares two values with Solid's internal equality semantics.",
    "Use it when a custom reactive primitive must make the same change-detection decision as the runtime.",
  ],
  "solid-js/lazy": [
    "Defines a code-split component.",
    "The returned component triggers its dynamic import on first render and suspends through any enclosing `<Loading>` boundary while the chunk is in flight.",
  ],
  "solid-js/mapArray": [
    "Reactively maps an array, reusing the previously-mapped value for unchanged items.",
    "The callback shape follows the keying mode: - default / `keyed: true` receives `(item, index)` where `item` is the raw row value and `index` is an accessor.",
  ],
  "solid-js/repeat": [
    "Reactively renders a callback `count` times, reusing previously-rendered entries when only the count changes.",
    "Use it to build count-driven rendering primitives; prefer `<Repeat>` when JSX control flow is sufficient.",
  ],
  "solid-js/untrack": [
    "Executes a function without collecting reactive dependencies and returns its result.",
    "Use it to read current reactive values without subscribing the active computation.",
  ],
  "solid-js/useContext": [
    "Reads the current value of a context.",
    "For `createContext<T>()` (default-less): returns the value from the nearest enclosing Provider, or throws `ContextNotFoundError` if none is mounted.",
  ],
  "solid-js/createOptimisticStore": [
    "The store equivalent of `createOptimistic`.",
    "Writes inside an `action` transition are tentative — they show up immediately but auto-revert (or reconcile to the action's resolved value) once the transition finishes.",
  ],
  "solid-js/createProjection": [
    "Creates a derived (projected) store — `createMemo` for stores.",
    "The derive function receives a mutable draft and either mutates it in place (canonical) or returns a new value.",
  ],
  "solid-js/createStore": [
    "Creates a deeply-reactive store backed by a Proxy.",
    "Reads track each property accessed; only the parts that change trigger updates.",
  ],
  "solid-js/deep": [
    "Returns a plain (non-proxy) deep copy **and** subscribes the current tracking scope to every nested change in the source store.",
    "Any write anywhere in the subtree invalidates the consumer.",
  ],
  "solid-js/isWrappable": [
    "Checks whether a value can be wrapped by a reactive Store proxy.",
    "Use it before applying Store-specific behavior to an unknown object or collection.",
  ],
  "solid-js/merge": [
    "Merges multiple props-like objects into a single proxy that *preserves reactivity*.",
    "Reads are forwarded to the right-most source that defines the property, so later sources override earlier ones (like `Object.assign`).",
  ],
  "solid-js/omit": [
    "Returns a reactive proxy of `props` with the listed keys hidden.",
    "Use it to forward most reactive props while excluding fields consumed locally; tracking on the remaining keys is preserved.",
  ],
  "solid-js/reconcile": [
    "Returns a draft-mutating function that smart-merges `value` into a store, preserving fine-grained reactivity: only changed leaves trigger updates.",
    'With a `key` (default `"id"`), array items whose key matches between old and new states keep their identity (updated in place, moves and removals update the corresponding signals) — the shape for keyed server payloads.',
  ],
  "solid-js/snapshot": [
    "Returns a plain (non-proxy, non-reactive) deep copy of a store value.",
    "Reading via `snapshot` does **not** subscribe to changes — use this when you need to hand a stable plain object to non-reactive code (logging, serialization, structured-clone, network payloads, etc.).",
  ],
  "solid-js/storePath": [
    "Path-based setter helper for `createStore`.",
    "Call `storePath(...path, value)` to produce a draft-mutating function suitable for passing to `setStore`.",
  ],
  "solid-js/action": [
    "Creates a transactional asynchronous mutation that coordinates writes across an async gap and rolls tentative state back when the operation fails.",
    "Use it for optimistic writes followed by a server round trip and reconciliation. Prefer an ordinary async function when no reactive writes need transaction semantics.",
  ],
  "solid-js/onCleanup": [
    "Low-level reactive-cleanup primitive.",
    "Registers a callback that runs when the surrounding owner is disposed.",
  ],
  "solid-js/onSettled": [
    "Schedules a callback to run once after the reactive graph in the current Owner has fully settled.",
    "Use it when follow-up work must wait for every pending async read to resolve and the reactive queue to flush.",
  ],
  "solid-js/refresh": [
    "Invalidates one reactive source, forcing it to re-execute even if its inputs haven't changed.",
    "Pass either a Solid-created accessor or a projected store created from `createStore(fn, ...)` / `createProjection(...)`.",
  ],
  "@solidjs/web/getOwner": [
    "Returns the current reactive Owner that will receive newly created primitives and cleanup handlers.",
    "Capture it when work must later resume in the same lifecycle scope with `runWithOwner`.",
  ],
  "solid-js/createRoot": [
    "Creates a detached reactive root.",
    "The callback receives a `dispose()` function which, when called, tears down every signal, memo, effect, and `onCleanup` registered inside the root.",
  ],
  "solid-js/getObserver": [
    "Returns the currently-tracking observer (the computation that subscribes to reactive reads at this point), or `null` if reads here would be untracked.",
    "Used by reactive primitives that need to know whether they're inside a tracking scope.",
  ],
  "solid-js/getOwner": [
    "Returns the current reactive Owner that will receive newly created primitives and cleanup handlers.",
    "Capture it when work must later resume in the same lifecycle scope with `runWithOwner`.",
  ],
  "solid-js/isDisposed": [
    "Returns `true` if the owner has been disposed (or marked zombie pending disposal).",
    "Pair with a captured owner to bail out of late callbacks whose surrounding component already unmounted.",
  ],
  "solid-js/runWithOwner": [
    "Executes `fn` with the given `owner` set as the current owner.",
    "Any reactive primitives (`createSignal`, `createMemo`, `createEffect`, `onCleanup`, `cleanup`, etc.) created inside `fn` are attached to that owner, so they are disposed when the owner is disposed.",
  ],
  "solid-js/affects": [
    "Marks the supplied reactive data and its derivations as affected by the current in-flight transaction, allowing `isPending` to observe that work.",
    "Use it when an Action promises to change readable data later. The mark reports pending intent without hiding the current value or suspending readers.",
  ],
  "solid-js/enableExternalSource": [
    "Registers the runtime hooks used to integrate an external reactive source.",
    "Use it when adapting another reactive system so Solid computations can subscribe to and dispose its sources.",
  ],
  "solid-js/flatten": [
    'Resolves a children value to its renderable form: unwraps zero-arg functions (accessors), recursively flattens arrays, and optionally skips non-rendering values (`null`, `undefined`, `true`, `false`, `""`).',
    "Used internally by flow components and by the renderer to walk a children tree.",
  ],
  "solid-js/isPending": [
    "Checks whether reading the supplied reactive expression encounters pending asynchronous work.",
    "Use it to inspect pending state without replacing the surrounding loading-boundary behavior.",
  ],
  "solid-js/latest": [
    "Reads an asynchronous reactive expression while retaining its latest settled value when a new value is pending.",
    "Use it when stale data should remain visible during a refresh instead of immediately showing a fallback.",
  ],
  "solid-js/resolve": [
    "Awaits a reactive expression and returns its first fully-settled value as a `Promise`.",
    "Pending async reads (`createMemo` returning a promise, etc.) are waited on; once the expression returns synchronously without `NotReadyError` the promise resolves with that value.",
  ],
  "@solidjs/web/Assets": [
    "Collects server-rendered asset elements for placement in the document output.",
    "Use it in an SSR document shell to emit styles, links, and other assets registered by the rendered tree.",
  ],
  "@solidjs/web/Dynamic": [
    "Renders an arbitrary custom or native component and forwards the other props.",
    "JSX form of `dynamic()` — same primitive, picked at the JSX site.",
  ],
  "@solidjs/web/Errored": [
    "Catches uncaught errors inside its subtree and renders fallback content instead.",
    "The fallback callback receives an error accessor and `reset()` function, allowing it to display the current error and retry the protected subtree.",
  ],
  "@solidjs/web/For": [
    "Creates a list of elements from a list.",
    "Receives a map function as its child and returns a JSX element for each list item; if the list is empty, an optional `fallback` is rendered instead.",
  ],
  "@solidjs/web/Hydration": [
    "Re-enables hydration within a `<NoHydration>` zone (passthrough on the client).",
    "Use it to opt a subtree back into hydration when the surrounding region was opted out.",
  ],
  "@solidjs/web/HydrationScript": [
    "Renders the client bootstrap script and event metadata required for hydration.",
    "Include it in an SSR document when the generated HTML will be hydrated in the browser.",
  ],
  "@solidjs/web/Loading": [
    "Renders a `fallback` while pending async reads inside the subtree settle.",
    "Any computation (`createMemo`, `createSignal(fn)`, `createStore(fn)`, `lazy(...)`, etc.) that throws because data isn't ready is caught by the nearest enclosing `<Loading>`.",
  ],
  "@solidjs/web/Match": [
    "A branch inside a `<Switch>`.",
    "The first `<Match>` whose `when` is truthy wins; remaining matches are skipped.",
  ],
  "@solidjs/web/NoHydration": [
    "Disables hydration for its children on the client.",
    "During hydration, skips the subtree entirely (returns undefined so DOM is left untouched).",
  ],
  "@solidjs/web/Portal": [
    "Renders its children into a different part of the DOM (modal roots, tooltips, layers that need to escape an `overflow: hidden` ancestor).",
    "If `mount` is omitted, the portal attaches to `document.body`.",
  ],
  "@solidjs/web/Repeat": [
    "Creates a list of elements from a count.",
    "Receives a map function as its child that takes the index and returns a JSX element; if the count is zero, an optional `fallback` is rendered instead.",
  ],
  "@solidjs/web/Reveal": [
    "Coordinates the reveal timing of sibling `<Loading>` boundaries.",
    'The `order` prop picks the reveal policy: - `"sequential"` (default) — boundaries reveal in registration order; later boundaries stay on their fallback until earlier ones resolve.',
  ],
  "@solidjs/web/Show": [
    "Conditionally renders its children when `when` is truthy, otherwise renders the optional `fallback`.",
    "Use it for one conditional region. The function-child form receives the narrowed truthy value; use `<Switch>` when several branches compete.",
  ],
  "@solidjs/web/Switch": [
    "Switches between content based on mutually exclusive conditions.",
    "Renders the first `<Match>` whose `when` is truthy; falls back to `fallback` when none match.",
  ],
  "solid-js/Errored": [
    "Catches uncaught errors inside its subtree and renders fallback content instead.",
    "The fallback callback receives an error accessor and `reset()` function, allowing it to display the current error and retry the protected subtree.",
  ],
  "solid-js/For": [
    "Creates a list of elements from a list.",
    "Receives a map function as its child and returns a JSX element for each list item; if the list is empty, an optional `fallback` is rendered instead.",
  ],
  "solid-js/Hydration": [
    "Re-enables hydration within a `<NoHydration>` zone (passthrough on the client).",
    "Use it to opt a subtree back into hydration when the surrounding region was opted out.",
  ],
  "solid-js/Loading": [
    "Renders a `fallback` while pending async reads inside the subtree settle.",
    "Any computation (`createMemo`, `createSignal(fn)`, `createStore(fn)`, `lazy(...)`, etc.) that throws because data isn't ready is caught by the nearest enclosing `<Loading>`.",
  ],
  "solid-js/Match": [
    "A branch inside a `<Switch>`.",
    "The first `<Match>` whose `when` is truthy wins; remaining matches are skipped.",
  ],
  "solid-js/NoHydration": [
    "Disables hydration for its children on the client.",
    "During hydration, skips the subtree entirely (returns undefined so DOM is left untouched).",
  ],
  "solid-js/Repeat": [
    "Creates a list of elements from a count.",
    "Receives a map function as its child that takes the index and returns a JSX element; if the count is zero, an optional `fallback` is rendered instead.",
  ],
  "solid-js/Reveal": [
    "Coordinates the reveal timing of sibling `<Loading>` boundaries.",
    'The `order` prop picks the reveal policy: - `"sequential"` (default) — boundaries reveal in registration order; later boundaries stay on their fallback until earlier ones resolve.',
  ],
  "solid-js/Show": [
    "Conditionally renders its children when `when` is truthy, otherwise renders the optional `fallback`.",
    "Use it for one conditional region. The function-child form receives the narrowed truthy value; use `<Switch>` when several branches compete.",
  ],
  "solid-js/Switch": [
    "Switches between content based on mutually exclusive conditions.",
    "Renders the first `<Match>` whose `when` is truthy; falls back to `fallback` when none match.",
  ],
  "@solidjs/web/generateHydrationScript": [
    "Generates the hydration bootstrap script as an HTML string.",
    "Use it in a custom SSR document pipeline that cannot render the `HydrationScript` component directly.",
  ],
  "@solidjs/web/hydrate": [
    "Resumes a server-rendered tree on the client, attaching event listeners and reactive bindings without reconstructing the DOM.",
    "Returns a `dispose` function that tears down reactive scopes (DOM nodes are left in place).",
  ],
  "@solidjs/web/render": [
    "Renders a component tree into a DOM element.",
    "Returns a dispose function that tears the tree down and cleans up reactive scopes when called.",
  ],
  "@solidjs/web/renderToStream": [
    "Streams an HTML response, flushing the synchronous shell first and then progressively emitting async-resolved fragments as their `<Loading>` boundaries settle.",
    "Use it when time to first byte matters and the synchronous shell should reach the client before every asynchronous boundary resolves.",
  ],
  "@solidjs/web/renderToString": [
    "Renders a component tree synchronously to an HTML string.",
    "Async reads inside `<Loading>` boundaries emit their `fallback` content; for full-graph resolution use `renderToStringAsync` instead.",
  ],
  "@solidjs/web/renderToStringAsync": [
    "Renders a component tree to an HTML string and awaits all async reads in the subtree before resolving.",
    "The returned HTML reflects the fully-settled state — no `<Loading>` fallbacks appear in the output.",
  ],
  "@solidjs/web/getRequestEvent": [
    "Returns the request event associated with the current server execution context, when one exists.",
    "Use it in server-side code that needs request headers, response metadata, or other request-scoped state.",
  ],
  "@solidjs/web/httpHeader": [
    "Declares an HTTP response header for the lifetime of the current reactive scope during SSR; `append` adds another value instead of replacing the header.",
    "Call it in a component or reactive scope when that rendered branch owns response metadata such as caching or content-language headers.",
  ],
  "@solidjs/web/httpStatus": [
    "Declares the HTTP response status and optional status text for the lifetime of the current reactive scope during SSR.",
    "Call it in a route, error fallback, or other rendered branch that determines a response such as 404 Not Found.",
  ],
  "@solidjs/web/isHref": [
    "Whether `value` is an `Href`-branded URL-bearing value.",
    "Registered-symbol check, so it stays correct across duplicated module instances — same rationale as `isResponseEnvelope`.",
  ],
  "@solidjs/web/isResponseEnvelope": [
    "Whether `value` is a `ResponseEnvelope`.",
    "Uses a registered-symbol brand rather than `instanceof`, so it stays correct when separately bundled entries each carry a copy of the class.",
  ],
  "@solidjs/web/redirect": [
    "Response redirecting to `url` (default status 302).",
    "Return (or throw) it from a server function — the HTTP handler forwards the redirect for the client integration to follow — or return it from a client-side action, where the integration interprets it in memory.",
  ],
  "@solidjs/web/reload": [
    "Empty response requesting revalidation of the named cache keys — all of them when omitted.",
    'For mutations whose only effect the caller needs is "refetch your data".',
  ],
  "@solidjs/web/respond": [
    "A value paired with response metadata (status, headers, `revalidate`) — for the things a naked return can't express.",
    "Scripted callers receive `value` transparently (the transport unwraps the envelope), and progressive enhancement stays invisible: the carried response holds a plain JSON body so consumers without the client runtime (no-JS form posts, direct HTTP) get real JSON.",
  ],
  "@solidjs/web/acquireAsset": [
    "Acquires a reference-counted web asset and returns a function that releases it.",
    "Use it in renderer integrations that must retain shared assets only while consumers are mounted.",
  ],
  "@solidjs/web/addEvent": [
    "Attaches either a direct or delegated event handler to an element.",
    "Use it from compiled output or renderer integrations that need Solid's event delegation semantics.",
  ],
  "@solidjs/web/applyRef": [
    "Applies one ref callback, or an array of ref callbacks, to an element.",
    "Use it when custom compiled output must reproduce JSX ref assignment behavior.",
  ],
  "@solidjs/web/assign": [
    "Assigns a props object to an element while handling children, refs, properties, attributes, styles, and events.",
    "Use it in generated DOM code or a custom renderer bridge that applies a complete dynamic props object.",
  ],
  "@solidjs/web/claimElement": [
    "Claim `node` for registered consumers (see `registerElementClaim`).",
    "Emitted by the compiler at element creation; idempotent by contract.",
  ],
  "@solidjs/web/claimElementTree": [
    "Sweep-claim every navigation-relevant element (`a[href]`, `form[action]`) in `root` — the subtree equivalent of the per-element `claimElement` compiled output emits, for content that becomes live DOM without compiled creation code (frame streams, adopted SSR ranges).",
    "Use it after streamed or adopted DOM enters a registered navigation container; without a registered claim consumer it intentionally has no effect.",
  ],
  "@solidjs/web/className": [
    "Updates an element's class value and accounts for its previous class state.",
    "Use it from renderer code that applies dynamic JSX class values.",
  ],
  "@solidjs/web/createComponent": [
    "Invokes a component with the supplied props while preserving Solid's component execution semantics.",
    "Compiled JSX normally calls this helper; call it manually only when implementing a JSX factory or renderer.",
  ],
  "@solidjs/web/delegateEvents": [
    "Registers document-level delegated listeners for the supplied event names.",
    "Use it when generated code relies on delegated events that have not yet been installed.",
  ],
  "@solidjs/web/dynamic": [
    "Returns a stable `Component` whose identity is driven by a reactive (and optionally async) `source`.",
    "The returned component can be used anywhere a normal component is used; children and props flow through JSX as usual.",
  ],
  "@solidjs/web/dynamicProperty": [
    "Marks a property on a props object as dynamically evaluated.",
    "Use it in compiler or renderer output when a property must retain live getter behavior.",
  ],
  "@solidjs/web/effect": [
    "Creates a renderer effect with separate computation and DOM side-effect callbacks.",
    "Use it in custom DOM primitives that must track values before applying imperative updates.",
  ],
  "@solidjs/web/getAssets": [
    "Returns the HTML for assets collected during the current server render.",
    "Use it in a custom SSR document pipeline when assembling the final asset output manually.",
  ],
  "@solidjs/web/getDelegatedRoot": [
    "Returns the delegated-event root associated with a mountable node.",
    "Use it when renderer infrastructure needs to resolve the event delegation boundary for a node.",
  ],
  "@solidjs/web/getHydrationKey": [
    "Returns the next hydration key for the current server rendering context.",
    "Use it in custom SSR primitives that emit nodes requiring client-side hydration matching.",
  ],
  "@solidjs/web/getNextElement": [
    "Claims and returns the next hydratable element, optionally creating it from a template when not hydrating.",
    "Use it in compiled DOM output that supports both client creation and hydration.",
  ],
  "@solidjs/web/getNextMarker": [
    "Finds a hydration marker boundary and returns the marker together with the nodes it encloses.",
    "Use it in compiled control-flow output that must claim an existing dynamic DOM range.",
  ],
  "@solidjs/web/getNextMatch": [
    "Finds and claims the next hydratable element matching the requested tag name.",
    "Use it when compiled hydration output must match a specific existing element type.",
  ],
  "@solidjs/web/insert": [
    "Inserts static or reactive content into a DOM parent and updates the managed range when the value changes.",
    "Use it as the core renderer primitive for expressions, components, arrays, and dynamic children.",
  ],
  "@solidjs/web/memo": [
    "Wraps a function in a renderer memo and returns a reactive accessor.",
    "Use it in compiled DOM expressions that should avoid repeating unchanged computations.",
  ],
  "@solidjs/web/ref": [
    "Evaluates and applies a JSX ref expression to an element.",
    "Use it in generated code when the ref value itself may need deferred evaluation.",
  ],
  "@solidjs/web/registerDelegatedContainer": [
    "Registers a container and optional logical owner for delegated event handling.",
    "Use it for portals or custom mount points whose events must participate in Solid delegation.",
  ],
  "@solidjs/web/registerDelegatedRoot": [
    "Registers a root node as an event delegation boundary.",
    "Use it when creating a custom DOM root that must receive delegated events.",
  ],
  "@solidjs/web/registerElementClaim": [
    "Registers a consumer for element claims emitted by compiled DOM output.",
    "Use it in router or framework integrations that observe created links and forms. Handlers must be idempotent because later `href` or `action` writes can claim the same element again.",
  ],
  "@solidjs/web/runHydrationEvents": [
    "Replays events that were captured while the application was waiting to hydrate.",
    "Use it after a custom hydration sequence has attached the handlers needed for queued events.",
  ],
  "@solidjs/web/scope": [
    "Wraps a renderer callback so it executes in its captured reactive scope.",
    "Use it in generated callbacks that may run later but must retain their original Owner context.",
  ],
  "@solidjs/web/setAttribute": [
    "Sets or removes a standard DOM attribute according to the supplied value.",
    "Use it in renderer code for attributes that should not be assigned as DOM properties.",
  ],
  "@solidjs/web/setAttributeNS": [
    "Sets or removes a namespaced DOM attribute.",
    "Use it for SVG, XML, or other attributes that require an explicit namespace.",
  ],
  "@solidjs/web/setProperty": [
    "Assigns a value directly to a DOM element property.",
    "Use it in renderer code for live properties such as input values and checked state.",
  ],
  "@solidjs/web/setStyleProperty": [
    "Sets or removes one CSS property on an element's inline style declaration.",
    "Use it for independently reactive style properties, including custom properties.",
  ],
  "@solidjs/web/spread": [
    "Reactively spreads a props object onto an element.",
    "Use it in compiled JSX for dynamic object spreads whose values can change over time.",
  ],
  "@solidjs/web/style": [
    "Applies a style object to an element and removes properties no longer present in the next value.",
    "Use it for dynamic JSX style objects whose property set can change; use `setStyleProperty` when one CSS property updates independently.",
  ],
  "@solidjs/web/template": [
    "Creates a clone factory from a static HTML template string.",
    "Use it in compiled DOM output to efficiently instantiate repeated static structures.",
  ],
  "@solidjs/web/unregisterDelegatedContainer": [
    "Removes a previously registered delegated-event container.",
    "Call it when a portal or custom mount point no longer participates in event delegation.",
  ],
  "@solidjs/web/unregisterDelegatedRoot": [
    "Removes a previously registered event delegation root.",
    "Call it when disposing a custom DOM root and its delegated event infrastructure.",
  ],
  "@solidjs/web/untrack": [
    "Executes a function without collecting reactive dependencies and returns its result.",
    "Use it to read current reactive values without subscribing the active computation.",
  ],
  "@solidjs/web/useAssets": [
    "Registers an asset-producing callback with the current server rendering context.",
    "Use it from SSR integrations that need to contribute dynamic elements to the document assets.",
  ],
};

export function resolveApiContent(api) {
  const existing = apiContent[api.id];
  if (existing) return existing;

  const definition = api.sourceDefinition || `${api.title} is a callable API exported by ${api.packageName}.`;
  const useCase =
    api.sourceUseCase ||
    resolveFallbackUseCase(api, {
      type: "Use it to define precise TypeScript contracts for libraries, components, and custom primitives.",
      internalCompiler:
        "Use it only for renderers, compiler output, or framework integrations; application code should not normally call it directly.",
      domRuntime: "Use it for DOM bindings, events, templates, or Web renderer integrations.",
      rendering: "Use it for application mounting, hydration, or server-side HTML output.",
      default: "Use it in the reactive and component scenarios described by its source declaration.",
    });
  return [definition, useCase];
}
