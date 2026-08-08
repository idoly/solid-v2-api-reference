import ts from "typescript";
import { compileDemo } from "../../demo/compile.mjs";
import { serverDemoIds } from "../../demo/config.mjs";
import { demoNotes } from "../demos/notes.mjs";

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

function inlineSingleUseRenderApp(source) {
  const parsed = ts.createSourceFile("demo.tsx", source, ts.ScriptTarget.ESNext, true, ts.ScriptKind.TSX);
  const app = parsed.statements.find(
    (statement) => ts.isFunctionDeclaration(statement) && statement.name?.text === "App" && statement.body,
  );
  if (!app) return source;

  let references = 0;
  const countReferences = (node) => {
    if (ts.isIdentifier(node) && node.text === "App") references += 1;
    ts.forEachChild(node, countReferences);
  };
  countReferences(parsed);
  if (references !== 2) return source;

  const renderStatement = parsed.statements.find((statement) => {
    if (!ts.isExpressionStatement(statement) || !ts.isCallExpression(statement.expression)) return false;
    const call = statement.expression;
    const entry = call.arguments[0];
    return (
      ts.isIdentifier(call.expression) &&
      call.expression.text === "render" &&
      entry &&
      ts.isArrowFunction(entry) &&
      ts.isJsxSelfClosingElement(entry.body) &&
      ts.isIdentifier(entry.body.tagName) &&
      entry.body.tagName.text === "App"
    );
  });
  if (!renderStatement || !ts.isCallExpression(renderStatement.expression)) return source;

  const entry = renderStatement.expression.arguments[0];
  if (!entry || !ts.isArrowFunction(entry)) return source;
  const afterApp = source.slice(app.end).match(/^\s*/)?.[0].length ?? 0;
  const replacements = [
    { start: app.getStart(parsed), end: app.end + afterApp, value: "" },
    { start: entry.body.getStart(parsed), end: entry.body.end, value: app.body.getText(parsed) },
  ];
  let output = source;
  for (const replacement of replacements.sort((a, b) => b.start - a.start)) {
    output = `${output.slice(0, replacement.start)}${replacement.value}${output.slice(replacement.end)}`;
  }
  return output;
}

function hasCodeComment(source) {
  const scanner = ts.createScanner(ts.ScriptTarget.ESNext, false, ts.LanguageVariant.JSX, source);
  for (let token = scanner.scan(); token !== ts.SyntaxKind.EndOfFileToken; token = scanner.scan()) {
    if (token === ts.SyntaxKind.SingleLineCommentTrivia || token === ts.SyntaxKind.MultiLineCommentTrivia) return true;
  }
  return false;
}

function addContractNote(source, record) {
  if (hasCodeComment(source)) return source;
  const note = demoNotes[record.id] ?? demoNotes[record.title];
  if (!note) return source;

  const parsed = ts.createSourceFile("demo.tsx", source, ts.ScriptTarget.ESNext, true, ts.ScriptKind.TSX);
  const imports = parsed.statements.filter(ts.isImportDeclaration);
  const position = imports.at(-1)?.end ?? 0;
  return `${source.slice(0, position)}\n\n// ${note}\n${source.slice(position).trimStart()}`;
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
  const hasBrowserEntry = /\b(?:render|hydrate)\s*\(\s*\(\)\s*=>/.test(source);
  return invokesCurrent && hasOutput && (isServerDemo || hasBrowserEntry);
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
      .map((source) => (serverDemoIds.has(record.id) ? source : inlineSingleUseRenderApp(source)))
      .map((source) => addContractNote(source, record))
      .map((source) => normalizeDemoSource(source, record.id))
      .filter((source) => isObservableDemo(source, record));
    record.codes = sources.filter((source) => compileExample(source, record.id));
  }
  validateDemoQuality(records);
}

function validateImports(source, record) {
  const parsed = ts.createSourceFile("demo.tsx", source, ts.ScriptTarget.ESNext, true, ts.ScriptKind.TSX);
  const entrypoints = new Set(["render", "hydrate", "renderToString", "renderToStream"]);
  const supporting = [];

  for (const statement of parsed.statements) {
    if (!ts.isImportDeclaration(statement)) continue;
    const bindings = statement.importClause?.namedBindings;
    if (!bindings || !ts.isNamedImports(bindings)) continue;
    for (const specifier of bindings.elements) {
      const localName = specifier.name.text;
      let references = 0;
      const count = (node) => {
        if (ts.isIdentifier(node) && node.text === localName && node !== specifier.name) references += 1;
        ts.forEachChild(node, count);
      };
      for (const candidate of parsed.statements) {
        if (candidate !== statement) count(candidate);
      }
      if (!references) throw new Error(`Demo ${record.id} imports unused API ${localName}`);

      const importedName = specifier.propertyName?.text ?? localName;
      if (importedName !== record.title && !entrypoints.has(importedName)) supporting.push(importedName);
    }
  }

  if (supporting.length > 4)
    throw new Error(`Demo ${record.id} uses ${supporting.length} supporting APIs: ${supporting.join(", ")}`);
}

export function validateDemoQuality(records) {
  const programOwners = new Map();
  for (const record of records) {
    if (!record.codes.length) throw new Error(`API ${record.id} has no complete, observable, compilable demo`);
    for (const source of record.codes) {
      if (!hasCodeComment(source)) throw new Error(`Demo ${record.id} has no contract comment`);
      validateImports(source, record);
      const lines = source.split("\n").length;
      if (lines > 75)
        throw new Error(`Demo ${record.id} is ${lines} lines; split the scenario or reduce supporting code`);
      const existing = programOwners.get(source);
      if (existing) throw new Error(`Demo ${record.id} duplicates the complete program for ${existing}`);
      programOwners.set(source, record.id);
    }
  }
}
