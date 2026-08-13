# Solid v2 API Reference

[English](./README.md) | [简体中文](./README.zh-CN.md)

A source-derived, executable Chinese and English API reference for `solid-js@2.0.0-rc.0` and `@solidjs/web@2.0.0-rc.0`.

The catalog is generated from the packages installed in this repository. It exposes the real callable exports, TypeScript signatures, related types, pinned source links, and editable examples. Browser examples use a scoped preview mount; SSR examples run through a restricted Node executor.

## Requirements

- Node.js `^20.19.0` or `>=22.12.0`
- npm
- Podman (for containerized browser tests)

## Getting Started

```bash
npm install
npm run dev
```

Vite prints the local development URL, normally <http://localhost:5173/>.

## Commands

```bash
npm run dev              # Generate both catalogs and start Vite
npm run generate         # Rebuild generated catalog artifacts
npm run check            # Regenerate and run TypeScript checks
npm run build            # Regenerate and create a production build
npm run preview          # Preview the production build through Vite
npm start                # Serve the build and Demo APIs with the production Node server
npm test                 # Run the complete static, unit, demo, and browser test suite
npm run test:unit        # Run Node contract and HTTP protocol tests
npm run test:e2e         # Run Playwright with a locally installed browser
npm run test:e2e:podman  # Run Playwright in the pinned browser container
npm run verify:demos     # Verify all browser and SSR examples
npm run format           # Format project source files with Prettier
npm run format:check     # Check formatting without writing files
npm run check:generated  # Verify committed catalog artifacts are current
npm run check:bundle     # Enforce production gzip budgets after a build
npm run package:code     # Build, validate, and smoke-test deployable code.zip
```

`predev`, `precheck`, and `prebuild` regenerate both API catalog artifacts automatically.

## Browser Tests

The end-to-end suite uses Playwright and the `mcr.microsoft.com/playwright:v1.62.0-noble` Podman image. The image owns Chromium and its system libraries, so no browser is installed on the host. The suite builds the production app, starts a Vite preview server inside the temporary container, and covers desktop search and browser history, persisted locale and theme preferences, the mobile catalog, the lazy API chunk boundary, and a real-Chromium run of every generated API demo with Browser and Console output checks.

```bash
npm run test:e2e:podman
```

Failures retain screenshots, videos, and Playwright traces under `test-results/`; the HTML report is written to `playwright-report/`. Override the image for an internal registry or mirror with `PLAYWRIGHT_IMAGE` while keeping its Playwright version aligned with `@playwright/test`.

GitHub Actions runs the same complete `npm test` quality gate on pushes and pull requests. See [tests/README.md](tests/README.md) for the test layers, environment overrides, and artifact workflow.

## Project Structure

```text
data/
  catalog-index.json       Lightweight generated navigation and search index
  catalog.json             Complete metadata, locale text pools, and demo source pool

scripts/
  README.md                 Catalog and demo tooling documentation
  catalog/
    check-generated.mjs   Deterministic committed-artifact check
    demos.mjs              Stable demo registry entry point
    demos/                 Domain demo registries and special overrides
    format.mjs             Embedded TSX formatter
    generate.mjs           Catalog scanner and record assembler
    generator/             Demo preparation and catalog output stages
    locale-en.mjs          English API prose and generation rules
    locale-zh-cn.mjs       Chinese API prose and generation rules
    related-apis.mjs       Bilingual API selection comparisons
  demo/
    app.mjs                Testable production server factory
    compile.mjs            Shared TypeScript/JSX compiler
    config.mjs             Runtime limits and registered SSR APIs
    http.mjs               Framework-neutral Demo API request handler
    i18n.mjs               Localized service errors and locale fallback
    load.mjs               Generated demo source loader
    service.mjs            Shared compile and SSR service
    plugin.ts              Vite development endpoints
    server.mjs             Environment and process lifecycle entry
    verify.mjs             Browser and SSR verification orchestration
    verify-interactions.mjs Generic control exercise helpers
    verify-scenarios.mjs   API-specific behavior contracts
  release/
    package.sh             Reproducible deployment package builder
    smoke.mjs              Extracted package startup probe
  test/bundle-budget.mjs   Production gzip budget check

src/
  main.tsx                 Browser entry and application composition
  data/catalog-index.ts    Eager adapter for lightweight discovery data
  data/catalog.ts          Lazy adapter for complete API reference data
  features/api/            API page and reference view
  features/demo/           Controller, service client, scoped DOM, and runtime
  features/home/           Project home page
  features/i18n/           Locale config, UI messages, and runtime messages
  features/navigation/     Controller, search, sidebar, and top bar
  features/theme/          Theme state
  lib/preferences.ts       Safe browser preference adapter
  ui/                      Shared CSS modules, highlighting, and icons
  styles/global.css        Global tokens, reset, and theme roots
  **/*.module.css          Feature-scoped layout and component styles

tests/
  README.md                Test architecture and troubleshooting
  unit/                    Catalog and HTTP protocol contracts
  e2e/                     Playwright production-browser workflows
```

