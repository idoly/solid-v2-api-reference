# Change Log

## Unreleased

### Dependency and Components

- 将 `solid-js`、`@solidjs/web` 与 `babel-preset-solid` 从 `2.0.0-beta.29` 升级到 `2.0.0-beta.30`。
- 间接依赖 `@solidjs/signals` 同步升级到 `2.0.0-beta.30`，DOM Expressions Babel 插件升级到 `0.50.0-next.35`。
- 新增 `@solidjs/web/useHead` 的 SSR 分类、双语说明、关联 API 和可执行 Demo，并更新固定上游源码提交。
- `renderToString` 与 `renderToStream` 新增 `onHead` option，并在 Demo 中覆盖宿主文档收集 head 输出的流程。
- `clientOnly` 新增编译器注入参数 `_moduleUrl`，用于提前输出资源提示；`useAssets` 与 `getAssets` 标记弃用，分别迁移到 `useHead` 与 `onHead`。
- `@solidjs/web/frames` 增加 live props 更新、frame rebind/rebase 和组件 handoff 类型契约；根入口的既有 `solid-js` API 签名没有变化。
- 通过 npm override 让尚未发布 beta.30 peer 范围的 `@idoly/ant-design-solid@0.2.4` 复用项目 Solid 版本，保证全新 `npm ci` 可解析一致的依赖树。
- 将 `@idoly/ant-design-solid` 从 `0.1.0` 升级到 `0.2.4`，迁移到 `base.css` 与组件级 CSS 导出。
- JavaScript 全部改用组件子路径导入；组件样式集中到全局与 API 懒加载两个 CSS 入口，继续保留页面级 CSS code splitting。
- 使用 BackTop 替换手写滚动监听和回顶逻辑，使用 Button 替换移动 Drawer 关闭按钮，并为当前侧栏文档增加 `aria-current="page"`。

### Interaction and Accessibility

- 统一 Editor、TopBar、Drawer 与 BackTop 图标按钮的默认、hover、active、鼠标 focus、键盘 focus-visible 和暗色交互状态。
- 图标按钮使用统一尺寸变量并强制清除 Button inline padding；primary Run 去除浅色 inset shadow，保证背景与同色边框之间没有亮缝。
- Button 与 FloatButton 通过 ConfigProvider component tokens 共享颜色、边框、focus ring、shadow 和 active transform；展开编辑器的 Run 保留主题 primary 层级。
- TopBar 与 Editor Tooltip 使用 `triggerRender` 直接绑定实际控件，修复 `display: contents` 零尺寸锚点导致的左上角错位和工具栏布局异常。
- BackTop 不再重复设置 fixed root；Tooltip 保持在按钮左侧，鼠标点击后不残留键盘焦点环，移动端继续隐藏。

### Verification

- TypeScript、Prettier、生产构建、gzip bundle budget 和 17 项 Node 单元测试通过。
- Podman Chromium 端到端测试 4/4 通过，覆盖三处图标按钮计算样式、Tooltip 几何位置、编辑器 toolbar 边界、primary Run、BackTop 点击和移动端布局。

## 1.4-2.0.0-beta.29 - 2026-08-01

保持 Solid `2.0.0-beta.29` 依赖基线，集中升级内容模型、Demo 体验、主题界面、工程门禁和部署交付流程。

### Content and Catalog

- 完整目录升级为 schema 5，新增结构化 Related APIs 和 `reExportOf` 元数据。
- 标记 13 个跨包 re-export，避免为相同运行语义维护虚假的差异说明。
- 44 个 API 页面新增 46 条双语选择建议，覆盖 effects、Context、Store、Owner、async、control flow、hydration、DOM renderer 和 response API。
- 清理全部当前 API 的通用 fallback 文案，修复 `onSettled`、`registerElementClaim` 等错误断句，并统一 Definition 与 Use case 的内容边界。
- 新增 `CONTENT_GUIDE.md`，约束中英文语义一致性、Demo 聚焦、交互选择、程序长度和行为验证标准。

### Demo Experience

- API 页面首次进入只加载源码，不再自动编译或执行；用户点击 Run 后才请求 runtime。
- Reset 恢复原始源码、清除 Browser DOM 与 Console 日志，并回到未执行提示状态。
- `Loading` 真实展示 idle、pending fallback 和 resolved 三阶段；`lazy` 展示模块请求生命周期；`Reveal` 验证后完成的边界不会越过前序边界提前显示。
- `Errored` 按实际签名读取 error accessor，并提供可验证的恢复操作。
- `createUniqueId`、`createMemo`、`isEqual`、`hydrate` 和 `getRequestEvent` 修正为可观察且符合当前 API 语义的 Demo。
- `Assets`、`HydrationScript`、`Hydration`、`NoHydration` 和 `getRequestEvent` 改为真实 SSR 上下文执行。
- 同模块 named imports 在生成阶段自动合并，避免 Web re-export Demo 出现重复 import。
- 109 个浏览器 Demo 默认直接在 `render` Owner 中执行 setup，生成器用 AST 移除只调用一次的 `App` 入口壳；只有真实组件与生命周期边界保留命名组件。
- 121 个 Demo 均包含针对当前 API 的契约注释；生成器拒绝 unused import，并将 supporting API 限制为最多 4 个。
- 精简 Loading、lazy、Reveal、Portal、Errored、deep、respond、createOptimistic 和 reconcile 的辅助 API，同时增强 render Demo 的 mount/dispose 生命周期展示。
- 当前 121 个独立 Demo 分为 109 个浏览器组和 12 个 SSR 组，全部通过编译、执行与行为验证。

