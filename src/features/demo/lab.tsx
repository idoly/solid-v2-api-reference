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
  "[&>main]:m-0 [&>main]:w-full [&>main]:bg-transparent [&>main]:p-0 [&_h1]:mb-3 [&_h1]:text-lg [&_h1]:leading-[1.35] [&_h1]:text-[#28322b] [&_h3]:mb-3 [&_h3]:text-lg [&_h3]:leading-[1.35] [&_h3]:text-[#28322b] [&_p]:my-2 [&_p]:text-[13px] [&_p]:leading-[1.7] [&_p]:text-[#5d6860] [&_strong]:text-base [&_strong]:text-[#315e55] [&_ul]:mt-2.5 [&_ul]:pl-[22px] [&_ul]:text-[13px] [&_ul]:leading-[1.8] [&_ul]:text-[#465149] [&_ol]:mt-2.5 [&_ol]:pl-[22px] [&_ol]:text-[13px] [&_ol]:leading-[1.8] [&_ol]:text-[#465149] [&_pre]:mt-2.5 [&_pre]:overflow-x-auto [&_pre]:bg-[#1a1f1c] [&_pre]:p-3 [&_pre]:font-mono [&_pre]:text-[11px] [&_pre]:leading-[1.65] [&_pre]:text-[#dbe4de] [&_input]:mt-2 [&_input]:min-h-9 [&_input]:w-full [&_input]:rounded [&_input]:border [&_input]:border-[#bcc8bf] [&_input]:bg-surface [&_input]:px-2.5 [&_input]:py-2 [&_input]:text-[13px] [&_input]:text-[#354139] [&_textarea]:mt-2 [&_textarea]:min-h-9 [&_textarea]:w-full [&_textarea]:rounded [&_textarea]:border [&_textarea]:border-[#bcc8bf] [&_textarea]:bg-surface [&_textarea]:px-2.5 [&_textarea]:py-2 [&_textarea]:text-[13px] [&_textarea]:text-[#354139] [&_aside]:mt-2.5 [&_aside]:border [&_aside]:border-[#cbd6c9] [&_aside]:bg-[#eef5e7] [&_aside]:p-3 dark:[&_h1]:text-[#edf2ee] dark:[&_h3]:text-[#edf2ee] dark:[&_p]:text-[#bac4bd] dark:[&_strong]:text-[#b5da7e] dark:[&_ul]:text-[#c4cdc6] dark:[&_ol]:text-[#c4cdc6] dark:[&_pre]:bg-[#0e1210] dark:[&_input]:border-[#465149] dark:[&_input]:bg-panel-dark dark:[&_input]:text-[#e0e7e2] dark:[&_textarea]:border-[#465149] dark:[&_textarea]:bg-panel-dark dark:[&_textarea]:text-[#e0e7e2] dark:[&_aside]:border-[#40523b] dark:[&_aside]:bg-[#20291d]";

