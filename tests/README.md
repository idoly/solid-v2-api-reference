# Testing

The project has two complementary test layers. The generated demo verifier checks every API example in isolated DOM or SSR execution. Playwright then exercises the assembled production application in Chromium supplied by a Podman container.

## Complete Verification

Run the same local quality gate used before a release:

```bash
npm test
```

This command runs, in order:

1. Catalog generation and TypeScript checks.
2. Generated demo source and repository formatting checks.
3. All 116 browser and 5 SSR demo groups.
4. Production build and Playwright end-to-end tests in Podman.

The generation-based commands are intentionally sequential because they share `.generated` and the two files under `data/`.

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

## Covered Contracts

`tests/e2e/application.spec.ts` verifies:

- The generated API count, desktop search, API selection, and browser back navigation.
- The initial route does not fetch the complete API chunk; opening an API fetches it on demand.
- Locale and theme preferences survive a reload.
- A browser demo compiles through the runtime endpoint and publishes DOM and console output.
- The mobile catalog opens, searches, navigates, and closes correctly.

Use accessible roles and labels for locators. Add test-only selectors only when the user-facing semantics cannot identify an element reliably.

## Failure Artifacts

Playwright writes its HTML report to `playwright-report/`. Failed tests retain screenshots, videos, and traces under `test-results/`.

```bash
npx playwright show-trace test-results/<test-name>/trace.zip
```

Both directories are ignored by Git and uploaded by GitHub Actions when present.
