import fs from "node:fs";
import { spawnSync } from "node:child_process";

const files = ["data/catalog.json", "data/catalog-index.json"];
const before = new Map(files.map((file) => [file, fs.readFileSync(file, "utf8")]));
const result = spawnSync(process.execPath, ["scripts/catalog/generate.mjs"], { stdio: "inherit" });
if (result.status !== 0) process.exit(result.status ?? 1);

const changed = files.filter((file) => fs.readFileSync(file, "utf8") !== before.get(file));
if (changed.length) {
  console.error(`Generated catalog artifacts are stale: ${changed.join(", ")}`);
  process.exit(1);
}
console.log("Generated catalog artifacts are current.");
