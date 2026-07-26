const reactiveUtilitiesDemo = `import {
  children,
  createComponent,
  createContext,
  createSignal,
  createUniqueId,
  isEqual,
  untrack,
  useContext,
} from "solid-js";
import { render } from "@solidjs/web";

function App() {
  const Locale = createContext("未设置");
  const [count] = createSignal(3);
  const id = createUniqueId();
  const same = isEqual({ value: 1 }, { value: 1 });
  const snapshot = untrack(() => count());
  const content = children(() => <span>已解析 children</span>);
  const Badge = (props: { text: string }) => <strong>{props.text}</strong>;
  const badge = createComponent(Badge, { text: "createComponent" });
  console.log("响应式工具", { id, snapshot, same });
  function ContextValue() {
    return <p>Context：{useContext(Locale)}</p>;
  }
  return (
    <Locale value="中文">
      <main>
        <h3>响应式工具</h3>
        <ContextValue />
        <p id={id}>快照：{snapshot}</p>
        <p>结构相等：{String(same)}</p>
        {badge}
        {content()}
      </main>
    </Locale>
  );
}

render(() => <App />, document.getElementById("root")!);`;

const controlFlowDemo = `import { Errored, Match, Repeat, Show, Switch } from "__PACKAGE__";
import { render } from "@solidjs/web";

function App() {
  console.log("控制流", { show: true, match: "第二项", repeat: 3 });
  return (
    <main>
      <h3>控制流组合</h3>
      <Show when={true} fallback={<p>隐藏</p>}>
        <p>Show：可见</p>
      </Show>
      <Switch fallback={<p>无匹配项</p>}>
        <Match when={false}>
          <p>第一项</p>
        </Match>
        <Match when={true}>
          <p>Switch：第二项</p>
        </Match>
      </Switch>
      <ul>
        <Repeat count={3}>{(index) => <li>Repeat {index + 1}</li>}</Repeat>
      </ul>
      <Errored fallback={(error) => <p>Errored：{error.message}</p>}>
        <p>边界内内容正常</p>
      </Errored>
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);`;

const responseHelpersDemo = `import { getRequestEvent, isHref, isResponseEnvelope, redirect, reload, respond, render } from "@solidjs/web";

function App() {
  const event = getRequestEvent();
  const location = "/guide";
  const redirectResponse = redirect(location, 302);
  const reloadResponse = reload();
  const envelope = respond({ saved: true }, { status: 201 });
  console.log("响应状态", {
    redirect: redirectResponse.status,
    reload: reloadResponse.status,
    envelope: isResponseEnvelope(envelope),
  });
  return (
    <main>
      <h3>响应辅助函数</h3>
      <p>请求上下文：{event ? "存在" : "当前为浏览器环境"}</p>
      <p>Href：{String(isHref(location))}</p>
      <p>Envelope：{String(isResponseEnvelope(envelope))}</p>
      <p>Redirect：{redirectResponse.status}</p>
      <p>Reload：{reloadResponse.status}</p>
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);`;

const domMutationDemo = `import { createSignal, flush } from "solid-js";
import {
  applyRef,
  assign,
  className,
  createComponent,
  dynamicProperty,
  insert,
  memo,
  ref,
  render,
  scope,
  setAttribute,
  setAttributeNS,
  setProperty,
  setStyleProperty,
  spread,
  style,
  template,
  untrack,
} from "@solidjs/web";

function App() {
  const [label, setLabel] = createSignal("初始按钮");
  const makeButton = template("<button type='button'></button>");
  const button = makeButton() as HTMLButtonElement;
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  setAttribute(button, "aria-label", "运行时按钮");
  setAttributeNS(svg, "http://www.w3.org/2000/xmlns/", "xmlns", "http://www.w3.org/2000/svg");
  setProperty(button, "disabled", false);
  setStyleProperty(button, "padding", "8px 12px");
  className(button, "runtime-button");
  style(button, { color: "#315e55", background: "#eef5e7" });
  assign(button, { title: "assign 已应用" });
  spread(button, { "data-runtime": "spread" });
  let refApplied = false;
  applyRef(() => {
    refApplied = true;
  }, button);
  ref(
    () => () => {
      refApplied = true;
    },
    button,
  );
  insert(button, label);
  const props = {
    get current() {
      return label();
    },
  };
  const current = untrack(() => dynamicProperty(props, "current"));
  const cached = memo(() => label(), true);
  const scoped = scope(() => cached());
  const plain = untrack(() => label());
  const Label = (value: { text: string }) => <p>{value.text}</p>;
  const component = createComponent(Label, { text: "createComponent 已运行" });
  console.log("DOM 节点", { tag: button.tagName, refApplied, label: plain });
  queueMicrotask(() => {
    setLabel("更新后的按钮");
    flush();
  });
  return (
    <main>
      <h3>DOM 运行时</h3>
      {button}
      {svg}
      {component}
      <p>ref：{String(refApplied)}</p>
      <p>dynamicProperty：{String(current)}</p>
      <p>memo / scope：{scoped()}</p>
      <p>untrack：{plain}</p>
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);`;

