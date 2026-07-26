import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import Babel from "@babel/standalone";
import presetSolid from "babel-preset-solid";
import { demoOverrides, zhContent } from "./api-content.zh.mjs";

const root = process.cwd();
const tempDir = path.join(root, ".generated");
const entryFile = path.join(tempDir, "api-entries.ts");
const outputFile = path.join(root, "src", "generated-api-catalog.ts");
const sourceCommit = "918efc9ae0826d7d5be363017e7469e75f470fbb";

fs.mkdirSync(tempDir, { recursive: true });
fs.writeFileSync(entryFile, 'import * as Solid from "solid-js";\nimport * as Web from "@solidjs/web";\n');

const program = ts.createProgram([entryFile], {
  target: ts.ScriptTarget.ESNext,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  skipLibCheck: true,
  strict: true,
});
const checker = program.getTypeChecker();
const sourceFile = program.getSourceFile(entryFile);

const componentNames = new Set(["For", "Show", "Switch", "Match", "Errored", "Loading", "Repeat", "Reveal", "Hydration", "NoHydration", "Portal", "Dynamic", "Assets", "HydrationScript"]);
const storeNames = new Set(["createStore", "createProjection", "createOptimisticStore", "reconcile", "merge", "omit", "snapshot", "deep", "isWrappable", "storePath"]);
const lifecycleNames = new Set(["action", "onSettled", "refresh", "onCleanup"]);
const ownerNames = new Set(["createRoot", "createOwner", "getOwner", "getObserver", "isDisposed", "runWithOwner", "getNextChildId"]);
const asyncNames = new Set(["resolve", "flatten", "NotReadyError", "enableExternalSource", "affects", "isPending", "latest"]);
const ssrNames = new Set(["render", "hydrate", "renderToString", "renderToStringAsync", "renderToStream", "isServer", "isDev", "HydrationScript", "ssr", "ssrElement", "ssrAttribute", "ssrStyle", "ssrClassList", "ssrHydrationKey", "resolveSSRNode", "generateHydrationScript"]);
const responseNames = new Set(["redirect", "reload", "respond", "isHref", "isResponseEnvelope", "getRequestEvent"]);
const deprecatedNames = new Set(["@solidjs/web/renderToStringAsync"]);
const preferredCategoryOrder = [
  "响应式", "Store", "生命周期与 Action", "Owner 与作用域", "异步与互操作",
  "组件与控制流", "渲染与 SSR", "响应与导航", "DOM 与 Web 运行时", "类型", "内部与编译器接口",
];

function text(parts) {
  return ts.displayPartsToString(parts ?? []).replace(/\s+/g, " ").trim();
}

function tagText(value) {
  if (typeof value === "string") return value.trim();
  if (!value) return "";
  return value.map((part) => part.text).join("").trim();
}

function normalizeExample(value) {
  const captionless = value.replace(/^\s*<caption>[\s\S]*?<\/caption>\s*/i, "");
  const fenced = captionless.match(/```[\w-]*\s*(?:\r?\n)([\s\S]*?)```/);
  return (fenced?.[1] ?? captionless).trim();
}

function sourcePathFor(declaration, packageName, name) {
  if (packageName === "@solidjs/web" && ssrNames.has(name)) return "packages/solid-web/server/index.ts";
  const filename = declaration?.getSourceFile().fileName.replaceAll("\\", "/") ?? "";
  const signals = filename.match(/@solidjs\/signals\/dist\/types\/(.+)\.d\.ts$/);
  if (signals) return `packages/solid-signals/src/${signals[1].replace(/^index$/, "index")}.ts`;
  const solid = filename.match(/solid-js\/types\/(client|server)\/(.+)\.d\.ts$/);
  if (solid) return `packages/solid/src/${solid[1]}/${solid[2]}.ts`;
  if (filename.endsWith("solid-js/types/types.d.ts")) return "packages/solid/src/types.ts";
  const web = filename.match(/@solidjs\/web\/types\/(.+)\.d\.ts$/);
  if (web) {
    if (web[1] === "server") return "packages/solid-web/server/index.ts";
    if (web[1] === "server-mock") return "packages/solid-web/src/server-mock.ts";
    if (web[1] === "jsx") return "packages/solid-web/src/index.ts";
    return `packages/solid-web/src/${web[1]}.ts`;
  }
  return packageName === "solid-js" ? "packages/solid/src/index.ts" : "packages/solid-web/src/index.ts";
}

