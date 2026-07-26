import Prism from "prismjs";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";

export const syntaxClasses =
  "[&_.token.comment]:text-[#7f9186] [&_.token.prolog]:text-[#7f9186] [&_.token.doctype]:text-[#7f9186] [&_.token.cdata]:text-[#7f9186] [&_.token.punctuation]:text-[#aebbb3] [&_.token.namespace]:opacity-75 [&_.token.property]:text-[#efaa7c] [&_.token.tag]:text-[#efaa7c] [&_.token.boolean]:text-[#efaa7c] [&_.token.number]:text-[#efaa7c] [&_.token.constant]:text-[#efaa7c] [&_.token.symbol]:text-[#efaa7c] [&_.token.selector]:text-[#acd77c] [&_.token.attr-name]:text-[#acd77c] [&_.token.string]:text-[#acd77c] [&_.token.char]:text-[#acd77c] [&_.token.builtin]:text-[#acd77c] [&_.token.operator]:text-[#8fc7bd] [&_.token.entity]:text-[#8fc7bd] [&_.token.url]:text-[#8fc7bd] [&_.token.atrule]:text-[#d1a7df] [&_.token.attr-value]:text-[#d1a7df] [&_.token.keyword]:text-[#d1a7df] [&_.token.function]:text-[#83b9e8] [&_.token.class-name]:text-[#83b9e8] [&_.token.regex]:text-[#e7c46b] [&_.token.important]:text-[#e7c46b] [&_.token.variable]:text-[#e7c46b]";

export function highlightTs(source: string) {
  return Prism.highlight(source, Prism.languages.typescript, "typescript");
}

export function highlightTsx(source: string) {
  return Prism.highlight(source, Prism.languages.tsx, "tsx");
}
