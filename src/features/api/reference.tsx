import { For, Show, createMemo } from "solid-js";
import { Code2, ExternalLink } from "../../ui/icons";
import { highlightTs, syntaxClasses } from "../../ui/highlight";
import { actionButton, statusBadge } from "../../ui/classes";
import { type Doc } from "../../data/catalog";
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
    <div class="mb-7 flex items-start gap-4">
      <span class="mt-1 font-mono text-[11px] font-medium text-accent-strong">{props.index}</span>
      <h2 class="m-0 font-display text-[25px] font-bold text-ink dark:text-[#e5ebe6]">{props.title}</h2>
    </div>
  );
}

const styles = {
  page: "mx-auto max-w-[1160px] px-[52px] pb-20 max-shell:px-[34px] max-mobile:px-[19px] max-mobile:pb-[60px]",
  hero: "border-b border-[#d8ded9] py-[49px] pt-[58px] dark:border-line-dark max-mobile:py-[38px] max-mobile:pt-[42px]",
  heroLine: "flex flex-wrap items-center gap-3.5 max-mobile:gap-2.5",
  title:
    "min-w-0 flex-[1_1_360px] [overflow-wrap:anywhere] font-display text-[clamp(36px,5vw,59px)] leading-[1.08] font-bold text-ink dark:text-[#edf2ee] max-mobile:basis-[calc(100%_-_60px)] max-mobile:text-[37px]",
  packageName: "font-mono text-xs text-[#67716a] dark:text-[#a7b2aa]",
  section: "border-b border-[#d8ded9] py-[54px] dark:border-line-dark max-mobile:py-[43px]",
  spec: "grid gap-4",
  description:
    "grid gap-5 rounded-md border border-border border-l-2 border-l-[#93bd43] bg-white px-6 py-[22px] shadow-[0_6px_18px_rgba(38,52,42,.035)] dark:border-[#3b493f] dark:border-l-[#88ad48] dark:bg-panel-dark max-mobile:p-[18px]",
  definitionLabel: "mb-2 block font-mono text-[10px] font-medium text-[#6f981d] uppercase dark:text-[#b5da7e]",
  definitionText: "m-0 max-w-[880px] text-[15px] leading-[1.9] text-[#3f4b43] dark:text-[#d2dad4]",
  useCase: "border-t border-[#e1e6e1] pt-4 dark:border-[#303a33]",
  useCaseLabel: "mb-2 block font-mono text-[10px] font-medium text-[#63706a] uppercase dark:text-[#91a097]",
  useCaseText: "m-0 max-w-[880px] text-sm leading-[1.85] text-[#5b665f] dark:text-[#adb9b1]",
  group: "grid gap-2.5",
  groupHeader: "flex min-h-[34px] items-center justify-between gap-4 px-0.5",
  groupTitle: "m-0 text-sm font-semibold text-[#3f4942] dark:text-[#b5da7e]",
  groupMeta: "font-mono text-[11px] text-[#6f7972] dark:text-[#98a39b]",
  card: "overflow-hidden rounded-md border border-border bg-white shadow-[0_8px_22px_rgba(35,46,39,.055)] dark:border-border-dark dark:bg-panel-dark dark:shadow-none",
  signatureHeader: "flex min-h-[58px] flex-col items-start justify-center gap-1.5 bg-[#17201c] px-4 py-3.5",
  signatureCode: "block max-w-full font-mono text-xs leading-[1.7] break-words whitespace-pre-wrap text-[#dbe5df]",
  table: "border-t border-border dark:border-border-dark",
  tableHeader:
    "grid grid-cols-[minmax(100px,.55fr)_minmax(0,1fr)_minmax(0,1.25fr)] bg-surface-muted font-mono text-[10px] text-[#657168] dark:bg-[#202721] dark:text-[#b6c1b9] [&>*]:min-w-0 [&>*]:border-r [&>*]:border-[#e4e7e5] dark:[&>*]:border-border-dark [&>*]:px-[15px] [&>*]:py-3 [&>*:last-child]:border-r-0 max-tablet:hidden",
  noParameters:
    "border-t border-[#e4e7e5] px-[15px] py-3.5 text-xs text-[#7d857f] dark:border-border-dark dark:text-[#aebbb2]",
  parameterRow:
    "grid grid-cols-[minmax(100px,.55fr)_minmax(0,1fr)_minmax(0,1.25fr)] items-start border-t border-[#e4e7e5] dark:border-border-dark [&>*]:min-w-0 [&>*]:border-r [&>*]:border-[#e4e7e5] dark:[&>*]:border-border-dark [&>*]:px-[15px] [&>*]:py-3 [&>*:last-child]:border-r-0 max-tablet:grid-cols-1 max-tablet:[&>*]:border-r-0 max-tablet:[&>*]:border-b max-tablet:[&>*]:border-[#e4e7e5] dark:max-tablet:[&>*]:border-border-dark max-tablet:[&>*:last-child]:border-b-0",
  parameterField: "max-tablet:grid max-tablet:grid-cols-[62px_minmax(0,1fr)] max-tablet:items-start",
  parameterIdentity: "flex items-center gap-[7px] max-tablet:grid max-tablet:grid-cols-[62px_minmax(0,1fr)]",
  mobileLabel: "hidden font-mono text-[9px] text-[#7b857e] max-tablet:block dark:text-[#98a39b]",
  parameterValue: "break-words font-mono text-xs leading-[1.65] text-[#315e55] dark:text-[#9ed6ca]",
  parameterDescription: "m-0 text-[13px] leading-[1.7] text-[#59635c] dark:text-[#c2ccc4]",
  typeHeader: "flex min-h-[66px] items-start justify-between gap-4 bg-[#fafcf9] px-4 py-[13px] dark:bg-[#1a201c]",
  typeBody: "min-w-0",
  typeName: "block break-words font-mono text-[13px] font-bold text-[#345e56] dark:text-[#9ed6ca]",
  typeDescription: "mt-1.5 mb-0 text-[13px] leading-[1.65] text-[#5e6861] dark:text-[#c2ccc4]",
  sourceLink: "inline-flex shrink-0 items-center gap-[5px] text-[11px] text-[#55716a] dark:text-[#8eb7ae]",
  typeCode:
    "m-0 max-h-80 overflow-auto overflow-x-hidden border-t border-[#29332e] bg-[#17201c] p-4 text-[#dbe5df] dark:border-[#3b463e] dark:bg-[#0e1210]",
} as const;

