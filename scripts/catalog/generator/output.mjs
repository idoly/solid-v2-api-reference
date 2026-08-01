import fs from "node:fs";
import path from "node:path";

export function writeCatalog({ root, sourceCommit, records, categories }) {
  const locales = ["zh-CN", "en"];
  const localizedTexts = records.flatMap((record) => [
    record.definition,
    record.useCase,
    ...record.overloads.flatMap((overload) => [
      ...overload.parameters.map((parameter) => parameter.description),
      overload.returns.description,
    ]),
    ...record.relatedTypes.map((relatedType) => relatedType.description),
    ...record.relatedApis.map((relatedApi) => relatedApi.reason),
  ]);
  const localeProperty = { "zh-CN": "zh", en: "en" };
  const textKey = (value) => JSON.stringify(locales.map((locale) => value[localeProperty[locale]]));
  const textPool = [...new Map(localizedTexts.map((value) => [textKey(value), value])).values()];
  const textIndexes = new Map(textPool.map((value, index) => [textKey(value), index]));
  const poolText = (value) => textIndexes.get(textKey(value));

  const codePool = [...new Set(records.flatMap((record) => record.codes))];
  const codeIndexes = new Map(codePool.map((code, index) => [code, index]));
  const pooledRecords = records.map(({ overloads, relatedTypes, relatedApis, ...record }) => ({
    ...record,
    definition: poolText(record.definition),
    useCase: poolText(record.useCase),
    overloads: overloads.map(({ parameters, returns, ...overload }) => ({
      ...overload,
      parameters: parameters.map(({ description, ...parameter }) => ({
        ...parameter,
        description: poolText(description),
      })),
      returns: { ...returns, description: poolText(returns.description) },
    })),
    relatedTypes: relatedTypes.map(({ description, ...relatedType }) => ({
      ...relatedType,
      description: poolText(description),
    })),
    relatedApis: relatedApis.map(({ reason, ...relatedApi }) => ({
      ...relatedApi,
      reason: poolText(reason),
    })),
    codes: record.codes.map((code) => codeIndexes.get(code)),
  }));

  const textPools = Object.fromEntries(
    locales.map((locale) => [locale, textPool.map((value) => value[localeProperty[locale]])]),
  );
  const catalog = {
    schemaVersion: 5,
    sourceCommit,
    categories,
    textPools,
    codePool,
    records: pooledRecords,
  };
  const catalogIndex = {
    schemaVersion: 1,
    categories,
    records: records.map(
      ({ id, title, packageName, category, kind, internal, deprecated, reExportOf, definition, useCase }) => ({
        id,
        title,
        packageName,
        category,
        kind,
        internal,
        deprecated,
        reExportOf,
        definition: { "zh-CN": definition.zh, en: definition.en },
        useCase: { "zh-CN": useCase.zh, en: useCase.en },
      }),
    ),
  };
  fs.writeFileSync(path.join(root, "data", "catalog.json"), `${JSON.stringify(catalog)}\n`);
  fs.writeFileSync(path.join(root, "data", "catalog-index.json"), `${JSON.stringify(catalogIndex)}\n`);
}
