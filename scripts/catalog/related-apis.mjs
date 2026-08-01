const comparisons = {
  "solid-js/createSignal": {
    "solid-js/createStore": [
      "Choose `createStore` when nested object or array fields need independent reactive updates.",
      "嵌套对象或数组字段需要独立响应式更新时选择 `createStore`。",
    ],
  },
  "solid-js/createStore": {
    "solid-js/createSignal": [
      "Choose `createSignal` for a single value or when updates should replace the value as a whole.",
      "单个值或希望每次整体替换状态时选择 `createSignal`。",
    ],
    "solid-js/reconcile": [
      "Use `reconcile` when applying immutable data while preserving compatible Store identities.",
      "把不可变数据写入 Store 且希望保留兼容对象身份时使用 `reconcile`。",
    ],
  },
  "solid-js/createEffect": {
    "solid-js/createRenderEffect": [
      "Choose `createRenderEffect` only when the side effect must run during the render phase.",
      "副作用必须在渲染阶段立即执行时才选择 `createRenderEffect`。",
    ],
    "solid-js/createComputed": [
      "Choose `createComputed` for synchronous reactive writes that do not represent an external side effect.",
      "需要同步执行响应式写入、且不代表外部副作用时选择 `createComputed`。",
    ],
  },
  "solid-js/createRenderEffect": {
    "solid-js/createEffect": [
      "Prefer `createEffect` for ordinary external side effects that may run after rendering.",
      "普通外部副作用应优先使用可在渲染后执行的 `createEffect`。",
    ],
  },
  "solid-js/mapArray": {
    "solid-js/indexArray": [
      "Choose `indexArray` when positions are stable and values at those positions change frequently.",
      "位置稳定但各位置的值经常变化时选择 `indexArray`。",
    ],
  },
  "solid-js/indexArray": {
    "solid-js/mapArray": [
      "Choose `mapArray` when item identity should survive insertion, removal, and reordering.",
      "项目身份需要在插入、删除和重排后继续保留时选择 `mapArray`。",
    ],
  },
  "@solidjs/web/render": {
    "@solidjs/web/hydrate": [
      "Choose `hydrate` when matching server-rendered DOM already exists in the mount container.",
      "挂载容器中已经存在匹配的服务端 DOM 时选择 `hydrate`。",
    ],
  },
  "@solidjs/web/hydrate": {
    "@solidjs/web/render": [
      "Choose `render` when the client must create the DOM instead of reusing server-rendered nodes.",
      "客户端需要创建 DOM、而不是复用服务端节点时选择 `render`。",
    ],
  },
  "@solidjs/web/renderToString": {
    "@solidjs/web/renderToStringAsync": [
      "Choose the async variant when the complete HTML must wait for asynchronous boundaries.",
      "完整 HTML 必须等待异步边界完成时选择异步版本。",
    ],
    "@solidjs/web/renderToStream": [
      "Choose streaming when the synchronous shell should reach the client before all async content resolves.",
      "需要在异步内容全部完成前先向客户端发送同步 shell 时选择流式输出。",
    ],
  },
  "@solidjs/web/renderToStream": {
    "@solidjs/web/renderToString": [
      "Choose `renderToString` when the response must be complete before it is sent.",
      "响应必须完整生成后再发送时选择 `renderToString`。",
    ],
  },
  "solid-js/action": {
    "solid-js/createOptimistic": [
      "Use `createOptimistic` for one optimistic value inside an action transition.",
      "Action 事务中只需要管理一个乐观值时使用 `createOptimistic`。",
    ],
  },
  "solid-js/createOptimistic": {
    "solid-js/action": [
      "Use `action` to coordinate the asynchronous operation that confirms or rolls back optimistic state.",
      "需要协调确认或回滚乐观状态的异步操作时使用 `action`。",
    ],
  },
  "solid-js/children": {
    "solid-js/createMemo": [
      "Use `createMemo` for general derived values; `children` additionally normalizes component child resolution.",
      "普通派生值使用 `createMemo`；`children` 还会规范化组件 children 的解析。",
    ],
  },
  "solid-js/createMemo": {
    "solid-js/createEffect": [
      "Choose `createEffect` when the computation exists to perform an external side effect rather than return a cached value.",
      "计算的目的不是返回缓存值、而是执行外部副作用时选择 `createEffect`。",
    ],
  },
  "solid-js/createContext": {
    "solid-js/useContext": [
      "`createContext` defines the channel and Provider; descendants call `useContext` to read its nearest value.",
      "`createContext` 定义通道和 Provider；后代组件通过 `useContext` 读取最近的值。",
    ],
  },
  "solid-js/useContext": {
    "solid-js/createContext": [
      "Call `createContext` once when defining the shared channel before consumers read it with `useContext`.",
      "先用 `createContext` 定义共享通道，再由消费者通过 `useContext` 读取。",
    ],
  },
  "solid-js/createReaction": {
    "solid-js/createEffect": [
      "Choose `createEffect` for continuously tracked side effects; use `createReaction` when tracking is armed explicitly.",
      "持续自动追踪副作用时选择 `createEffect`；需要显式重新建立追踪时使用 `createReaction`。",
    ],
  },
  "solid-js/createOptimisticStore": {
    "solid-js/createOptimistic": [
      "Choose `createOptimistic` for one value; use the Store variant for nested objects and arrays with fine-grained writes.",
      "单个值使用 `createOptimistic`；嵌套对象和数组需要细粒度写入时使用 Store 版本。",
    ],
  },
  "solid-js/deep": {
    "solid-js/snapshot": [
      "Choose `snapshot` for an untracked plain copy; `deep` additionally subscribes the current computation to the whole subtree.",
      "只需要不追踪的普通副本时选择 `snapshot`；`deep` 还会让当前计算订阅整个子树。",
    ],
  },
  "solid-js/snapshot": {
    "solid-js/deep": [
      "Choose `deep` when producing a plain copy should also track every nested change in the source Store.",
      "生成普通副本时还需要追踪来源 Store 的所有深层变化，应选择 `deep`。",
    ],
  },
  "solid-js/merge": {
    "solid-js/omit": [
      "Use `merge` to combine reactive prop sources; use `omit` to expose one source while hiding selected keys.",
      "组合多个响应式 props 来源时使用 `merge`；隐藏单个来源中的部分键时使用 `omit`。",
    ],
  },
  "solid-js/onCleanup": {
    "solid-js/createRoot": [
      "Use `createRoot` when code outside a component needs an explicit Owner and disposer for its cleanup callbacks.",
      "组件外代码需要显式 Owner 和 disposer 来管理清理回调时使用 `createRoot`。",
    ],
  },
  "solid-js/getOwner": {
    "solid-js/runWithOwner": [
      "Capture an Owner with `getOwner`, then use `runWithOwner` when later work must create primitives in that lifecycle scope.",
      "先用 `getOwner` 捕获 Owner；后续工作需要在该生命周期中创建原语时使用 `runWithOwner`。",
    ],
  },
  "solid-js/runWithOwner": {
    "solid-js/getOwner": [
      "Obtain the lifecycle scope with `getOwner` before crossing the asynchronous or external callback boundary.",
      "跨越异步或外部回调边界前，先用 `getOwner` 获取需要恢复的生命周期作用域。",
    ],
  },
  "solid-js/isPending": {
    "solid-js/latest": [
      "Use `latest` when the UI should keep reading the previous settled value instead of only reporting pending state.",
      "界面需要继续读取上一次已完成的值，而不只是报告 pending 状态时使用 `latest`。",
    ],
  },
  "solid-js/latest": {
    "solid-js/isPending": [
      "Use `isPending` when code only needs to inspect whether async work affects an expression.",
      "代码只需要判断异步工作是否影响某个表达式时使用 `isPending`。",
    ],
  },
  "solid-js/resolve": {
    "solid-js/latest": [
      "Use `resolve` to await the first settled value outside rendering; use `latest` to keep stale data visible reactively.",
      "渲染之外等待首个稳定值时使用 `resolve`；响应式保留旧数据显示时使用 `latest`。",
    ],
  },
  "solid-js/Show": {
    "solid-js/Switch": [
      "Use `<Switch>` when several mutually exclusive conditions compete; `<Show>` is clearer for one condition.",
      "多个互斥条件需要竞争时使用 `<Switch>`；只有一个条件时 `<Show>` 更清晰。",
    ],
  },
  "solid-js/Switch": {
    "solid-js/Show": [
      "Use `<Show>` when only one truthy condition and one fallback are needed.",
      "只需要一个真值条件和一个 fallback 时使用 `<Show>`。",
    ],
  },
  "solid-js/Loading": {
    "solid-js/Reveal": [
      "Use `<Reveal>` around sibling Loading boundaries when their completed content must appear in a coordinated order.",
      "多个同级 Loading 边界的完成内容需要按顺序出现时，在外层使用 `<Reveal>`。",
    ],
  },
  "solid-js/Reveal": {
    "solid-js/Loading": [
      "Each async region still needs its own `<Loading>` boundary; `<Reveal>` only coordinates when those boundaries reveal.",
      "每个异步区域仍需要自己的 `<Loading>` 边界；`<Reveal>` 只协调它们何时显示。",
    ],
  },
  "solid-js/NoHydration": {
    "solid-js/Hydration": [
      "Use `<Hydration>` to opt a nested interactive region back in when its surrounding subtree uses `<NoHydration>`.",
      "外层子树使用 `<NoHydration>` 时，嵌套交互区域可用 `<Hydration>` 重新启用 hydration。",
    ],
  },
  "solid-js/Hydration": {
    "solid-js/NoHydration": [
      "`<Hydration>` is meaningful inside a `<NoHydration>` region; use the latter to establish the skipped outer boundary.",
      "`<Hydration>` 只在 `<NoHydration>` 区域内有意义；先用后者建立跳过 hydration 的外层边界。",
    ],
  },
  "@solidjs/web/For": {
    "solid-js/mapArray": [
      "Use `<For>` in JSX; use `mapArray` when building a custom list primitive or composing the mapped accessor directly.",
      "JSX 列表使用 `<For>`；构建自定义列表原语或直接组合映射 accessor 时使用 `mapArray`。",
    ],
  },
  "@solidjs/web/Show": {
    "@solidjs/web/Switch": [
      "Use `<Switch>` when several mutually exclusive conditions compete; `<Show>` is clearer for one condition.",
      "多个互斥条件需要竞争时使用 `<Switch>`；只有一个条件时 `<Show>` 更清晰。",
    ],
  },
  "@solidjs/web/Switch": {
    "@solidjs/web/Show": [
      "Use `<Show>` when only one truthy condition and one fallback are needed.",
      "只需要一个真值条件和一个 fallback 时使用 `<Show>`。",
    ],
  },
  "@solidjs/web/Loading": {
    "@solidjs/web/Reveal": [
      "Use `<Reveal>` around sibling Loading boundaries when their completed content must appear in a coordinated order.",
      "多个同级 Loading 边界的完成内容需要按顺序出现时，在外层使用 `<Reveal>`。",
    ],
  },
  "@solidjs/web/Reveal": {
    "@solidjs/web/Loading": [
      "Each async region still needs its own `<Loading>` boundary; `<Reveal>` only coordinates when those boundaries reveal.",
      "每个异步区域仍需要自己的 `<Loading>` 边界；`<Reveal>` 只协调它们何时显示。",
    ],
  },
  "@solidjs/web/NoHydration": {
    "@solidjs/web/Hydration": [
      "Use `<Hydration>` to opt a nested interactive region back in when its surrounding subtree uses `<NoHydration>`.",
      "外层子树使用 `<NoHydration>` 时，嵌套交互区域可用 `<Hydration>` 重新启用 hydration。",
    ],
  },
  "@solidjs/web/Hydration": {
    "@solidjs/web/NoHydration": [
      "`<Hydration>` is meaningful inside a `<NoHydration>` region; use the latter to establish the skipped outer boundary.",
      "`<Hydration>` 只在 `<NoHydration>` 区域内有意义；先用后者建立跳过 hydration 的外层边界。",
    ],
  },
  "@solidjs/web/Dynamic": {
    "@solidjs/web/dynamic": [
      "Use the `dynamic` function when a stable component wrapper is needed outside a JSX site.",
      "需要在 JSX 位置之外创建身份稳定的组件包装时使用 `dynamic` 函数。",
    ],
  },
  "@solidjs/web/dynamic": {
    "@solidjs/web/Dynamic": [
      "Use `<Dynamic>` when the runtime-selected component can be expressed directly at the JSX call site.",
      "运行时选择的组件可以直接写在 JSX 调用位置时使用 `<Dynamic>`。",
    ],
  },
  "@solidjs/web/Assets": {
    "@solidjs/web/useAssets": [
      "Use `useAssets` in a primitive that registers assets; place `<Assets>` in the SSR document where collected output belongs.",
      "原语内部注册资源时使用 `useAssets`；在 SSR 文档输出位置放置 `<Assets>`。",
    ],
  },
  "@solidjs/web/style": {
    "@solidjs/web/setStyleProperty": [
      "Use `setStyleProperty` when one reactive CSS property updates independently instead of replacing a style object.",
      "单个响应式 CSS 属性需要独立更新，而不是替换整个 style 对象时使用 `setStyleProperty`。",
    ],
  },
  "@solidjs/web/assign": {
    "@solidjs/web/spread": [
      "Use `spread` for a reactive props object; use `assign` when renderer code applies a known props snapshot.",
      "响应式 props 对象使用 `spread`；渲染器应用已知 props 快照时使用 `assign`。",
    ],
  },
  "@solidjs/web/respond": {
    "@solidjs/web/redirect": [
      "Use `redirect` for navigation responses; use `respond` when returning a normal value with custom status, headers, or revalidation metadata.",
      "导航响应使用 `redirect`；普通值还需携带状态、响应头或重新验证信息时使用 `respond`。",
    ],
  },
  "solid-js/untrack": {
    "solid-js/on": [
      "Choose `on` when dependencies should be declared explicitly rather than suppressed for one read.",
      "需要显式声明依赖、而不是只屏蔽一次读取的追踪时选择 `on`。",
    ],
  },
};

export function relatedApisFor(id, availableIds) {
  return Object.entries(comparisons[id] ?? {})
    .filter(([relatedId]) => availableIds.has(relatedId))
    .map(([relatedId, [en, zh]]) => ({ id: relatedId, reason: { en, zh } }));
}
