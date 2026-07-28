import { transformSync } from "@babel/core";
import ts from "typescript";
import presetSolid from "babel-preset-solid";
import { DemoError } from "./i18n.mjs";

export function compileDemo(source, options = {}) {
  const filename = options.filename ?? "solid-demo.tsx";
  const generate = options.generate ?? "dom";
  const jsx = ts.transpileModule(source, {
    fileName: filename,
    compilerOptions: {
      jsx: ts.JsxEmit.Preserve,
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ESNext,
    },
  }).outputText;
  const transformed = transformSync(jsx, {
    filename: filename.replace(/\.tsx$/, ".jsx"),
    sourceType: "module",
    configFile: false,
    babelrc: false,
    presets: [[presetSolid, { moduleName: "@solidjs/web", generate }]],
  })?.code;
  if (!transformed) throw new DemoError("babelNoOutput");
  return ts
    .transpileModule(transformed, {
      fileName: filename.replace(/\.tsx$/, ".js"),
      compilerOptions: {
        allowJs: true,
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ESNext,
      },
    })
    .outputText.trim();
}
