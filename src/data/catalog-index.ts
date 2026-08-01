import catalogIndex from "../../data/catalog-index.json";

export type Text = { "zh-CN": string; en: string };

export type CatalogEntry = {
  id: string;
  title: string;
  packageName: string;
  category: string;
  kind: string;
  internal: boolean;
  deprecated: boolean;
  reExportOf?: string;
  definition: Text;
  useCase: Text;
};

type CatalogIndex = {
  schemaVersion: 1;
  categories: string[];
  records: CatalogEntry[];
};

const data = catalogIndex as CatalogIndex;
if (data.schemaVersion !== 1) throw new Error(`Unsupported catalog index schema: ${data.schemaVersion}`);

export const docs = data.records;
export const docsById = new Map(docs.map((doc) => [doc.id, doc]));
export const docsByTitle = new Map<string, CatalogEntry>();
for (const doc of docs) {
  if (!docsByTitle.has(doc.title)) docsByTitle.set(doc.title, doc);
}

const groupedDocs = Map.groupBy(docs, (doc) => doc.category);
export const groups = data.categories.map((category) => ({
  category,
  docs: groupedDocs.get(category) ?? [],
}));

export const findDoc = (idOrTitle: string) => docsById.get(idOrTitle) ?? docsByTitle.get(idOrTitle);
export const packageScope = (packageName: string) => (packageName === "solid-js" ? "core" : "web");
