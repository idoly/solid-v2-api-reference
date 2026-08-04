# Solid v2 API 参考

[English](./README.md) | [简体中文](./README.zh-CN.md)

基于源码生成、可直接运行的 `solid-js@2.0.0-beta.30` 与 `@solidjs/web@2.0.0-beta.30` 中英文 API 参考。

目录直接从当前仓库安装的依赖包生成，包含真实公开导出、TypeScript 签名、相关类型、固定版本源码链接和可编辑示例。浏览器示例使用受控的预览挂载点；SSR 示例通过受限的 Node 执行器运行。

## 环境要求

- Node.js `^20.19.0` 或 `>=22.12.0`
- npm
- Podman（用于容器化浏览器测试）

## 快速开始

```bash
npm install
npm run dev
```

Vite 会输出本地开发地址，通常为 <http://localhost:5173/>。

## 常用命令

```bash
npm run dev              # 生成两个目录产物并启动 Vite
npm run generate         # 重新生成目录产物
npm run check            # 重新生成目录并执行 TypeScript 检查
npm run build            # 重新生成目录并构建生产版本
npm run preview          # 通过 Vite 预览生产构建
npm start                # 使用生产 Node 服务器提供构建产物和示例接口
npm test                 # 执行完整静态、单元、Demo 与浏览器测试
npm run test:unit        # 执行 Node 目录契约与 HTTP 协议测试
npm run test:e2e         # 使用本机已安装的浏览器运行 Playwright
npm run test:e2e:podman  # 在固定版本浏览器容器中运行 Playwright
npm run verify:demos     # 验证全部浏览器与 SSR 示例
npm run format           # 使用 Prettier 格式化项目源码
npm run format:check     # 仅检查格式，不写入文件
npm run check:generated  # 校验已提交目录产物与生成结果一致
npm run check:bundle     # 构建后校验生产资源 gzip 预算
npm run package:code     # 构建、校验并冒烟测试可部署的 code.zip
```

`predev`、`precheck` 和 `prebuild` 会自动重新生成两个 API 目录产物。

## 浏览器测试

端到端测试使用 Playwright 和 Podman 镜像 `mcr.microsoft.com/playwright:v1.62.0-noble`。Chromium 及其系统依赖均由镜像提供，宿主机无需安装浏览器。测试会在临时容器中构建生产版本、启动 Vite 预览服务，并覆盖桌面端搜索与浏览器历史、语言和主题持久化、可执行示例、移动端目录以及 API chunk 懒加载边界。

```bash
npm run test:e2e:podman
```

失败时，截图、视频和 Playwright trace 会保留在 `test-results/`，HTML 报告输出到 `playwright-report/`。内部镜像仓库或镜像代理可通过 `PLAYWRIGHT_IMAGE` 覆盖默认镜像，但镜像中的 Playwright 版本必须与 `@playwright/test` 保持一致。

GitHub Actions 会在 push 和 pull request 时执行与本地一致的完整 `npm test` 质量门禁。测试分层、环境变量和失败产物排查方式见 [tests/README.md](tests/README.md)。

## 项目结构

```text
data/
  catalog-index.json       生成的轻量导航与搜索索引
  catalog.json             完整元数据、本地化文本池和示例源码池

scripts/
  README.md                 目录和示例工具文档
  catalog/
    check-generated.mjs   确定性生成产物检查
    demos.mjs              稳定的示例注册表入口
    demos/                 按领域组织的示例注册表与特殊覆盖
    format.mjs             嵌入式 TSX 格式化器
    generate.mjs           目录扫描与记录组装器
    generator/             示例处理与目录输出阶段
    locale-en.mjs          英文 API 内容与生成规则
    locale-zh-cn.mjs       中文 API 内容与生成规则
    related-apis.mjs       双语 API 选择建议
  demo/
    app.mjs                可测试的生产服务器工厂
    compile.mjs            共享 TypeScript/JSX 编译器
    config.mjs             运行限制与已注册 SSR API
    http.mjs               与 HTTP 框架无关的示例接口处理器
    i18n.mjs               本地化服务错误与语言回退
    load.mjs               生成后的示例源码加载器
    service.mjs            共享编译与 SSR 服务
    plugin.ts              Vite 开发接口
    server.mjs             环境配置与进程生命周期入口
    verify.mjs             浏览器与 SSR 验证编排
    verify-interactions.mjs 通用控件交互辅助
    verify-scenarios.mjs   API 专项行为契约
  release/
    package.sh             可重复执行的部署包构建器
    smoke.mjs              解压后启动探测
  test/bundle-budget.mjs   生产 gzip 预算检查

src/
  main.tsx                 浏览器入口与应用组合
  data/catalog-index.ts    轻量发现数据的首屏适配器
  data/catalog.ts          完整 API 参考数据的懒加载适配器
  features/api/            API 页面与参考视图
  features/demo/           示例控制器、服务客户端、DOM 作用域与运行时
  features/home/           项目首页
  features/i18n/           语言配置、界面文案与运行时文案
  features/navigation/     导航、搜索、侧边栏与顶部栏
  features/theme/          主题状态
  lib/preferences.ts       安全的浏览器偏好适配器
  ui/                      共享 CSS Modules、代码高亮与图标
  styles/global.css        全局 token、reset 与主题根样式
  **/*.module.css          功能局部布局与组件样式

tests/
  README.md                测试架构与问题排查
  unit/                    目录与 HTTP 协议契约
  e2e/                     Playwright 生产浏览器流程
```

