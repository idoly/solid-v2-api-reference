import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import * as prettier from "prettier";

const root = process.cwd();
const demosRoot = path.join(root, "scripts", "catalog", "demos");
function listModuleFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return listModuleFiles(entryPath);
    return entry.isFile() && entry.name.endsWith(".mjs") ? [entryPath] : [];
  });
}

const files = [path.join(root, "scripts", "catalog", "demos.mjs"), ...listModuleFiles(demosRoot)];
const check = process.argv.includes("--check");
let formattedDemos = 0;
let invalid = false;

function escapeTemplate(value) {
  return value.replaceAll("\\", "\\\\").replaceAll("`", "\\`").replaceAll("${", "\\${");
}

async function formatFile(file) {
  const source = fs.readFileSync(file, "utf8");
  const options = (await prettier.resolveConfig(file)) ?? {};
  const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  const replacements = [];

  async function visit(node) {
    if (ts.isNoSubstitutionTemplateLiteral(node) && node.text.trimStart().startsWith("import ")) {
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
  formattedDemos += replacements.length;

  if (check && output !== source) {
    console.error(`${path.relative(root, file)} contains unformatted demo source`);
    invalid = true;
  } else if (!check) {
    fs.writeFileSync(file, output);
  }
}

for (const file of files) await formatFile(file);
if (check) process.exitCode = invalid ? 1 : 0;
else console.log(`Formatted ${formattedDemos} demos across ${files.length} registry files.`);
