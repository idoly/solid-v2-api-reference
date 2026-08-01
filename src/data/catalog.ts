import catalog from "../../data/catalog.json";
import type { CatalogEntry, Text } from "./catalog-index";

export type { Text } from "./catalog-index";

export type Doc = CatalogEntry & {
  execution: "browser" | "server";
  overloads: Array<{
    signature: string;
    parameters: Array<{ name: string; type: string; optional: boolean; description: Text }>;
    returns: { type: string; description: Text };
  }>;
  relatedTypes: Array<{ name: string; description: Text; declaration: string; sourceUrl: string }>;
  relatedApis: Array<{ id: string; reason: Text }>;
  codes: string[];
  sourceUrl: string;
};

type TextRef = number;
type Overload = Doc["overloads"][number];
type Parameter = Overload["parameters"][number];
type RelatedType = Doc["relatedTypes"][number];
type RelatedApi = Doc["relatedApis"][number];
type RawOverload = Omit<Overload, "parameters" | "returns"> & {
  parameters: Array<Omit<Parameter, "description"> & { description: TextRef }>;
  returns: Omit<Overload["returns"], "description"> & { description: TextRef };
};
type RawRelatedType = Omit<RelatedType, "description"> & { description: TextRef };
type RawRelatedApi = Omit<RelatedApi, "reason"> & { reason: TextRef };
type RawApi = Omit<Doc, "definition" | "useCase" | "overloads" | "relatedTypes" | "relatedApis" | "codes"> & {
  definition: TextRef;
  useCase: TextRef;
  overloads: RawOverload[];
  relatedTypes: RawRelatedType[];
  relatedApis: RawRelatedApi[];
  codes: number[];
};

type Catalog = {
  schemaVersion: 5;
  sourceCommit: string;
  categories: string[];
  textPools: { "zh-CN": string[]; en: string[] };
  codePool: string[];
  records: RawApi[];
};

const data = catalog as unknown as Catalog;

if (data.schemaVersion !== 5) throw new Error(`Unsupported catalog schema: ${data.schemaVersion}`);
if (data.textPools["zh-CN"].length !== data.textPools.en.length) {
  throw new Error("Catalog locale pools contain different numbers of text entries");
}

function pooledValue(values: string[], index: number, label: string) {
  const value = values[index];
  if (value === undefined) throw new Error(`Invalid ${label} pool reference: ${index}`);
  return value;
}

const expandText = (index: TextRef): Text => ({
  "zh-CN": pooledValue(data.textPools["zh-CN"], index, "zh-CN text"),
  en: pooledValue(data.textPools.en, index, "en text"),
});

// Large prose and demo strings remain pooled; records materialize their references once at startup.
export const docs: Doc[] = data.records.map(({ overloads, relatedTypes, relatedApis, ...record }) => ({
  ...record,
  definition: expandText(record.definition),
  useCase: expandText(record.useCase),
  overloads: overloads.map(({ parameters, returns, ...overload }) => ({
    ...overload,
    parameters: parameters.map(({ description, ...parameter }) => ({
      ...parameter,
      description: expandText(description),
    })),
    returns: { ...returns, description: expandText(returns.description) },
  })),
  relatedTypes: relatedTypes.map(({ description, ...relatedType }) => ({
    ...relatedType,
    description: expandText(description),
  })),
  relatedApis: relatedApis.map(({ reason, ...relatedApi }) => ({
    ...relatedApi,
    reason: expandText(reason),
  })),
  codes: record.codes.map((index) => pooledValue(data.codePool, index, "demo source")),
}));

export const docsById = new Map(docs.map((doc) => [doc.id, doc]));
