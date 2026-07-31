import { runtimeError, runtimeLocale, runtimeMessage } from "../i18n/runtime";
import type { Result } from "./model";

async function requestJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<{ response: Response; data: T }> {
  let response: Response;
  try {
    response = await fetch(input, init);
  } catch {
    throw runtimeError("runtimeUnavailable");
  }

  if ([404, 405, 501].includes(response.status) || response.status >= 500) {
    throw runtimeError("runtimeUnavailable");
  }
  if (!response.headers.get("content-type")?.toLowerCase().includes("application/json")) {
    throw runtimeError("runtimeUnavailable");
  }

  try {
    return { response, data: (await response.json()) as T };
  } catch {
    throw runtimeError("runtimeUnavailable");
  }
}

export async function compileBrowserDemo(source: string): Promise<string> {
  const { response, data } = await requestJson<{ code?: string; error?: string }>("/__solid_api_compile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ source, locale: runtimeLocale() }),
  });
  if (!response.ok || !data.code) throw data.error ? new Error(data.error) : runtimeError("compileFailed");
  return data.code;
}

function isResult(value: unknown): value is Result {
  if (!value || typeof value !== "object") return false;
  const result = value as Partial<Result>;
  return Array.isArray(result.logs) && typeof result.html === "string";
}

export async function requestServerDemo(id: string, index: number): Promise<Result> {
  try {
    const { data } = await requestJson<unknown>(
      `/__solid_api_demo?id=${encodeURIComponent(id)}&index=${index}&locale=${encodeURIComponent(runtimeLocale())}`,
    );
    if (isResult(data)) return data;
    const error = (data as { error?: unknown } | null)?.error;
    if (typeof error === "string") throw new Error(error);
    throw runtimeError("runtimeUnavailable");
  } catch (error) {
    const message = error instanceof Error ? error.message : runtimeMessage("runtimeUnavailable");
    return { logs: [{ level: "error", text: message }], html: "", error: message };
  }
}
