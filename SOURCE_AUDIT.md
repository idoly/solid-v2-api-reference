# Solid v2 Callable API Audit

## Baseline

- Runtime packages: `solid-js@2.0.0-beta.25` and `@solidjs/web@2.0.0-beta.25`
- Source commit: `918efc9ae0826d7d5be363017e7469e75f470fbb`
- Catalog generator: `scripts/generate-api-catalog.mjs`
- Generated catalog: `src/generated-api-catalog.ts`

## Inclusion Rule

The catalog contains APIs that application or integration code can invoke directly:

1. The symbol is exported by a public package entry point.
2. The symbol exists at runtime.
3. Its resolved TypeScript type has at least one call signature.
4. The source does not mark it `@internal`.

Pure types, constants, symbols, namespaces, classes, non-callable objects, and internal compiler functions are excluded. Callable JSX components remain included. Deprecated callables remain visible with an explicit warning while they are still exported by beta.25.

## Current Surface

- `solid-js`: 54 callable APIs
- `@solidjs/web`: 64 callable APIs
- Total: 118 callable APIs
- Categories: 9
- Deprecated: 1
- APIs with quality-gated executable demos: 118/118
- Executable API entries: 118, backed by 52 unique complete programs
- Browser API groups verified in isolated DOM processes: 115/115
- Browser demos with JSX/DOM output: 115/115
- SSR demos with real HTML preview output: 3/3
- Server API groups verified through the Node executor: 3/3
- APIs without a verified complete demo: 0
- Callable overloads: 157; `never` error-guard declarations are excluded
- Chinese parameter and return notes: 420
- Related type definitions: 221 references across 54 APIs
- Generated instructional comments are not added to demo source
- Browser demos are editable, automatically run once when an API/example is entered, use a standard TSX `App` component entry, keep component state and target API calls inside `App` (except module-level `lazy` and the `render`/`hydrate` bootstraps), and are recompiled on each run; SSR demos remain read-only and execute only trusted generated code
- Shared demo source and compiled strings are pooled in the generated TypeScript catalog to avoid duplicate bundle payload

Same-named callables from different packages remain distinct, for example `solid-js/For` and `@solidjs/web/For`.

## Data Source

The site does not read or retain Markdown API documents. The generator uses the TypeScript compiler API to resolve public package exports, declarations, call signatures, JSDoc, examples, status tags, and source ownership. `scripts/api-content.zh.mjs` provides source-reviewed Chinese introductions, use cases, and complete demo overrides. Every displayed demo is compiled during generation; browser demos execute the matching compiled program in a DOM sandbox, while SSR demos execute through a restricted Node endpoint. API names, package names, code, and TypeScript signatures remain unchanged. Source links are pinned to the beta.25 commit. No official-documentation links are generated.

## Reproduction

```sh
npm run generate
npm run verify:demos
npm run check
npm run build
```

`predev`, `precheck`, and `prebuild` regenerate the catalog automatically.
