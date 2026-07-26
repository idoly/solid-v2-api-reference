import fs from "node:fs";
import path from "node:path";

function pooledValue(values, index) {
  const value = values[index];
  if (value === undefined) throw new Error(`Invalid source code pool reference: ${index}`);
  return value;
}

export function loadDemoCatalog(file = "data/catalog.json") {
  const catalogPath = path.resolve(file);
  const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));

  if (catalog.schemaVersion !== 3) throw new Error(`Unsupported catalog schema: ${catalog.schemaVersion}`);

  return catalog.records.map((record) => ({
    id: record.id,
    codes: record.codes.map((index) => pooledValue(catalog.codePool, index)),
  }));
}
