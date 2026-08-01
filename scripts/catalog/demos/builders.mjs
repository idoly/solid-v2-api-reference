// Builds a complete browser program while keeping setup inside the render Owner.
// `after` is reserved for work that needs the mounted DOM.
export function browserDemo({ title, solid = [], web = [], setup, view, after = "", renderId }) {
  const solidImport = solid.length ? `import { ${solid.join(", ")} } from "solid-js";\n` : "";
  const webNames = [...new Set([...web, "render"])];
  const renderOptions = renderId ? `, undefined, { renderId: "${renderId}" }` : "";
  return `${solidImport}import { ${webNames.join(", ")} } from "@solidjs/web";

render(() => {
${setup
  .trim()
  .split("\n")
  .map((line) => `  ${line}`)
  .join("\n")}

  return (
    <main>
      <h3>${title}</h3>
${view
  .trim()
  .split("\n")
  .map((line) => `      ${line}`)
  .join("\n")}
    </main>
  );
}, document.getElementById("root")!${renderOptions});${after ? `\n${after.trim()}` : ""}`;
}
