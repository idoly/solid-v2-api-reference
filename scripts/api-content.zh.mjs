export const zhContent = {
  children: ["解析 `children` 访问器，并返回带有 `.toArray()` 方法的响应式访问器。", "组件需要检查、规范化或遍历 children，而不只是直接渲染时使用。"],
  createComponent: ["调用组件，并通过 `untrack` 避免组件函数中的响应式读取订阅到父级计算。", "主要由 JSX 编译结果使用；编写自定义 JSX 工厂或渲染器时才需要手动调用。"],
  createContext: ["创建用于在组件树后代之间共享值的 Context。", "把跨层级状态放入 Provider，避免逐层传递 props。"],
  createEffect: ["创建计算阶段与副作用阶段相互分离的响应式 effect。", "在计算函数中读取依赖，在 effect 回调中执行日志、网络请求或其他命令式副作用。"],
  createMemo: ["创建只读、缓存且可响应更新的派生信号。", "根据一个或多个响应式来源计算值，并避免相同依赖状态下重复计算。"],
  createOptimistic: ["创建支持 Action 事务的乐观信号，写入会立即可见，并在事务结束时确认或回滚。", "单值状态需要先反馈用户操作，再等待异步提交结果时使用。"],
  createReaction: ["创建一次性收集依赖、在依赖变化后执行回调的响应式 reaction。", "需要显式控制本轮追踪范围，并在回调后按需重新订阅时使用。"],
  createRenderEffect: ["创建在渲染队列中执行的响应式 effect。", "副作用必须与 DOM 创建或更新阶段同步时使用；普通业务副作用优先使用 `createEffect`。"],
  createSignal: ["创建由 getter 和 setter 组成的细粒度响应式状态。", "保存独立值，并让读取该值的 memo、effect 或组件按需更新。"],
  createTrackedEffect: ["创建在同一作用域内同时追踪依赖和执行副作用的 effect。", "仅在确实需要副作用过程参与依赖追踪时使用，并注意重复执行及状态撕裂风险。"],
  createUniqueId: ["创建在服务端渲染和客户端 hydration 之间保持一致的稳定 ID。", "用于 `for`、`aria-labelledby` 等要求 SSR 与客户端 ID 一致的属性。"],
  flush: ["立即处理待执行的响应式队列，也可以在同步 flush 作用域内运行回调。", "测试或必须立即观察已提交响应式结果时使用；常规更新通常交给微任务批处理。"],
  lazy: ["创建按需动态导入的代码分割组件。", "组件首次渲染时才加载模块，并通过最近的 `<Loading>` 边界显示等待状态。"],
  mapArray: ["响应式映射数组，并复用未变化项目已经生成的结果。", "构建自定义列表原语，且需要根据 keyed 模式精确控制项目与索引访问方式时使用。"],
  repeat: ["按响应式数量重复执行渲染回调，并复用仍然存在的项目。", "需要构建固定次数或数量驱动的列表时使用，也是 `<Repeat>` 的底层辅助函数。"],
  untrack: ["在不收集响应式依赖的情况下执行函数，并返回函数结果。", "只想读取当前值、不希望当前计算订阅该值时使用。"],
  useContext: ["读取距离当前组件最近的 Context Provider 值。", "组件需要消费祖先 Provider 提供的跨层级状态时使用。"],
  createOptimisticStore: ["创建支持 Action 事务和自动回滚的乐观 Store。", "对象或数组状态需要立即展示暂存修改，并在异步操作失败时恢复时使用。"],
  createProjection: ["创建派生 Store，相当于 Store 版本的 `createMemo`。", "需要通过 draft 增量计算结构化派生状态，并保留细粒度更新时使用。"],
  createStore: ["创建由 Proxy 支撑的深层响应式 Store。", "管理对象或数组状态，并让消费者只订阅实际读取的属性时使用。"],
  deep: ["返回 Store 的普通深拷贝，同时让当前追踪作用域订阅整个子树的变化。", "消费者需要普通对象，并希望任意深层写入都能使其失效时使用。"],
  merge: ["把多个 props 风格对象合并为保持响应性的代理，后面的来源覆盖前面的来源。", "组合默认 props、外部 props 和派生 props，同时保留 getter 与响应式读取时使用。"],
  omit: ["返回隐藏指定键、但其余属性仍保持响应性的 props 代理。", "向子组件转发大部分 props，同时排除少量本地消费字段时使用。"],
  reconcile: ["创建用于智能协调 Store draft 的更新函数，只修改真正变化的叶子节点。", "把服务端数据合并进现有 Store，并通过默认 `id` 或指定 key 保留数组项目身份时使用。"],
  snapshot: ["创建 Store 当前值的普通、非响应式深拷贝。", "向日志、序列化、结构化克隆或网络层传递稳定普通对象时使用。"],
  storePath: ["为 `createStore` 创建基于路径的 draft 更新函数。", "需要把动态属性路径和值组合成可传给 Store setter 的更新器时使用。"],
  action: ["创建跨越异步间隙的事务式 mutation，并协调暂存写入、确认与失败回滚。", "乐观更新需要等待服务端结果，且中间状态不能泄漏到事务外部时使用。"],
  onCleanup: ["向当前 Owner 注册清理回调。", "释放定时器、事件监听、订阅或其他必须随组件和响应式作用域销毁的资源。"],
  onSettled: ["在当前 Owner 内所有异步读取完成且响应式队列稳定后，执行一次回调。", "需要等待整个局部响应式图稳定后再执行收尾逻辑时使用。"],
  refresh: ["主动使一个可刷新响应式来源失效，强制它重新执行。", "输入未变化但仍需重新请求或重算 Solid accessor、Projection Store 时使用。"],
  createRoot: ["创建可独立销毁的响应式根作用域。", "在组件树之外创建信号、memo 和 effect，并需要显式控制其生命周期时使用。"],
  getObserver: ["返回当前正在追踪依赖的 Observer；未处于追踪作用域时返回 `null`。", "自定义响应式原语需要判断当前读取是否会被订阅时使用。"],
  getOwner: ["返回当前响应式 Owner，也就是新建原语和清理逻辑将要挂载的生命周期节点。", "需要捕获当前生命周期上下文，稍后配合 `runWithOwner` 恢复时使用。"],
  isDisposed: ["判断指定 Owner 是否已销毁或正等待销毁。", "异步回调返回较晚，需要避免操作已经卸载的组件或作用域时使用。"],
  runWithOwner: ["在指定 Owner 上下文中执行函数。", "异步边界或外部回调中创建响应式原语，并希望它们仍归属于原 Owner 时使用。"],
  affects: ["声明当前事务将影响指定响应式数据及其派生值，使 `isPending` 可以观察等待状态。", "异步 Action 开始后需要标记哪些数据正在变化，但仍允许读取旧值时使用。"],
  flatten: ["把 children 值解析为可渲染形式：展开访问器和嵌套数组，并可跳过空渲染值。", "自定义控制流或渲染器需要遍历和规范化 children 树时使用。"],
  resolve: ["等待响应式表达式首次完全稳定，并以 Promise 返回结果。", "表达式可能读取尚未就绪的异步 memo 或 signal，需要等待其可同步返回时使用。"],
  Dynamic: ["渲染运行时指定的原生标签或自定义组件，并转发其他 props。", "组件类型由响应式数据决定，无法在 JSX 编写阶段固定时使用。"],
  Errored: ["捕获子树中未处理的错误，并渲染 fallback。", "组件区域需要隔离错误，并通过 fallback 或 `reset()` 提供恢复入口时使用。"],
  For: ["根据列表创建并复用元素。", "渲染响应式数组，并需要 keyed 或非 keyed 更新策略以及空列表 fallback 时使用。"],
  Hydration: ["在 `<NoHydration>` 区域内重新启用 hydration；客户端普通渲染时直接透传 children。", "外层区域跳过 hydration，但其中某个子树仍需要恢复交互时使用。"],
  Loading: ["在子树中的异步读取完成前渲染 fallback。", "lazy 组件、异步 memo、异步 signal 或 Store 需要声明局部加载边界时使用。"],
  Match: ["定义 `<Switch>` 中的一个条件分支。", "多个互斥条件需要按顺序选择首个真值分支时使用。"],
  NoHydration: ["在客户端 hydration 阶段跳过其子树，保留现有 DOM 不做接管。", "服务端输出的静态区域不需要客户端响应式绑定时使用。"],
  Portal: ["把 children 渲染到 DOM 的其他挂载点。", "模态框、提示层或需要脱离 `overflow: hidden` 容器的浮层内容使用。"],
  Repeat: ["根据 count 创建并复用指定数量的元素。", "列表只由数量驱动，回调只需要项目索引，并需要零数量 fallback 时使用。"],
  Reveal: ["协调同级 `<Loading>` 边界显示真实内容的顺序。", "多个异步区域需要按顺序或统一时机揭示，避免页面内容无序跳动时使用。"],
  Show: ["条件为真时渲染 children，否则渲染可选 fallback。", "单一条件需要切换一块 JSX，并希望函数 children 获得收窄后的值时使用。"],
  Switch: ["在多个互斥条件中渲染第一个成立的 `<Match>`。", "条件分支超过两个，或需要统一 fallback 时使用。"],
  hydrate: ["接管服务端已经生成的 DOM，附加事件和响应式绑定而不重新创建节点。", "客户端启动 SSR 应用，并需要保留现有 DOM 与服务端状态时使用。"],
  render: ["把组件树渲染到指定 DOM 容器，并返回销毁函数。", "纯客户端应用挂载根组件，或独立挂载一棵组件子树时使用。"],
  renderToStream: ["流式输出 HTML：先发送同步 shell，再随着异步 `<Loading>` 边界完成逐步输出片段。", "服务端渲染对首字节时间敏感，并希望渐进传输异步内容时使用。"],
  renderToString: ["同步把组件树渲染为 HTML 字符串。", "服务端只需要同步结果，异步区域允许输出 `<Loading>` fallback 时使用。"],
  renderToStringAsync: ["等待组件子树中的异步读取全部完成后，返回完整 HTML 字符串。", "需要完全稳定的服务端 HTML 且可以接受等待全部异步任务时使用；该 API 已弃用。"],
  isHref: ["判断值是否带有 `Href` 品牌标记。", "处理 redirect 等响应辅助值，需要跨重复模块实例可靠识别 Href 时使用。"],
  isResponseEnvelope: ["判断值是否为 `ResponseEnvelope`。", "服务端函数或传输层需要识别带响应元数据的返回值时使用。"],
  redirect: ["创建跳转到指定 URL 的响应，默认状态码为 302。", "服务端函数、Action 或渐进增强表单需要通知客户端执行导航时使用。"],
  reload: ["创建要求重新验证指定缓存键的空响应；省略键时重新验证全部。", "mutation 完成后只需要通知调用方重新获取数据时使用。"],
  respond: ["把业务值与状态码、响应头和 revalidate 信息组合为响应信封。", "普通返回值不足以表达 HTTP 元数据，同时还要让脚本调用方透明取得业务值时使用。"],
  claimElement: ["把一个 DOM 元素交给已注册的元素认领消费者处理。", "编译器生成元素时通知导航或框架集成层；处理器必须保持幂等。"],
  claimElementTree: ["遍历并认领根节点内与导航相关的链接和表单元素。", "SSR 范围或流式内容直接进入 DOM、没有经过编译器创建流程时使用。"],
  dynamic: ["根据响应式或异步来源返回身份稳定的动态组件。", "组件类型会在运行时变化，同时还需要像普通组件一样接收 props 和 children 时使用。"],
  registerElementClaim: ["注册编译器元素认领事件的消费者，并返回取消注册函数。", "路由器或框架集成需要观察新建及属性更新后的链接、表单元素时使用。"],
};

