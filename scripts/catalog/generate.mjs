import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import { resolveApiContent as resolveEnContent } from "./locale-en.mjs";
import { resolveApiContent as resolveZhContent } from "./locale-zh-cn.mjs";
import { compileDemo } from "../demo/compile.mjs";
import { demoOverrides } from "./demos.mjs";

const root = process.cwd();
const tempDir = path.join(root, ".generated");
const entryFile = path.join(tempDir, "api-entries.ts");
const sourceCommit = "595ec2536ddfda5cf705b6a3e0ab59f899c60f71";

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

const componentNames = new Set([
  "For",
  "Show",
  "Switch",
  "Match",
  "Errored",
  "Loading",
  "Repeat",
  "Reveal",
  "Hydration",
  "NoHydration",
  "Portal",
  "Dynamic",
  "Assets",
  "HydrationScript",
]);
const storeNames = new Set([
  "createStore",
  "createProjection",
  "createOptimisticStore",
  "reconcile",
  "merge",
  "omit",
  "snapshot",
  "deep",
  "isWrappable",
  "storePath",
]);
const lifecycleNames = new Set(["action", "onSettled", "refresh", "onCleanup"]);
const ownerNames = new Set([
  "createRoot",
  "createOwner",
  "getOwner",
  "getObserver",
  "isDisposed",
  "runWithOwner",
  "getNextChildId",
]);
const asyncNames = new Set([
  "resolve",
  "flatten",
  "NotReadyError",
  "enableExternalSource",
  "affects",
  "isPending",
  "latest",
]);
const ssrNames = new Set([
  "render",
  "hydrate",
  "renderToString",
  "renderToStringAsync",
  "renderToStream",
  "isServer",
  "isDev",
  "HydrationScript",
  "ssr",
  "ssrElement",
  "ssrAttribute",
  "ssrStyle",
  "ssrClassList",
  "ssrHydrationKey",
  "resolveSSRNode",
  "generateHydrationScript",
]);
const responseNames = new Set(["redirect", "reload", "respond", "isHref", "isResponseEnvelope", "getRequestEvent"]);
const deprecatedNames = new Set(["@solidjs/web/renderToStringAsync"]);
const CATEGORY = {
  reactivity: "reactivity",
  stores: "stores",
  lifecycleActions: "lifecycle-actions",
  ownersScopes: "owners-scopes",
  asyncInterop: "async-interop",
  componentsControlFlow: "components-control-flow",
  renderingSsr: "rendering-ssr",
  responsesNavigation: "responses-navigation",
  domWebRuntime: "dom-web-runtime",
  types: "types",
  internalCompiler: "internal-compiler",
};
const preferredCategoryOrder = [
  CATEGORY.reactivity,
  CATEGORY.stores,
  CATEGORY.lifecycleActions,
  CATEGORY.ownersScopes,
  CATEGORY.asyncInterop,
  CATEGORY.componentsControlFlow,
  CATEGORY.renderingSsr,
  CATEGORY.responsesNavigation,
  CATEGORY.domWebRuntime,
  CATEGORY.types,
  CATEGORY.internalCompiler,
];

function text(parts) {
  return ts
    .displayPartsToString(parts ?? [])
    .replace(/\s+/g, " ")
    .trim();
}

function tagText(value) {
  if (typeof value === "string") return value.trim();
  if (!value) return "";
  return value
    .map((part) => part.text)
    .join("")
    .trim();
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
  if (internal) return CATEGORY.internalCompiler;
  if (typeOnly) return CATEGORY.types;
  if (componentNames.has(name)) return CATEGORY.componentsControlFlow;
  if (storeNames.has(name)) return CATEGORY.stores;
  if (lifecycleNames.has(name)) return CATEGORY.lifecycleActions;
  if (ownerNames.has(name)) return CATEGORY.ownersScopes;
  if (asyncNames.has(name)) return CATEGORY.asyncInterop;
  if (packageName === "@solidjs/web" && ssrNames.has(name)) return CATEGORY.renderingSsr;
  if (packageName === "@solidjs/web" && responseNames.has(name)) return CATEGORY.responsesNavigation;
  if (packageName === "@solidjs/web") return CATEGORY.domWebRuntime;
  return CATEGORY.reactivity;
}

