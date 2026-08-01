import { defaultLocale, resolveLocale, type Code } from "./config";

const runtimeMessages = {
  en: {
    circular: "[Circular reference]",
    compileFailed: "Code compilation failed",
    functionValue: (name: string) => `[function ${name}]`,
    executionTimedOut: "Example execution timed out. You can edit the code and run it again.",
    importDenied: (name: string) => `Example cannot import undeclared module: ${name}`,
    missingOutput: "This example has no executable compiled output",
    runtimeUnavailable: "Example execution is unavailable in this deployment.",
  },
  "zh-CN": {
    circular: "[循环引用]",
    compileFailed: "代码编译失败",
    functionValue: (name: string) => `[函数 ${name}]`,
    executionTimedOut: "示例运行超时，可以修改代码后重新运行。",
    importDenied: (name: string) => `示例不允许导入未声明的模块：${name}`,
    missingOutput: "该示例没有可执行的编译产物",
    runtimeUnavailable: "当前部署环境无法运行示例。",
  },
} as const;

type RuntimeKey = keyof (typeof runtimeMessages)[typeof defaultLocale];
type RuntimeEntry = string | ((value: string) => string);

export function runtimeLocale(): Code {
  return resolveLocale(document.documentElement.lang);
}

export function runtimeMessage(key: RuntimeKey, value = ""): string {
  const locale = runtimeLocale();
  const entry: RuntimeEntry = runtimeMessages[locale]?.[key] ?? runtimeMessages[defaultLocale][key];
  return typeof entry === "function" ? entry(value) : entry;
}

export function runtimeError(key: RuntimeKey, value = ""): Error {
  return new Error(runtimeMessage(key, value));
}