const reactiveUtilitiesDemo = `import {
  children, createComponent, createContext, createSignal,
  createUniqueId, isEqual, untrack, useContext
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
  return <Locale value="中文"><main><h3>响应式工具</h3><ContextValue /><p id={id}>快照：{snapshot}</p><p>结构相等：{String(same)}</p>{badge}{content()}</main></Locale>;
}

render(() => <App />, document.getElementById("root")!);`;

const controlFlowDemo = `import { Errored, Match, Repeat, Show, Switch } from "__PACKAGE__";
import { render } from "@solidjs/web";

function App() {
  console.log("控制流", { show: true, match: "第二项", repeat: 3 });
  return <main><h3>控制流组合</h3><Show when={true} fallback={<p>隐藏</p>}><p>Show：可见</p></Show><Switch fallback={<p>无匹配项</p>}><Match when={false}><p>第一项</p></Match><Match when={true}><p>Switch：第二项</p></Match></Switch><ul><Repeat count={3}>{index => <li>Repeat {index + 1}</li>}</Repeat></ul><Errored fallback={error => <p>Errored：{error.message}</p>}><p>边界内内容正常</p></Errored></main>;
}

render(() => <App />, document.getElementById("root")!);`;

const responseHelpersDemo = `import { getRequestEvent, isHref, isResponseEnvelope, redirect, reload, respond, render } from "@solidjs/web";

function App() {
  const event = getRequestEvent();
  const location = "/guide";
  const redirectResponse = redirect(location, 302);
  const reloadResponse = reload();
  const envelope = respond({ saved: true }, { status: 201 });
  console.log("响应状态", { redirect: redirectResponse.status, reload: reloadResponse.status, envelope: isResponseEnvelope(envelope) });
  return <main><h3>响应辅助函数</h3><p>请求上下文：{event ? "存在" : "当前为浏览器环境"}</p><p>Href：{String(isHref(location))}</p><p>Envelope：{String(isResponseEnvelope(envelope))}</p><p>Redirect：{redirectResponse.status}</p><p>Reload：{reloadResponse.status}</p></main>;
}

render(() => <App />, document.getElementById("root")!);`;

