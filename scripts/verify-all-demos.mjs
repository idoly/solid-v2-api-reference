import { spawnSync } from "node:child_process";
import fs from "node:fs";

const docs = JSON.parse(fs.readFileSync("src/generated-api-catalog.json", "utf8"));
const serverIds = new Set(["@solidjs/web/renderToString", "@solidjs/web/renderToStringAsync", "@solidjs/web/renderToStream"]);
const ids = docs.filter((entry) => entry.compiledCodes.length && !serverIds.has(entry.id)).map((entry) => entry.id);
const failures = [];

for (const id of ids) {
  const result = spawnSync(process.execPath, ["--conditions=browser", "scripts/verify-demos.mjs", id], {
    cwd: process.cwd(),
    encoding: "utf8",
    timeout: 10000,
  });
  if (result.status !== 0) failures.push({ id, output: `${result.stdout}\n${result.stderr}`.trim() });
}

console.log(JSON.stringify({ browserApiGroups: ids.length, passed: ids.length - failures.length, failed: failures.length }, null, 2));
if (failures.length) {
  for (const failure of failures) console.error(`\n### ${failure.id}\n${failure.output}`);
  process.exit(1);
}
