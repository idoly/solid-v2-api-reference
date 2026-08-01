import path from "node:path";
import { createDemoServer } from "./app.mjs";

const root = path.resolve(process.env.STATIC_DIR ?? "dist");
const port = integerEnvironment("PORT", 9000, { min: 1, max: 65_535 });
const rateLimit = integerEnvironment("DEMO_RATE_LIMIT", 30, { min: 1 });
const trustProxy = booleanEnvironment("TRUST_PROXY", false);
const server = createDemoServer({ root, rateLimit, trustProxy });

server.listen(port, "0.0.0.0", () => console.log(`Server listening on ${port}`));

const shutdown = () => server.close(() => process.exit(0));
process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);

function booleanEnvironment(name, fallback) {
  const value = process.env[name];
  if (value === undefined) return fallback;
  if (value === "1" || value === "true") return true;
  if (value === "0" || value === "false") return false;
  throw new Error(`${name} must be one of: 1, 0, true, false`);
}

function integerEnvironment(name, fallback, { min, max = Number.MAX_SAFE_INTEGER }) {
  const value = Number(process.env[name] ?? fallback);
  if (!Number.isSafeInteger(value) || value < min || value > max) {
    throw new Error(`${name} must be an integer between ${min} and ${max}`);
  }
  return value;
}
