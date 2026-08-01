import Prism from "prismjs";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";

import styles from "./highlight.module.css";

export const syntaxClasses = styles.syntax;

export function highlightTs(source: string) {
  return Prism.highlight(source, Prism.languages.typescript, "typescript");
}

export function highlightTsx(source: string) {
  return Prism.highlight(source, Prism.languages.tsx, "tsx");
}
