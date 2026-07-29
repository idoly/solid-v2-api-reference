import { ArrowRight, Check, ExternalLink, Sparkles } from "../../ui/icons";
import { actionButton } from "../../ui/classes";
import { highlightTsx, syntaxClasses } from "../../ui/highlight";
import { docs } from "../../data/catalog";
import type { Locale } from "../i18n/locale";
import type { Navigation } from "../navigation/navigation";

const styles = {
  page: "mx-auto max-w-[1320px] px-9 pt-[38px] pb-20 max-shell:px-6 max-mobile:px-[19px] max-mobile:pt-[22px] max-mobile:pb-[55px]",
  hero: "grid min-h-[410px] grid-cols-[minmax(0,1.04fr)_minmax(390px,.96fr)] items-center gap-[62px] border-b border-[#d3dbd4] pt-7 pb-12 dark:border-line-dark max-shell:grid-cols-[minmax(0,1fr)_minmax(300px,.86fr)] max-shell:gap-8 max-tablet:grid-cols-1 max-tablet:gap-9 max-mobile:min-h-0 max-mobile:grid-cols-1 max-mobile:gap-9 max-mobile:pt-6 max-mobile:pb-11",
  heroCopy: "min-w-0",
  eyebrow:
    "inline-flex items-center gap-2 border-l-2 border-[#8db53f] pl-2.5 font-mono text-[11px] font-medium text-[#52721d] dark:border-[#9cc75a] dark:text-[#b7da83] [&>svg]:text-[#779e2d]",
  title:
    "mt-[18px] font-display text-[56px] leading-[1.06] font-bold [overflow-wrap:anywhere] text-ink dark:text-[#edf2ee] max-shell:text-[49px] max-mobile:mt-4 max-mobile:text-[38px]",
  lead: "mt-5 max-w-[570px] text-[15px] leading-[1.85] text-[#536058] dark:text-[#b2bcb5] max-mobile:mt-4 max-mobile:text-sm",
  actions: "mt-7 flex flex-wrap gap-2.5 max-mobile:mt-5",
  codePanel:
    "min-w-0 overflow-hidden rounded-md border border-[#303732] border-t-2 border-t-[#9fca50] bg-code text-[#dbe5df] shadow-[12px_12px_0_#dce5cc] dark:border-[#39423c] dark:border-t-[#9fca50] dark:shadow-[12px_12px_0_#253026] max-mobile:shadow-[7px_7px_0_#dce5cc] dark:max-mobile:shadow-[7px_7px_0_#253026]",
  codeHeader:
    "flex h-11 items-center justify-between border-b border-[#303632] bg-[#1b201d] px-4 font-mono text-[10px] text-[#9ba69f]",
  codeBody:
    "min-h-[218px] overflow-auto px-[22px] py-[22px] font-mono text-xs leading-[1.8] whitespace-pre max-mobile:min-h-[210px] max-mobile:px-[17px] max-mobile:py-5 max-mobile:text-[11px]",
  codeFooter:
    "flex min-h-11 items-center gap-2 border-t border-[#303632] bg-[#1b201d] px-4 py-2 text-[11px] text-[#acd477] [&>span]:min-w-0 [&>span]:[overflow-wrap:anywhere]",
  about:
    "grid grid-cols-[minmax(280px,.82fr)_minmax(0,1.18fr)] gap-[52px] py-[52px] max-shell:gap-9 max-tablet:grid-cols-1 max-tablet:gap-9 max-tablet:py-11",
  aboutCopy: "max-w-[390px] max-tablet:max-w-[680px]",
  sectionLabel: "font-mono text-[10px] text-[#73806f] uppercase dark:text-[#93a18f]",
  aboutTitle: "mt-2 font-display text-[26px] leading-[1.32] font-bold text-ink dark:text-[#e5ebe6]",
  aboutText: "mt-4 text-sm leading-[1.85] text-[#566159] dark:text-[#b6c0b8]",
  facts: "mt-6 grid grid-cols-2 gap-x-6 gap-y-4 text-xs",
  fact: "",
  factWide: "col-span-2",
  factLabel: "text-[#818b84] dark:text-[#8f9a92]",
  factValue: "mt-1.5 font-mono text-[11px] [overflow-wrap:anywhere] text-[#3f625a] dark:text-[#91c7bb]",
  validation:
    "mt-6 flex items-start gap-2.5 border-l-2 border-[#8db53f] bg-[#edf3e7] px-3 py-2.5 text-xs leading-[1.65] text-[#4f632f] dark:border-[#91bb4d] dark:bg-[#1d241a] dark:text-[#b7d58b]",
  validationIcon: "mt-0.5 shrink-0",
  stages: "grid gap-3",
  stage:
    "grid min-h-[108px] grid-cols-[42px_minmax(138px,.58fr)_minmax(0,1fr)] items-center gap-4 rounded-[5px] bg-[#e9eeea] px-[18px] py-4 dark:bg-[#181e1a] max-mobile:min-h-0 max-mobile:grid-cols-[34px_minmax(0,1fr)] max-mobile:gap-x-3 max-mobile:gap-y-2 max-mobile:px-4 max-mobile:py-4",
  stageIndex:
    "grid size-8 place-items-center rounded border border-[#b9cf94] bg-[#f7faf3] font-mono text-[10px] font-medium text-[#5f851e] dark:border-[#4a6335] dark:bg-[#20261d] dark:text-[#b5da7e]",
  stageTitle: "block text-sm font-semibold text-[#344039] dark:text-[#dbe3dd]",
  stageMeta: "mt-2 block font-mono text-[10px] [overflow-wrap:anywhere] text-[#527169] dark:text-[#90bdb3]",
  stageDescription: "m-0 text-[13px] leading-[1.8] text-[#68726b] dark:text-[#a8b2ab] max-mobile:col-start-2",
} as const;

