import { browserDemo } from "./builders.mjs";

function flowImports(packageName, names) {
  return packageName === "solid-js" ? { solid: [...names, "createSignal"] } : { solid: ["createSignal"], web: names };
}

function flowDemo(packageName, name) {
  const imports = flowImports(
    packageName,
    name === "Match"
      ? ["Match", "Switch"]
      : name === "Switch"
        ? ["Match", "Switch"]
        : name === "Errored"
          ? ["Errored", "Show"]
          : [name],
  );
  if (name === "Show")
    return browserDemo({
      title: "Show",
      ...imports,
      setup: `const [user, setUser] = createSignal<{ id: number; name: string }>();`,
      view: `<button type="button" onClick={() => setUser((current) => current ? undefined : { id: 7, name: "Ada" })}>
  Toggle user
</button>
<Show when={user()} keyed fallback={<p>No user</p>}>
  {(value) => <p>Keyed user: {value.name}</p>}
</Show>`,
    });
  if (name === "Match")
    return browserDemo({
      title: "Match",
      ...imports,
      setup: `const [status, setStatus] = createSignal<"idle" | "loading" | "ready">("idle");`,
      view: `<button type="button" onClick={() => setStatus("loading")}>Loading</button>
<button type="button" onClick={() => setStatus("ready")}>Ready</button>
<Switch fallback={<p>Idle</p>}>
  <Match when={status() === "loading"}><p>Loading</p></Match>
  <Match when={status() === "ready"} keyed>{(matched) => <p>Ready: {String(matched)}</p>}</Match>
</Switch>`,
    });
  if (name === "Switch")
    return browserDemo({
      title: "Switch",
      ...imports,
      setup: `const [score, setScore] = createSignal(82);`,
      view: `<label for="switch-score">Score: {score()}</label>
<input id="switch-score" type="range" min="0" max="100" value={score()} onInput={(event) => setScore(event.currentTarget.valueAsNumber)} />
<Switch fallback={<p>No grade</p>}>
  <Match when={score() >= 90}><p>Grade A</p></Match>
  <Match when={score() >= 80}><p>Grade B</p></Match>
  <Match when={score() >= 70}><p>Grade C</p></Match>
</Switch>`,
    });
  if (name === "Repeat")
    return browserDemo({
      title: "Repeat",
      ...imports,
      setup: `const [count, setCount] = createSignal(3);
const start = 5;`,
      view: `<label for="repeat-count">Rows: {count()}</label>
<input id="repeat-count" type="range" min="0" max="8" value={count()} onInput={(event) => setCount(event.currentTarget.valueAsNumber)} />
<ol>
  <Repeat count={count()} from={start} fallback={<li>No rows</li>}>
    {(index) => <li>Row {index}</li>}
  </Repeat>
</ol>`,
    });
  return browserDemo({
    title: "Errored",
    ...imports,
    setup: `const [fail, setFail] = createSignal(false);
const fallback = (error: () => unknown, reset: () => void) => (
  <section>
    <p>Error: {String(error())}</p>
    <button type="button" onClick={() => { setFail(false); reset(); }}>Recover content</button>
  </section>
);
function BrokenContent() { throw new Error("Triggered from the demo"); }`,
    view: `<button type="button" onClick={() => setFail((value) => !value)}>Toggle error</button>
<Show when={!fail()} fallback={<Errored fallback={fallback}><BrokenContent /></Errored>}>
  <p>Protected content rendered successfully</p>
</Show>`,
  });
}

export const flowDemos = Object.fromEntries(
  ["solid-js", "@solidjs/web"].flatMap((packageName) =>
    ["Errored", "Match", "Repeat", "Show", "Switch"].map((name) => [
      `${packageName}/${name}`,
      flowDemo(packageName, name),
    ]),
  ),
);
