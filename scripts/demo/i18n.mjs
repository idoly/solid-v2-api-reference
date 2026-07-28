const messages = {
  en: {
    babelNoOutput: "Babel did not return compiled output",
    demoImportDenied: ({ name }) => `Demo cannot import undeclared module: ${name}`,
    demoNotAllowed: "This API is not allowed in the server executor",
    invalidJson: "Request body must be valid JSON",
    methodNotAllowed: "Method not allowed",
    missingDemoSource: "Missing demo source",
    requestTooLarge: "Request exceeds the 100 KB limit",
    serverDemoNotFound: "Server demo source was not found",
    serverDemoTimedOut: "Server demo timed out",
    sourceTooLarge: "Demo source exceeds the 100 KB limit",
    tooManyRequests: "Too many demo requests",
  },
  "zh-CN": {
    babelNoOutput: "Babel 未返回编译产物",
    demoImportDenied: ({ name }) => `示例不允许导入未声明的模块：${name}`,
    demoNotAllowed: "该 API 不允许在服务端执行器中运行",
    invalidJson: "请求正文必须是有效的 JSON",
    methodNotAllowed: "不支持该请求方法",
    missingDemoSource: "缺少示例源码",
    requestTooLarge: "请求超过 100 KB 限制",
    serverDemoNotFound: "未找到服务端示例源码",
    serverDemoTimedOut: "服务端示例执行超时",
    sourceTooLarge: "示例源码超过 100 KB 限制",
    tooManyRequests: "示例请求过于频繁",
  },
};

const defaultLocale = "en";
const localeCodes = Object.keys(messages);

export class DemoError extends Error {
  constructor(key, values) {
    super(key);
    this.name = "DemoError";
    this.key = key;
    this.values = values;
  }
}

export function normalizeLocale(value) {
  const requested = String(value ?? "")
    .split(",", 1)[0]
    .trim()
    .replace("_", "-")
    .toLowerCase();
  const exact = localeCodes.find((code) => code.toLowerCase() === requested);
  if (exact) return exact;

  const language = requested.split("-", 1)[0];
  return localeCodes.find((code) => code.toLowerCase().split("-", 1)[0] === language) ?? defaultLocale;
}

export function message(locale, key, values = {}) {
  const dictionary = messages[normalizeLocale(locale)] ?? messages[defaultLocale];
  const entry = dictionary[key] ?? messages[defaultLocale][key] ?? key;
  return typeof entry === "function" ? entry(values) : entry;
}

export function formatError(value, locale) {
  if (value instanceof DemoError) return `${value.name}: ${message(locale, value.key, value.values)}`;
  if (value instanceof Error) return `${value.name}: ${value.message}`;
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(
      value,
      (_key, nested) => (typeof nested === "function" ? `[function ${nested.name || "anonymous"}]` : nested),
      2,
    );
  } catch {
    return String(value);
  }
}
