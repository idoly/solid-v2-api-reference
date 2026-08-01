import { browserDemo } from "./builders.mjs";

export const responseDemos = {
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
    web: ["isResponseEnvelope", "respond"],
    setup: `const [name, setName] = createSignal("Ada");
const [status, setStatus] = createSignal(201);
const envelope = () => respond({ id: 7, name: name() }, { status: status(), headers: { location: "/users/7" } });`,
    view: `<label for="respond-name">Response name</label>
<input id="respond-name" value={name()} onInput={(event) => setName(event.currentTarget.value)} />
<label for="respond-status">Status</label>
<select id="respond-status" value={status()} onChange={(event) => setStatus(Number(event.currentTarget.value))}>
  <option value="200">200</option><option value="201">201</option><option value="202">202</option>
</select>
<output>Envelope: {String(isResponseEnvelope(envelope()))} | Status: {envelope().response.status}</output>`,
  }),
};
