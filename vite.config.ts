import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import { createDemoRuntimePlugin } from "./scripts/demo/plugin";

export default defineConfig({
  plugins: [solid(), createDemoRuntimePlugin()],
  server: {
    host: "0.0.0.0",
  },
  build: {
    target: "esnext",
  },
});
