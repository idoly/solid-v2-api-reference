import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import * as prettier from "prettier";

const root = process.cwd();
const file = path.join(root, "scripts", "catalog", "demos.mjs");
const check = process.argv.includes("--check");
const source = fs.readFileSync(file, "utf8");
const options = (await prettier.resolveConfig(file)) ?? {};
const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
const replacements = [];

function escapeTemplate(value) {
  return value.replaceAll("\\", "\\\\").replaceAll("`", "\\`").replaceAll("${", "\\${");
}

async function visit(node) {
  if (ts.isNoSubstitutionTemplateLiteral(node)) {
    const formatted = (
      await prettier.format(node.text, {
        ...options,
        parser: "typescript",
        filepath: "demo.tsx",
      })
    ).trim();
    replacements.push({ start: node.getStart(ast), end: node.getEnd(), value: `\`${escapeTemplate(formatted)}\`` });
  }
  await Promise.all(node.getChildren(ast).map(visit));
}

await visit(ast);
let output = source;
for (const replacement of replacements.sort((a, b) => b.start - a.start)) {
  output = `${output.slice(0, replacement.start)}${replacement.value}${output.slice(replacement.end)}`;
}
output = await prettier.format(output, { ...options, parser: "babel", filepath: file });

if (check) {
  if (output !== source) {
    console.error(`${path.relative(root, file)} contains unformatted demo source`);
    process.exitCode = 1;
  }
} else {
  fs.writeFileSync(file, output);
  console.log(`Formatted ${replacements.length} demos in ${path.relative(root, file)}.`);
}