const inlineDoc =
  "[&_p_code]:rounded-[3px] [&_p_code]:border [&_p_code]:border-[#d5e2d2] [&_p_code]:bg-[#f0f6f3] [&_p_code]:px-1 [&_p_code]:py-px [&_p_code]:font-mono [&_p_code]:text-[.9em] [&_p_code]:text-[#315e55] [&_p_strong]:font-bold [&_p_strong]:text-[#303a33] [&_p_em]:text-[#46544b] dark:[&_p_code]:border-[#3c5148] dark:[&_p_code]:bg-[#1d2c27] dark:[&_p_code]:text-[#9bc9bf] dark:[&_p_strong]:text-[#e0e7e2] dark:[&_p_em]:text-[#bac4bd]";
export const pageClass = styles.page;

export function Reference(props: { doc: Doc; locale: Locale }) {
  return (
    <>
      <header class={styles.hero}>
        <div class={styles.heroLine}>
          <span class={statusBadge.api}>API</span>
          <h1 class={styles.title}>{props.doc.title}</h1>
          <span class={styles.packageName}>{props.doc.packageName}</span>
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
          <div class={`${inlineDoc} ${styles.description}`}>
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
                          <div class={`${inlineDoc} ${styles.parameterRow}`}>
                            <div class={styles.parameterIdentity}>
                              <span class={styles.mobileLabel}>{props.locale.t("parameter")}</span>
                              <div class="flex min-w-0 items-center gap-[7px]">
                                <code class={styles.parameterValue}>{parameter.name}</code>
                                <small class={statusBadge.parameter}>
                                  {parameter.optional ? props.locale.t("optional") : props.locale.t("required")}
                                </small>
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
                <h3 class={`${styles.groupTitle} text-[15px]`}>{props.locale.t("type")}</h3>
                <span class={styles.groupMeta}>
                  {props.doc.relatedTypes.length} {props.locale.t("relatedDefinitions")}
                </span>
              </div>
              <For each={props.doc.relatedTypes}>
                {(relatedType) => (
                  <div class={styles.card}>
                    <div class={styles.typeHeader}>
                      <div class={`${inlineDoc} ${styles.typeBody}`}>
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