`data` is generated, `scripts/catalog` owns catalog content and generation, `scripts/demo` owns executable demo services, and `src` contains the browser application.

## Catalog Generation

`scripts/catalog/generate.mjs` uses the TypeScript compiler API to inspect public runtime exports from the installed Solid packages. A symbol is included when it:

1. Is exported from a public package entry point.
2. Exists at runtime.
3. Has at least one callable TypeScript signature.
4. Is not marked `@internal`.

The generator writes two artifacts. `data/catalog-index.json` contains only the bilingual summaries and identity fields needed by navigation and search. Schema 5 of `data/catalog.json` stores complete signatures, related types and APIs, re-export ownership, localized prose pools, demo source, and the generated browser/server execution type. [src/data/catalog-index.ts](src/data/catalog-index.ts) loads the index eagerly, while [src/data/catalog.ts](src/data/catalog.ts) validates and expands the complete catalog only when an API page is opened. Do not edit or manually format either generated file.

English and Chinese API prose is resolved by `scripts/catalog/locale-en.mjs` and `scripts/catalog/locale-zh-cn.mjs`. Each strategy contains the current API content and a resolver for APIs discovered in later package versions. Related API comparisons and package re-exports are generated as structured metadata. Complete demo programs are grouped by domain under `scripts/catalog/demos/` and exported through the stable `scripts/catalog/demos.mjs` entry point. Content and demo acceptance rules are documented in [CONTENT_GUIDE.md](CONTENT_GUIDE.md).

## Runtime

Development needs no separate runtime process:

```bash
npm run dev
```

For production, build and start the bundled Node server:

```bash
npm run build
npm start
```

The server hosts both `dist` and executable demos on port `9000` by default. Set `PORT` to use another port. `scripts/demo/app.mjs` owns the injectable HTTP application; `server.mjs` only validates environment settings, starts listening, and handles shutdown signals.

Pure static hosting is also supported for reading the reference. Without the Node server, demos remain clickable but show a localized runtime-unavailable message.

## Demo Execution

Browser examples are compiled through `scripts/demo/compile.mjs` and executed with an import allowlist and scoped preview adapter. They may import only:

- `solid-js`
- `@solidjs/web`

The scoped adapter is an isolation aid, not a security sandbox: user-edited browser code executes in the current page origin and can reach browser globals. Do not load or auto-run demo source supplied by an untrusted third party. Moving execution to an opaque-origin sandbox iframe is the required design before shared or remotely supplied programs are supported.

SSR examples are read-only and execute only trusted generated code. Source and request bodies are limited to 100 KB; SSR execution is restricted to the registered catalog allowlist and times out after five seconds. Runtime endpoints enforce their HTTP methods and validate demo indexes before execution.

Browser demos do not execute when an API page opens. Run compiles and executes the current source; Reset restores the generated source, clears Browser and Console results, and returns both panels to their pre-execution prompts. During execution, demos publish console and DOM updates incrementally and discard stale results. The verifier compiles and runs every example, exercises interactive controls, applies targeted scenarios where ordering matters, and validates SSR through the production service.

Current verified surface:

- 97 callable APIs
- 97 unique complete demo programs
- 80 browser API groups
- 17 SSR API groups
- 97/97 passing in the contract verifier

## Frontend Architecture

The application is a Solid single-page interface with hash-based API selection. It does not use a router or external state manager. A single optional active-document ID represents both home and API routes, while a small history adapter keeps deep links and browser back/forward navigation synchronized.

- Navigation and search use a lightweight generated index; complete reference data and the API feature load on demand.
- URL mechanics live in a hash-route adapter; navigation owns only catalog, search, and panel state.
- Demo execution stays in the feature controller; inline and fullscreen editors share one implementation.
- The browser runtime is dynamically imported only when an example executes; service transport, scoped DOM access, value formatting, and execution orchestration have separate modules.
- Browser/server execution metadata is generated from the Node allowlist and contract-tested, eliminating duplicate frontend API lists.
- Application styles use global tokens and feature-scoped CSS Modules; Ant Solid consumes its precompiled stylesheet.
- Ant Solid provides accessible interactive controls, overlays, feedback, and loading states.
- Prism provides TypeScript/TSX highlighting.
- Lucide provides interface icons.
- Theme and locale preferences persist in `localStorage`.

## Source Baseline

- Project release: `1.4-2.0.0-rc.0`

- `solid-js`: `2.0.0-rc.0`
- `@solidjs/web`: `2.0.0-rc.0`
- Pinned source commit: `ff4d3c4479163fbdd3327f5b22d0c3ea7bd1a2c5`
- `@solidjs/web` rc.0 additions: `clearFlashCookie`, `hasFlashCookie`, `parseCookieHeader`, `serializeCookie`, `getServerFunctionMetadata`, and `isServerFunction`

Detailed maintenance documentation:

- [Deployment and code packaging](./DEPLOYMENT.md)
- [Release changes](./CHANGELOG.md)
- [Catalog and demo tooling](./scripts/README.md)
- [Testing and browser automation](./tests/README.md)
- [Adding a locale](./src/features/i18n/README.md)
