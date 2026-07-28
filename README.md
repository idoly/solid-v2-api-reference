# Solid v2 API Reference

[English](./README.md) | [简体中文](./README.zh-CN.md)

A source-derived, executable Chinese and English API reference for `solid-js@2.0.0-beta.26` and `@solidjs/web@2.0.0-beta.26`.

The catalog is generated from the packages installed in this repository. It exposes the real callable exports, TypeScript signatures, related types, pinned source links, and editable examples. Browser examples use a scoped preview mount; SSR examples run through a restricted Node executor.

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

`data` is generated, `scripts/catalog` owns catalog content and generation, `scripts/demo` owns executable demo services, and `src` contains the browser application.

## Catalog Generation

`scripts/catalog/generate.mjs` uses the TypeScript compiler API to inspect public runtime exports from the installed Solid packages. A symbol is included when it:

1. Is exported from a public package entry point.
2. Exists at runtime.
3. Has at least one callable TypeScript signature.
4. Is not marked `@internal`.

The generated `data/catalog.json` stores metadata, categories, localized prose, demo source, and compact record indexes. [src/data/catalog.ts](src/data/catalog.ts) validates and expands it for the application. Do not edit or manually format this generated file.

English and Chinese API prose is resolved by `scripts/catalog/locale-en.mjs` and `scripts/catalog/locale-zh-cn.mjs`. Each strategy contains the current API content and a resolver for APIs discovered in later package versions. Every API has its own language-neutral, complete demo program in `scripts/catalog/demos.mjs`.

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

The server hosts both `dist` and executable demos on port `9000` by default. Set `PORT` to use another port.

Pure static hosting is also supported for reading the reference. Without the Node server, demos remain clickable but show a localized runtime-unavailable message.

## Demo Execution

Browser examples are compiled through `scripts/demo/compile.mjs` and executed with a restricted module loader and scoped preview adapter. They may import only:

- `solid-js`
- `@solidjs/web`

SSR examples are read-only and execute only trusted generated code. Source and request bodies are limited to 100 KB; SSR execution is limited to the three registered rendering APIs and times out after five seconds.

The verifier uses Solid's development and browser conditions and fails on compilation errors, invalid reactive usage, framework diagnostics, `console.error`, runtime failures, timeouts, or missing output.

Current verified surface:

- 118 callable APIs
- 118 unique complete demo programs
- 115 browser API groups
- 3 SSR API groups
- 118/118 passing

## Frontend Architecture

The application is a Solid single-page interface with hash-based API selection. It does not use a router or external state manager.

- Tailwind CSS v4 provides the CSS-first design system and utility styles.
- Prism provides TypeScript/TSX highlighting.
- Lucide provides interface icons.
- Theme and locale preferences persist in `localStorage`.

## Source Baseline

- `solid-js`: `2.0.0-beta.26`
- `@solidjs/web`: `2.0.0-beta.26`
- Pinned source commit: `595ec2536ddfda5cf705b6a3e0ab59f899c60f71`

Detailed maintenance documentation:

- [Catalog and demo tooling](./scripts/README.md)
- [Adding a locale](./src/features/i18n/README.md)
