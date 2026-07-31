# Localization

Frontend localization is split by responsibility:

- `config.ts` defines supported locale codes, the default locale, labels, locale resolution, and locale cycling.
- `messages.ts` contains UI copy, document metadata, and category labels.
- `runtime.ts` contains browser demo errors and value-formatting labels.
- `locale.ts` connects those dictionaries to Solid signals, preferences, document metadata, and catalog text.

All lookups fall back to `defaultLocale`. Browser-visible runtime errors must use `runtimeMessage` or `runtimeError`; do not add translated strings directly to demo execution modules.

Browser runtime messages and Node service errors remain separate because they ship to different environments; `scripts/demo/http.mjs` gives Vite and production service responses the same locale fallback.

## Adding A Locale

1. Add the locale code and display metadata in `config.ts`.
2. Add complete UI, metadata, and category dictionaries in `messages.ts`.
3. Add the browser runtime dictionary in `runtime.ts`.
4. Add a catalog locale strategy under `scripts/catalog/` and register it in `scripts/catalog/generate.mjs`.
5. Extend the locale mapping and generated contracts for both `data/catalog-index.json` and `data/catalog.json`; update `src/data/catalog-index.ts` and `src/data/catalog.ts` as needed.
6. Add the matching service-error dictionary in `scripts/demo/i18n.mjs`.
7. Add or update Playwright preference coverage when locale cycling behavior changes.
8. Run the complete `npm test` quality gate.

Catalog API prose is generated separately from UI copy. A locale is not complete until its catalog strategy, lightweight index output, full catalog pools, runtime/UI dictionaries, and service errors are all present.
