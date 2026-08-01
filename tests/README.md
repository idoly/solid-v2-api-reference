# Testing

The project has three complementary test layers. Node unit tests protect generated-data and HTTP protocol contracts. The demo verifier checks every API example in isolated DOM or SSR execution. Playwright then exercises the assembled production application in Chromium supplied by a Podman container.

## Complete Verification

Run the same local quality gate used before a release:

```bash
npm test
```

This command runs, in order:

1. Deterministic catalog generation and TypeScript checks.
2. Generated demo source and repository formatting checks.
3. Node unit tests for schema, re-exports, related APIs, content fallbacks, demo uniqueness, execution metadata, request methods, validation, limits, and localization.
4. All 109 browser and 12 SSR demo groups, including targeted behavior scenarios.
5. Production build and gzip bundle budgets.
6. Playwright end-to-end tests in Podman.

The generation-based commands are intentionally sequential because they share `.generated` and the two files under `data/`. The complete gate generates the catalog once, builds once, and then lets the Podman browser suite reuse `dist`; standalone commands retain their own preparation steps. GitHub Actions invokes this same command instead of maintaining a separate CI-only sequence.

## Unit Tests

Run the fast Node contract suite with:

```bash
npm run test:unit
```

`tests/unit/catalog-contract.test.mjs` verifies the catalog schema, loader projection, and generated browser/server execution metadata. `tests/unit/catalog-quality.test.mjs` protects re-export and Related API references, rejects generic prose fallbacks, and enforces distinct bounded demo programs. `tests/unit/demo-http.test.mjs` verifies endpoint routing, HTTP methods, index validation, request limits, and localized protocol errors without starting a server. `tests/unit/server-app.test.mjs` runs the production server factory on a random port and covers health checks, static caching, HEAD responses, SPA fallback, missing assets, method restrictions, and rate limiting.

## Playwright

The recommended browser command is:

```bash
npm run test:e2e:podman
```

`scripts/test/e2e-podman.sh` mounts the repository into `mcr.microsoft.com/playwright:v1.62.0-noble`. Chromium and all OS libraries come from the image; the host only needs Node.js, npm, and Podman. `PLAYWRIGHT_IMAGE` may point to an internal mirror, but its Playwright version must match the exact `@playwright/test` version in `package.json`.

To use a browser installed directly on the host:

```bash
npx playwright install chromium
npm run test:e2e
```

`E2E_PORT` changes the preview port. `E2E_BASE_URL` disables the managed preview server and targets an already running application.

## End-To-End Contracts

`tests/e2e/application.spec.ts` verifies:

- The generated API count, desktop content/sidebar proportions, search, API selection, and browser back navigation.
- The initial route does not fetch the complete API chunk; opening an API fetches it on demand.
- Locale and theme preferences survive a reload.
- A browser demo makes no runtime request before Run, then compiles through the runtime endpoint, publishes DOM and console output, and returns to its pre-execution state after Reset.
- The mobile catalog opens, searches, navigates, and closes correctly.

Use accessible roles and labels for locators. Add test-only selectors only when the user-facing semantics cannot identify an element reliably.

## Failure Artifacts

Playwright writes its HTML report to `playwright-report/`. Failed tests retain screenshots, videos, and traces under `test-results/`.

```bash
npx playwright show-trace test-results/<test-name>/trace.zip
```

Both directories are ignored by Git and uploaded by GitHub Actions when present.
