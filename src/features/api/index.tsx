import { For, Show, createEffect, createMemo, createSignal } from "solid-js";
import { docs, docsById } from "../../data/catalog";
import { Code2 } from "../../ui/icons";
import { Lab } from "../demo/lab";
import type { Locale } from "../i18n/locale";
import { Heading, Reference, pageClass } from "./reference";

const styles = {
  examples: "relative scroll-mt-20 py-[54px] max-mobile:py-[43px]",
  tabs: "mb-2 flex gap-1",
  empty:
    "flex min-h-[110px] items-center justify-center gap-3 border border-dashed border-[#ccd2cd] bg-[#fafbfa] text-[#7c847f] dark:border-border-dark dark:bg-panel-dark dark:text-[#aeb7b0]",
  tab: "min-h-[34px] cursor-pointer rounded border-[1.5px] px-3 text-xs transition-[color,background-color,border-color,box-shadow,transform] duration-150 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#719a2e]",
  active:
    "border-[#b9d58a] bg-[#f1f7e7] text-[#354425] hover:border-[#7f9f48] hover:shadow-[0_4px_12px_rgba(70,95,45,.18)] dark:border-[#46563e] dark:bg-[#252d22] dark:text-[#b8dc80] dark:hover:border-[#c8d0cb] dark:hover:bg-[#c8d0cb] dark:hover:text-[#171b18] dark:hover:shadow-[0_6px_18px_rgba(0,0,0,.48)]",
  inactive:
    "border-[#cfd7d1] bg-surface text-[#5d6961] hover:border-[#7f9f48] hover:bg-[#edf4e5] hover:shadow-[0_4px_12px_rgba(70,95,45,.18)] dark:border-border-dark dark:bg-surface-dark dark:text-[#b8c1ba] dark:hover:border-[#c8d0cb] dark:hover:bg-[#c8d0cb] dark:hover:text-[#171b18] dark:hover:shadow-[0_6px_18px_rgba(0,0,0,.48)]",
} as const;

type Props = { id: string; locale: Locale };

const fallback = docs[0];
if (!fallback) throw new Error("The API catalog is empty");

export function Api(props: Props) {
  const [selected, setSelected] = createSignal(0);
  const doc = createMemo(() => docsById.get(props.id) ?? fallback);
  const codes = createMemo(() => doc().codes);

  createEffect(
    () => doc().id,
    () => {
      setSelected(0);
    },
  );

  return (
    <article class={pageClass}>
      <Reference doc={doc()} locale={props.locale} />
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
          <Lab doc={doc()} code={codes()[selected()]} exampleIndex={selected()} locale={props.locale} />
        </Show>
      </section>
    </article>
  );
}
