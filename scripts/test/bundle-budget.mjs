import fs from "node:fs";
import path from "node:path";
import { gzipSync } from "node:zlib";

const assets = fs.readdirSync("dist/assets");
const budgets = [
  { label: "main JavaScript", pattern: /^index-[^/]+\.js$/, max: 125 * 1024 },
  { label: "API JavaScript", pattern: /^api-[^/]+\.js$/i, max: 85 * 1024 },
  { label: "global CSS", pattern: /^index-[^/]+\.css$/, max: 25 * 1024 },
  { label: "API CSS", pattern: /^api-[^/]+\.css$/i, max: 7 * 1024 },
];

let failed = false;
for (const budget of budgets) {
  const matches = assets.filter((file) => budget.pattern.test(file));
  if (matches.length !== 1) {
    console.error(`${budget.label}: expected one matching asset, found ${matches.length}`);
    failed = true;
    continue;
  }
  const file = matches[0];
  const size = gzipSync(fs.readFileSync(path.join("dist/assets", file))).length;
  console.log(`${budget.label}: ${(size / 1024).toFixed(1)} KiB / ${(budget.max / 1024).toFixed(0)} KiB gzip`);
  if (size > budget.max) failed = true;
}

if (failed) process.exit(1);
