import { For, Show, createEffect, createMemo, createSignal } from "solid-js";
import type { Doc } from "../../data/catalog";
import { Code2 } from "../../ui/icons";
import { Lab } from "../demo/lab";
import type { Locale } from "../i18n/locale";
import { Heading, Reference, pageClass } from "./reference";

const styles = {
  examples: "relative scroll-mt-20 py-[54px] max-mobile:py-[43px]",
  tabs: "mb-2 flex gap-1",
  empty:
    "flex min-h-[110px] items-center justify-center gap-3 border border-dashed border-[#ccd2cd] bg-[#fafbfa] text-[#7c847f] dark:border-[#3b443e] dark:bg-[#171c19] dark:text-[#9fa9a2]",
  tab: "min-h-[34px] cursor-pointer rounded border px-3 text-xs transition-colors",
  active: "border-[#b9d58a] bg-[#f1f7e7] text-[#354425] dark:border-[#526b3c] dark:bg-[#26331f] dark:text-[#b8dc80]",
  inactive: "border-[#cfd7d1] bg-surface text-[#5d6961] dark:border-[#39423c] dark:bg-surface-dark dark:text-[#aeb8b1]",
} as const;

type Props = { doc: Doc; locale: Locale };

export function Api(props: Props) {
  const [selected, setSelected] = createSignal(0);
  const codes = createMemo(() => props.doc.codes);

  createEffect(
    () => props.doc.id,
    () => {
      setSelected(0);
    },
  );

  return (
    <article class={pageClass}>
      <Reference doc={props.doc} locale={props.locale} />
      <section class={styles.examples}>
        <Heading index="02" title={props.locale.t("usage")} />
        <Show
          when={codes().length}
          fallback={
            <div class={styles.empty}>
              <Code2 size={22} />
              <p class="m-0 text-[13px]">{props.locale.t("noDemo")}</p>
            </div>
          }
        >
          <Show when={codes().length > 1}>
            <div class={styles.tabs}>
              <For each={codes()}>
                {(_, index) => (
                  <button
                    class={`${styles.tab} ${selected() === index() ? styles.active : styles.inactive}`}
                    onClick={() => setSelected(index())}
                  >
                    {props.locale.t("example")} {index() + 1}
                  </button>
                )}
              </For>
            </div>
          </Show>
          <Lab doc={props.doc} code={codes()[selected()]} exampleIndex={selected()} locale={props.locale} />
        </Show>
      </section>
    </article>
  );
}
