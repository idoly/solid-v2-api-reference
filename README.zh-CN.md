# Solid v2 API 参考

[English](./README.md) | [简体中文](./README.zh-CN.md)

基于源码生成、可直接运行的 `solid-js@2.0.0-beta.27` 与 `@solidjs/web@2.0.0-beta.27` 中英文 API 参考。

目录直接从当前仓库安装的依赖包生成，包含真实公开导出、TypeScript 签名、相关类型、固定版本源码链接和可编辑示例。浏览器示例使用受控的预览挂载点；SSR 示例通过受限的 Node 执行器运行。

## 环境要求

- Node.js `^20.19.0` 或 `>=22.12.0`
- npm

## 快速开始

```bash
npm install
npm run dev
```

Vite 会输出本地开发地址，通常为 <http://localhost:5173/>。

## 常用命令

```bash
npm run dev          # 生成目录并启动 Vite
npm run generate     # 根据已安装的 Solid 包重新生成目录
npm run check        # 重新生成目录并执行 TypeScript 检查
npm run build        # 重新生成目录并构建生产版本
npm run preview      # 通过 Vite 预览生产构建
npm start            # 使用生产 Node 服务器提供构建产物和示例接口
npm run verify:demos # 验证全部浏览器与 SSR 示例
npm run format       # 使用 Prettier 格式化项目源码
npm run format:check # 仅检查格式，不写入文件
```

`predev`、`precheck` 和 `prebuild` 会自动重新生成 API 目录。

## 项目结构

```text
data/
  catalog.json             生成的元数据、本地化文本池和示例源码池

scripts/
  README.md                 目录和示例工具文档
  catalog/
    demos.mjs              按 API 组织的示例注册表与源码构建器
    format.mjs             嵌入式 TSX 格式化器
    generate.mjs           目录扫描与生成器
    locale-en.mjs          英文 API 内容与生成规则
    locale-zh-cn.mjs       中文 API 内容与生成规则
  demo/
    compile.mjs            共享 TypeScript/JSX 编译器
    i18n.mjs               本地化服务错误与语言回退
    load.mjs               生成后的示例源码加载器
    service.mjs            共享编译与 SSR 服务
    plugin.ts              Vite 开发接口
    server.mjs             生产 HTTP 服务器
    verify.mjs             浏览器与 SSR 验证器

src/
  main.tsx                 浏览器入口与应用组合
  data/catalog.ts          生成数据的类型适配器
  features/api/            API 页面与参考视图
  features/demo/           示例控制器、视图与运行时适配器
  features/home/           项目首页
  features/i18n/           语言配置、界面文案与运行时文案
  features/navigation/     导航、搜索、侧边栏与顶部栏
  features/theme/          主题状态
  lib/preferences.ts       安全的浏览器偏好适配器
  ui/                      共享样式、代码高亮与图标
  tailwind.css             Tailwind CSS 设计系统
```

`data` 保存生成产物，`scripts/catalog` 负责目录内容与生成，`scripts/demo` 负责可执行示例服务，`src` 包含浏览器应用。

## 目录生成

`scripts/catalog/generate.mjs` 使用 TypeScript Compiler API 扫描已安装 Solid 包的公开运行时导出。一个符号需要同时满足以下条件才会进入目录：

1. 从公开包入口导出。
2. 在运行时实际存在。
3. 至少有一个可调用的 TypeScript 签名。
4. 没有标记为 `@internal`。

生成的 `data/catalog.json` 保存元数据、分类、本地化内容、示例源码和紧凑记录索引。[src/data/catalog.ts](src/data/catalog.ts) 负责验证并展开数据供应用使用。不要编辑或手动格式化该生成文件。

中英文 API 内容分别由 `scripts/catalog/locale-en.mjs` 和 `scripts/catalog/locale-zh-cn.mjs` 解析。每种策略包含当前 API 内容，以及用于处理未来新增 API 的回退解析器。每个 API 都在 `scripts/catalog/demos.mjs` 中拥有独立、完整且与语言无关的示例程序。

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

服务器同时提供 `dist` 和可执行示例，默认监听 `9000` 端口，可通过 `PORT` 修改。

也可以只静态托管文档。缺少 Node 服务时，示例按钮仍可点击，但会显示本地化的“运行环境不可用”提示。

## 示例执行

浏览器示例通过 `scripts/demo/compile.mjs` 编译，并使用受限模块加载器和预览适配器执行。示例仅允许导入：

- `solid-js`
- `@solidjs/web`

SSR 示例为只读，只执行可信的生成源码。源码和请求正文上限均为 100 KB；SSR 仅允许执行三个已注册的渲染 API，并在五秒后超时。

验证器使用 Solid 的开发与浏览器条件，并在编译错误、无效响应式用法、框架诊断、`console.error`、运行失败、超时或缺少输出时失败。

当前验证范围：

- 118 个可调用 API
- 118 个独立完整示例
- 115 个浏览器 API 示例组
- 3 个 SSR API 示例组
- 118/118 通过

## 前端架构

应用是使用 Hash 选择 API 的 Solid 单页界面，不依赖路由器或外部状态管理器。

- Tailwind CSS v4 提供 CSS-first 设计系统和工具类。
- Prism 提供 TypeScript/TSX 代码高亮。
- Lucide 提供界面图标。
- 主题和语言偏好保存在 `localStorage` 中。

## 版本基线

- `solid-js`：`2.0.0-beta.27`
- `@solidjs/web`：`2.0.0-beta.27`
- 固定源码提交：`4e3921b77c3dfc538b983710dfd9531709251e84`

详细维护文档：

- [版本变更](./CHANGELOG.md)
- [目录与示例工具](./scripts/README.md)
- [添加语言](./src/features/i18n/README.md)