const storeUtilitiesDemo = `import { createStore, flush, isWrappable, merge, omit, storePath } from "solid-js";
import { render } from "@solidjs/web";

const [state, setState] = createStore({ profile: { name: "Ada", role: "admin" } });
const updateName = storePath("profile", "name", () => "Lin");
const combined = merge({ name: state.profile.name }, { role: state.profile.role });
const publicProfile = omit(combined, "role");

function App() {
  return (
    <main>
      <h3>Store 工具</h3>
      <p>可包装：{String(isWrappable(state))}</p>
      <p>
        合并：{combined.name} / {combined.role}
      </p>
      <p>省略字段：{JSON.stringify(publicProfile)}</p>
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);
setState(updateName);
flush();
console.log("Store 工具", { name: state.profile.name, wrappable: isWrappable(state) });`;

const ownerLifecycleDemo = `import { createRoot, getObserver, getOwner, isDisposed, onCleanup, onSettled, runWithOwner } from "solid-js";
import { render } from "@solidjs/web";

const events: string[] = [];
let nestedOwner: NonNullable<ReturnType<typeof getOwner>>;
let observer: ReturnType<typeof getObserver>;
const dispose = createRoot((dispose) => {
  nestedOwner = getOwner()!;
  observer = getObserver();
  onCleanup(() => {
    events.push("cleanup");
  });
  onSettled(() => {
    events.push("settled");
  });
  runWithOwner(nestedOwner, () => {
    events.push("runWithOwner");
  });
  return dispose;
});
const before = isDisposed(nestedOwner!);
dispose();
const after = isDisposed(nestedOwner!);

function App() {
  return (
    <main>
      <h3>Owner 生命周期</h3>
      <p>Owner：{nestedOwner! ? "存在" : "缺失"}</p>
      <p>Observer：{observer! ? "存在" : "当前无观察者"}</p>
      <p>
        释放状态：{String(before)} → {String(after)}
      </p>
      <ul>
        {events.map((item) => (
          <li>{item}</li>
        ))}
      </ul>
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);
console.log("Owner 状态", { before, after, events });`;

const webOwnerDemo = `import { getOwner, render } from "@solidjs/web";

function App() {
  const owner = getOwner();
  console.log("Web Owner", { exists: Boolean(owner) });
  return (
    <main>
      <h3>Web Owner</h3>
      <p>{owner ? "当前组件拥有 Owner" : "未找到 Owner"}</p>
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);`;

const asyncUtilitiesDemo = `import { affects, createSignal, flatten, flush, isPending, latest } from "solid-js";
import { render } from "@solidjs/web";

const [value, setValue] = createSignal("初始");
affects(value);
const newest = latest(() => value());
const pending = isPending(() => Promise.resolve("完成"));
const flattened = flatten([<span>第一项</span>, [<span>第二项</span>]]);

function App() {
  return (
    <main>
      <h3>异步与互操作</h3>
      <p>latest：{newest}</p>
      <p>pending：{String(pending)}</p>
      <div>{flattened}</div>
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);
setValue("更新");
flush();
console.log("异步工具", { newest, pending });`;

const optimisticDemo = `import { action, createOptimistic, flush, untrack } from "solid-js";
import { render } from "@solidjs/web";

const [value, setValue] = createOptimistic(1);
const history = document.createElement("ol");
let release!: () => void;
const gate = new Promise<void>((resolve) => {
  release = resolve;
});
const update = action(function* () {
  setValue(2);
  yield gate;
});

function App() {
  return (
    <main>
      <h3>Optimistic Signal</h3>
      <p>当前值：{value()}</p>
      {history}
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);
const pending = update();
flush();
const optimistic = untrack(() => value());
history.insertAdjacentHTML("beforeend", \`<li>乐观阶段：\${optimistic}</li>\`);
release();
await pending;
flush();
const settled = untrack(() => value());
history.insertAdjacentHTML("beforeend", \`<li>完成后：\${settled}</li>\`);
console.log("Optimistic Signal", { optimistic, settled });`;

