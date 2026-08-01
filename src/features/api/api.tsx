import "./ant-design.css";
import Empty from "@idoly/ant-design-solid/empty";
import Segmented from "@idoly/ant-design-solid/segmented";
import { Show, createEffect, createMemo, createSignal } from "solid-js";
import { docs, docsById } from "../../data/catalog";
import { Code2 } from "../../ui/icons";
import { Lab } from "../demo/lab";
import type { Locale } from "../i18n/locale";
import { Heading, Reference, pageClass } from "./reference";

import styles from "./api.module.css";

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
            <Empty
              class={styles.empty}
              image={<Code2 size={24} />}
              description={props.locale.t("noDemo")}
              classNames={{ image: styles.emptyImage, description: styles.emptyDescription }}
            />
          }
        >
          <Show when={codes().length > 1}>
            <Segmented
              class={styles.tabs}
              classNames={{ item: styles.tabItem }}
              value={selected()}
              options={codes().map((_, index) => ({
                value: index,
                label: `${props.locale.t("example")} ${index + 1}`,
              }))}
              onChange={(value) => setSelected(Number(value))}
            />
          </Show>
          <Lab doc={doc()} code={codes()[selected()]} exampleIndex={selected()} locale={props.locale} />
        </Show>
      </section>
    </article>
  );
}
