import { For, Show, createMemo } from "solid-js";
import { Code2, ExternalLink } from "../../ui/icons";
import { highlightTs, syntaxClasses } from "../../ui/highlight";
import { actionButton, statusBadge } from "../../ui/classes";
import { docsById, type Doc } from "../../data/catalog";
import type { Locale } from "../i18n/locale";

function InlineDoc(props: { text: string }) {
  const parts = createMemo(() => props.text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean));
  return (
    <For each={parts()}>
      {(part) => {
        if (part.startsWith("`") && part.endsWith("`")) return <code>{part.slice(1, -1)}</code>;
        if (part.startsWith("**") && part.endsWith("**")) return <strong>{part.slice(2, -2)}</strong>;
        if (part.startsWith("*") && part.endsWith("*")) return <em>{part.slice(1, -1)}</em>;
        return part;
      }}
    </For>
  );
}

export function Heading(props: { index: string; title: string }) {
  return (
    <div class={styles.heading}>
      <span class={styles.headingIndex}>{props.index}</span>
      <h2 class={styles.headingTitle}>{props.title}</h2>
    </div>
  );
}

import styles from "./reference.module.css";

export const pageClass = styles.page;

export function Reference(props: { doc: Doc; locale: Locale }) {
  return (
    <>
      <header class={styles.hero}>
        <div class={styles.heroLine}>
          <span class={statusBadge.api}>API</span>
          <h1 class={styles.title}>{props.doc.title}</h1>
          <span class={styles.packageName}>{props.doc.packageName}</span>
          <Show when={props.doc.reExportOf} keyed>
            {(canonicalId) => (
              <span class={styles.reExport}>
                {props.locale.t("reExportedFrom")} <a href={`#${canonicalId}`}>{canonicalId}</a>
              </span>
            )}
          </Show>
          <Show when={props.doc.internal}>
            <span class={statusBadge.internal}>{props.locale.t("internal")}</span>
          </Show>
          <Show when={props.doc.deprecated}>
            <span class={statusBadge.deprecated}>{props.locale.t("deprecated")}</span>
          </Show>
          <a class={actionButton.source} href={props.doc.sourceUrl} target="_blank" rel="noreferrer">
            {props.locale.t("viewSource")}
            <Code2 size={14} />
          </a>
        </div>
      </header>

      <section class={styles.section}>
        <Heading index="01" title={props.locale.t("introduction")} />
        <div class={styles.spec}>
          <div class={`${styles.inlineDoc} ${styles.description}`}>
            <div>
              <span class={styles.definitionLabel}>{props.locale.t("definition")}</span>
              <p class={styles.definitionText}>
                <InlineDoc text={props.locale.text(props.doc.definition)} />
              </p>
            </div>
            <div class={styles.useCase}>
              <span class={styles.useCaseLabel}>{props.locale.t("useCase")}</span>
              <p class={styles.useCaseText}>
                <InlineDoc text={props.locale.text(props.doc.useCase)} />
              </p>
            </div>
          </div>

          <Show when={props.doc.relatedApis.length}>
            <div class={styles.relatedApis}>
              <h3 class={styles.relatedApisTitle}>{props.locale.t("relatedApis")}</h3>
              <ul class={styles.relatedApisList}>
                <For each={props.doc.relatedApis}>
                  {(relatedApi) => {
                    const target = () => docsById.get(relatedApi.id);
                    return (
                      <li class={styles.relatedApi}>
                        <a class={styles.relatedApiLink} href={`#${relatedApi.id}`}>
                          {target()?.title ?? relatedApi.id}
                          <span>{target()?.packageName}</span>
                        </a>
                        <p class={`${styles.inlineDoc} ${styles.relatedApiReason}`}>
                          <InlineDoc text={props.locale.text(relatedApi.reason)} />
                        </p>
                      </li>
                    );
                  }}
                </For>
              </ul>
            </div>
          </Show>

          <div class={styles.group}>
            <div class={styles.groupHeader}>
              <h3 class={styles.groupTitle}>{props.locale.t("call")}</h3>
              <Show when={props.doc.overloads.length > 1}>
                <span class={styles.groupMeta}>
                  {props.doc.overloads.length} {props.locale.t("overloads")}
                </span>
              </Show>
            </div>
            <For each={props.doc.overloads}>
              {(overload) => (
                <div class={styles.card}>
                  <div class={styles.signatureHeader}>
                    <code
                      class={`${styles.signatureCode} ${syntaxClasses}`}
                      innerHTML={highlightTs(`${props.doc.title}${overload.signature}`)}
                    />
                  </div>
                  <div class={styles.table}>
                    <div class={styles.tableHeader}>
                      <span>{props.locale.t("parameter")}</span>
                      <span>{props.locale.t("type")}</span>
                      <span>{props.locale.t("description")}</span>
                    </div>
                    <Show
                      when={overload.parameters.length}
                      fallback={<div class={styles.noParameters}>{props.locale.t("noParameters")}</div>}
                    >
                      <For each={overload.parameters}>
                        {(parameter) => (
                          <div class={`${styles.inlineDoc} ${styles.parameterRow}`}>
                            <div class={styles.parameterIdentity}>
                              <span class={styles.mobileLabel}>{props.locale.t("parameter")}</span>
                              <div class={styles.parameterNameWrap}>
                                <code class={styles.parameterValue}>{parameter.name}</code>
                                <span class={statusBadge.parameter}>
                                  {parameter.optional ? props.locale.t("optional") : props.locale.t("required")}
                                </span>
                              </div>
                            </div>
                            <div class={styles.parameterField}>
                              <span class={styles.mobileLabel}>{props.locale.t("type")}</span>
                              <code class={styles.parameterValue}>{parameter.type}</code>
                            </div>
                            <div class={styles.parameterField}>
                              <span class={styles.mobileLabel}>{props.locale.t("description")}</span>
                              <p class={styles.parameterDescription}>
                                <InlineDoc text={props.locale.text(parameter.description)} />
                              </p>
                            </div>
                          </div>
                        )}
                      </For>
                    </Show>
                  </div>
                </div>
              )}
            </For>
          </div>

          <Show when={props.doc.relatedTypes.length}>
            <div class={styles.group}>
              <div class={styles.groupHeader}>
                <h3 class={styles.groupTypeTitle}>{props.locale.t("type")}</h3>
                <span class={styles.groupMeta}>
                  {props.doc.relatedTypes.length} {props.locale.t("relatedDefinitions")}
                </span>
              </div>
              <For each={props.doc.relatedTypes}>
                {(relatedType) => (
                  <div class={styles.card}>
                    <div class={styles.typeHeader}>
                      <div class={`${styles.inlineDoc} ${styles.typeBody}`}>
                        <code class={styles.typeName}>{relatedType.name}</code>
                        <p class={styles.typeDescription}>
                          <InlineDoc text={props.locale.text(relatedType.description)} />
                        </p>
                      </div>
                      <a class={styles.sourceLink} href={relatedType.sourceUrl} target="_blank" rel="noreferrer">
                        {props.locale.t("source")}
                        <ExternalLink size={12} />
                      </a>
                    </div>
                    <pre class={styles.typeCode}>
                      <code
                        class={`${styles.signatureCode} ${syntaxClasses}`}
                        innerHTML={highlightTs(relatedType.declaration)}
                      />
                    </pre>
                  </div>
                )}
              </For>
            </div>
          </Show>
        </div>
      </section>
    </>
  );
}