const domMutationDemo = `import { createSignal, flush } from "solid-js";
import { applyRef, assign, className, createComponent, dynamicProperty, insert, memo, ref, render, scope, setAttribute, setAttributeNS, setProperty, setStyleProperty, spread, style, template, untrack } from "@solidjs/web";

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
  applyRef(() => { refApplied = true; }, button);
  ref(() => () => { refApplied = true; }, button);
  insert(button, label);
  const props = { get current() { return label(); } };
  const current = dynamicProperty(props, "current");
  const cached = memo(() => label(), true);
  const scoped = scope(() => cached());
  const plain = untrack(() => label());
  const Label = (value: { text: string }) => <p>{value.text}</p>;
  const component = createComponent(Label, { text: "createComponent 已运行" });
  console.log("DOM 节点", { tag: button.tagName, refApplied, label: plain });
  queueMicrotask(() => { setLabel("更新后的按钮"); flush(); });
  return <main><h3>DOM 运行时</h3>{button}{svg}{component}<p>ref：{String(refApplied)}</p><p>dynamicProperty：{String(current)}</p><p>memo / scope：{scoped()}</p><p>untrack：{plain}</p></main>;
}

render(() => <App />, document.getElementById("root")!);`;

const storeUtilitiesDemo = `import { createStore, isWrappable, merge, omit, storePath } from "solid-js";
import { render } from "@solidjs/web";

function App() {
  const [state, setState] = createStore({ profile: { name: "Ada", role: "admin" } });
  const updateName = storePath("profile", "name", () => "Lin");
  setState(updateName);
  const combined = merge({ name: state.profile.name }, { role: state.profile.role });
  const publicProfile = omit(combined, "role");
  console.log("Store 工具", { name: state.profile.name, wrappable: isWrappable(state) });
  return <main><h3>Store 工具</h3><p>可包装：{String(isWrappable(state))}</p><p>合并：{combined.name} / {combined.role}</p><p>省略字段：{JSON.stringify(publicProfile)}</p></main>;
}

render(() => <App />, document.getElementById("root")!);`;

