export type Log = {
  level: "log" | "info" | "warn" | "error" | "result";
  text: string;
};

export type Result = {
  logs: Log[];
  html: string;
  error?: string;
};

const serverDemoIds = new Set([
  "@solidjs/web/renderToString",
  "@solidjs/web/renderToStringAsync",
  "@solidjs/web/renderToStream",
  "@solidjs/web/httpHeader",
  "@solidjs/web/httpStatus",
]);

export function isServerDemo(id: string) {
  return serverDemoIds.has(id);
}