function kindFor(name, typeOnly, declarations) {
  if (typeOnly) return "type";
  if (componentNames.has(name)) return "component";
  if (declarations.some((node) => ts.isFunctionDeclaration(node) || ts.isMethodSignature(node))) return "function";
  if (declarations.some((node) => ts.isClassDeclaration(node))) return "class";
  return "constant";
}

function parameterFallback(name) {
  const zh = {
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
  const en = {
    compute: "The reactive computation function; reactive reads inside it become dependencies.",
    effectFn: "The side-effect callback, or a configuration object containing callbacks and error handlers.",
    fn: "The function or computation callback to execute.",
    callback: "The callback to execute when the corresponding condition is met.",
    value: "The value to write, compare, reconcile, or wrap.",
    options: "Optional settings that control this API's behavior.",
    props: "The properties passed to the component or rendering primitive.",
    children: "The child nodes to process or render.",
    owner: "The reactive Owner to inspect, read, or restore.",
    source: "The reactive source or input accessor.",
    element: "The target DOM element.",
    node: "The DOM node to process.",
    key: "The key used for lookup, comparison, or reconciliation.",
    path: "The property path to access or update in a Store.",
    fallback: "The fallback content shown when the primary content is unavailable.",
    init: "The initial value or initialization settings.",
  };
  return {
    zh: zh[name] ?? `传给该调用的 \`${name}\` 参数；具体约束由其类型定义。`,
    en: en[name] ?? `The \`${name}\` argument passed to this call; its type defines the exact constraints.`,
  };
}

function returnFallback(type) {
  let zh;
  let en;
  if (type === "void") {
    zh = "不返回业务值；调用通过副作用产生结果。";
    en = "Returns no application value; the call produces its result through side effects.";
  } else if (type === "never") {
    zh = "该重载不会正常返回。";
    en = "This overload never returns normally.";
  } else if (/^Promise</.test(type)) {
    zh = "返回 Promise，完成后得到声明中的结果类型。";
    en = "Returns a Promise that resolves to the declared result type.";
  } else if (/^\(.*\) =>/.test(type) || type.includes("dispose")) {
    zh = "返回可继续调用的函数；其参数和结果由该函数类型定义。";
    en = "Returns another callable function whose parameters and result are defined by its function type.";
  } else if (/Signal</.test(type)) {
    zh = "返回响应式 Signal，可通过访问器读取并通过 setter 更新。";
    en = "Returns a reactive Signal that can be read through its accessor and updated through its setter.";
  } else if (/Store/.test(type)) {
    zh = "返回保持细粒度响应性的 Store 结果。";
    en = "Returns a Store value that preserves fine-grained reactivity.";
  } else if (/Element|SolidElement|JSX/.test(type)) {
    zh = "返回可交给 Solid 渲染器处理的内容。";
    en = "Returns content that can be consumed by the Solid renderer.";
  } else {
    zh = `返回 \`${type}\`。`;
    en = `Returns \`${type}\`.`;
  }
  return { zh, en };
}

function callableDetails(runtimeType, declaration) {
  return runtimeType.getCallSignatures().map((signature) => {
    const signatureDeclaration = signature.getDeclaration();
    const sourceParameters = signatureDeclaration?.parameters ? [...signatureDeclaration.parameters] : [];
    const parameters = signature.getParameters().map((parameter, parameterIndex) => {
      const sourceParameter = sourceParameters[parameterIndex];
      const parameterDeclaration =
        sourceParameter ?? parameter.valueDeclaration ?? parameter.declarations?.[0] ?? declaration;
      const parameterType = checker.getTypeOfSymbolAtLocation(parameter, parameterDeclaration);
      const sourceDescription = text(parameter.getDocumentationComment(checker));
      const name = sourceParameter?.name?.getText() ?? parameter.name;
      return {
        name,
        type:
          sourceParameter?.type?.getText() ??
          checker.typeToString(
            parameterType,
            parameterDeclaration,
            ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope,
          ),
        optional:
          Boolean(sourceParameter?.questionToken || sourceParameter?.initializer) ||
          parameterIndex >= signature.minArgumentCount,
        description: {
          zh: containsChinese(sourceDescription) ? sourceDescription : parameterFallback(name).zh,
          en: sourceDescription && !containsChinese(sourceDescription) ? sourceDescription : parameterFallback(name).en,
        },
      };
    });
    const checkedReturnType = checker.typeToString(
      checker.getReturnTypeOfSignature(signature),
      declaration,
      ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope,
    );
    const returnType = signatureDeclaration?.type?.getText() ?? checkedReturnType;
    const typeParameters = signatureDeclaration?.typeParameters?.length
      ? `<${[...signatureDeclaration.typeParameters].map((parameter) => parameter.getText()).join(", ")}>`
      : "";
    const sourceSignature = `${typeParameters}(${sourceParameters.map((parameter) => parameter.getText()).join(", ")}): ${returnType}`;
    const returnTag = signature.getJsDocTags().find((tag) => tag.name === "returns" || tag.name === "return");
    const sourceReturnDescription = tagText(returnTag?.text);
    return {
      signature: signatureDeclaration
        ? sourceSignature
        : checker.signatureToString(
            signature,
            declaration,
            ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope,
            ts.SignatureKind.Call,
          ),
      parameters,
      returns: {
        type: returnType,
        description: {
          zh: containsChinese(sourceReturnDescription) ? sourceReturnDescription : returnFallback(returnType).zh,
          en:
            sourceReturnDescription && !containsChinese(sourceReturnDescription)
              ? sourceReturnDescription
              : returnFallback(returnType).en,
        },
      },
    };
  });
}

function containsChinese(value) {
  return /[\u3400-\u9fff]/.test(value);
}

function firstSentence(value) {
  const normalized = value
    .replace(/```[\s\S]*?```/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return (
    normalized
      .replace(/^[-*]\s+/, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .match(/^.*?[.!?。！？](?:\s|$)/)?.[0]
      ?.trim() || normalized.replace(/^[-*]\s+/, "").slice(0, 260)
  );
}

const moduleEntries = sourceFile.statements.filter(ts.isImportDeclaration).map((statement) => {
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
    if (
      (ts.isTypeAliasDeclaration(node) || ts.isInterfaceDeclaration(node) || ts.isClassDeclaration(node)) &&
      node.name
    ) {
      const symbol = checker.getSymbolAtLocation(node.name);
      if (symbol && !localTypes.has(node.name.text)) localTypes.set(node.name.text, { symbol, ownerPackage });
    }
    ts.forEachChild(node, visitType);
  };
  visitType(programFile);
}

const builtInTypeNames = new Set([
  "Array",
  "AsyncGenerator",
  "AsyncIterable",
  "Boolean",
  "Date",
  "Element",
  "Error",
  "Function",
  "Generator",
  "HTMLElement",
  "Iterable",
  "Iterator",
  "JSX",
  "Map",
  "Node",
  "Number",
  "Object",
  "Promise",
  "Readonly",
  "Record",
  "RegExp",
  "Set",
  "String",
  "Symbol",
  "WeakMap",
  "WeakSet",
]);

function relatedTypeDescription(name, apiTitle) {
  const zh = {
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
  const en = {
    ComputeFunction:
      "Defines the reactive computation shape, including the previous result argument and current return value.",
    EffectFunction: "Defines the side-effect callback arguments and optional cleanup return value.",
    EffectBundle: "Combines a side-effect callback with a computation-phase error handler.",
    BaseEffectOptions: "Defines naming, scheduling, and diagnostics shared by all effects.",
    EffectOptions: "Configures an effect's name, scheduling, and other execution behavior.",
    Signal: "A tuple containing a reactive accessor and its setter.",
    SignalOptions: "Configures Signal equality, naming, and related behavior.",
    Store: "Represents a Store reader with deep fine-grained reactivity.",
    StoreOptions: "Configures Store wrapping, comparison, and structural updates.",
    Component: "A component function that accepts props and returns Solid-renderable content.",
    Owner: "Represents the lifecycle and cleanup scope that owns reactive nodes.",
    Accessor: "A zero-argument function that reads the current reactive value.",
    Setter: "A reactive writer that accepts a new value or updater function.",
    NoInfer: "Prevents this position from participating in generic inference while retaining the inferred constraint.",
  };
  return {
    zh: zh[name] ?? `定义 \`${apiTitle}\` 调用签名中 \`${name}\` 的结构和类型约束。`,
    en: en[name] ?? `Defines the structure and type constraints of \`${name}\` in the \`${apiTitle}\` call signature.`,
  };
}

function relatedTypeDetails(overloads, packageName, apiTitle) {
  const results = [];
  const seen = new Set();
  const pending = overloads.map((overload) =>
    [...overload.parameters.map((parameter) => parameter.type), overload.returns.type].join(" "),
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
      const declaration = declarations.find(
        (node) => ts.isTypeAliasDeclaration(node) || ts.isInterfaceDeclaration(node) || ts.isClassDeclaration(node),
      );
      if (!declaration) continue;
      const ownerPackage = publicTarget
        ? publicTypes.get(packageName)?.has(name)
          ? packageName
          : "solid-js"
        : localTarget.ownerPackage;
      const declarationText = declaration
        .getText()
        .replace(/^export\s+/, "")
        .replace(/^declare\s+/, "")
        .replace(/\/\*\*[\s\S]*?\*\//g, "")
        .replace(/\n\s*\n/g, "\n")
        .trim()
        .slice(0, 6000);
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
    const declarationTags = declarations.flatMap((declaration) =>
      ts.getJSDocTags(declaration).map((tag) => ({
        name: tag.tagName.text,
        text: typeof tag.comment === "string" ? tag.comment : tag.comment,
      })),
    );
    const tags = [...symbolTags, ...declarationTags];
    const internal = tags.some((tag) => tag.name === "internal");
    const declaration = declarations[0];
    const runtimeType = declaration ? checker.getTypeOfSymbolAtLocation(target, declaration) : undefined;
    const callable = Boolean(runtimeType?.getCallSignatures().length);
    if (typeOnly || internal || !callable) continue;
    const deprecatedTag = tags.find((tag) => tag.name === "deprecated");
    const deprecated = Boolean(deprecatedTag) || deprecatedNames.has(`${packageName}/${exported.name}`);
    const docsText = text(target.getDocumentationComment(checker));
    const examples = [
      ...new Set(
        tags
          .filter((tag) => tag.name === "example")
          .map((tag) => normalizeExample(tagText(tag.text)))
          .filter(Boolean),
      ),
    ];
    const kind = kindFor(exported.name, typeOnly, declarations);
    const category = categoryFor(exported.name, packageName, typeOnly, internal);
    const overloads = callableDetails(runtimeType, declaration).filter((overload) => overload.returns.type !== "never");
    if (!overloads.length) continue;
    const relatedTypes = relatedTypeDetails(overloads, packageName, exported.name);
    const id = `${packageName}/${exported.name}`;
    const sourceDefinition = firstSentence(docsText);
    const sourceUseCase = firstSentence(docsText.replace(sourceDefinition, "").replace(/\s+/g, " ").trim());
    const contentContext = {
      id,
      title: exported.name,
      packageName,
      category,
      kind,
      sourceDefinition: sourceDefinition && !containsChinese(sourceDefinition) ? sourceDefinition : "",
      sourceUseCase: sourceUseCase && !containsChinese(sourceUseCase) ? sourceUseCase : "",
    };
    const [zhDefinition, zhUseCase] = resolveZhContent(contentContext);
    const [enDefinition, enUseCase] = resolveEnContent(contentContext);
    const definition = { zh: zhDefinition, en: enDefinition };
    const useCase = { zh: zhUseCase, en: enUseCase };
    records.push({
      id,
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
  const isServerDemo = new Set([
    "@solidjs/web/renderToString",
    "@solidjs/web/renderToStringAsync",
    "@solidjs/web/renderToStream",
  ]).has(record.id);
  const hasTsxEntry =
    /\b(?:function|const)\s+App\b/.test(source) && /\b(?:render|hydrate)\s*\(\s*\(\)\s*=>\s*<App\s*\/>/.test(source);
  return invokesCurrent && hasOutput && (isServerDemo || hasTsxEntry);
}

function compileExample(source, id) {
  try {
    const server = id.startsWith("@solidjs/web/renderTo");
    return compileDemo(source, {
      filename: `${id.replace(/[^a-zA-Z0-9_-]/g, "_")}.tsx`,
      generate: server ? "ssr" : "dom",
    });
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
  const hasOverride =
    Object.prototype.hasOwnProperty.call(demoOverrides, record.id) ||
    Object.prototype.hasOwnProperty.call(demoOverrides, record.title);
  const override = demoOverrides[record.id] ?? demoOverrides[record.title];
  const resolvedOverride =
    typeof override === "string" ? override.replaceAll("__PACKAGE__", record.packageName) : undefined;
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

const categories = preferredCategoryOrder.filter((category) => records.some((record) => record.category === category));

const locales = ["zh-CN", "en"];
const localizedTexts = records.flatMap((record) => [
  record.definition,
  record.useCase,
  ...record.overloads.flatMap((overload) => [
    ...overload.parameters.map((parameter) => parameter.description),
    overload.returns.description,
  ]),
  ...record.relatedTypes.map((relatedType) => relatedType.description),
]);
const localeProperty = { "zh-CN": "zh", en: "en" };
const textKey = (value) => JSON.stringify(locales.map((locale) => value[localeProperty[locale]]));
const textPool = [...new Map(localizedTexts.map((value) => [textKey(value), value])).values()];
const textIndexes = new Map(textPool.map((value, index) => [textKey(value), index]));
const poolText = (value) => textIndexes.get(textKey(value));

const codePool = [...new Set(records.flatMap((record) => record.codes))];
const codeIndexes = new Map(codePool.map((code, index) => [code, index]));
const pooledRecords = records.map(({ overloads, relatedTypes, ...record }) => ({
  ...record,
  definition: poolText(record.definition),
  useCase: poolText(record.useCase),
  overloads: overloads.map(({ parameters, returns, ...overload }) => ({
    ...overload,
    parameters: parameters.map(({ description, ...parameter }) => ({
      ...parameter,
      description: poolText(description),
    })),
    returns: { ...returns, description: poolText(returns.description) },
  })),
  relatedTypes: relatedTypes.map(({ description, ...relatedType }) => ({
    ...relatedType,
    description: poolText(description),
  })),
  codes: record.codes.map((code) => codeIndexes.get(code)),
}));

const textPools = Object.fromEntries(
  locales.map((locale) => [locale, textPool.map((value) => value[localeProperty[locale]])]),
);
const catalog = {
  schemaVersion: 3,
  sourceCommit,
  categories,
  textPools,
  codePool,
  records: pooledRecords,
};
fs.writeFileSync(path.join(root, "data", "catalog.json"), `${JSON.stringify(catalog)}\n`);
console.log(
  `Generated ${records.length} public callable APIs across ${categories.length} categories and ${locales.length} locales.`,
);
