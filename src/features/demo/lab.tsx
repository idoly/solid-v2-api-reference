import { For, Show } from "solid-js";
import { Check, Copy, Maximize2, Play, RotateCcw, X } from "../../ui/icons";
import { iconButton } from "../../ui/classes";
import { syntaxClasses } from "../../ui/highlight";
import type { Locale } from "../i18n/locale";
import { createController } from "./controller";
import type { Doc } from "../../data/catalog";

const editorLayer =
  "absolute inset-0 m-0 h-full w-full [overflow-wrap:normal] border-0 p-[18px] font-mono text-xs leading-[1.75] break-normal whitespace-pre [tab-size:2]";
const mountContent =
  "[&>main]:m-0 [&>main]:w-full [&>main]:bg-transparent [&>main]:p-0 [&_h1]:mb-3 [&_h1]:text-lg [&_h1]:leading-[1.35] [&_h1]:text-[#28322b] [&_h3]:mb-3 [&_h3]:text-lg [&_h3]:leading-[1.35] [&_h3]:text-[#28322b] [&_p]:my-2 [&_p]:text-[13px] [&_p]:leading-[1.7] [&_p]:text-[#5d6860] [&_strong]:text-base [&_strong]:text-[#315e55] [&_ul]:mt-2.5 [&_ul]:pl-[22px] [&_ul]:text-[13px] [&_ul]:leading-[1.8] [&_ul]:text-[#465149] [&_ol]:mt-2.5 [&_ol]:pl-[22px] [&_ol]:text-[13px] [&_ol]:leading-[1.8] [&_ol]:text-[#465149] [&_pre]:mt-2.5 [&_pre]:overflow-x-auto [&_pre]:bg-[#1a1f1c] [&_pre]:p-3 [&_pre]:font-mono [&_pre]:text-[11px] [&_pre]:leading-[1.65] [&_pre]:text-[#dbe4de] [&_input]:mt-2 [&_input]:min-h-9 [&_input]:w-full [&_input]:rounded [&_input]:border [&_input]:border-[#bcc8bf] [&_input]:bg-surface [&_input]:px-2.5 [&_input]:py-2 [&_input]:text-[13px] [&_input]:text-[#354139] [&_textarea]:mt-2 [&_textarea]:min-h-9 [&_textarea]:w-full [&_textarea]:rounded [&_textarea]:border [&_textarea]:border-[#bcc8bf] [&_textarea]:bg-surface [&_textarea]:px-2.5 [&_textarea]:py-2 [&_textarea]:text-[13px] [&_textarea]:text-[#354139] [&_aside]:mt-2.5 [&_aside]:border [&_aside]:border-[#cbd6c9] [&_aside]:bg-[#eef5e7] [&_aside]:p-3 dark:[&_h1]:text-[#edf2ee] dark:[&_h3]:text-[#edf2ee] dark:[&_p]:text-[#bac4bd] dark:[&_strong]:text-[#b5da7e] dark:[&_ul]:text-[#c4cdc6] dark:[&_ol]:text-[#c4cdc6] dark:[&_pre]:bg-code dark:[&_input]:border-[#465149] dark:[&_input]:bg-panel-dark dark:[&_input]:text-[#e0e7e2] dark:[&_textarea]:border-[#465149] dark:[&_textarea]:bg-panel-dark dark:[&_textarea]:text-[#e0e7e2] dark:[&_aside]:border-[#40523b] dark:[&_aside]:bg-[#20291d] [&_label]:mt-3 [&_label]:block [&_label]:text-[11px] [&_label]:font-semibold [&_label]:text-[#59645c] [&_input]:outline-none [&_input]:transition-colors focus:[&_input]:border-[#6e9231] focus:[&_input]:ring-2 focus:[&_input]:ring-[#b8ef4a]/25 [&_input[type=range]]:h-8 [&_input[type=range]]:cursor-pointer [&_input[type=range]]:border-0 [&_input[type=range]]:px-0 [&_input[type=range]]:ring-0 [&_button]:mt-3 [&_button]:min-h-9 [&_button]:cursor-pointer [&_button]:rounded [&_button]:border [&_button]:border-[#28312b] [&_button]:bg-[#28312b] [&_button]:px-3 [&_button]:py-2 [&_button]:text-xs [&_button]:font-semibold [&_button]:text-white [&_button]:transition-colors hover:[&_button]:border-[#567225] hover:[&_button]:bg-[#567225] focus-visible:[&_button]:outline-2 focus-visible:[&_button]:outline-offset-2 focus-visible:[&_button]:outline-[#719a2e] [&_button+button]:ml-2 [&_output]:mt-3 [&_output]:block [&_output]:rounded [&_output]:border [&_output]:border-[#d7dfd8] [&_output]:bg-[#f3f6f3] [&_output]:px-3 [&_output]:py-2.5 [&_output]:font-mono [&_output]:text-[13px] [&_output]:text-[#315e55] dark:[&_label]:text-[#bac4bd] dark:[&_button]:border-[#a5ce62] dark:[&_button]:bg-[#a5ce62] dark:[&_button]:text-[#172013] dark:hover:[&_button]:border-[#b9df7c] dark:hover:[&_button]:bg-[#b9df7c] dark:[&_output]:border-[#354039] dark:[&_output]:bg-[#1b221d] dark:[&_output]:text-[#b5da7e] [&_form]:mt-3 [&_form]:border-t [&_form]:border-[#e0e6e1] [&_form]:pt-1 [&_input::placeholder]:text-[#8d9790] [&_button:disabled]:cursor-not-allowed [&_button:disabled]:opacity-50 [&_textarea]:outline-none [&_textarea]:transition-colors focus:[&_textarea]:border-[#6e9231] focus:[&_textarea]:ring-2 focus:[&_textarea]:ring-[#b8ef4a]/25 max-mobile:[&_button]:mr-2 max-mobile:[&_button+button]:ml-0 dark:[&_form]:border-[#303a33] dark:[&_input::placeholder]:text-[#768078] [&_select]:mt-1.5 [&_select]:min-h-9 [&_select]:w-full [&_select]:cursor-pointer [&_select]:rounded [&_select]:border [&_select]:border-[#bcc8bf] [&_select]:bg-surface [&_select]:px-2.5 [&_select]:py-2 [&_select]:text-[13px] [&_select]:text-[#354139] [&_select]:outline-none [&_select]:transition-colors focus:[&_select]:border-[#6e9231] focus:[&_select]:ring-2 focus:[&_select]:ring-[#b8ef4a]/25 [&_input[type=checkbox]]:mr-2 [&_input[type=checkbox]]:min-h-0 [&_input[type=checkbox]]:w-auto [&_input[type=checkbox]]:accent-[#6f981d] dark:[&_select]:border-[#465149] dark:[&_select]:bg-panel-dark dark:[&_select]:text-[#e0e7e2]";

