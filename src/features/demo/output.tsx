import { For, Show, type Accessor } from "solid-js";
import type { Result } from "./model";
import type { Locale } from "../i18n/locale";
import styles from "./output.module.css";

const consoleTone = {
  log: styles.log,
  info: styles.info,
  warn: styles.warn,
  error: styles.error,
  result: styles.result,
} as const;

type Props = {
  result: Accessor<Result | undefined>;
  hasPreview: Accessor<boolean>;
  locale: Locale;
  setMount: (element: HTMLDivElement) => void;
};

export function DemoOutput(props: Props) {
  return (
    <div class={styles.runtime}>
      <div class={styles.results}>
        <div class={`${styles.preview} ${props.hasPreview() ? styles.previewVisible : styles.previewHidden}`}>
          <header class={styles.panelHeader}>{props.locale.t("browser")}</header>
          <div ref={props.setMount} class={styles.mount} data-demo-output="browser" />
          <Show when={!props.result()}>
            <span class={styles.previewMessage}>{props.locale.t("browserPending")}</span>
          </Show>
          <Show when={props.result() && !props.result()?.html}>
            <span class={styles.previewMessage}>{props.locale.t("browserEmpty")}</span>
          </Show>
        </div>
        <div class={styles.console}>
          <header class={styles.panelHeader}>{props.locale.t("console")}</header>
          <div class={styles.consoleBody} data-demo-output="console">
            <Show
              when={props.result()}
              fallback={<span class={styles.consoleEmpty}>{props.locale.t("consolePending")}</span>}
            >
              <Show
                when={props.result()?.logs.length}
                fallback={<span class={styles.consoleEmpty}>{props.locale.t("consoleEmpty")}</span>}
              >
                <For each={props.result()?.logs}>
                  {(entry) => (
                    <div class={`${styles.consoleRow} ${consoleTone[entry.level]}`} data-log-level={entry.level}>
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