const ownerLifecycleDemo = `import { createRoot, createSignal, getObserver, getOwner, isDisposed, onCleanup, onSettled, runWithOwner } from "solid-js";
import { render } from "@solidjs/web";

function App() {
  const appOwner = getOwner();
  const observer = getObserver();
  const [events, setEvents] = createSignal<string[]>([]);
  let nestedOwner = appOwner!;
  const dispose = createRoot(dispose => {
    nestedOwner = getOwner()!;
    onCleanup(() => { setEvents(items => [...items, "cleanup"]); });
    onSettled(() => { setEvents(items => [...items, "settled"]); });
    runWithOwner(nestedOwner, () => setEvents(items => [...items, "runWithOwner"]));
    return dispose;
  });
  const before = isDisposed(nestedOwner);
  dispose();
  const after = isDisposed(nestedOwner);
  console.log("Owner 状态", { before, after, events: events() });
  return <main><h3>Owner 生命周期</h3><p>Owner：{appOwner ? "存在" : "缺失"}</p><p>Observer：{observer ? "存在" : "当前无观察者"}</p><p>释放状态：{String(before)} → {String(after)}</p><ul>{events().map(item => <li>{item}</li>)}</ul></main>;
}

render(() => <App />, document.getElementById("root")!);`;

const webOwnerDemo = `import { getOwner, render } from "@solidjs/web";

function App() {
  const owner = getOwner();
  console.log("Web Owner", { exists: Boolean(owner) });
  return <main><h3>Web Owner</h3><p>{owner ? "当前组件拥有 Owner" : "未找到 Owner"}</p></main>;
}

render(() => <App />, document.getElementById("root")!);`;

const asyncUtilitiesDemo = `import { affects, createSignal, flatten, flush, isPending, latest } from "solid-js";
import { render } from "@solidjs/web";

function App() {
  const [value, setValue] = createSignal("初始");
  affects(value);
  const newest = latest(() => value());
  const pending = isPending(() => Promise.resolve("完成"));
  const flattened = flatten([<span>第一项</span>, [<span>第二项</span>]]);
  queueMicrotask(() => { setValue("更新"); flush(); });
  console.log("异步工具", { newest, pending });
  return <main><h3>异步与互操作</h3><p>latest：{newest}</p><p>pending：{String(pending)}</p><div>{flattened}</div></main>;
}

render(() => <App />, document.getElementById("root")!);`;

