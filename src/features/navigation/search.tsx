import { For, Show, createSignal } from "solid-js";
import { docs, docsByTitle } from "../../data/catalog-index";
import { ChevronRight, SearchIcon, X } from "../../ui/icons";
import type { Locale } from "../i18n/locale";
import type { Navigation } from "./navigation";

const styles = {
  root: "relative flex h-9 items-center gap-2 rounded-[5px] border border-[#ccd4ce] bg-surface px-2.5 text-[#8c948f] focus-within:border-[#8caf4e] focus-within:shadow-[0_0_0_3px_rgba(184,239,74,.16)] dark:border-[#39423c] dark:bg-surface-dark dark:text-[#8f9a92] max-mobile:hidden",
  input: "w-full min-w-0 border-0 bg-transparent text-sm text-ink outline-0 dark:text-[#e2e8e3]",
  clear:
    "grid size-7 shrink-0 cursor-pointer place-items-center rounded border-0 bg-transparent p-0 transition-colors hover:bg-[#e3ebe1] hover:text-[#405c20] dark:hover:bg-[#303532] dark:hover:text-[#edf2ee]",
  results:
    "absolute top-[42px] right-0 left-0 max-h-[410px] overflow-auto rounded-md border border-[#d7ded8] bg-surface p-1.5 shadow-[0_18px_42px_rgba(25,34,28,.14)] dark:border-[#39423c] dark:bg-surface-dark",
  quickHeader: "flex items-center justify-between px-2.5 py-2",
  quickTitle: "text-xs font-semibold text-[#4d5750] dark:text-[#cbd4cd]",
  quickMeta: "font-mono text-[9px] text-[#929994]",
  quickGrid: "grid grid-cols-2 gap-1 max-tablet:grid-cols-1",
  quickItem:
    "flex min-w-0 cursor-pointer items-center justify-between gap-2 rounded px-2.5 py-2 text-left transition-colors duration-150 hover:bg-[#e3ebe1] dark:hover:bg-[#303532] dark:hover:text-[#edf2ee]",
  quickName:
    "min-w-0 flex-1 overflow-hidden font-mono text-xs text-ellipsis whitespace-nowrap text-[#315e55] dark:text-[#91c7bb]",
  package: "shrink-0 font-mono text-[9px] text-[#929994]",
  empty: "block p-3.5 text-[13px] text-muted dark:text-[#9ca79f]",
  result:
    "grid w-full cursor-pointer grid-cols-[minmax(0,1fr)_auto] items-center rounded p-[9px] text-left transition-colors duration-150 hover:bg-[#e3ebe1] dark:hover:bg-[#303532] dark:hover:text-[#edf2ee]",
  resultContent: "flex min-w-0 items-center justify-between gap-[9px]",
  resultName: "min-w-0 flex-1 overflow-hidden text-[13px] text-ellipsis whitespace-nowrap",
  resultPackage: "shrink-0 text-xs text-[#929994]",
} as const;

const quickApis = ["createSignal", "createMemo", "createEffect", "createStore", "Show", "render"]
  .map((name) => docsByTitle.get(name))
  .filter((doc) => doc !== undefined);

type Props = { nav: Navigation; locale: Locale };

export function Search(props: Props) {
  const [open, setOpen] = createSignal(false);
  const select = (id: string) => {
    setOpen(false);
    props.nav.openDoc(id);
  };

  return (
    <div
      class={styles.root}
      onFocusIn={() => setOpen(true)}
      onFocusOut={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <SearchIcon size={16} />
      <input
        class={styles.input}
        value={props.nav.query()}
        onInput={(event) => props.nav.setQuery(event.currentTarget.value)}
        onKeyDown={(event) => event.key === "Escape" && event.currentTarget.blur()}
        placeholder={props.locale.t("searchPlaceholder")}
        aria-label={`${props.locale.t("searchLabel")} (${docs.length})`}
      />
      <Show when={props.nav.query()}>
        <button class={styles.clear} onClick={() => props.nav.setQuery("")} aria-label={props.locale.t("clearSearch")}>
          <X size={14} />
        </button>
      </Show>
      <Show when={open()}>
        <div class={styles.results}>
          <Show when={props.nav.query().trim()} fallback={<QuickLinks locale={props.locale} select={select} />}>
            <Show
              when={props.nav.results().length}
              fallback={<span class={styles.empty}>{props.locale.t("noResults")}</span>}
            >
              <For each={props.nav.results()}>
                {(doc) => (
                  <button class={styles.result} onClick={() => select(doc.id)}>
                    <span class={styles.resultContent}>
                      <code class={styles.resultName}>{doc.title}</code>
                      <small class={styles.resultPackage}>{doc.packageName}</small>
                    </span>
                    <ChevronRight size={14} />
                  </button>
                )}
              </For>
            </Show>
          </Show>
        </div>
      </Show>
    </div>
  );
}

function QuickLinks(props: { locale: Locale; select: (id: string) => void }) {
  return (
    <div>
      <div class={styles.quickHeader}>
        <strong class={styles.quickTitle}>{props.locale.t("commonApis")}</strong>
        <small class={styles.quickMeta}>
          {quickApis.length} {props.locale.t("shortcuts")}
        </small>
      </div>
      <div class={styles.quickGrid}>
        <For each={quickApis}>
          {(doc) => (
            <button class={styles.quickItem} onClick={() => props.select(doc.id)}>
              <code class={styles.quickName}>{doc.title}</code>
              <small class={styles.package}>{doc.packageName === "solid-js" ? "core" : "web"}</small>
            </button>
          )}
        </For>
      </div>
    </div>
  );
}
