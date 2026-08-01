import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const catalog = JSON.parse(await readFile(new URL("../../data/catalog.json", import.meta.url), "utf8"));
const records = new Map(catalog.records.map((record) => [record.id, record]));
const text = (reference, locale) => catalog.textPools[locale][reference];

test("re-exports point to a canonical API with the same callable name", () => {
  const reExports = catalog.records.filter((record) => record.reExportOf);
  assert.ok(reExports.length > 0);
  for (const record of reExports) {
    const canonical = records.get(record.reExportOf);
    assert.ok(canonical, `${record.id} points to a missing canonical API`);
    assert.equal(record.title, canonical.title);
    assert.notEqual(record.packageName, canonical.packageName);
  }
});

test("related APIs resolve and provide bilingual selection guidance", () => {
  const related = catalog.records.flatMap((record) => record.relatedApis.map((entry) => [record, entry]));
  assert.ok(related.length > 0);
  for (const [record, entry] of related) {
    assert.ok(records.has(entry.id), `${record.id} points to missing related API ${entry.id}`);
    assert.notEqual(entry.id, record.id);
    assert.ok(text(entry.reason, "en").length >= 40);
    assert.ok(text(entry.reason, "zh-CN").length >= 18);
  }
});

test("catalog prose contains no generic fallback descriptions", () => {
  const forbidden = [
    /is a callable API exported by/,
    /Use it in the reactive and component scenarios described by its source declaration/,
    /是 .* 对外提供的可调用 API/,
    /用于源码声明所描述的响应式和组件场景/,
  ];
  for (const record of catalog.records) {
    const values = [
      text(record.definition, "en"),
      text(record.useCase, "en"),
      text(record.definition, "zh-CN"),
      text(record.useCase, "zh-CN"),
    ];
    for (const value of values) {
      assert.equal(
        forbidden.some((pattern) => pattern.test(value)),
        false,
        `${record.id}: ${value}`,
      );
    }
  }
});

test("demo programs are source-distinct and stay within the hard line limit", () => {
  const owners = new Map();
  for (const record of catalog.records) {
    assert.ok(record.codes.length > 0, `${record.id} has no demo`);
    for (const codeReference of record.codes) {
      const source = catalog.codePool[codeReference];
      assert.ok(source, `${record.id} has an invalid code reference`);
      assert.ok(source.split("\n").length <= 75, `${record.id} exceeds 75 lines`);
      const importedModules = [...source.matchAll(/import[\s\S]*?\sfrom\s+["']([^"']+)["'];/g)].map(
        (match) => match[1],
      );
      assert.equal(
        new Set(importedModules).size,
        importedModules.length,
        `${record.id} contains duplicate import declarations for one module`,
      );
      assert.equal(owners.has(source), false, `${record.id} duplicates ${owners.get(source)}`);
      owners.set(source, record.id);
    }
  }
});
