# Change Log

## 1.3-2.0.0-beta.29 - 2026-07-31

基线从 Solid `2.0.0-beta.27` 更新到 `2.0.0-beta.29`，并重新生成 API 目录。

### Dependency Baseline

- `solid-js`、`@solidjs/web`、`babel-preset-solid` 和间接依赖 `@solidjs/signals` 更新至 `2.0.0-beta.29`。
- DOM Expressions Babel 工具链更新至 `0.50.0-next.34`。
- 固定上游源码提交更新为 `4bc0be0bae7870071f30c79c6b70f95b7eddc303`。

### Catalog Changes

- 新增 `@solidjs/web/clientOnly`、`@solidjs/web/httpHeader` 和 `@solidjs/web/httpStatus`。
- `renderToStream` 的返回值新增只读 `readable: ReadableStream<Uint8Array>` 属性。
- 目录现包含 9 个分类、121 个公开可调用 API 和 121 个独立 demo。
- 新增 API 获得完整中英文说明；`clientOnly` 使用浏览器 demo，两个 HTTP 声明 API 使用请求上下文中的 SSR demo。

### Architecture and Performance

- 生成器新增 `data/catalog-index.json` 轻量发现索引；完整签名、关联类型和 demo 源码继续保存在 `data/catalog.json`。
- 首页、搜索和侧栏只加载轻量索引，API 功能区与完整目录通过 Solid `lazy()` 按需加载。
- 浏览器 demo 执行器改为动态导入；结果模型和 SSR demo 分类从运行实现中拆分。
- Hash 导航接入浏览器历史，支持深链接、前进、后退，并在恢复 API 时同步展开所属分类。
- 生产入口从 557.46 KB 降至 230.58 KB，gzip 从 116.20 KB 降至 75.48 KB；完整 API 数据进入独立按需 chunk。

### Test Automation

- 引入 `@playwright/test@1.62.0`，浏览器及系统依赖由 `mcr.microsoft.com/playwright:v1.62.0-noble` Podman 镜像提供。
- 新增桌面搜索与导航、浏览器历史、语言和主题持久化、真实 demo 执行、移动端目录以及按需 chunk 加载测试。
- 新增 GitHub Actions 工作流，并保留失败截图、视频、trace 和 HTML 报告。
- `npm test` 统一执行类型检查、格式检查、121 个 demo 验证和容器化端到端测试。
- 新增测试维护指南与函数代码包交付文档，记录 Podman 排错、`code.zip` 内容、监听端口和启动命令。

### Verification

- 116 个浏览器 demo 和 5 个 SSR demo 全部通过，合计 121/121。
- Podman Chromium 端到端测试 4/4 通过。
- 类型检查、格式检查和生产构建通过。

## 1.2-2.0.0-beta.27 - 2026-07-29

保持 Solid `2.0.0-beta.27` 依赖基线，重点完善 API demo 的交互性、运行稳定性与项目架构。

### Demo Experience

- 扩展 API demo，使输入、选择和按钮操作能够直接展示响应式结果。
- 增加异步日志与 DOM 结果的增量更新，过期执行不会覆盖当前 demo 状态。
- 完善 demo 表单、输出区域、焦点状态及深色模式样式。

### Architecture

- 统一 Vite 与生产服务器的 demo HTTP 请求处理、限制配置和错误响应。
- 服务端 demo 校验直接复用生产执行服务，减少重复编译与模块加载逻辑。
- 浏览器校验自动识别交互示例，并通过注册表维护精确行为场景。
- 收敛前端导航状态，复用语法高亮和编辑器实现，减少重复状态与 JSX。

### Verification

- 118 个公开 API demo 全部通过编译、执行和交互验证。
- 类型检查、格式检查和生产构建通过。

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
