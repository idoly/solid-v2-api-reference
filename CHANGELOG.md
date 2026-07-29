# Change Log

## 1.1-2.0.0-beta.27 - 2026-07-28

基线从 Solid `2.0.0-beta.26` 更新到 `2.0.0-beta.27`。

### Dependency Baseline

- `solid-js`: `2.0.0-beta.27`
- `@solidjs/web`: `2.0.0-beta.27`
- `babel-preset-solid`: `2.0.0-beta.27`
- `@solidjs/signals`（间接依赖）: `2.0.0-beta.27`
- `@dom-expressions/babel-plugin-jsx`（间接依赖）: `0.50.0-next.32`
- 固定上游源码提交：`4e3921b77c3dfc538b983710dfd9531709251e84`

### Catalog Changes

重新生成后仍为 9 个分类、118 个公开可调用 API、118 个独立 demo：

- 新增可调用 API：0
- 删除可调用 API：0
- API 重命名或分类变化：0
- demo 源码变化：0
- 签名或关联类型变化：4 个 API

`@solidjs/web/applyRef` 的签名增加元素泛型：

```ts
// beta.26
applyRef(
  r: ((element: Element) => void) | ((element: Element) => void)[],
  element: Element,
): void;

// beta.27
applyRef<T extends Element = Element>(
  r: ((element: NoInfer<T>) => void) | ((element: NoInfer<T>) => void)[],
  element: T,
): void;
```

新签名保留传入元素的具体类型，并阻止回调参数反向影响 `T` 的推断。现有调用方式兼容。

`ProjectionOptions.key` 扩展为可传 `null`：

```ts
// beta.26
key?: string | ((item: NonNullable<any>) => any);

// beta.27
key?: string | ((item: NonNullable<any>) => any) | null;
```

该关联类型变化会显示在以下 API 页面：

- `solid-js/createProjection`
- `solid-js/createOptimisticStore`
- `solid-js/createStore` 的 projection 重载

`null` 可用于显式选择非 keyed/按位置协调。现有 demo 未设置 `key`，行为不变。

### Exports Outside The Catalog

`@solidjs/web` 根入口新增运行时常量 `REVALIDATE_HEADER`。它不是可调用值，按当前 catalog 的 callable-only 规则不会被收录。

`@solidjs/web/server-functions` 子路径还增加了 flash cookie 与无 JavaScript 表单处理相关导出，包括 `createNoJSHandler`、`encodeFlashCookie`、`decodeFlashCookie`、`foldSetCookies`、`hasFlashCookie` 和 `clearFlashCookie`。当前生成器只扫描 `solid-js` 与 `@solidjs/web` 根入口，因此这些子路径 API 不在本项目的 118 项统计内。

### Runtime Semantics

公开签名之外，`beta.27` 包含以下行为修复：

- projection 返回替换对象时，新对象成为权威快照，旧对象中已不存在的键会被删除；客户端与 SSR 行为对齐。
- reconcile 增强数组与对象形状切换的处理。
- 修复 effect 执行期间 Owner/子队列被移除时可能跳过后续队列的问题。
- 修复 action 完成窗口的 batch/transition 接管，以及 optimistic store 在真实结果仍在途时的层保留。
- Store 不再包装平台对象，只包装普通数据对象和用户类实例。
- SSR 中 `dynamic()`/`lazy()` 的异步结果交由边界挂起处理，不再阻塞 shell。
- 流式 hydration 和 server-component frame 改进晚到边界的发现、认领与版本缓冲。
- SSR 文档资源、预加载、内联样式和脚本的注入顺序统一处理。

### Demo Assessment

现有 118 个 demo 不需要修改：

- `applyRef` demo 向 `applyRef` 传入具体的 `HTMLButtonElement`，可直接受益于新泛型推断。
- projection/store demo 未依赖旧的残留键行为，也未传入 `ProjectionOptions.key`，不受 `null` 扩展影响。
- SSR demo 使用的公开渲染函数签名未变化。

验证命令：

```bash
npm run check
npm run verify:demos
npm run build
```