function categoryFor(name, packageName, typeOnly, internal) {
  if (internal) return "内部与编译器接口";
  if (typeOnly) return "类型";
  if (componentNames.has(name)) return "组件与控制流";
  if (storeNames.has(name)) return "Store";
  if (lifecycleNames.has(name)) return "生命周期与 Action";
  if (ownerNames.has(name)) return "Owner 与作用域";
  if (asyncNames.has(name)) return "异步与互操作";
  if (packageName === "@solidjs/web" && ssrNames.has(name)) return "渲染与 SSR";
  if (packageName === "@solidjs/web" && responseNames.has(name)) return "响应与导航";
  if (packageName === "@solidjs/web") return "DOM 与 Web 运行时";
  return "响应式";
}

function kindFor(name, typeOnly, declarations) {
  if (typeOnly) return "type";
  if (componentNames.has(name)) return "component";
  if (declarations.some((node) => ts.isFunctionDeclaration(node) || ts.isMethodSignature(node))) return "function";
  if (declarations.some((node) => ts.isClassDeclaration(node))) return "class";
  return "constant";
}

function parameterFallback(name) {
  const exact = {
    compute: "响应式计算函数；其中的响应式读取会成为依赖。",
    effectFn: "执行副作用的回调，或包含回调与错误处理器的配置对象。",
    fn: "要执行的函数或计算回调。",
    callback: "满足对应时机后执行的回调。",
    value: "要写入、比较、协调或包装的值。",
    options: "控制该 API 行为的可选配置。",
    props: "传给组件或渲染原语的属性对象。",
    children: "要处理或渲染的子节点。",
    owner: "要读取、检查或恢复的响应式 Owner。",
    source: "响应式来源或输入访问器。",
    element: "目标 DOM 元素。",
    node: "要处理的 DOM 节点。",
    key: "用于查找、比较或协调的键。",
    path: "Store 中要访问或更新的属性路径。",
    fallback: "主内容不可用时显示的后备内容。",
    init: "初始值或初始化配置。",
  };
  return exact[name] ?? `传给该调用的 \`${name}\` 参数；具体约束由其类型定义。`;
}

function returnFallback(type) {
  if (type === "void") return "不返回业务值；调用通过副作用产生结果。";
  if (type === "never") return "该重载不会正常返回。";
  if (/^Promise</.test(type)) return "返回 Promise，完成后得到声明中的结果类型。";
  if (/^\(.*\) =>/.test(type) || type.includes("dispose")) return "返回可继续调用的函数；其参数和结果由该函数类型定义。";
  if (/Signal</.test(type)) return "返回响应式 Signal，可通过访问器读取并通过 setter 更新。";
  if (/Store/.test(type)) return "返回保持细粒度响应性的 Store 结果。";
  if (/Element|SolidElement|JSX/.test(type)) return "返回可交给 Solid 渲染器处理的内容。";
  return `返回 \`${type}\`。`;
}

function callableDetails(runtimeType, declaration) {
  return runtimeType.getCallSignatures().map((signature) => {
    const signatureDeclaration = signature.getDeclaration();
    const sourceParameters = signatureDeclaration?.parameters ? [...signatureDeclaration.parameters] : [];
    const parameters = signature.getParameters().map((parameter, parameterIndex) => {
      const sourceParameter = sourceParameters[parameterIndex];
      const parameterDeclaration = sourceParameter ?? parameter.valueDeclaration ?? parameter.declarations?.[0] ?? declaration;
      const parameterType = checker.getTypeOfSymbolAtLocation(parameter, parameterDeclaration);
      const sourceDescription = text(parameter.getDocumentationComment(checker));
      const name = sourceParameter?.name?.getText() ?? parameter.name;
      return {
        name,
        type: sourceParameter?.type?.getText()
          ?? checker.typeToString(parameterType, parameterDeclaration, ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope),
        optional: Boolean(sourceParameter?.questionToken || sourceParameter?.initializer) || parameterIndex >= signature.minArgumentCount,
        description: containsChinese(sourceDescription) ? sourceDescription : parameterFallback(name),
      };
    });
    const checkedReturnType = checker.typeToString(checker.getReturnTypeOfSignature(signature), declaration, ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope);
    const returnType = signatureDeclaration?.type?.getText() ?? checkedReturnType;
    const typeParameters = signatureDeclaration?.typeParameters?.length
      ? `<${[...signatureDeclaration.typeParameters].map((parameter) => parameter.getText()).join(", ")}>`
      : "";
    const sourceSignature = `${typeParameters}(${sourceParameters.map((parameter) => parameter.getText()).join(", ")}): ${returnType}`;
    const returnTag = signature.getJsDocTags().find((tag) => tag.name === "returns" || tag.name === "return");
    const sourceReturnDescription = tagText(returnTag?.text);
    return {
      signature: signatureDeclaration ? sourceSignature : checker.signatureToString(signature, declaration, ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope, ts.SignatureKind.Call),
      parameters,
      returns: {
        type: returnType,
        description: containsChinese(sourceReturnDescription) ? sourceReturnDescription : returnFallback(returnType),
      },
    };
  });
}

