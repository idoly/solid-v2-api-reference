# Deployment and Code Package

## 函数代码包

本项目通过生产 Node 服务器同时提供静态页面和 Demo API。每次提交或交付部署版本时，除正常源码变更外，还应在仓库根目录生成一份 `code.zip`。

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
2. 删除旧 `code.zip`，排除 Git 元数据、临时文件和测试报告后重新压缩。
3. 保留 `node_modules`，并校验 `package.json`、生产页面、服务端入口和两个目录产物。
4. 输出压缩包大小、文件数量和 SHA-256。

也可以在文件管理器中进入项目根目录，全选所有部署文件和 `node_modules`，右键压缩为 ZIP。ZIP 内应直接看到 `package.json`，不能在外层额外包一层项目目录。自动化脚本是默认交付方式。

### 函数配置

- 监听端口：`9000`
- 启动命令：`npm start`
- 健康检查：`GET /health`
- 可选端口环境变量：`PORT`

如果平台注入 `PORT`，服务器会优先监听该值；此时平台的“监听端口”必须与 `PORT` 一致。

### 使用依赖层

如果通过函数计算平台的“层”提供依赖，可以不把 `node_modules` 放入 ZIP，但依赖层必须与当前 Node.js 版本、CPU 架构和 `package-lock.json` 一致，并包含全部生产依赖。默认交付方式仍是将 `node_modules` 放入 `code.zip`，以减少环境差异。

## Delivery Checklist

Before each deployment handoff:

1. Run the complete `npm test` quality gate.
2. Run `npm run package:code` to build and validate `code.zip`, including `node_modules`.
3. Verify that `package.json` is at the ZIP root.
4. Configure port `9000` and startup command `npm start`.
5. Keep `code.zip` out of Git; it is a delivery artifact and is already ignored.
