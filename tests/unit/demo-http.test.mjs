import assert from "node:assert/strict";
import test from "node:test";
import { handleRuntimeRequest, isRuntimePath } from "../../scripts/demo/http.mjs";

function request(method, body = "", headers = {}) {
  return {
    method,
    headers,
    async *[Symbol.asyncIterator]() {
      if (body) yield Buffer.from(body);
    },
  };
}

const url = (path) => new URL(path, "http://localhost");

test("recognizes only registered runtime paths", () => {
  assert.equal(isRuntimePath("/__solid_api_compile"), true);
  assert.equal(isRuntimePath("/__solid_api_demo"), true);
  assert.equal(isRuntimePath("/__solid_api_unknown"), false);
});

test("enforces endpoint methods", async () => {
  const compile = await handleRuntimeRequest(request("GET"), url("/__solid_api_compile"));
  const demo = await handleRuntimeRequest(request("POST"), url("/__solid_api_demo"));

  assert.deepEqual(compile, { status: 405, body: { error: "Method not allowed" } });
  assert.deepEqual(demo, { status: 405, body: { error: "Method not allowed" } });
});

test("rejects invalid demo indexes before execution", async () => {
  for (const index of ["-1", "1.5", "NaN"]) {
    const response = await handleRuntimeRequest(
      request("GET"),
      url(`/__solid_api_demo?id=@solidjs/web/renderToString&index=${index}`),
    );
    assert.equal(response.status, 400);
    assert.match(response.body.error, /Demo index must be a non-negative integer/);
    assert.equal(response.body.logs[0].level, "error");
  }
});

test("localizes malformed JSON errors", async () => {
  const response = await handleRuntimeRequest(
    request("POST", "{", { "accept-language": "zh-CN" }),
    url("/__solid_api_compile"),
  );

  assert.equal(response.status, 400);
  assert.match(response.body.error, /请求正文必须是有效的 JSON/);
});

test("rejects request bodies above the configured limit", async () => {
  const response = await handleRuntimeRequest(request("POST", "x".repeat(100_001)), url("/__solid_api_compile"));

  assert.equal(response.status, 400);
  assert.match(response.body.error, /Request exceeds the 100 KB limit/);
});