const optimisticDemo = `import { createOptimistic, flush } from "solid-js";
import { render } from "@solidjs/web";

function App() {
  const [value, setValue] = createOptimistic(1);
  setValue(2);
  flush();
  console.log("Optimistic Signal", { value: value() });
  return <main><h3>Optimistic Signal</h3><p>当前值：{value()}</p></main>;
}

render(() => <App />, document.getElementById("root")!);`;

const projectionDemo = `import { createOptimisticStore, createProjection, flush, refresh } from "solid-js";
import { render } from "@solidjs/web";

function App() {
  const projected = createProjection(draft => { draft.total = 2; }, { total: 0 });
  const [optimistic, setOptimistic] = createOptimisticStore({ status: "初始", count: 1 });
  setOptimistic(draft => { draft.status = "已更新"; draft.count = 2; });
  refresh(projected);
  flush();
  console.log("Store 投影", { total: projected.total, optimistic: optimistic.status });
  return <main><h3>Store 投影</h3><p>Projection：{projected.total}</p><p>Optimistic：{optimistic.status} / {optimistic.count}</p></main>;
}

render(() => <App />, document.getElementById("root")!);`;

const hydrationToggleDemo = `import { enableHydration } from "solid-js";
import { render } from "@solidjs/web";

function App() {
  enableHydration();
  console.log("Hydration", { enabled: true });
  return <main><h3>Hydration 已启用</h3><p>后续渲染可读取 Hydration 上下文。</p></main>;
}

render(() => <App />, document.getElementById("root")!);`;

const delegatedEventsDemo = `import { createSignal, flush } from "solid-js";
import { addEvent, delegateEvents, getDelegatedRoot, registerDelegatedContainer, registerDelegatedRoot, render, unregisterDelegatedContainer, unregisterDelegatedRoot } from "@solidjs/web";

function App() {
  const root = document.getElementById("root")!;
  const [clicks, setClicks] = createSignal(0);
  const button = document.createElement("button");
  button.textContent = "触发事件";
  root.append(button);
  registerDelegatedRoot(root);
  registerDelegatedContainer(root);
  delegateEvents(["click"]);
  addEvent(button, "click", () => setClicks(value => value + 1), false);
  button.click();
  flush();
  const delegatedRoot = getDelegatedRoot(button);
  unregisterDelegatedContainer(root);
  unregisterDelegatedRoot(root);
  console.log("事件委托", { clicks: clicks(), delegatedRoot: Boolean(delegatedRoot) });
  return <main><h3>事件委托</h3>{button}<p>点击次数：{clicks()}</p><p>找到委托根：{String(Boolean(delegatedRoot))}</p></main>;
}

render(() => <App />, document.getElementById("root")!);`;

const elementClaimsDemo = `import { claimElement, claimElementTree, registerElementClaim, render } from "@solidjs/web";

function App() {
  const claimed: string[] = [];
  const stop = registerElementClaim(element => { claimed.push(element.tagName); });
  const section = document.createElement("section");
  section.innerHTML = "<a href='/guide'>指南</a><form></form>";
  claimElement(section);
  claimElementTree(section);
  stop();
  console.log("元素认领", { claimed });
  return <main><h3>元素认领</h3>{section}<p>认领记录：{claimed.join(", ") || "没有匹配元素"}</p></main>;
}

render(() => <App />, document.getElementById("root")!);`;

const runtimeEffectDemo = `import { createSignal, flush } from "solid-js";
import { effect, render } from "@solidjs/web";

function App() {
  const [value, setValue] = createSignal(1);
  const [observed, setObserved] = createSignal(0);
  effect(
    () => value(),
    next => { setObserved(next); }
  );
  queueMicrotask(() => { setValue(2); flush(); console.log("运行时 effect", { observed: observed() }); });
  return <main><h3>运行时 Effect</h3><p>观察值：{observed()}</p></main>;
}

render(() => <App />, document.getElementById("root")!);`;

const hydrationAssetsDemo = `import { enableHydration } from "solid-js";
import { Assets, HydrationScript, acquireAsset, generateHydrationScript, getAssets, getHydrationKey, getNextElement, getNextMarker, getNextMatch, render, runHydrationEvents, useAssets } from "@solidjs/web";

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
  console.log("Hydration 与 Assets", { assets, hydrationScript, hydrationKey, nextElement: nextElement.tagName, match: match?.tagName, marker: marker?.nodeName, collected: collected.length });
  return <main class="asset-demo"><h3>Hydration 与 Assets</h3><Assets><meta name="api-demo" content="assets" /></Assets><HydrationScript /><p>Hydration key：{hydrationKey ?? "当前无 key"}</p><p>模板节点：{nextElement.tagName}</p><p>匹配节点：{match?.tagName ?? "无"}</p></main>;
}

render(() => <App />, document.getElementById("root")!, undefined, { renderId: "api-demo" });`;