const projectionDemo = `import { createOptimisticStore, createProjection, flush, refresh } from "solid-js";
import { render } from "@solidjs/web";

const projected = createProjection(
  (draft) => {
    draft.total = 2;
  },
  { total: 0 },
);
const [optimistic, setOptimistic] = createOptimisticStore({ status: "初始", count: 1 });

function App() {
  return (
    <main>
      <h3>Store 投影</h3>
      <p>Projection：{projected.total}</p>
      <p>
        Optimistic：{optimistic.status} / {optimistic.count}
      </p>
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);
setOptimistic((draft) => {
  draft.status = "已更新";
  draft.count = 2;
});
refresh(projected);
flush();
console.log("Store 投影", { total: projected.total, optimistic: optimistic.status });`;

const hydrationToggleDemo = `import { enableHydration } from "solid-js";
import { render } from "@solidjs/web";

function App() {
  enableHydration();
  console.log("Hydration", { enabled: true });
  return (
    <main>
      <h3>Hydration 已启用</h3>
      <p>后续渲染可读取 Hydration 上下文。</p>
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);`;

const delegatedEventsDemo = `import { createSignal, flush, untrack } from "solid-js";
import {
  addEvent,
  delegateEvents,
  getDelegatedRoot,
  registerDelegatedContainer,
  registerDelegatedRoot,
  render,
  unregisterDelegatedContainer,
  unregisterDelegatedRoot,
} from "@solidjs/web";

const root = document.getElementById("root")!;
const [clicks, setClicks] = createSignal(0);
const [hasDelegatedRoot, setHasDelegatedRoot] = createSignal(false);
const button = document.createElement("button");
button.textContent = "触发事件";
registerDelegatedRoot(root);
registerDelegatedContainer(root);
delegateEvents(["click"]);
addEvent(button, "click", () => setClicks((value) => value + 1), false);

function App() {
  return (
    <main>
      <h3>事件委托</h3>
      {button}
      <p>点击次数：{clicks()}</p>
      <p>找到委托根：{String(hasDelegatedRoot())}</p>
    </main>
  );
}

render(() => <App />, root);
button.click();
flush();
const delegatedRoot = getDelegatedRoot(button);
setHasDelegatedRoot(Boolean(delegatedRoot));
flush();
unregisterDelegatedContainer(root);
unregisterDelegatedRoot(root);
console.log("事件委托", { clicks: untrack(() => clicks()), delegatedRoot: Boolean(delegatedRoot) });`;

const elementClaimsDemo = `import { claimElement, claimElementTree, registerElementClaim, render } from "@solidjs/web";

function App() {
  const claimed: string[] = [];
  const stop = registerElementClaim((element) => {
    claimed.push(element.tagName);
  });
  const section = document.createElement("section");
  section.innerHTML = "<a href='/guide'>指南</a><form></form>";
  claimElement(section);
  claimElementTree(section);
  stop();
  console.log("元素认领", { claimed });
  return (
    <main>
      <h3>元素认领</h3>
      {section}
      <p>认领记录：{claimed.join(", ") || "没有匹配元素"}</p>
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);`;

const runtimeEffectDemo = `import { createSignal, flush } from "solid-js";
import { effect, render } from "@solidjs/web";

function App() {
  const [value, setValue] = createSignal(1);
  const output = document.createElement("p");
  let observed = 0;
  effect(
    () => value(),
    (next) => {
      observed = next;
      output.textContent = \`观察值：\${next}\`;
    },
  );
  queueMicrotask(() => {
    setValue(2);
    flush();
    console.log("运行时 effect", { observed });
  });
  return (
    <main>
      <h3>运行时 Effect</h3>
      {output}
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);`;

