import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { serverDemoIds } from "../../scripts/demo/config.mjs";
import { loadDemoCatalog } from "../../scripts/demo/load.mjs";

const catalog = JSON.parse(await readFile(new URL("../../data/catalog.json", import.meta.url), "utf8"));

test("generated catalog uses the current schema", () => {
  assert.equal(catalog.schemaVersion, 4);
});

test("demo loader preserves generated execution metadata", () => {
  const demos = loadDemoCatalog();
  assert.equal(demos.length, catalog.records.length);
  assert.equal(
    demos.every((demo) => ["browser", "server"].includes(demo.execution)),
    true,
  );
});

test("generated execution metadata matches the server allowlist", () => {
  const generatedIds = catalog.records
    .filter((record) => record.execution === "server")
    .map((record) => record.id)
    .sort();
  assert.deepEqual(generatedIds, [...serverDemoIds].sort());
  assert.equal(
    catalog.records.every((record) => ["browser", "server"].includes(record.execution)),
    true,
  );
});