const styles = {
  root: "overflow-hidden rounded-md border border-[#cbd4cd] bg-white shadow-[0_14px_38px_rgba(34,45,38,.075)] dark:border-line-dark dark:bg-[#181d1a] dark:shadow-none",
  controls: "absolute top-[49px] right-0 z-[2] flex min-h-9 items-center justify-end gap-2 max-mobile:top-[38px]",
  codePane: "flex min-h-80 max-h-[620px] min-w-0 flex-col border-r-0 bg-[#0e1210] text-[#dbe4de]",
  editor:
    "relative h-[380px] min-h-80 max-h-[620px] flex-1 resize-y overflow-hidden bg-[#0e1210] max-mobile:h-80 max-mobile:min-h-[260px] max-mobile:max-h-[420px]",
  highlight: `${editorLayer} z-[1] overflow-hidden bg-[#0e1210] text-[#dbe4de] pointer-events-none`,
  textarea: `${editorLayer} z-[2] resize-none overflow-auto bg-transparent text-transparent caret-[#f5faf7] outline-0 [-webkit-text-fill-color:transparent] selection:bg-[rgba(121,163,82,.34)] read-only:cursor-default`,
  runtime: "border-t border-[#29302b] bg-[#0e1210]",
  results: "grid min-h-[230px] grid-cols-1 bg-[#0e1210]",
  browserHeader:
    "flex min-h-[38px] items-center border-b border-border bg-[#eef2ee] px-5 font-mono text-[10px] font-medium text-[#657168] dark:border-line-dark dark:bg-surface-dark dark:text-[#a6b0a9]",
  mount: `min-h-40 bg-surface p-5 text-[#28322b] transition-colors empty:hidden dark:bg-[#131815] dark:text-[#dbe4de] ${mountContent}`,
  previewMessage: "block px-2.5 py-7 text-center text-xs text-[#818a84] dark:text-[#939e96]",
  console: "min-h-[110px] max-h-[300px] min-w-0 overflow-auto bg-[#0e1210] p-3.5 text-[#dbe4de]",
  consoleHeader: "border-b border-[#29302b] pb-2.5 font-mono text-[10px] text-[#b8c2bb]",
  consoleEmpty: "block py-2.5 text-xs leading-[1.7] text-[#a6b0a9]",
  consoleText: "m-0 min-w-0 font-mono text-[11px] leading-[1.65] break-words whitespace-pre-wrap text-inherit",
  dialog:
    "fixed inset-0 z-[100] m-auto h-[min(88vh,900px)] w-[min(92vw,1180px)] max-w-none overflow-hidden rounded-md border border-[#cbd4cd] bg-white p-0 text-[#354139] shadow-[0_28px_90px_rgba(0,0,0,.25)] backdrop:bg-[rgba(13,17,14,.42)] backdrop:backdrop-blur-[2px] dark:border-[#3b443e] dark:bg-[#181d1a] dark:text-[#dbe4de] dark:shadow-[0_28px_90px_rgba(0,0,0,.42)] dark:backdrop:bg-[rgba(13,17,14,.68)] max-mobile:h-[calc(100dvh-20px)] max-mobile:w-[calc(100vw-20px)]",
  dialogShell: "grid h-full min-h-0 grid-rows-[52px_minmax(0,1fr)_58px]",
  dialogHeader:
    "flex items-center justify-between border-b border-[#d2dad4] bg-[#f3f6f3] px-4 dark:border-[#303832] dark:bg-[#1e2520]",
  dialogTitle: "m-0 min-w-0 truncate font-mono text-xs font-semibold text-[#354139] dark:text-[#dce5df]",
  dialogEditor: "relative min-h-0 overflow-hidden bg-[#0e1210]",
  dialogFooter:
    "flex items-center justify-end gap-2 border-t border-[#d2dad4] bg-[#f3f6f3] px-4 dark:border-[#303832] dark:bg-[#1e2520]",
  dialogIconButton:
    "grid size-9 shrink-0 cursor-pointer place-items-center rounded-[5px] border border-[#cbd4cd] bg-white p-0 text-[#465149] transition-colors hover:border-[#96a299] hover:bg-[#e9eeea] disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#465149] dark:bg-[#252d27] dark:text-[#dce4de] dark:hover:border-[#708078] dark:hover:bg-[#303a33]",
  dialogRunButton:
    "grid size-9 shrink-0 cursor-pointer place-items-center rounded-[5px] border border-[#222923] bg-[#222923] p-0 text-white transition-colors hover:border-[#506b22] hover:bg-[#506b22] disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#a5ce62] dark:bg-[#a5ce62] dark:text-[#172013] dark:hover:border-[#b9df7c] dark:hover:bg-[#b9df7c]",
  dialogTextarea: `${editorLayer} resize-none overflow-auto bg-transparent text-transparent caret-[#f5faf7] outline-0 [-webkit-text-fill-color:transparent] selection:bg-[rgba(121,163,82,.34)] read-only:cursor-default`,
  dialogHighlight: `${editorLayer} overflow-hidden bg-[#0e1210] text-[#dbe4de] pointer-events-none`,
} as const;

const preview = "min-w-0 border-b border-border bg-surface transition-colors dark:border-line-dark dark:bg-[#131815]";
const consoleRow = "border-b border-[#29302b] py-1.5";
const consoleTone = {
  log: "text-[#dbe4de]",
  info: "text-[#c5ddd7]",
  warn: "text-[#e8cc7c]",
  error: "text-[#ff9d8b]",
  result: "text-[#a9d778]",
} as const;

type Props = { doc: Doc; code: string; exampleIndex: number; locale: Locale };

export function Lab(props: Props) {
  let mount: HTMLDivElement | undefined;
  let highlightLayer!: HTMLPreElement;
  let expandedHighlightLayer!: HTMLPreElement;
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
        <div class={styles.editor}>
          <pre ref={highlightLayer} class={`${styles.highlight} ${syntaxClasses}`} aria-hidden="true">
            <code class="font-[inherit] [white-space:inherit]" innerHTML={highlighted()} />
          </pre>
          <textarea
            class={styles.textarea}
            value={source()}
            onInput={(event) => edit(event.currentTarget.value)}
            onScroll={(event) => {
              highlightLayer.scrollTop = event.currentTarget.scrollTop;
              highlightLayer.scrollLeft = event.currentTarget.scrollLeft;
            }}
            onKeyDown={insertTab}
            readonly={demo().server}
            spellcheck={false}
            wrap="off"
            aria-label={props.locale.t("editorLabel")}
          />
        </div>
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
          <div class={styles.dialogEditor}>
            <pre ref={expandedHighlightLayer} class={`${styles.dialogHighlight} ${syntaxClasses}`} aria-hidden="true">
              <code class="font-[inherit] [white-space:inherit]" innerHTML={highlighted()} />
            </pre>
            <textarea
              class={styles.dialogTextarea}
              value={source()}
              onInput={(event) => edit(event.currentTarget.value)}
              onScroll={(event) => {
                expandedHighlightLayer.scrollTop = event.currentTarget.scrollTop;
                expandedHighlightLayer.scrollLeft = event.currentTarget.scrollLeft;
              }}
              onKeyDown={insertTab}
              readonly={demo().server}
              spellcheck={false}
              wrap="off"
              aria-label={props.locale.t("editorLabel")}
            />
          </div>
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
