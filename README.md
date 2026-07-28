# Solid v2 API Reference

A source-derived, executable Chinese and English API reference for `solid-js@2.0.0-beta.26` and `@solidjs/web@2.0.0-beta.26`.

The catalog is generated from the packages installed in this repository. It exposes the real callable exports, TypeScript signatures, related types, pinned source links, and editable examples. Browser examples run against a scoped preview mount and document adapter; SSR examples run through a restricted Node executor.

## Requirements

- Node.js `^20.19.0` or `>=22.12.0`
- npm

## Getting Started

```bash
npm install
npm run dev
```

Vite prints the local development URL, normally <http://localhost:5173/>.

## Commands

```bash
npm run dev          # Generate the catalog and start Vite
npm run generate     # Rebuild the catalog from installed Solid packages
npm run check        # Regenerate and run TypeScript checks
npm run build        # Regenerate and create a production build
npm run preview      # Preview the production build through Vite
npm start            # Serve the build and Demo APIs with the production Node server
npm run verify:demos # Verify all browser and SSR examples
npm run format       # Format project source files with Prettier
npm run format:check # Check formatting without writing files
```

`predev`, `precheck`, and `prebuild` regenerate the API catalog automatically.

## Project Structure

```text
data/
  catalog.json             Generated metadata, locale text pools, and demo source pool

scripts/
  README.md                 Catalog and demo tooling documentation
  catalog/
    demos.mjs              Per-API demo registry and source builders
    format.mjs             Embedded TSX formatter
    generate.mjs           Catalog scanner and generator
    locale-en.mjs          English API prose and generation rules
    locale-zh-cn.mjs       Chinese API prose and generation rules
  demo/
    compile.mjs            Shared TypeScript/JSX compiler
    i18n.mjs               Localized service errors and locale fallback
    load.mjs               Generated demo source loader
    service.mjs            Shared compile and SSR service
    plugin.ts              Vite development endpoints
    server.mjs             Production HTTP server
    verify.mjs             Browser and SSR verification

src/
  main.tsx                 Browser entry and application composition
  data/catalog.ts          Typed adapter for generated data
  features/api/            API page and reference view
  features/demo/           Controller, view, and runtime adapter
  features/home/           Project home page
  features/i18n/           Locale config, UI messages, and runtime messages
  features/navigation/     Controller, search, sidebar, and top bar
  features/theme/          Theme state
  lib/preferences.ts       Safe browser preference adapter
  ui/                      Shared classes, highlighting, and icons
  tailwind.css             CSS-first Tailwind design system
```

The separation is intentional:

- `data` contains one generated catalog and can be rebuilt with `npm run generate`.
- `scripts/catalog` owns API prose strategies, demo templates, formatting, and catalog generation.
- `scripts/demo` owns Node/build-time demo compilation and execution tooling.
- `src` contains the browser application and its typed catalog adapter.

The frontend uses a few deliberately small patterns:

- **Adapter:** `src/data/catalog.ts` validates and expands generated data; `features/demo/runtime.ts` isolates browser and SSR runtimes.
- **Controller + View:** Demo state lives in `features/demo/controller.ts`; `lab.tsx` renders it.
- **Composition:** `features/api/index.tsx` owns page-level example selection and composes `reference.tsx`.
- **Preference adapter:** locale and theme controllers share failure-tolerant storage through `lib/preferences.ts`.
- **Registry:** API lookup, category grouping, icons, and state classes use explicit `Map`, `Set`, or object registries.

## Catalog Generation

`scripts/catalog/generate.mjs` uses the TypeScript compiler API to inspect public runtime exports from the installed Solid packages. A symbol is included when it:

1. Is exported from a public package entry point.
2. Exists at runtime.
3. Has at least one callable TypeScript signature.
4. Is not marked `@internal`.

The generated `data/catalog.json` stores metadata, categories, localized prose, demo source, records, and their numeric pool indexes in one versioned file. [src/data/catalog.ts](src/data/catalog.ts) validates and expands those indexes, then exposes:

- `docs`
- `groups`
- `docsById`
- `docsByTitle`
- `findDoc`
- `Doc`
- `Text`

Do not manually format `data/catalog.json`; its compact form is intentional.

English and Chinese API prose is resolved by `scripts/catalog/locale-en.mjs` and `scripts/catalog/locale-zh-cn.mjs`. Each strategy contains the complete current API content and a resolver for APIs discovered in later package versions. New English entries prefer upstream JSDoc; missing prose in either language is generated from API metadata and category rules. Every API has its own language-neutral, complete demo program in `scripts/catalog/demos.mjs`.

## Runtime

