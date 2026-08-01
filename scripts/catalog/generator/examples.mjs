import ts from "typescript";
import { compileDemo } from "../../demo/compile.mjs";
import { serverDemoIds } from "../../demo/config.mjs";

function completeExample(record, source, allRecords) {
  const imported = new Set();
  for (const match of source.matchAll(/import(?:\s+type)?\s*\{([^}]+)\}\s*from/g)) {
    for (const item of match[1].split(",")) imported.add(item.trim().split(/\s+as\s+/)[0]);
  }

  const candidates = new Map();
  for (const candidate of allRecords) {
    if (!candidates.has(candidate.title) || candidate.packageName === "solid-js")
      candidates.set(candidate.title, candidate);
  }
  candidates.set(record.title, record);

  const identifiers = new Set();
  const declared = new Set();
  const parsed = ts.createSourceFile("demo.tsx", source, ts.ScriptTarget.ESNext, true, ts.ScriptKind.TSX);
  const visit = (node) => {
    if (ts.isIdentifier(node)) {
      identifiers.add(node.text);
      const parent = node.parent;
      if (
        (ts.isVariableDeclaration(parent) ||
          ts.isFunctionDeclaration(parent) ||
          ts.isClassDeclaration(parent) ||
          ts.isParameter(parent)) &&
        parent.name === node
      )
        declared.add(node.text);
    }
    ts.forEachChild(node, visit);
  };
  visit(parsed);

  const additions = new Map();
  for (const [name, candidate] of candidates) {
    if (imported.has(name) || declared.has(name) || !identifiers.has(name)) continue;
    const names = additions.get(candidate.packageName) ?? [];
    names.push(name);
    additions.set(candidate.packageName, names);
  }

  const imports = [...additions].map(
    ([packageName, names]) => `import { ${names.sort().join(", ")} } from ${JSON.stringify(packageName)};`,
  );
  return imports.length ? `${imports.join("\n")}\n\n${source}` : source;
}

function consolidateNamedImports(source) {
  const parsed = ts.createSourceFile("demo.tsx", source, ts.ScriptTarget.ESNext, true, ts.ScriptKind.TSX);
  const groups = Map.groupBy(
    parsed.statements.filter(
      (statement) =>
        ts.isImportDeclaration(statement) &&
        ts.isStringLiteral(statement.moduleSpecifier) &&
        statement.importClause &&
        !statement.importClause.name &&
        statement.importClause.namedBindings &&
        ts.isNamedImports(statement.importClause.namedBindings),
    ),
    (statement) => statement.moduleSpecifier.text,
  );
  const replacements = [];
  for (const [packageName, imports] of groups) {
    if (imports.length < 2) continue;
    const names = [
      ...new Set(
        imports.flatMap((statement) =>
          statement.importClause.namedBindings.elements.map((element) => element.getText(parsed)),
        ),
      ),
    ];
    replacements.push({
      start: imports[0].getStart(parsed),
      end: imports[0].getEnd(),
      value: `import { ${names.join(", ")} } from ${JSON.stringify(packageName)};`,
    });
    for (const statement of imports.slice(1)) {
      const lineEnd = source.indexOf("\n", statement.getEnd());
      replacements.push({
        start: statement.getStart(parsed),
        end: lineEnd < 0 ? statement.getEnd() : lineEnd + 1,
        value: "",
      });
    }
  }
  let output = source;
  for (const replacement of replacements.sort((a, b) => b.start - a.start)) {
    output = `${output.slice(0, replacement.start)}${replacement.value}${output.slice(replacement.end)}`;
  }
  return output;
}

function normalizeDemoSource(source, id) {
  if (/[\u3400-\u9fff]/u.test(source)) throw new Error(`Demo ${id} contains non-English text`);
  return source.trim();
}

function isObservableDemo(source, record) {
  const escapedName = record.title.replace(/[$]/g, "\\$");
  const invokesCurrent =
    new RegExp(`\\b${escapedName}\\s*\\(`).test(source) || new RegExp(`<${escapedName}(?:\\s|>|/)`).test(source);
  const hasOutput =
    /console\.(?:log|info|warn|error)\s*\(|\brender\s*\(|\bhydrate\s*\(|document\.(?:getElementById|createElement|body)/.test(
      source,
    );
  const isServerDemo = serverDemoIds.has(record.id);
  const hasTsxEntry =
    /\b(?:function|const)\s+App\b/.test(source) && /\b(?:render|hydrate)\s*\(\s*\(\)\s*=>\s*<App\s*\/>/.test(source);
  const hasHydrationEntry = /\bhydrate\s*\(\s*\(\)\s*=>/.test(source);
  return invokesCurrent && hasOutput && (isServerDemo || hasTsxEntry || hasHydrationEntry);
}

function compileExample(source, id) {
  try {
    const server = serverDemoIds.has(id);
    return compileDemo(source, {
      filename: `${id.replace(/[^a-zA-Z0-9_-]/g, "_")}.tsx`,
      generate: server ? "ssr" : "dom",
    });
  } catch (error) {
    console.warn(`Skipping non-compilable example ${id}: ${error.message.split("\n")[0]}`);
    return undefined;
  }
}

export function prepareExamples(records, demoOverrides, preferredCategoryOrder) {
  records.sort((a, b) => {
    const categoryDifference = preferredCategoryOrder.indexOf(a.category) - preferredCategoryOrder.indexOf(b.category);
    if (categoryDifference) return categoryDifference;
    if (a.packageName !== b.packageName) return a.packageName.localeCompare(b.packageName);
    return a.title.localeCompare(b.title);
  });
  for (const record of records) {
    const hasOverride =
      Object.prototype.hasOwnProperty.call(demoOverrides, record.id) ||
      Object.prototype.hasOwnProperty.call(demoOverrides, record.title);
    const override = demoOverrides[record.id] ?? demoOverrides[record.title];
    const resolvedOverride =
      typeof override === "string"
        ? consolidateNamedImports(override.replaceAll("__PACKAGE__", record.packageName))
        : undefined;
    const rawSources = hasOverride
      ? resolvedOverride
        ? [resolvedOverride]
        : []
      : record.codes.map((code) => completeExample(record, code, records));
    const sources = rawSources
      .map((source) => normalizeDemoSource(source, record.id))
      .filter((source) => isObservableDemo(source, record));
    record.codes = sources.filter((source) => compileExample(source, record.id));
  }
  validateDemoQuality(records);
}

export function validateDemoQuality(records) {
  const programOwners = new Map();
  for (const record of records) {
    if (!record.codes.length) throw new Error(`API ${record.id} has no complete, observable, compilable demo`);
    for (const source of record.codes) {
      const lines = source.split("\n").length;
      if (lines > 75)
        throw new Error(`Demo ${record.id} is ${lines} lines; split the scenario or reduce supporting code`);
      const existing = programOwners.get(source);
      if (existing) throw new Error(`Demo ${record.id} duplicates the complete program for ${existing}`);
      programOwners.set(source, record.id);
    }
  }
}
