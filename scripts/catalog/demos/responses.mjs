import { browserDemo } from "./builders.mjs";

export const responseDemos = {
  "@solidjs/web/commitEventResponse": `import { commitEventResponse } from "@solidjs/web";

const event = {
  request: new Request("https://api.example.test/data"),
  locals: {},
  response: {
    status: 202,
    headers: new Headers({ "x-from-stub": "included", "x-shared": "stub" }),
    committed: false,
  },
};
// Handler plumbing fills missing headers without replacing values already owned by the response.
const response = commitEventResponse(
  new Response("ready", { status: 200, headers: { "x-shared": "response" } }),
  event,
);
console.log(
  "<main><p>Status: " +
    response.status +
    "</p><p>Stub header: " +
    response.headers.get("x-from-stub") +
    "</p><p>Shared header: " +
    response.headers.get("x-shared") +
    "</p><p>Committed: " +
    event.response.committed +
    "</p></main>",
);`,
  "@solidjs/web/composeMiddleware": `import { composeMiddleware } from "@solidjs/web";

const order: string[] = [];
const middleware = composeMiddleware([
  async (request, next) => {
    order.push("outer:before");
    const response = await next(request);
    order.push("outer:after");
    response.headers.set("x-outer", "complete");
    return response;
  },
  async (request, next) => {
    order.push("inner:before");
    const response = await next(new Request(request, { headers: { "x-input": "forwarded" } }));
    order.push("inner:after");
    return response;
  },
]);
// Middleware nests in declaration order and may replace the request passed to the terminal handler.
const response = await middleware(new Request("https://api.example.test/data"), async (request) => {
  order.push("handler");
  return new Response(request.headers.get("x-input"));
});
console.log(
  "<main><p>Body: " +
    (await response.text()) +
    "</p><p>Outer header: " +
    response.headers.get("x-outer") +
    "</p><p>Order: " +
    order.join(" -> ") +
    "</p></main>",
);`,
  "@solidjs/web/createRequestEvent": `import { createRequestEvent } from "@solidjs/web";

const request = new Request("https://api.example.test/items/7", { method: "PATCH" });
// The optional init extends the canonical request event while defaults provide locals and a response stub.
const event = createRequestEvent(request, { traceId: "trace-7" });
event.locals.role = "editor";
event.response.status = 202;
console.log(
  "<main><p>Method: " +
    event.request.method +
    "</p><p>Trace: " +
    event.traceId +
    "</p><p>Role: " +
    event.locals.role +
    "</p><p>Status: " +
    event.response.status +
    "</p><p>Committed: " +
    event.response.committed +
    "</p></main>",
);`,
  "@solidjs/web/createResponseStub": `import { createResponseStub } from "@solidjs/web";

// Each call returns an independent mutable response head for one request lifecycle.
const first = createResponseStub();
const second = createResponseStub();
first.status = 201;
first.headers.set("location", "/items/7");
console.log(
  "<main><p>Independent: " +
    (first !== second) +
    "</p><p>Status: " +
    first.status +
    "</p><p>Location: " +
    first.headers.get("location") +
    "</p><p>Committed: " +
    first.committed +
    "</p></main>",
);`,
  "@solidjs/web/createSSRResponse": `import { createSSRResponse } from "@solidjs/web";

const event = {
  request: new Request("https://api.example.test/page"),
  locals: {},
  response: {
    status: 203,
    statusText: "Non-Authoritative Information",
    headers: new Headers({ "x-render": "solid" }),
    committed: false,
  },
};
// String SSR output becomes an HTML Response whose head is finalized from the request event.
const response = createSSRResponse("<main>Rendered page</main>", event);
const body = await response.text();
console.log(
  "<article><p>Status: " +
    response.status +
    "</p><p>Content type: " +
    response.headers.get("content-type") +
    "</p><p>Render header: " +
    response.headers.get("x-render") +
    "</p><p>Committed: " +
    event.response.committed +
    "</p>" +
    body +
    "</article>",
);`,
  "@solidjs/web/getExpectedRedirectStatus": `import { getExpectedRedirectStatus } from "@solidjs/web";

// Existing redirect statuses are preserved; a Location paired with a non-redirect status defaults to 302.
const temporary = getExpectedRedirectStatus({ status: 307, headers: new Headers() });
const fallback = getExpectedRedirectStatus({ status: 200, headers: new Headers() });
console.log("<main><p>Preserved redirect: " + temporary + "</p><p>Fallback redirect: " + fallback + "</p></main>");`,
  "@solidjs/web/getRequestEvent": `import { RequestContext, getRequestEvent, renderToString } from "@solidjs/web";

const requestEvent = {
  request: new Request("https://api.example.test/reference?source=demo"),
  response: { status: 200, statusText: "OK", headers: new Headers(), committed: false },
};
(globalThis as any)[RequestContext] = { getStore: () => requestEvent };

const html = renderToString(() => {
  const firstRead = getRequestEvent();
  const secondRead = getRequestEvent();
  return (
    <main>
      <h1>Current SSR request</h1>
      <p>URL: {firstRead.request.url}</p>
      <p>Stable context: {String(firstRead === secondRead)}</p>
    </main>
  );
});

delete (globalThis as any)[RequestContext];
console.log(html);`,
  "@solidjs/web/isHref": browserDemo({
    title: "isHref",
    solid: ["createSignal"],
    web: ["isHref"],
    setup: `const [value, setValue] = createSignal("/guide");`,
    view: `<label for="href-value">Navigation target</label>
<input id="href-value" value={value()} onInput={(event) => setValue(event.currentTarget.value)} />
<output>Valid href: {String(isHref(value()))}</output>`,
  }),
  "@solidjs/web/isResponseEnvelope": browserDemo({
    title: "isResponseEnvelope",
    solid: ["createSignal"],
    web: ["isResponseEnvelope", "respond"],
    setup: `const values = { envelope: respond({ saved: true }, { status: 201 }), response: new Response(), object: { saved: true } };
const [sample, setSample] = createSignal<keyof typeof values>("envelope");`,
    view: `<label for="envelope-sample">Value</label>
<select id="envelope-sample" value={sample()} onChange={(event) => setSample(event.currentTarget.value as keyof typeof values)}>
  <option value="envelope">Envelope</option><option value="response">Response</option><option value="object">Plain object</option>
</select>
<output>Response envelope: {String(isResponseEnvelope(values[sample()]))}</output>`,
  }),
  "@solidjs/web/isSafeError": browserDemo({
    title: "isSafeError",
    web: ["isSafeError", "markSafeError"],
    setup: `const branded = markSafeError(new Error("Visible validation message"));
// Only explicitly branded errors are safe to serialize without production sanitization.
const checks = { branded: isSafeError(branded), plain: isSafeError(new Error("Internal detail")) };`,
    view: `<p>Branded error: {String(checks.branded)}</p>
<p>Plain error: {String(checks.plain)}</p>`,
  }),
  "@solidjs/web/markSafeError": browserDemo({
    title: "markSafeError",
    web: ["isSafeError", "markSafeError"],
    setup: `const original = new Error("Insufficient funds");
// Marking preserves object identity while opting intentional client-facing content out of sanitization.
const marked = markSafeError(original);`,
    view: `<p>Same error: {String(marked === original)}</p>
<p>Safe to serialize: {String(isSafeError(marked))}</p>
<p>Message: {marked.message}</p>`,
  }),
  "@solidjs/web/redirect": browserDemo({
    title: "redirect",
    solid: ["createSignal"],
    web: ["redirect"],
    setup: `const [destination, setDestination] = createSignal("/login");
const [permanent, setPermanent] = createSignal(false);
const result = () => redirect(destination(), permanent() ? 308 : 302);`,
    view: `<label for="redirect-path">Destination</label>
<input id="redirect-path" value={destination()} onInput={(event) => setDestination(event.currentTarget.value)} />
<label><input type="checkbox" checked={permanent()} onChange={(event) => setPermanent(event.currentTarget.checked)} /> Permanent</label>
<output>{result().status} {"->"} {result().headers.get("location")}</output>`,
  }),
  "@solidjs/web/reload": browserDemo({
    title: "reload",
    solid: ["createSignal"],
    web: ["reload"],
    setup: `const [status, setStatus] = createSignal(200);
const response = () => reload({ status: status(), headers: { "x-refresh": "profile" } });`,
    view: `<label for="reload-status">Reload status: {status()}</label>
<input id="reload-status" type="range" min="200" max="299" value={status()} onInput={(event) => setStatus(event.currentTarget.valueAsNumber)} />
<output>Status: {response().status} | Header: {response().headers.get("x-refresh")}</output>`,
  }),
  "@solidjs/web/respond": browserDemo({
    title: "respond",
    solid: ["createSignal"],
    web: ["respond"],
    setup: `const [name, setName] = createSignal("Ada");
const [status, setStatus] = createSignal(201);
const envelope = () => respond({ id: 7, name: name() }, { status: status(), headers: { location: "/users/7" } });`,
    view: `<label for="respond-name">Response name</label>
<input id="respond-name" value={name()} onInput={(event) => setName(event.currentTarget.value)} />
<label for="respond-status">Status</label>
<select id="respond-status" value={status()} onChange={(event) => setStatus(Number(event.currentTarget.value))}>
  <option value="200">200</option><option value="201">201</option><option value="202">202</option>
</select>
<output>Name: {envelope().value.name} | Status: {envelope().response.status} | Location: {envelope().response.headers.get("location")}</output>`,
  }),
};