const externalSourceDemo = `import { createMemo, createSignal, enableExternalSource, flush } from "solid-js";
import { render } from "@solidjs/web";

function App() {
  let disposed = false;
  enableExternalSource({
    factory: compute => ({
      track: previous => compute(previous),
      dispose: () => { disposed = true; }
    }),
    untrack: fn => fn()
  });
  const [value, setValue] = createSignal(2);
  const doubled = createMemo(() => value() * 2);
  queueMicrotask(() => { setValue(3); flush(); console.log("外部响应源", { value: value(), doubled: doubled(), disposed }); });
  return <main><h3>外部响应源桥接</h3><p>值：{value()}</p><p>派生：{doubled()}</p></main>;
}

render(() => <App />, document.getElementById("root")!);`;

const hydrateDemo = `import { hydrate } from "@solidjs/web";

function App() {
  return <main><h3>Hydration 完成</h3><p>已有服务端 DOM 已交给客户端。</p></main>;
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
    setEvents(items => [...items, \`追踪值：\${value}\`]);
    return () => { setEvents(items => [...items, \`清理值：\${value}\`]); };
  });
  queueMicrotask(() => { setCount(1); flush(); });
  return <main><h3>Tracked Effect</h3><ol>{events().map(item => <li>{item}</li>)}</ol></main>;
}

render(() => <App />, document.getElementById("root")!);`,

  "solid-js/deep": `import { createEffect, createSignal, createStore, deep, flush } from "solid-js";
import { render } from "@solidjs/web";

function App() {
  const [state, setState] = createStore({ profile: { name: "Ada", score: 1 } });
  const [view, setView] = createSignal({ name: "", score: 0 });
  createEffect(
    () => deep(state),
    plain => { setView(plain.profile); }
  );
  queueMicrotask(() => {
    setState(draft => { draft.profile.score = 2; });
    flush();
  });
  return <main><h3>深层快照</h3><p>{view().name} · {view().score} 分</p></main>;
}

render(() => <App />, document.getElementById("root")!);`,

  "solid-js/flush": `import { createSignal, flush } from "solid-js";
import { render } from "@solidjs/web";

function App() {
  const [count, setCount] = createSignal(0);
  queueMicrotask(() => { setCount(3); flush(); });
  return <main><h3>同步提交结果</h3><strong>当前值：{count()}</strong></main>;
}

render(() => <App />, document.getElementById("root")!);`,

  "solid-js/mapArray": `import { createSignal, flush, mapArray } from "solid-js";
import { render } from "@solidjs/web";

function App() {
  const [items, setItems] = createSignal([{ id: 1, name: "Ada" }, { id: 2, name: "Grace" }]);
  const mapped = mapArray(items, item => ({ ...item, label: item.name.toUpperCase() }));
  queueMicrotask(() => { setItems([{ id: 1, name: "Ada Lovelace" }]); flush(); });
  return <main><h3>映射结果</h3><ul>{mapped().map(item => <li>{item.id} · {item.label}</li>)}</ul></main>;
}

render(() => <App />, document.getElementById("root")!);`,

  "solid-js/repeat": `import { createSignal, flush, repeat } from "solid-js";
import { render } from "@solidjs/web";

function App() {
  const [count, setCount] = createSignal(2);
  const rows = repeat(count, index => <li>项目 {index + 1}</li>);
  queueMicrotask(() => { setCount(4); flush(); });
  return <main><h3>重复项目</h3><ul>{rows()}</ul></main>;
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
  queueMicrotask(async () => { setResult(await save(3)); flush(); });
  return <main><h3>Action 结果</h3><strong>{result() ?? "处理中"}</strong></main>;
}

render(() => <App />, document.getElementById("root")!);`,

  "solid-js/resolve": `import { createSignal, flush, resolve } from "solid-js";
import { render } from "@solidjs/web";

function App() {
  const [result, setResult] = createSignal({ ready: false, value: 0 });
  queueMicrotask(async () => {
    setResult(await resolve(() => ({ ready: true, value: 42 })));
    flush();
  });
  return <main><h3>稳定结果</h3><p>状态：{result().ready ? "就绪" : "等待"}</p><strong>{result().value}</strong></main>;
}

render(() => <App />, document.getElementById("root")!);`,

  "solid-js/lazy": `import { lazy } from "solid-js";
import { Loading, render } from "@solidjs/web";

const LazyMessage = lazy(() => Promise.resolve({
  default: () => <p>懒加载组件已运行</p>
}));

function App() {
  return <main><h3>Lazy 组件</h3><Loading fallback={<p>加载中</p>}><LazyMessage /></Loading></main>;
}

render(() => <App />, document.getElementById("root")!);`,

  "For": `import { For } from "__PACKAGE__";
import { createSignal, flush } from "solid-js";
import { render } from "@solidjs/web";

function App() {
  const [items, setItems] = createSignal(["Ada", "Grace"]);
  queueMicrotask(() => {
    setItems(["Ada", "Lin"]);
    flush();
    console.log("列表更新", items());
  });
  return <main><h3>成员列表</h3><ul><For each={items()}>{item => <li>{item}</li>}</For></ul></main>;
}

render(() => <App />, document.getElementById("root")!);`,

  "Hydration": `import { Hydration } from "__PACKAGE__";
import { render } from "@solidjs/web";

function App() {
  return <main><h3>Hydration 边界</h3><Hydration><p>Hydration 子树</p></Hydration></main>;
}

render(() => <App />, document.getElementById("root")!);`,

  "Loading": `import { Loading } from "__PACKAGE__";
import { render } from "@solidjs/web";

function App() {
  return <main><h3>内容状态</h3><Loading fallback={<p>加载中</p>}><p>内容已就绪</p></Loading></main>;
}

render(() => <App />, document.getElementById("root")!);`,

  "NoHydration": `import { NoHydration } from "__PACKAGE__";
import { render } from "@solidjs/web";

function App() {
  return <main><h3>非 Hydration 区域</h3><NoHydration><p>静态子树</p></NoHydration></main>;
}

render(() => <App />, document.getElementById("root")!);`,

  "Reveal": `import { Reveal } from "__PACKAGE__";
import { Loading } from "solid-js";
import { render } from "@solidjs/web";

function App() {
  return <main><h3>顺序展示</h3><Reveal order="sequential"><Loading fallback="等待"><p>第一段</p></Loading><Loading fallback="等待"><p>第二段</p></Loading></Reveal></main>;
}

render(() => <App />, document.getElementById("root")!);`,

  "@solidjs/web/Dynamic": `import { Dynamic, render } from "@solidjs/web";

function App() {
  return <main><h3>动态元素</h3><Dynamic component="section" data-kind="dynamic">动态组件内容</Dynamic></main>;
}

render(() => <App />, document.getElementById("root")!);`,

  "@solidjs/web/Portal": `import { Portal, render } from "@solidjs/web";

function App() {
  const modalRoot = document.getElementById("modal-root")!;
  return <main><h3>Portal 源位置</h3><p>内容会挂载到目标容器。</p><Portal mount={modalRoot}><aside><strong>Portal 真实内容</strong></aside></Portal></main>;
}

render(() => <App />, document.getElementById("root")!);`,

  "@solidjs/web/render": `import { render } from "@solidjs/web";

function App() {
  return <main><h1>客户端渲染成功</h1><p>这段 JSX 已挂载到页面。</p></main>;
}

render(() => <App />, document.getElementById("root")!);`,

  "@solidjs/web/renderToString": `import { renderToString } from "@solidjs/web";

const App = () => <main><h1>真实 SSR</h1><p>renderToString 已执行</p></main>;
const html = renderToString(() => <App />);
console.log(html);`,

  "@solidjs/web/renderToStringAsync": `import { renderToStringAsync } from "@solidjs/web";

const App = () => <main><h1>异步 SSR</h1><p>完整内容已就绪</p></main>;
const html = await renderToStringAsync(() => <App />);
console.log(html);`,

  "@solidjs/web/renderToStream": `import { renderToStream } from "@solidjs/web";

const App = () => <main><h1>流式 SSR</h1><p>服务端流已完成</p></main>;
const stream = renderToStream(() => <App />);
const html = await new Promise<string>(resolve => stream.then(resolve));
console.log(html);`,

  "@solidjs/web/dynamic": `import { createSignal, flush } from "solid-js";
import { dynamic, render } from "@solidjs/web";

function App() {
  const [multiline, setMultiline] = createSignal(false);
  const Field = dynamic(() => multiline() ? "textarea" : "input");
  queueMicrotask(() => { setMultiline(true); flush(); });
  return <main><h3>动态表单控件</h3><p>当前元素：{multiline() ? "TEXTAREA" : "INPUT"}</p><Field value="真实动态组件" /></main>;
}

render(() => <App />, document.getElementById("root")!);`,

  "solid-js/createSignal": `import { createSignal, flush } from "solid-js";
import { render } from "@solidjs/web";

function App() {
  const [count, setCount] = createSignal(0);
  queueMicrotask(() => { setCount(2); flush(); });
  return <main><h3>计数器状态</h3><strong>当前值：{count()}</strong><p>Signal 更新会同步到视图。</p></main>;
}

render(() => <App />, document.getElementById("root")!);`,

  "solid-js/createMemo": `import { createMemo, createSignal, flush } from "solid-js";
import { render } from "@solidjs/web";

function App() {
  const [price, setPrice] = createSignal(20);
  const total = createMemo(() => price() * 1.13);
  queueMicrotask(() => { setPrice(40); flush(); });
  return <main><h3>价格计算</h3><p>原价：¥{price()}</p><strong>含税价：¥{total().toFixed(2)}</strong></main>;
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
      setRecords(items => [...items, \`\${previous ?? "初始"} → \${next}\`]);
    }
  );
  queueMicrotask(() => {
    setCount(1);
    flush();
    console.log("Effect 记录", records());
  });
  return <main><h3>Effect 执行记录</h3><ol>{records().map(item => <li>{item}</li>)}</ol></main>;
}

render(() => <App />, document.getElementById("root")!);`,

  "solid-js/createRenderEffect": `import { createRenderEffect, createSignal, flush } from "solid-js";
import { render } from "@solidjs/web";

function App() {
  const [text, setText] = createSignal("第一次渲染");
  const paragraph = document.createElement("p");
  createRenderEffect(
    () => text(),
    value => { paragraph.textContent = value; }
  );
  queueMicrotask(() => { setText("响应式更新完成"); flush(); });
  return <main><h3>Render Effect</h3>{paragraph}</main>;
}

render(() => <App />, document.getElementById("root")!);`,

  "solid-js/createStore": `import { createStore, flush } from "solid-js";
import { render } from "@solidjs/web";

function App() {
  const [state, setState] = createStore({
    user: { name: "Ada", age: 36 },
    todos: [] as { id: string; text: string }[]
  });
  queueMicrotask(() => {
    setState(draft => {
      draft.user.age = 37;
      draft.todos.push({ id: "1", text: "验证真实 Store 更新" });
    });
    flush();
  });
  return <main><h3>{state.user.name} · {state.user.age} 岁</h3><ul>{state.todos.map(todo => <li>{todo.text}</li>)}</ul></main>;
}

render(() => <App />, document.getElementById("root")!);`,

  "solid-js/reconcile": `import { createStore, reconcile } from "solid-js";
import { render } from "@solidjs/web";

function App() {
  const [rows, setRows] = createStore([
    { id: 1, name: "Ada" },
    { id: 2, name: "Grace" }
  ]);
  const firstRow = rows[0];
  setRows(reconcile([
    { id: 1, name: "Ada Lovelace" },
    { id: 3, name: "Lin" }
  ]));
  const identityPreserved = rows[0] === firstRow;
  return <main><h3>协调结果</h3><p>首项身份：{identityPreserved ? "已保留" : "已替换"}</p><ul>{rows.map(row => <li>{row.id} · {row.name}</li>)}</ul></main>;
}

render(() => <App />, document.getElementById("root")!);`,

  "solid-js/snapshot": `import { createStore, snapshot } from "solid-js";
import { render } from "@solidjs/web";

function App() {
  const [state] = createStore({ user: { name: "Ada" }, todos: [] as string[] });
  const plain = snapshot(state);
  return <main><h3>普通对象快照</h3><pre>{JSON.stringify(plain, null, 2)}</pre></main>;
}

render(() => <App />, document.getElementById("root")!);`,

  "solid-js/createReaction": `import { createReaction, createSignal, flush } from "solid-js";
import { render } from "@solidjs/web";

function App() {
  const [count, setCount] = createSignal(0);
  const [status, setStatus] = createSignal("等待变化");
  const track = createReaction(() => {
    setStatus(\`已响应 count = \${count()}\`);
    track(() => count());
  });
  track(() => count());
  queueMicrotask(() => { setCount(1); flush(); });
  return <main><h3>Reaction 状态</h3><p>{status()}</p></main>;
}

render(() => <App />, document.getElementById("root")!);`,

  "solid-js/createRoot": `import { createRoot, createSignal, flush } from "solid-js";
import { render } from "@solidjs/web";

function App() {
  const scope = createRoot(dispose => {
    const [value, setValue] = createSignal(0);
    return { value, setValue, dispose };
  });
  queueMicrotask(() => {
    scope.setValue(2);
    flush();
    scope.dispose();
  });
  return <main><h3>独立响应式作用域</h3><strong>作用域值：{scope.value()}</strong></main>;
}

render(() => <App />, document.getElementById("root")!);`,
};