`data` 保存生成产物，`scripts/catalog` 负责目录内容与生成，`scripts/demo` 负责可执行示例服务，`src` 包含浏览器应用。

## 目录生成

`scripts/catalog/generate.mjs` 使用 TypeScript Compiler API 扫描已安装 Solid 包的公开运行时导出。一个符号需要同时满足以下条件才会进入目录：

1. 从公开包入口导出。
2. 在运行时实际存在。
3. 至少有一个可调用的 TypeScript 签名。
4. 没有标记为 `@internal`。

生成器会写入两个产物。`data/catalog-index.json` 只包含导航和搜索所需的双语摘要与标识字段；schema 5 的 `data/catalog.json` 保存完整签名、关联类型和 API、re-export 归属、本地化文本池、示例源码以及生成的浏览器/服务端执行类型。[src/data/catalog-index.ts](src/data/catalog-index.ts) 在首屏加载轻量索引，[src/data/catalog.ts](src/data/catalog.ts) 仅在打开 API 页面时验证并展开完整目录。不要编辑或手动格式化这两个生成文件。

中英文 API 内容分别由 `scripts/catalog/locale-en.mjs` 和 `scripts/catalog/locale-zh-cn.mjs` 解析。每种策略包含当前 API 内容，以及用于处理未来新增 API 的回退解析器。相关 API 对比和跨包 re-export 以结构化元数据生成。完整示例按领域存放在 `scripts/catalog/demos/`，并通过稳定入口 `scripts/catalog/demos.mjs` 导出。内容与示例验收规则见 [CONTENT_GUIDE.md](CONTENT_GUIDE.md)。

## 运行时

开发环境无需单独启动运行时服务：

```bash
npm run dev
```

生产环境需要构建并启动内置 Node 服务器：

```bash
npm run build
npm start
```

服务器同时提供 `dist` 和可执行示例，默认监听 `9000` 端口，可通过 `PORT` 修改。`scripts/demo/app.mjs` 负责可注入的 HTTP 应用，`server.mjs` 只校验环境配置、监听端口并处理退出信号。

也可以只静态托管文档。缺少 Node 服务时，示例按钮仍可点击，但会显示本地化的“运行环境不可用”提示。

## 示例执行

浏览器示例通过 `scripts/demo/compile.mjs` 编译，并使用 import allowlist 和预览 DOM 适配器执行。示例仅允许导入：

- `solid-js`
- `@solidjs/web`

预览适配器用于减少意外影响，但不是安全沙箱：用户编辑的浏览器代码仍在当前页面 origin 中执行，可以访问浏览器全局对象。不得加载或自动运行第三方提供的不可信示例源码；在支持共享或远程示例前，必须把执行迁移到 opaque-origin sandbox iframe。

SSR 示例为只读，只执行可信的生成源码。源码和请求正文上限均为 100 KB；SSR 仅允许执行目录 allowlist 中登记的示例，并在五秒后超时。运行时端点会校验 HTTP 方法和示例索引后再执行。

浏览器示例在打开 API 页面时不会自动执行。点击 Run 后才编译并执行当前源码；Reset 会恢复生成源码、清除 Browser 和 Console 结果，并让两个面板回到未执行提示状态。执行期间，Demo 会增量发布控制台和 DOM 结果，并丢弃过期执行。验证器会编译并运行全部示例、操作交互控件、对顺序敏感的 API 执行专项场景，并通过生产服务验证 SSR。

当前验证范围：

- 122 个可调用 API
- 122 个独立完整示例
- 109 个浏览器 API 示例组
- 13 个 SSR API 示例组
- 122/122 通过

## 前端架构

应用是使用 Hash 选择 API 的 Solid 单页界面，不依赖路由器或外部状态管理器。首页和 API 页面由单一的可选当前文档 ID 表达，小型历史适配层负责同步深链接和浏览器前进、后退行为。

- 导航与搜索使用轻量生成索引；完整参考数据和 API 功能区按需加载。
- URL 机械逻辑位于 Hash 路由适配器；导航层只负责目录、搜索与面板状态。
- 示例执行由功能控制器负责，内嵌与全屏编辑器复用同一实现。
- 浏览器运行时仅在执行示例时动态导入；服务通信、DOM 作用域、值格式化和执行编排分别归属独立模块。
- 浏览器/服务端执行类型由 Node 允许列表生成并接受契约测试，不再维护重复的前端 API 名单。
- 应用样式使用全局 token 和 feature-scoped CSS Modules；Ant Solid 使用其预编译样式。
- Ant Solid 提供可访问的交互控件、浮层、反馈与加载状态。
- Prism 提供 TypeScript/TSX 代码高亮。
- Lucide 提供界面图标。
- 主题和语言偏好保存在 `localStorage` 中。

## 版本基线

- 项目版本：`1.4-2.0.0-beta.30`

- `solid-js`：`2.0.0-beta.30`
- `@solidjs/web`：`2.0.0-beta.30`
- 固定源码提交：`2bb02e029611c349d7865bf7cc4d54527fd7cd41`

详细维护文档：

- [部署与代码包](./DEPLOYMENT.md)
- [版本变更](./CHANGELOG.md)
- [目录与示例工具](./scripts/README.md)
- [测试与浏览器自动化](./tests/README.md)
- [添加语言](./src/features/i18n/README.md)
