import { DEMO_SOURCE_LIMIT } from "./config.mjs";
import { DemoError, message, normalizeLocale } from "./i18n.mjs";
import { compile, execute, format } from "./service.mjs";

const COMPILE_PATH = "/__solid_api_compile";
const DEMO_PATH = "/__solid_api_demo";

export function isRuntimePath(pathname) {
  return pathname === COMPILE_PATH || pathname === DEMO_PATH;
}

export async function handleRuntimeRequest(request, url) {
  const requestedLocale = url.searchParams.get("locale") ?? request.headers["accept-language"];
  let locale = normalizeLocale(requestedLocale);

  if (url.pathname === COMPILE_PATH) {
    if (request.method !== "POST") {
      return { status: 405, body: { error: message(locale, "methodNotAllowed") } };
    }
    try {
      const payload = await readJson(request);
      locale = normalizeLocale(payload.locale ?? requestedLocale);
      return { status: 200, body: { code: compile(payload.source) } };
    } catch (error) {
      return { status: 400, body: { error: format(error, locale) } };
    }
  }

  try {
    const id = url.searchParams.get("id") ?? "";
    const index = Number(url.searchParams.get("index") ?? 0);
    return { status: 200, body: await execute(id, index) };
  } catch (error) {
    const errorMessage = format(error, locale);
    return {
      status: 400,
      body: { logs: [{ level: "error", text: errorMessage }], html: "", error: errorMessage },
    };
  }
}

async function readJson(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    const buffer = Buffer.from(chunk);
    size += buffer.length;
    if (size > DEMO_SOURCE_LIMIT) throw new DemoError("requestTooLarge");
    chunks.push(buffer);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new DemoError("invalidJson");
  }
}
