import { runtimeMessage } from "../i18n/runtime";

export function formatValue(value: unknown, seen = new WeakSet<object>()): string {
  if (value instanceof Error) return `${value.name}: ${value.message}`;
  if (value instanceof Node) return value instanceof Element ? value.outerHTML : (value.textContent ?? value.nodeName);
  if (typeof value === "string") return value;
  if (typeof value === "function") return runtimeMessage("functionValue", value.name || "anonymous");
  if (typeof value === "symbol") return value.toString();
  if (value && typeof value === "object") {
    if (seen.has(value)) return runtimeMessage("circular");
    seen.add(value);
    try {
      return JSON.stringify(
        value,
        (_key, nested) => {
          if (typeof nested === "function") return runtimeMessage("functionValue", nested.name || "anonymous");
          if (typeof nested === "symbol") return nested.toString();
          return nested;
        },
        2,
      );
    } catch {
      return Object.prototype.toString.call(value);
    }
  }
  return String(value);
}