function containsChinese(value) {
  return /[\u3400-\u9fff]/.test(value);
}

function firstSentence(value) {
  const normalized = value.replace(/```[\s\S]*?```/g, "").replace(/\s+/g, " ").trim();
  return normalized
    .replace(/^[-*]\s+/, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .match(/^.*?[.!?。！？](?:\s|$)/)?.[0]?.trim()
    || normalized.replace(/^[-*]\s+/, "").slice(0, 260);
}

function fallbackUseCase(category, kind) {
  if (kind === "type") return "用于为库、组件和自定义原语建立准确的 TypeScript 契约。";
  if (category === "内部与编译器接口") return "仅用于渲染器、编译器输出或框架集成；应用代码通常不应直接调用。";
  if (category === "DOM 与 Web 运行时") return "用于 DOM 绑定、事件、模板或 Web 渲染器集成。";
  if (category === "渲染与 SSR") return "用于应用挂载、hydration 或服务端 HTML 输出。";
  return "用于源码声明所描述的响应式和组件场景。";
}

const moduleEntries = sourceFile.statements
  .filter(ts.isImportDeclaration)
  .map((statement) => {
    const packageName = statement.moduleSpecifier.text;
    const moduleSymbol = checker.getSymbolAtLocation(statement.moduleSpecifier);
    const exports = checker.getExportsOfModule(moduleSymbol).sort((a, b) => a.name.localeCompare(b.name));
    return { packageName, exports };
  });

const publicTypes = new Map();
for (const moduleEntry of moduleEntries) {
  const types = new Map();
  for (const exported of moduleEntry.exports) {
    const target = exported.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exported) : exported;
    if (target.flags & ts.SymbolFlags.Type) types.set(exported.name, target);
  }
  publicTypes.set(moduleEntry.packageName, types);
}

const localTypes = new Map();
for (const programFile of program.getSourceFiles()) {
  const filename = programFile.fileName.replaceAll("\\", "/");
  if (!filename.includes("node_modules/@solidjs/") && !filename.includes("node_modules/solid-js/types/")) continue;
  const ownerPackage = filename.includes("/@solidjs/web/") ? "@solidjs/web" : "solid-js";
  const visitType = (node) => {
    if ((ts.isTypeAliasDeclaration(node) || ts.isInterfaceDeclaration(node) || ts.isClassDeclaration(node)) && node.name) {
      const symbol = checker.getSymbolAtLocation(node.name);
      if (symbol && !localTypes.has(node.name.text)) localTypes.set(node.name.text, { symbol, ownerPackage });
    }
    ts.forEachChild(node, visitType);
  };
  visitType(programFile);
}

const builtInTypeNames = new Set([
  "Array", "AsyncGenerator", "AsyncIterable", "Boolean", "Date", "Element", "Error", "Function",
  "Generator", "HTMLElement", "Iterable", "Iterator", "JSX", "Map", "Node", "Number", "Object",
  "Promise", "Readonly", "Record", "RegExp", "Set", "String", "Symbol", "WeakMap", "WeakSet",
]);

