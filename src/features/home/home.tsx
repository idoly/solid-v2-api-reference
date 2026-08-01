import Alert from "@idoly/ant-design-solid/alert";
import Button from "@idoly/ant-design-solid/button";
import { ArrowRight, Check, ExternalLink, Sparkles } from "../../ui/icons";
import { actionButton } from "../../ui/classes";
import { highlightTsx, syntaxClasses } from "../../ui/highlight";
import { docs } from "../../data/catalog-index";
import type { Locale } from "../i18n/locale";
import type { Navigation } from "../navigation/controller";

import styles from "./home.module.css";

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
            <Button
              type="primary"
              size="large"
              class={actionButton.primary}
              icon={<ArrowRight size={16} />}
              iconPlacement="end"
              onClick={() => props.nav.openDoc("createSignal")}
            >
              {props.locale.t("startBrowsing")}
            </Button>
            <a class={actionButton.secondary} href="https://github.com/solidjs/solid" target="_blank" rel="noreferrer">
              {props.locale.t("viewSource")} <ExternalLink size={15} />
            </a>
          </div>
        </div>
        <div class={styles.codePanel} aria-label={props.locale.t("codeExampleLabel")}>
          <div class={styles.codeHeader}>
            <span>Counter.tsx</span>
            <span class={styles.codeMeta}>fine-grained</span>
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
              <dd class={styles.factValue}>2.0.0-beta.29</dd>
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
          <Alert
            class={styles.validation}
            type="success"
            variant="filled"
            showIcon
            icon={<Check size={14} />}
            message={`${docs.length} ${props.locale.t("validationSuffix")}`}
            classNames={{ title: styles.validationTitle }}
          />
        </div>

        <ol class={styles.stages}>
          {stages(props.locale).map((stage) => (
            <li class={styles.stage}>
              <span class={styles.stageIndex}>{stage.index}</span>
              <div>
                <strong class={styles.stageTitle}>{stage.title}</strong>
                <code class={styles.stageMeta}>{stage.meta}</code>
              </div>
              <p class={styles.stageDescription}>{stage.description}</p>
            </li>
          ))}
        </ol>
      </section>
    </article>
  );
}
