# Localization

Frontend localization is split by responsibility:

- `config.ts` defines supported locale codes, the default locale, labels, locale resolution, and locale cycling.
- `messages.ts` contains UI copy, document metadata, and category labels.
- `runtime.ts` contains browser demo errors and value-formatting labels.
- `locale.ts` connects those dictionaries to Solid signals, preferences, document metadata, and catalog text.

All lookups fall back to `defaultLocale`. Browser-visible runtime errors must use `runtimeMessage` or `runtimeError`; do not add translated strings directly to demo execution modules.

## Adding A Locale

1. Add the locale code and display metadata in `config.ts`.
2. Add complete UI, metadata, and category dictionaries in `messages.ts`.
3. Add the browser runtime dictionary in `runtime.ts`.
4. Add a catalog locale strategy under `scripts/catalog/` and register it in `scripts/catalog/generate.mjs`.
5. Extend the generated catalog types and pools in `src/data/catalog.ts`.
6. Add the matching service-error dictionary in `scripts/demo/i18n.mjs`.
7. Run `npm run format:check`, `npm run check`, and `npm run verify:demos`.

Catalog API prose is generated separately from UI copy. A locale is not complete until both its catalog strategy and runtime/UI dictionaries are present.