const hydrationAssetsDemo = `import { enableHydration } from "solid-js";
import {
  Assets,
  HydrationScript,
  acquireAsset,
  generateHydrationScript,
  getAssets,
  getHydrationKey,
  getNextElement,
  getNextMarker,
  getNextMatch,
  render,
  runHydrationEvents,
  useAssets,
} from "@solidjs/web";

function App() {
  enableHydration();
  const release = acquireAsset({ type: "inline-style", id: "api-demo-style", content: ".asset-demo{color:#315e55}" });
  useAssets(() => <style>{".asset-demo{font-weight:700}"}</style>);
  const assets = getAssets();
  const hydrationScript = generateHydrationScript();
  const hydrationKey = getHydrationKey();
  const nextElement = getNextElement(() => document.createElement("section"));
  const siblings = document.createElement("div");
  siblings.innerHTML = "<i></i><span>匹配节点</span><!--/-->";
  const match = getNextMatch(siblings.firstChild!, "span");
  const [marker, collected] = getNextMarker(siblings.lastChild!);
  runHydrationEvents();
  release();
  console.log("Hydration 与 Assets", {
    assets,
    hydrationScript,
    hydrationKey,
    nextElement: nextElement.tagName,
    match: match?.tagName,
    marker: marker?.nodeName,
    collected: collected.length,
  });
  return (
    <main class="asset-demo">
      <h3>Hydration 与 Assets</h3>
      <Assets>
        <meta name="api-demo" content="assets" />
      </Assets>
      <HydrationScript />
      <p>Hydration key：{hydrationKey ?? "当前无 key"}</p>
      <p>模板节点：{nextElement.tagName}</p>
      <p>匹配节点：{match?.tagName ?? "无"}</p>
    </main>
  );
}

render(() => <App />, document.getElementById("root")!, undefined, { renderId: "api-demo" });`;

const externalSourceDemo = `import { createMemo, createSignal, enableExternalSource, flush } from "solid-js";
import { render } from "@solidjs/web";

function App() {
  let disposed = false;
  enableExternalSource({
    factory: (compute) => ({
      track: (previous) => compute(previous),
      dispose: () => {
        disposed = true;
      },
    }),
    untrack: (fn) => fn(),
  });
  const [value, setValue] = createSignal(2);
  const doubled = createMemo(() => value() * 2);
  queueMicrotask(() => {
    setValue(3);
    flush();
    console.log("外部响应源", { value: value(), doubled: doubled(), disposed });
  });
  return (
    <main>
      <h3>外部响应源桥接</h3>
      <p>值：{value()}</p>
      <p>派生：{doubled()}</p>
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);`;

const hydrateDemo = `import { hydrate } from "@solidjs/web";

function App() {
  return (
    <main>
      <h3>Hydration 完成</h3>
      <p>已有服务端 DOM 已交给客户端。</p>
    </main>
  );
}

const root = document.getElementById("root")!;
root.innerHTML = "<main><h3>Hydration 完成</h3><p>已有服务端 DOM 已交给客户端。</p></main>";
const previousHydration = (globalThis as any)._$HY;
(globalThis as any)._$HY = { done: true };
hydrate(() => <App />, root, { renderId: "api-demo" });
(globalThis as any)._$HY = previousHydration;
console.log("hydrate", { reused: true, html: root.innerHTML });`;