function relatedTypeDescription(name, apiTitle) {
  const descriptions = {
    ComputeFunction: "定义响应式计算阶段的函数形状，包括上一次结果参数和本次返回值。",
    EffectFunction: "定义副作用阶段回调的参数与可选清理函数返回值。",
    EffectBundle: "把副作用回调与计算阶段错误处理器组合为一个配置对象。",
    BaseEffectOptions: "定义所有 effect 共享的名称、调度与诊断选项。",
    EffectOptions: "配置 effect 的名称、调度和其他执行选项。",
    Signal: "由响应式读取访问器和写入 setter 组成的二元组。",
    SignalOptions: "配置 Signal 的相等性判断、名称和其他行为。",
    Store: "表示保持深层细粒度响应性的 Store 读取类型。",
    StoreOptions: "配置 Store 的包装、比较和结构更新行为。",
    Component: "表示接收 props 并返回 Solid 可渲染内容的组件函数。",
    Owner: "表示响应式节点所属的生命周期和清理作用域。",
    Accessor: "表示无参数调用并返回当前响应式值的读取函数。",
    Setter: "表示接受新值或更新函数的响应式写入函数。",
    NoInfer: "阻止该位置参与泛型推断，同时保留已经推断出的类型约束。",
  };
  return descriptions[name] ?? `定义 \`${apiTitle}\` 调用签名中 \`${name}\` 的结构和类型约束。`;
}

