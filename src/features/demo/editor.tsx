import { syntaxClasses } from "../../ui/highlight";
import styles from "./editor.module.css";

type Props = {
  variant: "inline" | "dialog";
  highlighted: () => string;
  source: () => string;
  edit: (source: string) => void;
  insertTab: (event: KeyboardEvent & { currentTarget: HTMLTextAreaElement }) => void;
  readOnly: () => boolean;
  label: () => string;
};

export function CodeEditor(props: Props) {
  let highlightLayer!: HTMLPreElement;
  const dialog = () => props.variant === "dialog";

  return (
    <div class={dialog() ? styles.dialogEditor : styles.editor}>
      <pre
        ref={highlightLayer}
        class={`${dialog() ? styles.dialogHighlight : styles.highlight} ${syntaxClasses}`}
        aria-hidden="true"
      >
        <code class={styles.codeContent} innerHTML={props.highlighted()} />
      </pre>
      <textarea
        class={dialog() ? styles.dialogTextarea : styles.textarea}
        value={props.source()}
        onInput={(event) => props.edit(event.currentTarget.value)}
        onScroll={(event) => {
          highlightLayer.scrollTop = event.currentTarget.scrollTop;
          highlightLayer.scrollLeft = event.currentTarget.scrollLeft;
        }}
        onKeyDown={props.insertTab}
        readonly={props.readOnly()}
        spellcheck={false}
        wrap="off"
        aria-label={props.label()}
      />
    </div>
  );
}