const styles = {
  root: "overflow-hidden rounded-md border border-[#cbd4cd] bg-white shadow-[0_14px_38px_rgba(34,45,38,.075)] dark:border-border-dark dark:bg-panel-dark dark:shadow-none",
  controls: "absolute top-[49px] right-0 z-[2] flex min-h-9 items-center justify-end gap-2 max-mobile:top-[38px]",
  codePane: "flex min-h-80 max-h-[620px] min-w-0 flex-col border-r-0 bg-code text-[#dbe4de]",
  editor:
    "relative h-[380px] min-h-80 max-h-[620px] flex-1 resize-y overflow-hidden bg-code max-mobile:h-80 max-mobile:min-h-[260px] max-mobile:max-h-[420px]",
  highlight: `${editorLayer} z-[1] overflow-hidden bg-code text-[#dbe4de] pointer-events-none`,
  textarea: `${editorLayer} z-[2] resize-none overflow-auto bg-transparent text-transparent caret-[#f5faf7] outline-0 [-webkit-text-fill-color:transparent] selection:bg-[rgba(121,163,82,.34)] read-only:cursor-default`,
  runtime: "border-t border-[#29302b] bg-code",
  results: "grid min-h-[230px] grid-cols-1 bg-code",
  browserHeader:
    "flex min-h-[38px] items-center border-b border-border bg-[#eef2ee] px-5 font-mono text-[10px] font-medium text-[#657168] dark:border-line-dark dark:bg-surface-dark dark:text-[#a6b0a9]",
  mount: `min-h-40 bg-surface p-5 text-[#28322b] transition-colors empty:hidden dark:bg-canvas-dark dark:text-[#dbe4de] ${mountContent}`,
  previewMessage: "block px-2.5 py-7 text-center text-xs text-[#818a84] dark:text-[#939e96]",
  console: "min-h-[110px] max-h-[300px] min-w-0 overflow-auto bg-code p-3.5 text-[#dbe4de]",
  consoleHeader: "border-b border-[#29302b] pb-2.5 font-mono text-[10px] text-[#b8c2bb]",
  consoleEmpty: "block py-2.5 text-xs leading-[1.7] text-[#a6b0a9]",
  consoleText: "m-0 min-w-0 font-mono text-[11px] leading-[1.65] break-words whitespace-pre-wrap text-inherit",
  dialog:
    "fixed inset-0 z-[100] m-auto h-[min(88vh,900px)] w-[min(92vw,1180px)] max-w-none overflow-hidden rounded-md border border-[#cbd4cd] bg-white p-0 text-[#354139] shadow-[0_28px_90px_rgba(0,0,0,.25)] backdrop:bg-[rgba(13,17,14,.42)] backdrop:backdrop-blur-[2px] dark:border-border-dark dark:bg-panel-dark dark:text-[#dbe4de] dark:shadow-[0_28px_90px_rgba(0,0,0,.42)] dark:backdrop:bg-[rgba(13,17,14,.68)] max-mobile:h-[calc(100dvh-20px)] max-mobile:w-[calc(100vw-20px)]",
  dialogShell: "grid h-full min-h-0 grid-rows-[52px_minmax(0,1fr)_58px]",
  dialogHeader:
    "flex items-center justify-between border-b border-[#d2dad4] bg-[#f3f6f3] px-4 dark:border-[#303832] dark:bg-[#1e2520]",
  dialogTitle: "m-0 min-w-0 truncate font-mono text-xs font-semibold text-[#354139] dark:text-[#dce5df]",
  dialogEditor: "relative min-h-0 overflow-hidden bg-code",
  dialogFooter:
    "flex items-center justify-end gap-2 border-t border-[#d2dad4] bg-[#f3f6f3] px-4 dark:border-[#303832] dark:bg-[#1e2520]",
  dialogIconButton:
    "grid size-9 shrink-0 cursor-pointer place-items-center rounded-[5px] border border-[#cbd4cd] bg-white p-0 text-[#465149] transition-colors hover:border-[#96a299] hover:bg-[#e9eeea] disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#465149] dark:bg-[#252d27] dark:text-[#dce4de] dark:hover:border-[#708078] dark:hover:bg-[#303a33]",
  dialogRunButton:
    "grid size-9 shrink-0 cursor-pointer place-items-center rounded-[5px] border border-[#222923] bg-[#222923] p-0 text-white transition-colors hover:border-[#506b22] hover:bg-[#506b22] disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#a5ce62] dark:bg-[#a5ce62] dark:text-[#172013] dark:hover:border-[#b9df7c] dark:hover:bg-[#b9df7c]",
  dialogTextarea: `${editorLayer} resize-none overflow-auto bg-transparent text-transparent caret-[#f5faf7] outline-0 [-webkit-text-fill-color:transparent] selection:bg-[rgba(121,163,82,.34)] read-only:cursor-default`,
  dialogHighlight: `${editorLayer} overflow-hidden bg-code text-[#dbe4de] pointer-events-none`,
} as const;

