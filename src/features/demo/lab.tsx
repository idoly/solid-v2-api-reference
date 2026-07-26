import { For, Show } from "solid-js";
import { Check, Copy, Play, RotateCcw } from "../../ui/icons";
import { actionButton, iconButton } from "../../ui/classes";
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
  codePane: "flex min-h-80 max-h-[620px] min-w-0 flex-col border-r-0 bg-[#1a1f1c] text-[#dbe4de]",
  editor:
    "relative h-[380px] min-h-80 max-h-[620px] flex-1 resize-y overflow-hidden bg-[#1a1f1c] max-mobile:h-80 max-mobile:min-h-[260px] max-mobile:max-h-[420px]",
  highlight: `${editorLayer} z-[1] overflow-hidden bg-[#1a1f1c] text-[#dbe4de] pointer-events-none`,
  textarea: `${editorLayer} z-[2] resize-none overflow-auto bg-transparent text-transparent caret-[#f5faf7] outline-0 [-webkit-text-fill-color:transparent] selection:bg-[rgba(121,163,82,.34)] read-only:cursor-default`,
  runtime: "border-t border-border bg-[#f3f6f3] dark:border-line-dark dark:bg-panel-dark",
  results: "grid min-h-[230px] grid-cols-1",
  browserHeader:
    "flex min-h-[38px] items-center border-b border-border bg-[#eef2ee] px-5 font-mono text-[10px] font-medium text-[#657168] dark:border-line-dark dark:bg-surface-dark dark:text-[#a6b0a9]",
  mount: `min-h-40 bg-surface p-5 text-[#28322b] transition-colors empty:hidden dark:bg-[#131815] dark:text-[#dbe4de] ${mountContent}`,
  previewMessage: "block px-2.5 py-7 text-center text-xs text-[#818a84] dark:text-[#939e96]",
  console: "min-h-[110px] max-h-[300px] min-w-0 overflow-auto bg-panel-dark p-3.5 text-[#d8e2dc]",
  consoleHeader: "border-b border-[#29302b] pb-2.5 font-mono text-[10px] text-[#8e9b93]",
  consoleEmpty: "block py-2.5 text-xs leading-[1.7] text-[#86928a]",
  consoleText: "m-0 min-w-0 font-mono text-[11px] leading-[1.65] break-words whitespace-pre-wrap text-inherit",
} as const;

const preview = "min-w-0 border-b border-border bg-surface transition-colors dark:border-line-dark dark:bg-[#131815]";
const consoleRow = "border-b border-[#29302b] py-1.5";
const consoleTone = {
  log: "text-[#d8e2dc]",
  info: "text-[#d8e2dc]",
  warn: "text-[#e8cc7c]",
  error: "text-[#ff9d8b]",
  result: "text-[#a9d778]",
} as const;

type Props = { doc: Doc; code: string; exampleIndex: number; locale: Locale };

export function Lab(props: Props) {
  let mount: HTMLDivElement | undefined;
  let highlightLayer!: HTMLPreElement;
  const { running, result, copied, source, edit, demo, highlighted, hasPreview, run, reset, copy, insertTab } =
    createController(props, () => mount);

  return (
    <div class={styles.root}>
      <div class={styles.controls}>
        <button
          class={actionButton.compact}
          onClick={() => {
            void run();
          }}
          disabled={running()}
        >
          <Play size={15} />
          {running() ? props.locale.t("running") : props.locale.t("runCode")}
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
    </div>
  );
}
