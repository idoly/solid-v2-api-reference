import fs from "node:fs";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";

const archive = path.resolve(process.argv[2] ?? "code.zip");
const stage = fs.mkdtempSync(path.join(os.tmpdir(), "solid-package-smoke."));
let server;

try {
  const unzip = spawnSync("unzip", ["-q", archive, "-d", stage], { stdio: "inherit" });
  if (unzip.status !== 0) process.exit(unzip.status ?? 1);

  const port = await availablePort();
  server = spawn(process.execPath, ["scripts/demo/server.mjs"], {
    cwd: stage,
    env: { ...process.env, PORT: String(port) },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let diagnostics = "";
  server.stdout.on("data", (chunk) => (diagnostics += chunk));
  server.stderr.on("data", (chunk) => (diagnostics += chunk));

  const base = `http://127.0.0.1:${port}`;
  const health = await waitForResponse(`${base}/health`, server, () => diagnostics);
  if (!health.ok || (await health.json()).status !== "ok") throw new Error("Packaged health endpoint failed");

  const page = await fetch(`${base}/`);
  const html = await page.text();
  if (!page.ok || !html.includes('<div id="root"></div>')) throw new Error("Packaged application page failed");
  const assetPath = html.match(/(?:src|href)="(\/assets\/[^"]+)"/)?.[1];
  if (!assetPath || !(await fetch(`${base}${assetPath}`)).ok) throw new Error("Packaged application asset failed");
  console.log(`Package smoke passed on port ${port}.`);
} finally {
  if (server && server.exitCode === null) {
    server.kill("SIGTERM");
    await Promise.race([new Promise((resolve) => server.once("exit", resolve)), delay(2_000)]);
    if (server.exitCode === null) server.kill("SIGKILL");
  }
  fs.rmSync(stage, { recursive: true, force: true });
}

function availablePort() {
  return new Promise((resolve, reject) => {
    const probe = net.createServer();
    probe.once("error", reject);
    probe.listen(0, "127.0.0.1", () => {
      const address = probe.address();
      probe.close(() => resolve(address.port));
    });
  });
}

async function waitForResponse(url, child, diagnostics) {
  for (let attempt = 0; attempt < 50; attempt++) {
    if (child.exitCode !== null) throw new Error(`Packaged server exited early:\n${diagnostics()}`);
    try {
      return await fetch(url);
    } catch {
      await delay(100);
    }
  }
  throw new Error(`Packaged server did not become ready:\n${diagnostics()}`);
}

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
