import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { after, before, test } from "node:test";
import { createDemoServer } from "../../scripts/demo/app.mjs";

let baseUrl;
let root;
let server;

before(async () => {
  root = await mkdtemp(path.join(tmpdir(), "solid-api-server-"));
  await mkdir(path.join(root, "assets"));
  await writeFile(path.join(root, "index.html"), "<!doctype html><title>fixture</title>");
  await writeFile(path.join(root, "assets", "app.js"), "export const ready = true;");

  server = createDemoServer({ root, rateLimit: 1 });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
  await rm(root, { recursive: true, force: true });
});

test("serves health and security headers", async () => {
  const response = await fetch(`${baseUrl}/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: "ok" });
  assert.equal(response.headers.get("cache-control"), "no-store");
});

test("serves immutable assets and supports HEAD", async () => {
  const asset = await fetch(`${baseUrl}/assets/app.js`);
  assert.equal(asset.status, 200);
  assert.match(asset.headers.get("content-type"), /^text\/javascript/);
  assert.equal(asset.headers.get("cache-control"), "public, max-age=31536000, immutable");
  assert.equal(await asset.text(), "export const ready = true;");

  const head = await fetch(`${baseUrl}/assets/app.js`, { method: "HEAD" });
  assert.equal(head.status, 200);
  assert.equal(await head.text(), "");
});

test("falls back to the SPA only for extensionless routes", async () => {
  const route = await fetch(`${baseUrl}/docs/createSignal`);
  assert.equal(route.status, 200);
  assert.match(await route.text(), /fixture/);

  const missingAsset = await fetch(`${baseUrl}/missing.js`);
  assert.equal(missingAsset.status, 404);
});

test("enforces static and runtime endpoint methods", async () => {
  const staticResponse = await fetch(baseUrl, { method: "POST" });
  assert.equal(staticResponse.status, 405);

  const runtimeResponse = await fetch(`${baseUrl}/__solid_api_compile`);
  assert.equal(runtimeResponse.status, 405);
  assert.deepEqual(await runtimeResponse.json(), { error: "Method not allowed" });

  const limitedResponse = await fetch(`${baseUrl}/__solid_api_compile`);
  assert.equal(limitedResponse.status, 429);
  assert.equal(limitedResponse.headers.get("retry-after"), "60");
});