export const demoOverrides = {
  "@solidjs/web/hydrate": hydrateDemo,
  "@solidjs/web/Assets": hydrationAssetsDemo,
  "@solidjs/web/HydrationScript": hydrationAssetsDemo,
  "@solidjs/web/acquireAsset": hydrationAssetsDemo,
  "@solidjs/web/generateHydrationScript": hydrationAssetsDemo,
  "@solidjs/web/getAssets": hydrationAssetsDemo,
  "@solidjs/web/getHydrationKey": hydrationAssetsDemo,
  "@solidjs/web/getNextElement": hydrationAssetsDemo,
  "@solidjs/web/getNextMarker": hydrationAssetsDemo,
  "@solidjs/web/getNextMatch": hydrationAssetsDemo,
  "@solidjs/web/runHydrationEvents": hydrationAssetsDemo,
  "@solidjs/web/useAssets": hydrationAssetsDemo,
  "solid-js/enableExternalSource": externalSourceDemo,

  "@solidjs/web/addEvent": delegatedEventsDemo,
  "@solidjs/web/delegateEvents": delegatedEventsDemo,
  "@solidjs/web/getDelegatedRoot": delegatedEventsDemo,
  "@solidjs/web/registerDelegatedContainer": delegatedEventsDemo,
  "@solidjs/web/registerDelegatedRoot": delegatedEventsDemo,
  "@solidjs/web/unregisterDelegatedContainer": delegatedEventsDemo,
  "@solidjs/web/unregisterDelegatedRoot": delegatedEventsDemo,
  "@solidjs/web/claimElement": elementClaimsDemo,
  "@solidjs/web/claimElementTree": elementClaimsDemo,
  "@solidjs/web/registerElementClaim": elementClaimsDemo,
  "@solidjs/web/effect": runtimeEffectDemo,

  "solid-js/affects": asyncUtilitiesDemo,
  "solid-js/flatten": asyncUtilitiesDemo,
  "solid-js/isPending": asyncUtilitiesDemo,
  "solid-js/latest": asyncUtilitiesDemo,
  "solid-js/createOptimistic": optimisticDemo,
  "solid-js/createOptimisticStore": projectionDemo,
  "solid-js/createProjection": projectionDemo,
  "solid-js/refresh": projectionDemo,
  "solid-js/enableHydration": hydrationToggleDemo,

  "solid-js/isWrappable": storeUtilitiesDemo,
  "solid-js/merge": storeUtilitiesDemo,
  "solid-js/omit": storeUtilitiesDemo,
  "solid-js/storePath": storeUtilitiesDemo,

  "solid-js/getObserver": ownerLifecycleDemo,
  "solid-js/getOwner": ownerLifecycleDemo,
  "solid-js/isDisposed": ownerLifecycleDemo,
  "solid-js/onCleanup": ownerLifecycleDemo,
  "solid-js/onSettled": ownerLifecycleDemo,
  "solid-js/runWithOwner": ownerLifecycleDemo,
  "@solidjs/web/getOwner": webOwnerDemo,

  "solid-js/children": reactiveUtilitiesDemo,
  "solid-js/createComponent": reactiveUtilitiesDemo,
  "solid-js/createContext": reactiveUtilitiesDemo,
  "solid-js/createUniqueId": reactiveUtilitiesDemo,
  "solid-js/isEqual": reactiveUtilitiesDemo,
  "solid-js/untrack": reactiveUtilitiesDemo,
  "solid-js/useContext": reactiveUtilitiesDemo,

  "@solidjs/web/Errored": controlFlowDemo,
  "@solidjs/web/Match": controlFlowDemo,
  "@solidjs/web/Repeat": controlFlowDemo,
  "@solidjs/web/Show": controlFlowDemo,
  "@solidjs/web/Switch": controlFlowDemo,
  "solid-js/Errored": controlFlowDemo,
  "solid-js/Match": controlFlowDemo,
  "solid-js/Repeat": controlFlowDemo,
  "solid-js/Show": controlFlowDemo,
  "solid-js/Switch": controlFlowDemo,

  "@solidjs/web/getRequestEvent": responseHelpersDemo,
  "@solidjs/web/isHref": responseHelpersDemo,
  "@solidjs/web/isResponseEnvelope": responseHelpersDemo,
  "@solidjs/web/redirect": responseHelpersDemo,
  "@solidjs/web/reload": responseHelpersDemo,
  "@solidjs/web/respond": responseHelpersDemo,

  "@solidjs/web/applyRef": domMutationDemo,
  "@solidjs/web/assign": domMutationDemo,
  "@solidjs/web/className": domMutationDemo,
  "@solidjs/web/createComponent": domMutationDemo,
  "@solidjs/web/dynamicProperty": domMutationDemo,
  "@solidjs/web/insert": domMutationDemo,
  "@solidjs/web/memo": domMutationDemo,
  "@solidjs/web/ref": domMutationDemo,
  "@solidjs/web/scope": domMutationDemo,
  "@solidjs/web/setAttribute": domMutationDemo,
  "@solidjs/web/setAttributeNS": domMutationDemo,
  "@solidjs/web/setProperty": domMutationDemo,
  "@solidjs/web/setStyleProperty": domMutationDemo,
  "@solidjs/web/spread": domMutationDemo,
  "@solidjs/web/style": domMutationDemo,
  "@solidjs/web/template": domMutationDemo,
  "@solidjs/web/untrack": domMutationDemo,
  "solid-js/createTrackedEffect": `import { createSignal, createTrackedEffect, flush } from "solid-js";
import { render } from "@solidjs/web";

function App() {
  const [count, setCount] = createSignal(0);
  const [events, setEvents] = createSignal<string[]>([]);
  createTrackedEffect(() => {
    const value = count();
    setEvents((items) => [...items, \`追踪值：\${value}\`]);
    return () => {
      setEvents((items) => [...items, \`清理值：\${value}\`]);
    };
  });
  queueMicrotask(() => {
    setCount(1);
    flush();
  });
  return (
    <main>
      <h3>Tracked Effect</h3>
      <ol>
        {events().map((item) => (
          <li>{item}</li>
        ))}
      </ol>
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);`,

  "solid-js/deep": `import { createEffect, createSignal, createStore, deep, flush } from "solid-js";
import { render } from "@solidjs/web";

function App() {
  const [state, setState] = createStore({ profile: { name: "Ada", score: 1 } });
  const [view, setView] = createSignal({ name: "", score: 0 });
  createEffect(
    () => deep(state),
    (plain) => {
      setView(plain.profile);
    },
  );
  queueMicrotask(() => {
    setState((draft) => {
      draft.profile.score = 2;
    });
    flush();
  });
  return (
    <main>
      <h3>深层快照</h3>
      <p>
        {view().name} · {view().score} 分
      </p>
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);`,

  "solid-js/flush": `import { createSignal, flush } from "solid-js";
import { render } from "@solidjs/web";

function App() {
  const [count, setCount] = createSignal(0);
  queueMicrotask(() => {
    setCount(3);
    flush();
  });
  return (
    <main>
      <h3>同步提交结果</h3>
      <strong>当前值：{count()}</strong>
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);`,

  "solid-js/mapArray": `import { createSignal, flush, mapArray } from "solid-js";
import { render } from "@solidjs/web";

function App() {
  const [items, setItems] = createSignal([
    { id: 1, name: "Ada" },
    { id: 2, name: "Grace" },
  ]);
  const mapped = mapArray(items, (item) => ({ ...item, label: item.name.toUpperCase() }));
  queueMicrotask(() => {
    setItems([{ id: 1, name: "Ada Lovelace" }]);
    flush();
  });
  return (
    <main>
      <h3>映射结果</h3>
      <ul>
        {mapped().map((item) => (
          <li>
            {item.id} · {item.label}
          </li>
        ))}
      </ul>
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);`,

  "solid-js/repeat": `import { createSignal, flush, repeat } from "solid-js";
import { render } from "@solidjs/web";

function App() {
  const [count, setCount] = createSignal(2);
  const rows = repeat(count, (index) => <li>项目 {index + 1}</li>);
  queueMicrotask(() => {
    setCount(4);
    flush();
  });
  return (
    <main>
      <h3>重复项目</h3>
      <ul>{rows()}</ul>
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);`,

  "solid-js/action": `import { action, createSignal, flush } from "solid-js";
import { render } from "@solidjs/web";

function App() {
  const [result, setResult] = createSignal<number>();
  const save = action(function* (value: number) {
    const doubled = yield Promise.resolve(value * 2);
    return doubled as number;
  });
  queueMicrotask(async () => {
    setResult(await save(3));
    flush();
  });
  return (
    <main>
      <h3>Action 结果</h3>
      <strong>{result() ?? "处理中"}</strong>
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);`,

  "solid-js/resolve": `import { resolve } from "solid-js";
import { render } from "@solidjs/web";

function App() {
  return (
    <main>
      <h3>稳定结果</h3>
      <p id="resolve-status">状态：等待</p>
      <strong id="resolve-value">0</strong>
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);
const result = await resolve(() => ({ ready: true, value: 42 }));
document.getElementById("resolve-status")!.textContent = result.ready ? "状态：就绪" : "状态：等待";
document.getElementById("resolve-value")!.textContent = String(result.value);
console.log("resolve", result);`,

  "solid-js/lazy": `import { lazy } from "solid-js";
import { Loading, render } from "@solidjs/web";

const LazyMessage = lazy(() =>
  Promise.resolve({
    default: () => <p>懒加载组件已运行</p>,
  }),
);

function App() {
  return (
    <main>
      <h3>Lazy 组件</h3>
      <Loading fallback={<p>加载中</p>}>
        <LazyMessage />
      </Loading>
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);`,

  For: `import { For } from "__PACKAGE__";
import { createSignal, flush } from "solid-js";
import { render } from "@solidjs/web";

function App() {
  const [items, setItems] = createSignal(["Ada", "Grace"]);
  queueMicrotask(() => {
    setItems(["Ada", "Lin"]);
    flush();
    console.log("列表更新", items());
  });
  return (
    <main>
      <h3>成员列表</h3>
      <ul>
        <For each={items()}>{(item) => <li>{item}</li>}</For>
      </ul>
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);`,

  Hydration: `import { Hydration } from "__PACKAGE__";
import { render } from "@solidjs/web";

function App() {
  return (
    <main>
      <h3>Hydration 边界</h3>
      <Hydration>
        <p>Hydration 子树</p>
      </Hydration>
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);`,

  Loading: `import { Loading } from "__PACKAGE__";
import { render } from "@solidjs/web";

function App() {
  return (
    <main>
      <h3>内容状态</h3>
      <Loading fallback={<p>加载中</p>}>
        <p>内容已就绪</p>
      </Loading>
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);`,

  NoHydration: `import { NoHydration } from "__PACKAGE__";
import { render } from "@solidjs/web";

function App() {
  return (
    <main>
      <h3>非 Hydration 区域</h3>
      <NoHydration>
        <p>静态子树</p>
      </NoHydration>
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);`,

  Reveal: `import { Reveal } from "__PACKAGE__";
import { Loading } from "solid-js";
import { render } from "@solidjs/web";

function App() {
  return (
    <main>
      <h3>顺序展示</h3>
      <Reveal order="sequential">
        <Loading fallback="等待">
          <p>第一段</p>
        </Loading>
        <Loading fallback="等待">
          <p>第二段</p>
        </Loading>
      </Reveal>
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);`,

  "@solidjs/web/Dynamic": `import { Dynamic, render } from "@solidjs/web";

function App() {
  return (
    <main>
      <h3>动态元素</h3>
      <Dynamic component="section" data-kind="dynamic">
        动态组件内容
      </Dynamic>
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);`,

  "@solidjs/web/Portal": `import { Portal, render } from "@solidjs/web";

function App() {
  const modalRoot = document.getElementById("modal-root")!;
  return (
    <main>
      <h3>Portal 源位置</h3>
      <p>内容会挂载到目标容器。</p>
      <Portal mount={modalRoot}>
        <aside>
          <strong>Portal 真实内容</strong>
        </aside>
      </Portal>
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);`,

  "@solidjs/web/render": `import { render } from "@solidjs/web";

function App() {
  return (
    <main>
      <h1>客户端渲染成功</h1>
      <p>这段 JSX 已挂载到页面。</p>
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);`,

  "@solidjs/web/renderToString": `import { renderToString } from "@solidjs/web";

const App = () => (
  <main>
    <h1>真实 SSR</h1>
    <p>renderToString 已执行</p>
  </main>
);
const html = renderToString(() => <App />);
console.log(html);`,

  "@solidjs/web/renderToStringAsync": `import { renderToStringAsync } from "@solidjs/web";

const App = () => (
  <main>
    <h1>异步 SSR</h1>
    <p>完整内容已就绪</p>
  </main>
);
const html = await renderToStringAsync(() => <App />);
console.log(html);`,

  "@solidjs/web/renderToStream": `import { renderToStream } from "@solidjs/web";

const App = () => (
  <main>
    <h1>流式 SSR</h1>
    <p>服务端流已完成</p>
  </main>
);
const stream = renderToStream(() => <App />);
const html = await new Promise<string>((resolve) => stream.then(resolve));
console.log(html);`,

  "@solidjs/web/dynamic": `import { createSignal, flush } from "solid-js";
import { dynamic, render } from "@solidjs/web";

function App() {
  const [multiline, setMultiline] = createSignal(false);
  const Field = dynamic(() => (multiline() ? "textarea" : "input"));
  queueMicrotask(() => {
    setMultiline(true);
    flush();
  });
  return (
    <main>
      <h3>动态表单控件</h3>
      <p>当前元素：{multiline() ? "TEXTAREA" : "INPUT"}</p>
      <Field value="真实动态组件" />
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);`,

  "solid-js/createSignal": `import { createSignal, flush } from "solid-js";
import { render } from "@solidjs/web";

function App() {
  const [count, setCount] = createSignal(0);
  queueMicrotask(() => {
    setCount(2);
    flush();
  });
  return (
    <main>
      <h3>计数器状态</h3>
      <strong>当前值：{count()}</strong>
      <p>Signal 更新会同步到视图。</p>
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);`,

  "solid-js/createMemo": `import { createMemo, createSignal, flush } from "solid-js";
import { render } from "@solidjs/web";

function App() {
  const [price, setPrice] = createSignal(20);
  const total = createMemo(() => price() * 1.13);
  queueMicrotask(() => {
    setPrice(40);
    flush();
  });
  return (
    <main>
      <h3>价格计算</h3>
      <p>原价：¥{price()}</p>
      <strong>含税价：¥{total().toFixed(2)}</strong>
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);`,

  "solid-js/createEffect": `import { createEffect, createSignal, flush } from "solid-js";
import { render } from "@solidjs/web";

function App() {
  const [count, setCount] = createSignal(0);
  const [records, setRecords] = createSignal<string[]>([]);
  createEffect(
    () => count(),
    (next, previous) => {
      setRecords((items) => [...items, \`\${previous ?? "初始"} → \${next}\`]);
    },
  );
  queueMicrotask(() => {
    setCount(1);
    flush();
    console.log("Effect 记录", records());
  });
  return (
    <main>
      <h3>Effect 执行记录</h3>
      <ol>
        {records().map((item) => (
          <li>{item}</li>
        ))}
      </ol>
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);`,

  "solid-js/createRenderEffect": `import { createRenderEffect, createSignal, flush } from "solid-js";
import { render } from "@solidjs/web";

function App() {
  const [text, setText] = createSignal("第一次渲染");
  const paragraph = document.createElement("p");
  createRenderEffect(
    () => text(),
    (value) => {
      paragraph.textContent = value;
    },
  );
  queueMicrotask(() => {
    setText("响应式更新完成");
    flush();
  });
  return (
    <main>
      <h3>Render Effect</h3>
      {paragraph}
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);`,

  "solid-js/createStore": `import { createStore, flush } from "solid-js";
import { render } from "@solidjs/web";

function App() {
  const [state, setState] = createStore({
    user: { name: "Ada", age: 36 },
    todos: [] as { id: string; text: string }[],
  });
  queueMicrotask(() => {
    setState((draft) => {
      draft.user.age = 37;
      draft.todos.push({ id: "1", text: "验证真实 Store 更新" });
    });
    flush();
  });
  return (
    <main>
      <h3>
        {state.user.name} · {state.user.age} 岁
      </h3>
      <ul>
        {state.todos.map((todo) => (
          <li>{todo.text}</li>
        ))}
      </ul>
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);`,

  "solid-js/reconcile": `import { createStore, reconcile, untrack } from "solid-js";
import { render } from "@solidjs/web";

const [rows, setRows] = createStore([
  { id: 1, name: "Ada" },
  { id: 2, name: "Grace" },
]);
const firstRow = untrack(() => rows[0]);
setRows(
  reconcile([
    { id: 1, name: "Ada Lovelace" },
    { id: 3, name: "Lin" },
  ]),
);
const identityPreserved = untrack(() => rows[0] === firstRow);

function App() {
  return (
    <main>
      <h3>协调结果</h3>
      <p>首项身份：{identityPreserved ? "已保留" : "已替换"}</p>
      <ul>
        {rows.map((row) => (
          <li>
            {row.id} · {row.name}
          </li>
        ))}
      </ul>
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);`,

  "solid-js/snapshot": `import { createStore, snapshot } from "solid-js";
import { render } from "@solidjs/web";

function App() {
  const [state] = createStore({ user: { name: "Ada" }, todos: [] as string[] });
  const plain = snapshot(state);
  return (
    <main>
      <h3>普通对象快照</h3>
      <pre>{JSON.stringify(plain, null, 2)}</pre>
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);`,

  "solid-js/createReaction": `import { createReaction, createRoot, createSignal, flush, untrack } from "solid-js";
import { render } from "@solidjs/web";

const [count, setCount] = createSignal(0);
const output = document.createElement("p");
const dispose = createRoot((dispose) => {
  const track = createReaction(() => {
    const current = untrack(() => count());
    output.textContent = \`已响应 count = \${current}\`;
    track(() => count());
  });
  track(() => count());
  return dispose;
});

function App() {
  return (
    <main>
      <h3>Reaction 状态</h3>
      {output}
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);
setCount(1);
flush();
dispose();`,

  "solid-js/createRoot": `import { createRoot, createSignal, flush } from "solid-js";
import { render } from "@solidjs/web";

function App() {
  const scope = createRoot((dispose) => {
    const [value, setValue] = createSignal(0);
    return { value, setValue, dispose };
  });
  queueMicrotask(() => {
    scope.setValue(2);
    flush();
    scope.dispose();
  });
  return (
    <main>
      <h3>独立响应式作用域</h3>
      <strong>作用域值：{scope.value()}</strong>
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);`,
};
