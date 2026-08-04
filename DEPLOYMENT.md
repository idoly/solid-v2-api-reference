# Deployment and Code Package

## 函数代码包

本项目通过生产 Node 服务器同时提供静态页面和 Demo API。当前交付版本为 `1.4-2.0.0-beta.30`。每次提交或交付部署版本时，除正常源码变更外，还应在仓库根目录生成一份 `code.zip`。

### 打包前检查

```bash
npm ci
npm test
```

完整质量门禁通过后再生成交付包。打包机还需要提供 `zip`、`unzip`、`rg` 和 `sha256sum`；自动化脚本会在开始构建前检查这些命令。

### 生成 ZIP

代码包必须包含 `node_modules`。在仓库根目录执行：

```bash
npm run package:code
```

版本化脚本 `scripts/release/package.sh` 会自动完成以下工作：

1. 重新生成目录并构建 `dist/`。
2. 在 `.tmp/` 下创建隔离 staging，只复制 `dist/`、`data/`、生产服务脚本和 package manifests。
3. 在 staging 中执行 `npm ci --omit=dev --ignore-scripts`，安装与 lockfile 一致的生产依赖。
4. 从 staging 生成 `code.zip`，校验运行入口、目录产物、核心依赖，并拒绝源码、测试和 Playwright 文件。
5. 解压归档并启动包内生产服务器，检查 `/health`、首页和一个构建资源。
6. 输出压缩包大小、文件数量和 SHA-256。

不要手工全选工作区或复用当前 `node_modules` 打包。ZIP 内应直接看到 `package.json`，不能在外层额外包一层项目目录。

### 函数配置

- 监听端口：`9000`
- 启动命令：`npm start`
- 健康检查：`GET /health`
- 可选端口环境变量：`PORT`
- 可选限流：`DEMO_RATE_LIMIT`，默认每分钟 30 次 runtime 请求
- 可信代理：`TRUST_PROXY=1` 时才读取 `X-Forwarded-For`

如果平台注入 `PORT`，服务器会优先监听该值；此时平台的“监听端口”必须与 `PORT` 一致。只有确认平台网关会清理并重写 `X-Forwarded-For` 时才能启用 `TRUST_PROXY=1`，否则客户端可以伪造来源地址绕过限流。

### Demo 执行信任边界

服务端只执行目录 allowlist 中登记的只读 SSR demo，生成 catalog 会通过契约测试与该列表保持一致。浏览器编辑器中的代码在当前页面 origin 中执行，import allowlist 和 scoped document 不是安全沙箱；不要加载或自动执行来自第三方链接、用户内容或远程存储的源码。支持共享 demo 前，需要将浏览器执行迁移到不带 `allow-same-origin` 的 sandbox iframe。

### 使用依赖层

如果通过函数计算平台的“层”提供依赖，可以不把 `node_modules` 放入 ZIP，但依赖层必须与当前 Node.js 版本、CPU 架构和 `package-lock.json` 一致，并包含全部生产依赖。默认交付方式仍是将 `node_modules` 放入 `code.zip`，以减少环境差异。

## Delivery Checklist

Before each deployment handoff:

1. Run the complete `npm test` quality gate.
2. Run `npm run package:code` to build a clean staging directory, install production dependencies, and validate `code.zip`.
3. Verify that `package.json` is at the ZIP root.
4. Configure port `9000` and startup command `npm start`.
5. Keep `code.zip` out of Git; it is a delivery artifact and is already ignored.
