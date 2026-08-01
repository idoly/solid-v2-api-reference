import { Input } from "@idoly/ant-design-solid";
import { For, Show, createSignal } from "solid-js";
import { docs, docsByTitle, packageScope } from "../../data/catalog-index";
import { ChevronRight, SearchIcon } from "../../ui/icons";
import type { Locale } from "../i18n/locale";
import type { Navigation } from "./controller";

import styles from "./search.module.css";

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
      <Input
        value={props.nav.query()}
        onChange={(event) => props.nav.setQuery(event.currentTarget.value)}
        onKeyDown={(event) => event.key === "Escape" && event.currentTarget.blur()}
        onClear={() => props.nav.setQuery("")}
        placeholder={props.locale.t("searchPlaceholder")}
        aria-label={`${props.locale.t("searchLabel")} (${docs.length})`}
        prefix={<SearchIcon size={16} />}
        allowClear
        classNames={{ root: styles.control, input: styles.input }}
      />
      <Show when={open()}>
        <div class={styles.results}>
          <Show when={props.nav.query().trim()} fallback={<QuickLinks locale={props.locale} select={select} />}>
            <Show
              when={props.nav.results().length}
              fallback={<span class={styles.empty}>{props.locale.t("noResults")}</span>}
            >
              <For each={props.nav.results()}>
                {(doc) => (
                  <button type="button" class={styles.result} onClick={() => select(doc.id)}>
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
            <button type="button" class={styles.quickItem} onClick={() => props.select(doc.id)}>
              <code class={styles.quickName}>{doc.title}</code>
              <small class={styles.package}>{packageScope(doc.packageName)}</small>
            </button>
          )}
        </For>
      </div>
    </div>
  );
}