### Frontend and Theme

- 引入 `@idoly/ant-design-solid` 的 ConfigProvider、Drawer、Modal、Collapse、Input、Tooltip、Skeleton、Empty、Alert 和 Segmented 等交互组件。
- 移除应用层 Tailwind 与构建插件，全部功能样式迁移到 CSS Modules；Ant Solid 继续使用预编译样式。
- 保留绿色品牌色，统一浅色/深色 token、按钮边框、hover、focus、Tooltip、BackTop、Editor、Browser 和 Console 层次。
- 桌面侧栏改为 `clamp(300px, 22vw, 320px)`，内容上限提升到 1480px；390px 移动端无水平溢出。
- Demo Lab 拆分为编排、Editor 和 Output 组件及对应 CSS Module；移动端 BackTop 隐藏以避免遮挡表单与输出。
- 移除远程 Google Fonts 依赖，改用系统字体栈，并提升导航、代码和面板小字号的清晰度。
- 统一中英文 UI、空状态与运行错误的术语和句式：用户界面使用“示例 / example”，中文主题使用“浅色 / 深色”，成对状态采用平行文案。

### Architecture and Delivery

- Demo 注册表按领域和特殊场景拆分，嵌入 TSX formatter 可递归处理所有注册模块。
- Catalog 生成器拆出示例准备、locale fallback 和文本/代码池输出阶段，并增加确定性产物检查。
- 发布脚本改用 staging allowlist，独立执行 `npm ci --omit=dev`，生成约 9.4 MB 的生产依赖包。
- 发布包会解压并启动真实服务器，检查 `/health`、首页和构建资源后才视为成功。
- Runtime 限流默认不信任 `X-Forwarded-For`；仅显式设置 `TRUST_PROXY=1` 时读取可信代理地址。
- 浏览器编辑代码的同源执行边界已明确记录；支持第三方共享源码前必须迁移到 opaque-origin sandbox iframe。

### Verification

- 17 个 Node 单元与契约测试通过。
- 121/121 Demo 通过，其中包含 Loading、Reveal、Errored、hydration、identity 和 async 的专项行为场景。
- Podman Chromium 端到端测试 4/4 通过，覆盖手动运行、Reset、主题、Tooltip、BackTop、移动 Drawer 和懒加载 chunk。
- 新增确定性 catalog 检查和 gzip bundle budget；主入口与 API chunk 均在预算内。
- 严格 TypeScript、Prettier、`git diff --check`、生产构建和发布包 smoke 全部通过。

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
- 浏览器 demo 执行器改为动态导入；服务通信、DOM 作用域、值格式化和执行编排拆分为独立模块。
- 完整目录升级为 schema 4，从 Node 允许列表生成浏览器/服务端执行类型，删除前端重复维护的 SSR API 名单。
- Hash 导航接入浏览器历史，支持深链接、前进、后退，并将 URL 读写和事件订阅收敛到独立路由适配器。
- 生产入口从 557.46 KB 降至 230.58 KB，gzip 从 116.20 KB 降至 75.48 KB；完整 API 数据进入独立按需 chunk。

### Test Automation

- 引入 `@playwright/test@1.62.0`，浏览器及系统依赖由 `mcr.microsoft.com/playwright:v1.62.0-noble` Podman 镜像提供。
- 新增桌面搜索与导航、浏览器历史、语言和主题持久化、真实 demo 执行、移动端目录以及按需 chunk 加载测试。
- 增加 12 个 Node 单元与服务集成测试，覆盖目录 schema、加载适配器、执行类型契约、HTTP 协议、静态资源、SPA 回退、缓存和限流。
- Demo HTTP 端点补齐方法与索引校验，错误响应继续复用统一本地化协议。
- 生产服务器拆分为可注入 HTTP 应用工厂和薄进程入口，可通过随机端口测试且不再在导入时产生监听副作用。
- GitHub Actions 与本地统一执行 `npm test`，并保留失败截图、视频、trace 和 HTML 报告。
- 完整门禁只生成一次目录、构建一次生产包，再由 Podman 复用 `dist`；独立测试命令仍保留自准备能力。
- `npm test` 统一执行类型检查、格式检查、单元测试、121 个 demo 验证和容器化端到端测试。
- 新增 `npm run package:code`，自动构建、压缩、校验 `code.zip` 并输出 SHA-256。

### Verification

- 116 个浏览器 demo 和 5 个 SSR demo 全部通过，合计 121/121。
- Node 契约、协议与服务集成测试 12/12 通过。
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