const preview = "min-w-0 border-b border-border bg-surface transition-colors dark:border-line-dark dark:bg-canvas-dark";
const consoleRow = "border-b border-[#29302b] py-1.5";
const consoleTone = {
  log: "text-[#dbe4de]",
  info: "text-[#c5ddd7]",
  warn: "text-[#e8cc7c]",
  error: "text-[#ff9d8b]",
  result: "text-[#a9d778]",
} as const;

type Props = { doc: Doc; code: string; exampleIndex: number; locale: Locale };
type CodeEditorProps = {
  class: string;
  highlightClass: string;
  textareaClass: string;
  highlighted: () => string;
  source: () => string;
  edit: (source: string) => void;
  insertTab: (event: KeyboardEvent & { currentTarget: HTMLTextAreaElement }) => void;
  readOnly: () => boolean;
  label: () => string;
};

function CodeEditor(props: CodeEditorProps) {
  let highlightLayer!: HTMLPreElement;
  return (
    <div class={props.class}>
      <pre ref={highlightLayer} class={`${props.highlightClass} ${syntaxClasses}`} aria-hidden="true">
        <code class="font-[inherit] [white-space:inherit]" innerHTML={props.highlighted()} />
      </pre>
      <textarea
        class={props.textareaClass}
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

export function Lab(props: Props) {
  let mount: HTMLDivElement | undefined;
  let editorDialog!: HTMLDialogElement;
  const { running, result, copied, source, edit, demo, highlighted, hasPreview, run, reset, copy, insertTab } =
    createController(props, () => mount);

  const openEditor = () => editorDialog.showModal();
  const closeEditor = () => editorDialog.close();

  return (
    <div class={styles.root}>
      <div class={styles.controls}>
        <button
          class={`${iconButton} disabled:cursor-not-allowed disabled:opacity-50`}
          onClick={() => {
            void run();
          }}
          disabled={running()}
          title={running() ? props.locale.t("running") : props.locale.t("runCode")}
          aria-label={running() ? props.locale.t("running") : props.locale.t("runCode")}
        >
          <Play size={15} />
        </button>
        <button
          class={iconButton}
          onClick={openEditor}
          title={props.locale.t("expandEditor")}
          aria-label={props.locale.t("expandEditor")}
        >
          <Maximize2 size={15} />
        </button>
        <button
          class={iconButton}
          onClick={() => {
            void copy();
          }}
          title={copied() ? props.locale.t("copiedCode") : props.locale.t("copyCode")}
          aria-label={copied() ? props.locale.t("copiedCode") : props.locale.t("copyCode")}
        >
          <Show when={copied()} fallback={<Copy size={15} />}>
            <Check size={15} />
          </Show>
        </button>
        <button
          class={iconButton}
          onClick={reset}
          title={props.locale.t("resetDemo")}
          aria-label={props.locale.t("resetDemo")}
        >
          <RotateCcw size={15} />
        </button>
      </div>
      <div class={styles.codePane}>
        <CodeEditor
          class={styles.editor}
          highlightClass={styles.highlight}
          textareaClass={styles.textarea}
          highlighted={highlighted}
          source={source}
          edit={edit}
          insertTab={insertTab}
          readOnly={() => demo().server}
          label={() => props.locale.t("editorLabel")}
        />
      </div>
      <div class={styles.runtime}>
        <div class={styles.results}>
          <div class={`${preview} ${hasPreview() ? "block" : "hidden"}`}>
            <header class={styles.browserHeader}>{props.locale.t("browser")}</header>
            <div ref={mount} class={styles.mount} />
            <Show when={!result()}>
              <span class={styles.previewMessage}>{props.locale.t("browserPending")}</span>
            </Show>
            <Show when={result() && !result()?.html}>
              <span class={styles.previewMessage}>{props.locale.t("browserEmpty")}</span>
            </Show>
          </div>
          <div class={styles.console}>
            <header class={styles.consoleHeader}>{props.locale.t("console")}</header>
            <Show
              when={result()}
              fallback={<span class={styles.consoleEmpty}>{props.locale.t("consolePending")}</span>}
            >
              <Show
                when={result()?.logs.length}
                fallback={<span class={styles.consoleEmpty}>{props.locale.t("consoleEmpty")}</span>}
              >
                <For each={result()?.logs}>
                  {(entry) => (
                    <div class={`${consoleRow} ${consoleTone[entry.level]}`}>
                      <pre class={styles.consoleText}>{entry.text}</pre>
                    </div>
                  )}
                </For>
              </Show>
            </Show>
          </div>
        </div>
      </div>
      <dialog
        ref={editorDialog}
        class={styles.dialog}
        aria-labelledby="expanded-editor-title"
        onClick={(event) => {
          if (event.target === event.currentTarget) closeEditor();
        }}
      >
        <div class={styles.dialogShell}>
          <header class={styles.dialogHeader}>
            <h2 id="expanded-editor-title" class={styles.dialogTitle}>
              {props.doc.title} - {props.locale.t("editorLabel")}
            </h2>
            <button
              class={styles.dialogIconButton}
              onClick={closeEditor}
              title={props.locale.t("closeEditor")}
              aria-label={props.locale.t("closeEditor")}
            >
              <X size={16} />
            </button>
          </header>
          <CodeEditor
            class={styles.dialogEditor}
            highlightClass={styles.dialogHighlight}
            textareaClass={styles.dialogTextarea}
            highlighted={highlighted}
            source={source}
            edit={edit}
            insertTab={insertTab}
            readOnly={() => demo().server}
            label={() => props.locale.t("editorLabel")}
          />
          <footer class={styles.dialogFooter}>
            <button
              class={styles.dialogIconButton}
              onClick={reset}
              title={props.locale.t("resetDemo")}
              aria-label={props.locale.t("resetDemo")}
            >
              <RotateCcw size={15} />
            </button>
            <button
              class={styles.dialogIconButton}
              onClick={() => {
                void copy();
              }}
              title={copied() ? props.locale.t("copiedCode") : props.locale.t("copyCode")}
              aria-label={copied() ? props.locale.t("copiedCode") : props.locale.t("copyCode")}
            >
              <Show when={copied()} fallback={<Copy size={15} />}>
                <Check size={15} />
              </Show>
            </button>
            <button
              class={styles.dialogRunButton}
              onClick={() => {
                closeEditor();
                void run();
              }}
              disabled={running()}
              title={running() ? props.locale.t("running") : props.locale.t("runCode")}
              aria-label={running() ? props.locale.t("running") : props.locale.t("runCode")}
            >
              <Play size={15} />
            </button>
          </footer>
        </div>
      </dialog>
    </div>
  );
}