function relatedTypeDetails(overloads, packageName, apiTitle) {
  const results = [];
  const seen = new Set();
  const pending = overloads.map((overload) =>
    [...overload.parameters.map((parameter) => parameter.type), overload.returns.type].join(" ")
  );

  while (pending.length && results.length < 12) {
    const typeText = pending.shift();
    for (const match of typeText.matchAll(/\b[A-Z][A-Za-z0-9_]*\b/g)) {
      const name = match[0];
      if (name.length === 1 || builtInTypeNames.has(name) || seen.has(name)) continue;
      const publicTarget = publicTypes.get(packageName)?.get(name) ?? publicTypes.get("solid-js")?.get(name);
      const localTarget = localTypes.get(name);
      const target = publicTarget ?? localTarget?.symbol;
      if (!target) continue;
      const declarations = target.getDeclarations() ?? [];
      const declaration = declarations.find((node) => ts.isTypeAliasDeclaration(node) || ts.isInterfaceDeclaration(node) || ts.isClassDeclaration(node));
      if (!declaration) continue;
      const ownerPackage = publicTarget
        ? (publicTypes.get(packageName)?.has(name) ? packageName : "solid-js")
        : localTarget.ownerPackage;
      const declarationText = declaration.getText().replace(/^export\s+/, "").replace(/^declare\s+/, "").replace(/\/\*\*[\s\S]*?\*\//g, "").replace(/\n\s*\n/g, "\n").trim().slice(0, 6000);
      seen.add(name);
      results.push({
        name,
        description: relatedTypeDescription(name, apiTitle),
        declaration: declarationText,
        sourceUrl: `https://github.com/solidjs/solid/blob/${sourceCommit}/${sourcePathFor(declaration, ownerPackage, name)}`,
      });
      pending.push(declarationText);
      if (results.length >= 12) break;
    }
  }
  return results;
}

const records = [];
for (const { packageName, exports } of moduleEntries) {
  for (const exported of exports) {
    let target = exported;
    if (exported.flags & ts.SymbolFlags.Alias) target = checker.getAliasedSymbol(exported);
    const declarations = target.getDeclarations() ?? exported.getDeclarations() ?? [];
    const valueFlags = target.flags & ts.SymbolFlags.Value;
    const typeOnly = !valueFlags;
    const symbolTags = target.getJsDocTags(checker);
    const declarationTags = declarations.flatMap((declaration) => ts.getJSDocTags(declaration).map((tag) => ({
      name: tag.tagName.text,
      text: typeof tag.comment === "string" ? tag.comment : tag.comment,
    })));
    const tags = [...symbolTags, ...declarationTags];
    const internal = tags.some((tag) => tag.name === "internal");
    const declaration = declarations[0];
    const runtimeType = declaration ? checker.getTypeOfSymbolAtLocation(target, declaration) : undefined;
    const callable = Boolean(runtimeType?.getCallSignatures().length);
    if (typeOnly || internal || !callable) continue;
    const deprecatedTag = tags.find((tag) => tag.name === "deprecated");
    const deprecated = Boolean(deprecatedTag) || deprecatedNames.has(`${packageName}/${exported.name}`);
    const docsText = text(target.getDocumentationComment(checker));
    const examples = [...new Set(tags
      .filter((tag) => tag.name === "example")
      .map((tag) => normalizeExample(tagText(tag.text)))
      .filter(Boolean))];
    const kind = kindFor(exported.name, typeOnly, declarations);
    const category = categoryFor(exported.name, packageName, typeOnly, internal);
    const overloads = callableDetails(runtimeType, declaration).filter((overload) => overload.returns.type !== "never");
    if (!overloads.length) continue;
    const relatedTypes = relatedTypeDetails(overloads, packageName, exported.name);
    const sourceDefinition = firstSentence(docsText);
    const remaining = docsText.replace(sourceDefinition, "").replace(/\s+/g, " ").trim();
    const sourceUseCase = firstSentence(remaining);
    const localized = zhContent[exported.name];
    const definition = localized?.[0]
      ?? (containsChinese(sourceDefinition) ? sourceDefinition : `${exported.name} 是 ${packageName} 对外提供的可调用 API。`);
    const useCase = localized?.[1]
      ?? (containsChinese(sourceUseCase) ? sourceUseCase : fallbackUseCase(category, kind));
    records.push({
      id: `${packageName}/${exported.name}`,
      title: exported.name,
      packageName,
      category,
      kind,
      internal,
      deprecated,
      definition,
      useCase,
      overloads,
      relatedTypes,
      codes: examples,
      sourceUrl: `https://github.com/solidjs/solid/blob/${sourceCommit}/${sourcePathFor(declarations[0], packageName, exported.name)}`,
    });
  }
}

function completeExample(record, source, allRecords) {
  const imported = new Set();
  for (const match of source.matchAll(/import(?:\s+type)?\s*\{([^}]+)\}\s*from/g)) {
    for (const item of match[1].split(",")) imported.add(item.trim().split(/\s+as\s+/)[0]);
  }

  const candidates = new Map();
  for (const candidate of allRecords) {
    if (!candidates.has(candidate.title) || candidate.packageName === "solid-js") candidates.set(candidate.title, candidate);
  }
  candidates.set(record.title, record);

  const identifiers = new Set();
  const declared = new Set();
  const parsed = ts.createSourceFile("demo.tsx", source, ts.ScriptTarget.ESNext, true, ts.ScriptKind.TSX);
  const visit = (node) => {
    if (ts.isIdentifier(node)) {
      identifiers.add(node.text);
      const parent = node.parent;
      if ((ts.isVariableDeclaration(parent) || ts.isFunctionDeclaration(parent) || ts.isClassDeclaration(parent) || ts.isParameter(parent)) && parent.name === node) declared.add(node.text);
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

  const imports = [...additions].map(([packageName, names]) =>
    `import { ${names.sort().join(", ")} } from ${JSON.stringify(packageName)};`
  );
  return imports.length ? `${imports.join("\n")}\n\n${source}` : source;
}

function sanitizeDemoComments(source) {
  const withoutBlocks = source.replace(/\/\*[\s\S]*?\*\//g, "");
  return withoutBlocks
    .split("\n")
    .map((line) => line.trimStart().startsWith("//") ? "" : line.replace(/\s+\/\/.*$/, ""))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function apiIsInsideApp(source, record) {
  if (record.id === "@solidjs/web/render" || record.id === "@solidjs/web/hydrate" || record.id === "solid-js/lazy") return true;
  const sourceFile = ts.createSourceFile("demo.tsx", source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const app = sourceFile.statements.find((statement) => ts.isFunctionDeclaration(statement) && statement.name?.text === "App");
  if (!app) return false;
  let found = false;
  const visit = (node) => {
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === record.title) found = true;
    if ((ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node))
      && ts.isIdentifier(node.tagName) && node.tagName.text === record.title) found = true;
    if (!found) ts.forEachChild(node, visit);
  };
  visit(app);
  return found;
}

function isObservableDemo(source, record) {
  const escapedName = record.title.replace(/[$]/g, "\\$");
  const invokesCurrent = new RegExp(`\\b${escapedName}\\s*\\(`).test(source)
    || new RegExp(`<${escapedName}(?:\\s|>|/)`).test(source);
  const hasOutput = /console\.(?:log|info|warn|error)\s*\(|\brender\s*\(|\bhydrate\s*\(|document\.(?:getElementById|createElement|body)/.test(source);
  const isServerDemo = new Set([
    "@solidjs/web/renderToString",
    "@solidjs/web/renderToStringAsync",
    "@solidjs/web/renderToStream",
  ]).has(record.id);
  const hasTsxEntry = /\b(?:function|const)\s+App\b/.test(source)
    && /\b(?:render|hydrate)\s*\(\s*\(\)\s*=>\s*<App\s*\/>/.test(source);
  return invokesCurrent && hasOutput && (isServerDemo || hasTsxEntry && apiIsInsideApp(source, record));
}

function compileExample(source, id) {
  try {
    const server = id.startsWith("@solidjs/web/renderTo");
    return Babel.transform(source, {
      filename: `${id.replace(/[^a-zA-Z0-9_-]/g, "_")}.tsx`,
      sourceType: "module",
      presets: [[presetSolid, { moduleName: "@solidjs/web", generate: server ? "ssr" : "dom" }], "typescript"],
      plugins: ["transform-modules-commonjs"],
    }).code;
  } catch (error) {
    console.warn(`Skipping non-compilable example ${id}: ${error.message.split("\n")[0]}`);
    return undefined;
  }
}

records.sort((a, b) => {
  const categoryDifference = preferredCategoryOrder.indexOf(a.category) - preferredCategoryOrder.indexOf(b.category);
  if (categoryDifference) return categoryDifference;
  if (a.packageName !== b.packageName) return a.packageName.localeCompare(b.packageName);
  return a.title.localeCompare(b.title);
});
for (const record of records) {
  const hasOverride = Object.prototype.hasOwnProperty.call(demoOverrides, record.id)
    || Object.prototype.hasOwnProperty.call(demoOverrides, record.title);
  const override = demoOverrides[record.id] ?? demoOverrides[record.title];
  const resolvedOverride = typeof override === "string" ? override.replaceAll("__PACKAGE__", record.packageName) : undefined;
  const rawSources = hasOverride ? (resolvedOverride ? [resolvedOverride] : []) : record.codes.map((code) => completeExample(record, code, records));
  const sources = rawSources
    .map((source) => sanitizeDemoComments(source))
    .filter((source) => isObservableDemo(source, record));
  const compiled = sources.map((source) => ({ source, compiled: compileExample(source, record.id) })).filter((item) => item.compiled);
  record.codes = compiled.map((item) => item.source);
  record.compiledCodes = compiled.map((item) => item.compiled);
}

const categories = preferredCategoryOrder.filter((category) => records.some((record) => record.category === category));

const codePool = [...new Set(records.flatMap((record) => record.codes))];
const compiledCodePool = [...new Set(records.flatMap((record) => record.compiledCodes))];
const codeIndexes = new Map(codePool.map((code, index) => [code, index]));
const compiledCodeIndexes = new Map(compiledCodePool.map((code, index) => [code, index]));
const pooledRecords = records.map((record) => ({
  ...record,
  codes: record.codes.map((code) => codeIndexes.get(code)),
  compiledCodes: record.compiledCodes.map((code) => compiledCodeIndexes.get(code)),
}));

const output = `// Generated by scripts/generate-api-catalog.mjs from public callable beta.25 exports.\n` +
`export type ApiEntry = {\n  id: string;\n  title: string;\n  packageName: string;\n  category: string;\n  kind: string;\n  internal: boolean;\n  deprecated: boolean;\n  definition: string;\n  useCase: string;\n  overloads: { signature: string; parameters: { name: string; type: string; optional: boolean; description: string }[]; returns: { type: string; description: string } }[];\n  relatedTypes: { name: string; description: string; declaration: string; sourceUrl: string }[];\n  codes: string[];\n  compiledCodes: string[];\n  sourceUrl: string;\n};\n` +
`const codePool = ${JSON.stringify(codePool, null, 2)};\n` +
`const compiledCodePool = ${JSON.stringify(compiledCodePool, null, 2)};\n` +
`const rawDocs = ${JSON.stringify(pooledRecords, null, 2)};\n` +
`export const docs: ApiEntry[] = rawDocs.map(doc => ({ ...doc, codes: doc.codes.map(index => codePool[index]), compiledCodes: doc.compiledCodes.map(index => compiledCodePool[index]) })) as ApiEntry[];\n` +
`export const categoryOrder = ${JSON.stringify(categories, null, 2)};\n` +
`export const docsByCategory = categoryOrder.map(category => ({ category, docs: docs.filter(doc => doc.category === category) }));\n`;

fs.writeFileSync(outputFile, output);
fs.writeFileSync(path.join(root, "src", "generated-api-catalog.json"), JSON.stringify(records, null, 2));
console.log(`Generated ${records.length} public callable APIs across ${categories.length} categories.`);
