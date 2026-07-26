// Complete zh-CN definitions and use cases for every catalog API.
export const apiContent = {
  "solid-js/children": [
    "解析 `children` 访问器，并返回带有 `.toArray()` 方法的响应式访问器。",
    "组件需要检查、规范化或遍历 children，而不只是直接渲染时使用。",
  ],
  "solid-js/createComponent": [
    "调用组件，并通过 `untrack` 避免组件函数中的响应式读取订阅到父级计算。",
    "主要由 JSX 编译结果使用；编写自定义 JSX 工厂或渲染器时才需要手动调用。",
  ],
  "solid-js/createContext": [
    "创建用于在组件树后代之间共享值的 Context。",
    "把跨层级状态放入 Provider，避免逐层传递 props。",
  ],
  "solid-js/createEffect": [
    "创建计算阶段与副作用阶段相互分离的响应式 effect。",
    "在计算函数中读取依赖，在 effect 回调中执行日志、网络请求或其他命令式副作用。",
  ],
  "solid-js/createMemo": [
    "创建只读、缓存且可响应更新的派生信号。",
    "根据一个或多个响应式来源计算值，并避免相同依赖状态下重复计算。",
  ],
  "solid-js/createOptimistic": [
    "创建支持 Action 事务的乐观信号，写入会立即可见，并在事务结束时确认或回滚。",
    "单值状态需要先反馈用户操作，再等待异步提交结果时使用。",
  ],
  "solid-js/createReaction": [
    "创建一次性收集依赖、在依赖变化后执行回调的响应式 reaction。",
    "需要显式控制本轮追踪范围，并在回调后按需重新订阅时使用。",
  ],
  "solid-js/createRenderEffect": [
    "创建在渲染队列中执行的响应式 effect。",
    "副作用必须与 DOM 创建或更新阶段同步时使用；普通业务副作用优先使用 `createEffect`。",
  ],
  "solid-js/createSignal": [
    "创建由 getter 和 setter 组成的细粒度响应式状态。",
    "保存独立值，并让读取该值的 memo、effect 或组件按需更新。",
  ],
  "solid-js/createTrackedEffect": [
    "创建在同一作用域内同时追踪依赖和执行副作用的 effect。",
    "仅在确实需要副作用过程参与依赖追踪时使用，并注意重复执行及状态撕裂风险。",
  ],
  "solid-js/createUniqueId": [
    "创建在服务端渲染和客户端 hydration 之间保持一致的稳定 ID。",
    "用于 `for`、`aria-labelledby` 等要求 SSR 与客户端 ID 一致的属性。",
  ],
  "solid-js/enableHydration": [
    "enableHydration 是 solid-js 对外提供的可调用 API。",
    "用于源码声明所描述的响应式和组件场景。",
  ],
  "solid-js/flush": [
    "立即处理待执行的响应式队列，也可以在同步 flush 作用域内运行回调。",
    "测试或必须立即观察已提交响应式结果时使用；常规更新通常交给微任务批处理。",
  ],
  "solid-js/isEqual": ["isEqual 是 solid-js 对外提供的可调用 API。", "用于源码声明所描述的响应式和组件场景。"],
  "solid-js/lazy": [
    "创建按需动态导入的代码分割组件。",
    "组件首次渲染时才加载模块，并通过最近的 `<Loading>` 边界显示等待状态；无人订阅时，仍在 pending 的惰性节点会在结算后自动释放。",
  ],
  "solid-js/mapArray": [
    "响应式映射数组，并复用未变化项目已经生成的结果。",
    "构建自定义列表原语，且需要根据 keyed 模式精确控制项目与索引访问方式时使用。",
  ],
  "solid-js/repeat": [
    "按响应式数量重复执行渲染回调，并复用仍然存在的项目。",
    "需要构建固定次数或数量驱动的列表时使用，也是 `<Repeat>` 的底层辅助函数。",
  ],
  "solid-js/untrack": [
    "在不收集响应式依赖的情况下执行函数，并返回函数结果。",
    "只想读取当前值、不希望当前计算订阅该值时使用。",
  ],
  "solid-js/useContext": [
    "读取距离当前组件最近的 Context Provider 值。",
    "组件需要消费祖先 Provider 提供的跨层级状态时使用。",
  ],
  "solid-js/createOptimisticStore": [
    "创建支持 Action 事务和自动回滚的乐观 Store。",
    "对象或数组状态需要立即展示暂存修改，并在异步操作失败时恢复时使用。",
  ],
  "solid-js/createProjection": [
    "创建派生 Store，相当于 Store 版本的 `createMemo`。",
    "需要通过 draft 增量计算结构化派生状态，并保留细粒度更新时使用；异步 Store 的首个值会沿 pending 状态正确结算到投影。",
  ],
  "solid-js/createStore": [
    "创建由 Proxy 支撑的深层响应式 Store。",
    "管理对象或数组状态，并让消费者只订阅实际读取的属性时使用；浅层 Store 接收其他 Store 代理时按引用隔离，避免写入泄漏到来源 Store。",
  ],
  "solid-js/deep": [
    "返回 Store 的普通深拷贝，同时让当前追踪作用域订阅整个子树的变化。",
    "消费者需要普通对象，并希望任意深层写入都能使其失效时使用。",
  ],
  "solid-js/isWrappable": ["isWrappable 是 solid-js 对外提供的可调用 API。", "用于源码声明所描述的响应式和组件场景。"],
  "solid-js/merge": [
    "把多个 props 风格对象合并为保持响应性的代理，后面的来源覆盖前面的来源。",
    "组合默认 props、外部 props 和派生 props，同时保留 getter 与响应式读取时使用。",
  ],
  "solid-js/omit": [
    "返回隐藏指定键、但其余属性仍保持响应性的 props 代理。",
    "向子组件转发大部分 props，同时排除少量本地消费字段时使用。",
  ],
  "solid-js/reconcile": [
    "创建用于智能协调 Store draft 的更新函数，只修改真正变化的叶子节点。",
    "把服务端数据合并进现有 Store，并通过默认 `id` 或指定 key 保留数组项目身份时使用。",
  ],
  "solid-js/snapshot": [
    "创建 Store 当前值的普通、非响应式深拷贝。",
    "向日志、序列化、结构化克隆或网络层传递稳定普通对象时使用。",
  ],
  "solid-js/storePath": [
    "为 `createStore` 创建基于路径的 draft 更新函数。",
    "需要把动态属性路径和值组合成可传给 Store setter 的更新器时使用。",
  ],
  "solid-js/action": [
    "创建跨越异步间隙的事务式 mutation，并协调暂存写入、确认与失败回滚。",
    "乐观更新需要等待服务端结果，且中间状态不能泄漏到事务外部时使用；被加载边界捕获的首次读取结算时不会重新进入未完成事务。",
  ],
  "solid-js/onCleanup": [
    "向当前 Owner 注册清理回调。",
    "释放定时器、事件监听、订阅或其他必须随组件和响应式作用域销毁的资源。",
  ],
  "solid-js/onSettled": [
    "在当前 Owner 内所有异步读取完成且响应式队列稳定后，执行一次回调。",
    "需要等待整个局部响应式图稳定后再执行收尾逻辑时使用。",
  ],
  "solid-js/refresh": [
    "主动使一个可刷新响应式来源失效，强制它重新执行。",
    "输入未变化但仍需重新请求或重算 Solid accessor、Projection Store 时使用。",
  ],
  "@solidjs/web/getOwner": [
    "返回当前响应式 Owner，也就是新建原语和清理逻辑将要挂载的生命周期节点。",
    "需要捕获当前生命周期上下文，稍后配合 `runWithOwner` 恢复时使用。",
  ],
  "solid-js/createRoot": [
    "创建可独立销毁的响应式根作用域。",
    "在组件树之外创建信号、memo 和 effect，并需要显式控制其生命周期时使用。",
  ],
  "solid-js/getObserver": [
    "返回当前正在追踪依赖的 Observer；未处于追踪作用域时返回 `null`。",
    "自定义响应式原语需要判断当前读取是否会被订阅时使用。",
  ],
  "solid-js/getOwner": [
    "返回当前响应式 Owner，也就是新建原语和清理逻辑将要挂载的生命周期节点。",
    "需要捕获当前生命周期上下文，稍后配合 `runWithOwner` 恢复时使用。",
  ],
  "solid-js/isDisposed": [
    "判断指定 Owner 是否已销毁或正等待销毁。",
    "异步回调返回较晚，需要避免操作已经卸载的组件或作用域时使用。",
  ],
  "solid-js/runWithOwner": [
    "在指定 Owner 上下文中执行函数。",
    "异步边界或外部回调中创建响应式原语，并希望它们仍归属于原 Owner 时使用。",
  ],
  "solid-js/affects": [
    "声明当前事务将影响指定响应式数据及其派生值，使 `isPending` 可以观察等待状态。",
    "异步 Action 开始后需要标记哪些数据正在变化，但仍允许读取旧值时使用。",
  ],
  "solid-js/enableExternalSource": [
    "enableExternalSource 是 solid-js 对外提供的可调用 API。",
    "用于源码声明所描述的响应式和组件场景。",
  ],
  "solid-js/flatten": [
    "把 children 值解析为可渲染形式：展开访问器和嵌套数组，并可跳过空渲染值。",
    "自定义控制流或渲染器需要遍历和规范化 children 树时使用。",
  ],
  "solid-js/isPending": ["isPending 是 solid-js 对外提供的可调用 API。", "用于源码声明所描述的响应式和组件场景。"],
  "solid-js/latest": ["latest 是 solid-js 对外提供的可调用 API。", "用于源码声明所描述的响应式和组件场景。"],
  "solid-js/resolve": [
    "等待响应式表达式首次完全稳定，并以 Promise 返回结果。",
    "表达式可能读取尚未就绪的异步 memo 或 signal，需要等待其可同步返回时使用。",
  ],
  "@solidjs/web/Assets": ["Assets 是 @solidjs/web 对外提供的可调用 API。", "用于源码声明所描述的响应式和组件场景。"],
  "@solidjs/web/Dynamic": [
    "渲染运行时指定的原生标签或自定义组件，并转发其他 props。",
    "组件类型由响应式数据决定，无法在 JSX 编写阶段固定时使用。",
  ],
  "@solidjs/web/Errored": [
    "捕获子树中未处理的错误，并渲染 fallback。",
    "组件区域需要隔离错误，并通过 fallback 或 `reset()` 提供恢复入口时使用。",
  ],
  "@solidjs/web/For": [
    "根据列表创建并复用元素。",
    "渲染响应式数组，并需要 keyed 或非 keyed 更新策略以及空列表 fallback 时使用。",
  ],
  "@solidjs/web/Hydration": [
    "在 `<NoHydration>` 区域内重新启用 hydration；客户端普通渲染时直接透传 children。",
    "外层区域跳过 hydration，但其中某个子树仍需要恢复交互时使用。",
  ],
  "@solidjs/web/HydrationScript": [
    "HydrationScript 是 @solidjs/web 对外提供的可调用 API。",
    "用于源码声明所描述的响应式和组件场景。",
  ],
  "@solidjs/web/Loading": [
    "在子树中的异步读取完成前渲染 fallback。",
    "lazy 组件、异步 memo、异步 signal 或 Store 需要声明局部加载边界时使用；流式 fallback 中的响应式文本会在 Hydration 时认领服务端节点并原位更新。",
  ],
  "@solidjs/web/Match": ["定义 `<Switch>` 中的一个条件分支。", "多个互斥条件需要按顺序选择首个真值分支时使用。"],
  "@solidjs/web/NoHydration": [
    "在客户端 hydration 阶段跳过其子树，保留现有 DOM 不做接管。",
    "服务端输出的静态区域不需要客户端响应式绑定时使用。",
  ],
  "@solidjs/web/Portal": [
    "把 children 渲染到 DOM 的其他挂载点。",
    "模态框、提示层或需要脱离 `overflow: hidden` 容器的浮层内容使用。",
  ],
  "@solidjs/web/Repeat": [
    "根据 count 创建并复用指定数量的元素。",
    "列表只由数量驱动，回调只需要项目索引，并需要零数量 fallback 时使用。",
  ],
  "@solidjs/web/Reveal": [
    "协调同级 `<Loading>` 边界显示真实内容的顺序。",
    "多个异步区域需要按顺序或统一时机揭示，避免页面内容无序跳动时使用。",
  ],
  "@solidjs/web/Show": [
    "条件为真时渲染 children，否则渲染可选 fallback。",
    "单一条件需要切换一块 JSX，并希望函数 children 获得收窄后的值时使用。",
  ],
  "@solidjs/web/Switch": [
    "在多个互斥条件中渲染第一个成立的 `<Match>`。",
    "条件分支超过两个，或需要统一 fallback 时使用。",
  ],
  "solid-js/Errored": [
    "捕获子树中未处理的错误，并渲染 fallback。",
    "组件区域需要隔离错误，并通过 fallback 或 `reset()` 提供恢复入口时使用。",
  ],
  "solid-js/For": [
    "根据列表创建并复用元素。",
    "渲染响应式数组，并需要 keyed 或非 keyed 更新策略以及空列表 fallback 时使用。",
  ],
  "solid-js/Hydration": [
    "在 `<NoHydration>` 区域内重新启用 hydration；客户端普通渲染时直接透传 children。",
    "外层区域跳过 hydration，但其中某个子树仍需要恢复交互时使用。",
  ],
  "solid-js/Loading": [
    "在子树中的异步读取完成前渲染 fallback。",
    "lazy 组件、异步 memo、异步 signal 或 Store 需要声明局部加载边界时使用；流式 fallback 中的响应式文本会在 Hydration 时认领服务端节点并原位更新。",
  ],
  "solid-js/Match": ["定义 `<Switch>` 中的一个条件分支。", "多个互斥条件需要按顺序选择首个真值分支时使用。"],
  "solid-js/NoHydration": [
    "在客户端 hydration 阶段跳过其子树，保留现有 DOM 不做接管。",
    "服务端输出的静态区域不需要客户端响应式绑定时使用。",
  ],
  "solid-js/Repeat": [
    "根据 count 创建并复用指定数量的元素。",
    "列表只由数量驱动，回调只需要项目索引，并需要零数量 fallback 时使用。",
  ],
  "solid-js/Reveal": [
    "协调同级 `<Loading>` 边界显示真实内容的顺序。",
    "多个异步区域需要按顺序或统一时机揭示，避免页面内容无序跳动时使用。",
  ],
  "solid-js/Show": [
    "条件为真时渲染 children，否则渲染可选 fallback。",
    "单一条件需要切换一块 JSX，并希望函数 children 获得收窄后的值时使用。",
  ],
  "solid-js/Switch": ["在多个互斥条件中渲染第一个成立的 `<Match>`。", "条件分支超过两个，或需要统一 fallback 时使用。"],
  "@solidjs/web/generateHydrationScript": [
    "generateHydrationScript 是 @solidjs/web 对外提供的可调用 API。",
    "用于应用挂载、hydration 或服务端 HTML 输出。",
  ],
  "@solidjs/web/hydrate": [
    "接管服务端已经生成的 DOM，附加事件和响应式绑定而不重新创建节点。",
    "客户端启动 SSR 应用，并需要保留现有 DOM 与服务端状态时使用。",
  ],
  "@solidjs/web/render": [
    "把组件树渲染到指定 DOM 容器，并返回销毁函数。",
    "纯客户端应用挂载根组件，或独立挂载一棵组件子树时使用。",
  ],
  "@solidjs/web/renderToStream": [
    "流式输出 HTML：先发送同步 shell，再随着异步 `<Loading>` 边界完成逐步输出片段。",
    "服务端渲染对首字节时间敏感，并希望渐进传输异步内容时使用。",
  ],
  "@solidjs/web/renderToString": [
    "同步把组件树渲染为 HTML 字符串。",
    "服务端只需要同步结果，异步区域允许输出 `<Loading>` fallback 时使用。",
  ],
  "@solidjs/web/renderToStringAsync": [
    "等待组件子树中的异步读取全部完成后，返回完整 HTML 字符串。",
    "需要完全稳定的服务端 HTML 且可以接受等待全部异步任务时使用；该 API 已弃用。",
  ],
  "@solidjs/web/getRequestEvent": [
    "getRequestEvent 是 @solidjs/web 对外提供的可调用 API。",
    "用于源码声明所描述的响应式和组件场景。",
  ],
  "@solidjs/web/isHref": [
    "判断值是否带有 `Href` 品牌标记。",
    "处理 redirect 等响应辅助值，需要跨重复模块实例可靠识别 Href 时使用。",
  ],
  "@solidjs/web/isResponseEnvelope": [
    "判断值是否为 `ResponseEnvelope`。",
    "服务端函数或传输层需要识别带响应元数据的返回值时使用。",
  ],
  "@solidjs/web/redirect": [
    "创建跳转到指定 URL 的响应，默认状态码为 302。",
    "服务端函数、Action 或渐进增强表单需要通知客户端执行导航时使用。",
  ],
  "@solidjs/web/reload": [
    "创建要求重新验证指定缓存键的空响应；省略键时重新验证全部。",
    "mutation 完成后只需要通知调用方重新获取数据时使用。",
  ],
  "@solidjs/web/respond": [
    "把业务值与状态码、响应头和 revalidate 信息组合为响应信封。",
    "普通返回值不足以表达 HTTP 元数据，同时还要让脚本调用方透明取得业务值时使用。",
  ],
  "@solidjs/web/acquireAsset": [
    "acquireAsset 是 @solidjs/web 对外提供的可调用 API。",
    "用于 DOM 绑定、事件、模板或 Web 渲染器集成。",
  ],
  "@solidjs/web/addEvent": [
    "addEvent 是 @solidjs/web 对外提供的可调用 API。",
    "用于 DOM 绑定、事件、模板或 Web 渲染器集成。",
  ],
  "@solidjs/web/applyRef": [
    "applyRef 是 @solidjs/web 对外提供的可调用 API。",
    "用于 DOM 绑定、事件、模板或 Web 渲染器集成。",
  ],
  "@solidjs/web/assign": [
    "assign 是 @solidjs/web 对外提供的可调用 API。",
    "用于 DOM 绑定、事件、模板或 Web 渲染器集成。",
  ],
  "@solidjs/web/claimElement": [
    "把一个 DOM 元素交给已注册的元素认领消费者处理。",
    "编译器生成元素时通知导航或框架集成层；处理器必须保持幂等。",
  ],
  "@solidjs/web/claimElementTree": [
    "遍历并认领根节点内与导航相关的链接和表单元素。",
    "SSR 范围或流式内容直接进入 DOM、没有经过编译器创建流程时使用。",
  ],
  "@solidjs/web/className": [
    "className 是 @solidjs/web 对外提供的可调用 API。",
    "用于 DOM 绑定、事件、模板或 Web 渲染器集成。",
  ],
  "@solidjs/web/createComponent": [
    "调用组件，并通过 `untrack` 避免组件函数中的响应式读取订阅到父级计算。",
    "主要由 JSX 编译结果使用；编写自定义 JSX 工厂或渲染器时才需要手动调用。",
  ],
  "@solidjs/web/delegateEvents": [
    "delegateEvents 是 @solidjs/web 对外提供的可调用 API。",
    "用于 DOM 绑定、事件、模板或 Web 渲染器集成。",
  ],
  "@solidjs/web/dynamic": [
    "根据响应式或异步来源返回身份稳定的动态组件。",
    "组件类型会在运行时变化，同时还需要像普通组件一样接收 props 和 children 时使用。",
  ],
  "@solidjs/web/dynamicProperty": [
    "dynamicProperty 是 @solidjs/web 对外提供的可调用 API。",
    "用于 DOM 绑定、事件、模板或 Web 渲染器集成。",
  ],
  "@solidjs/web/effect": [
    "effect 是 @solidjs/web 对外提供的可调用 API。",
    "用于 DOM 绑定、事件、模板或 Web 渲染器集成。",
  ],
  "@solidjs/web/getAssets": [
    "getAssets 是 @solidjs/web 对外提供的可调用 API。",
    "用于 DOM 绑定、事件、模板或 Web 渲染器集成。",
  ],
  "@solidjs/web/getDelegatedRoot": [
    "getDelegatedRoot 是 @solidjs/web 对外提供的可调用 API。",
    "用于 DOM 绑定、事件、模板或 Web 渲染器集成。",
  ],
  "@solidjs/web/getHydrationKey": [
    "getHydrationKey 是 @solidjs/web 对外提供的可调用 API。",
    "用于 DOM 绑定、事件、模板或 Web 渲染器集成。",
  ],
  "@solidjs/web/getNextElement": [
    "getNextElement 是 @solidjs/web 对外提供的可调用 API。",
    "用于 DOM 绑定、事件、模板或 Web 渲染器集成。",
  ],
  "@solidjs/web/getNextMarker": [
    "getNextMarker 是 @solidjs/web 对外提供的可调用 API。",
    "用于 DOM 绑定、事件、模板或 Web 渲染器集成。",
  ],
  "@solidjs/web/getNextMatch": [
    "getNextMatch 是 @solidjs/web 对外提供的可调用 API。",
    "用于 DOM 绑定、事件、模板或 Web 渲染器集成。",
  ],
  "@solidjs/web/insert": [
    "insert 是 @solidjs/web 对外提供的可调用 API。",
    "用于 DOM 绑定、事件、模板或 Web 渲染器集成。",
  ],
  "@solidjs/web/memo": ["memo 是 @solidjs/web 对外提供的可调用 API。", "用于 DOM 绑定、事件、模板或 Web 渲染器集成。"],
  "@solidjs/web/ref": ["ref 是 @solidjs/web 对外提供的可调用 API。", "用于 DOM 绑定、事件、模板或 Web 渲染器集成。"],
  "@solidjs/web/registerDelegatedContainer": [
    "registerDelegatedContainer 是 @solidjs/web 对外提供的可调用 API。",
    "用于 DOM 绑定、事件、模板或 Web 渲染器集成。",
  ],
  "@solidjs/web/registerDelegatedRoot": [
    "registerDelegatedRoot 是 @solidjs/web 对外提供的可调用 API。",
    "用于 DOM 绑定、事件、模板或 Web 渲染器集成。",
  ],
  "@solidjs/web/registerElementClaim": [
    "注册编译器元素认领事件的消费者，并返回取消注册函数。",
    "路由器或框架集成需要观察新建及属性更新后的链接、表单元素时使用。",
  ],
  "@solidjs/web/runHydrationEvents": [
    "runHydrationEvents 是 @solidjs/web 对外提供的可调用 API。",
    "用于 DOM 绑定、事件、模板或 Web 渲染器集成。",
  ],
  "@solidjs/web/scope": [
    "scope 是 @solidjs/web 对外提供的可调用 API。",
    "用于 DOM 绑定、事件、模板或 Web 渲染器集成。",
  ],
  "@solidjs/web/setAttribute": [
    "setAttribute 是 @solidjs/web 对外提供的可调用 API。",
    "用于 DOM 绑定、事件、模板或 Web 渲染器集成。",
  ],
  "@solidjs/web/setAttributeNS": [
    "setAttributeNS 是 @solidjs/web 对外提供的可调用 API。",
    "用于 DOM 绑定、事件、模板或 Web 渲染器集成。",
  ],
  "@solidjs/web/setProperty": [
    "setProperty 是 @solidjs/web 对外提供的可调用 API。",
    "用于 DOM 绑定、事件、模板或 Web 渲染器集成。",
  ],
  "@solidjs/web/setStyleProperty": [
    "setStyleProperty 是 @solidjs/web 对外提供的可调用 API。",
    "用于 DOM 绑定、事件、模板或 Web 渲染器集成。",
  ],
  "@solidjs/web/spread": [
    "spread 是 @solidjs/web 对外提供的可调用 API。",
    "用于 DOM 绑定、事件、模板或 Web 渲染器集成。",
  ],
  "@solidjs/web/style": [
    "style 是 @solidjs/web 对外提供的可调用 API。",
    "用于 DOM 绑定、事件、模板或 Web 渲染器集成。",
  ],
  "@solidjs/web/template": [
    "template 是 @solidjs/web 对外提供的可调用 API。",
    "用于 DOM 绑定、事件、模板或 Web 渲染器集成。",
  ],
  "@solidjs/web/unregisterDelegatedContainer": [
    "unregisterDelegatedContainer 是 @solidjs/web 对外提供的可调用 API。",
    "用于 DOM 绑定、事件、模板或 Web 渲染器集成。",
  ],
  "@solidjs/web/unregisterDelegatedRoot": [
    "unregisterDelegatedRoot 是 @solidjs/web 对外提供的可调用 API。",
    "用于 DOM 绑定、事件、模板或 Web 渲染器集成。",
  ],
  "@solidjs/web/untrack": [
    "在不收集响应式依赖的情况下执行函数，并返回函数结果。",
    "只想读取当前值、不希望当前计算订阅该值时使用。",
  ],
  "@solidjs/web/useAssets": [
    "useAssets 是 @solidjs/web 对外提供的可调用 API。",
    "用于 DOM 绑定、事件、模板或 Web 渲染器集成。",
  ],
};

export function resolveApiContent(api) {
  const existing = apiContent[api.id];
  if (existing) return existing;

  const definition = `${api.title} 是 ${api.packageName} 对外提供的可调用 API。`;
  if (api.kind === "type") return [definition, "用于为库、组件和自定义原语建立准确的 TypeScript 契约。"];
  if (api.category === "internal-compiler")
    return [definition, "仅用于渲染器、编译器输出或框架集成；应用代码通常不应直接调用。"];
  if (api.category === "dom-web-runtime") return [definition, "用于 DOM 绑定、事件、模板或 Web 渲染器集成。"];
  if (api.category === "rendering-ssr") return [definition, "用于应用挂载、hydration 或服务端 HTML 输出。"];
  return [definition, "用于源码声明所描述的响应式和组件场景。"];
}
