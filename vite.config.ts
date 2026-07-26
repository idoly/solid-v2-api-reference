import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import { createDemoRuntimePlugin } from "./scripts/demo/plugin";

export default defineConfig({
  plugins: [tailwindcss(), solid(), createDemoRuntimePlugin()],
  server: {
    host: "0.0.0.0",
  },
  build: {
    target: "esnext",
  },
});
