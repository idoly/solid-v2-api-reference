# Solid v2 API Reference

A source-derived, executable Chinese and English API reference for `solid-js@2.0.0-beta.26` and `@solidjs/web@2.0.0-beta.26`.

The catalog is generated from the packages installed in this repository. It exposes the real callable exports, TypeScript signatures, related types, pinned source links, and editable examples. Browser examples run in an isolated DOM sandbox; SSR examples run through a restricted Node executor.

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
    demos.mjs              Shared demo templates
    format.mjs             Embedded TSX formatter
    generate.mjs           Catalog scanner and generator
    locale-en.mjs          English API prose and generation rules
    locale-zh-cn.mjs       Chinese API prose and generation rules
  demo/
    compile.mjs            Shared TypeScript/JSX compiler
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
  features/i18n/           Locale state and messages
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

English and Chinese API prose is resolved by `scripts/catalog/locale-en.mjs` and `scripts/catalog/locale-zh-cn.mjs`. Each strategy contains the complete current API content and a resolver for APIs discovered in later package versions. New English entries prefer upstream JSDoc; missing prose in either language is generated from API metadata and category rules. Shared demo templates remain language-neutral generation inputs in `scripts/catalog/demos.mjs`.

## Demo Execution

Browser examples are compiled through `scripts/demo/compile.mjs` and executed with a restricted module loader. They may import only:

- `solid-js`
- `@solidjs/web`

SSR examples are read-only and execute only trusted generated code through the Vite middleware.

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
