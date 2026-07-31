import path from "node:path";
import { createDemoServer } from "./app.mjs";

const root = path.resolve(process.env.STATIC_DIR ?? "dist");
const port = integerEnvironment("PORT", 9000, { min: 1, max: 65_535 });
const rateLimit = integerEnvironment("DEMO_RATE_LIMIT", 30, { min: 1 });
const server = createDemoServer({ root, rateLimit });

server.listen(port, "0.0.0.0", () => console.log(`Server listening on ${port}`));

const shutdown = () => server.close(() => process.exit(0));
process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);

function integerEnvironment(name, fallback, { min, max = Number.MAX_SAFE_INTEGER }) {
  const value = Number(process.env[name] ?? fallback);
  if (!Number.isSafeInteger(value) || value < min || value > max) {
    throw new Error(`${name} must be an integer between ${min} and ${max}`);
  }
  return value;
}