The application expects the browser UI and Demo APIs to share one origin. `src/features/demo/runtime.ts` calls two internal endpoints:

| Endpoint                                 | Purpose                                                 |
| ---------------------------------------- | ------------------------------------------------------- |
| `POST /__solid_api_compile`              | Compile editable browser TSX into executable JavaScript |
| `GET /__solid_api_demo?id=...&index=...` | Execute a registered read-only SSR demo                 |

The production Node server also exposes `GET /health`, which returns `{ "status": "ok" }`. Runtime requests may include `locale` (`en` or `zh-CN`); unknown locales fall back to English, while Chinese language variants fall back to `zh-CN`.

A compile request uses JSON:

```json
{
  "source": "import { render } from '@solidjs/web';",
  "locale": "en"
}
```

Successful compile responses contain `{ "code": "..." }`. Demo execution responses use the same shape in development and production:

```json
{
  "logs": [{ "level": "log", "text": "..." }],
  "html": "<main>...</main>",
  "error": "optional localized error"
}
```

Log levels are `log`, `info`, `warn`, `error`, and `result`.

### Development

```bash
npm run dev
```

The Vite plugin in `scripts/demo/plugin.ts` installs both Demo API endpoints. Browser demos compile on demand, while the three SSR demos execute through the shared Node service.

### Production

```bash
npm run build
npm start
```

`npm start` runs `scripts/demo/server.mjs`, which serves `dist`, the SPA fallback, the health endpoint, and both Demo APIs. A typical deployment can be configured with:

```bash
PORT=9000 STATIC_DIR=dist DEMO_RATE_LIMIT=30 npm start
```

| Environment variable | Default | Meaning                                            |
| -------------------- | ------- | -------------------------------------------------- |
| `PORT`               | `9000`  | HTTP listen port                                   |
| `STATIC_DIR`         | `dist`  | Production asset directory                         |
| `DEMO_RATE_LIMIT`    | `30`    | Demo API requests allowed per client IP per minute |

When a reverse proxy is used, route the page and `/__solid_api_*` paths to the same application. Forward the client address through `X-Forwarded-For` if per-client rate limiting is required.

### Static-Only Hosting

A static host may serve `dist` without the Node runtime. The API pages still load, run buttons remain enabled, and demos still attempt their normal automatic execution. If the host returns a 404, HTML fallback, invalid JSON, or a network failure for a Demo API, the console shows a localized message instead of a JSON parsing exception:

```text
当前部署环境未提供代码运行服务。
This deployment does not provide the demo runtime service.
```

Signatures, prose, source links, code viewing, editing, copying, navigation, locale selection, and theme selection continue to work. Executable browser and SSR output requires the Demo APIs.

### Runtime Boundaries

- Browser code runs in the page's JavaScript realm with a scoped preview mount and proxied common document targets. This protects normal preview placement but is not a security boundary for untrusted code.
- Demo imports are restricted to `solid-js` and `@solidjs/web`.
- Compile request bodies and demo source are limited to 100 KB.
- SSR execution is limited to the three registered rendering APIs, uses generated read-only source, and times out after five seconds.
- The production server applies request and header timeouts of ten seconds.
- User-facing runtime and service failures are localized with English fallback.

## Demo Execution

Browser examples are compiled through `scripts/demo/compile.mjs` and executed with the restricted module loader and preview adapter. They may import only:

- `solid-js`
- `@solidjs/web`

SSR examples are read-only and execute only trusted generated code through the same service used by Vite development, Vite preview, and the production Node server.

The verifier runs Solid with `development` and `browser` export conditions where appropriate. It fails on:

- Reactive writes in invalid owned scopes
- Untracked reactive reads
- Ownerless effects
- Framework `console.warn` or `console.error` diagnostics
- Demo `console.error` output
- Runtime exceptions or timeouts
- Missing browser DOM output
- Missing SSR HTML output

Current verified surface:

- 118 callable APIs
- 115 browser API groups
- 3 SSR API groups
- 118/118 passing
- 118 unique complete demo programs

## Frontend Architecture

The application is a Solid single-page interface with hash-based API selection. It does not use a router or external state manager.

- Tailwind CSS v4 provides the CSS-first design system and utility styles.
- Prism provides TypeScript/TSX highlighting.
- Lucide provides interface icons.
- Theme selection follows the system preference initially and persists in `localStorage`.

## Source Baseline

- `solid-js`: `2.0.0-beta.26`
- `@solidjs/web`: `2.0.0-beta.26`
- Pinned source commit: `595ec2536ddfda5cf705b6a3e0ab59f899c60f71`

See [scripts/README.md](./scripts/README.md) for the catalog pipeline, locale strategy contract, inclusion rules, and demo verification details.