const heroCode = `import { createMemo, createSignal } from "solid-js";

function Counter() {
  const [count, setCount] = createSignal(0);
  const doubled = createMemo(() => count() * 2);
  return <button
    onClick={() => setCount(value => value + 1)}
  >{count()} × 2 = {doubled()}</button>;
}`;

const stages = (locale: Locale) => [
  {
    index: "01",
    title: locale.t("stageScanTitle"),
    meta: "solid-js · @solidjs/web",
    description: locale.t("stageScanDescription"),
  },
  {
    index: "02",
    title: locale.t("stageCatalogTitle"),
    meta: "catalog generator",
    description: locale.t("stageCatalogDescription"),
  },
  {
    index: "03",
    title: locale.t("stageVerifyTitle"),
    meta: "development strict",
    description: locale.t("stageVerifyDescription"),
  },
];

export function Home(props: { nav: Navigation; locale: Locale }) {
  return (
    <article class={styles.page}>
      <section class={styles.hero}>
        <div class={styles.heroCopy}>
          <span class={styles.eyebrow}>
            <Sparkles size={14} /> {props.locale.t("homeEyebrow")}
          </span>
          <h1 class={styles.title}>{props.locale.t("homeTitle")}</h1>
          <p class={styles.lead}>{props.locale.t("homeLead")}</p>
          <div class={styles.actions}>
            <button class={actionButton.primary} onClick={() => props.nav.openDoc("createSignal")}>
              {props.locale.t("startBrowsing")} <ArrowRight size={16} />
            </button>
            <a class={actionButton.secondary} href="https://github.com/solidjs/solid" target="_blank" rel="noreferrer">
              {props.locale.t("viewSource")} <ExternalLink size={15} />
            </a>
          </div>
        </div>
        <div class={styles.codePanel} aria-label={props.locale.t("codeExampleLabel")}>
          <div class={styles.codeHeader}>
            <span>Counter.tsx</span>
            <span class="text-[#a9d778]">fine-grained</span>
          </div>
          <pre class={styles.codeBody}>
            <code class={syntaxClasses} innerHTML={highlightTsx(heroCode)} />
          </pre>
          <div class={styles.codeFooter}>
            <Check size={14} />
            <span>{props.locale.t("codeFooter")}</span>
          </div>
        </div>
      </section>

      <section class={styles.about}>
        <div class={styles.aboutCopy}>
          <span class={styles.sectionLabel}>{props.locale.t("project")}</span>
          <h2 class={styles.aboutTitle}>{props.locale.t("aboutTitle")}</h2>
          <p class={styles.aboutText}>{props.locale.t("aboutText")}</p>
          <dl class={styles.facts}>
            <div class={styles.fact}>
              <dt class={styles.factLabel}>{props.locale.t("baseline")}</dt>
              <dd class={styles.factValue}>2.0.0-beta.27</dd>
            </div>
            <div class={styles.fact}>
              <dt class={styles.factLabel}>{props.locale.t("coverage")}</dt>
              <dd class={styles.factValue}>
                {docs.length} / {docs.length}
              </dd>
            </div>
            <div class={styles.factWide}>
              <dt class={styles.factLabel}>{props.locale.t("contentScope")}</dt>
              <dd class={styles.factValue}>{props.locale.t("contentScopeValue")}</dd>
            </div>
          </dl>
          <div class={styles.validation}>
            <span class={styles.validationIcon}>
              <Check size={14} />
            </span>
            <span>
              {docs.length} {props.locale.t("validationSuffix")}
            </span>
          </div>
        </div>

        <div class={styles.stages}>
          {stages(props.locale).map((stage) => (
            <div class={styles.stage}>
              <span class={styles.stageIndex}>{stage.index}</span>
              <div>
                <strong class={styles.stageTitle}>{stage.title}</strong>
                <code class={styles.stageMeta}>{stage.meta}</code>
              </div>
              <p class={styles.stageDescription}>{stage.description}</p>
            </div>
          ))}
        </div>
      </section>
    </article>
  );
}
