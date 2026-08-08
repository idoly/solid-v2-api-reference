import Button from "@idoly/ant-design-solid/button";
import Tooltip from "@idoly/ant-design-solid/tooltip";
import { Show } from "solid-js";
import { ExternalLink, Github, Languages, Menu, Moon, Sparkles, Sun } from "../../ui/icons";
import { iconButton, mobileIconButton } from "../../ui/classes";
import { docs } from "../../data/catalog-index";
import type { Locale } from "../i18n/locale";
import type { Theme } from "../theme";
import { Search } from "./search";
import type { Navigation } from "./controller";

import styles from "./topbar.module.css";

type Props = { nav: Navigation; theme: Theme; locale: Locale };

export function TopBar(props: Props) {
  return (
    <header class={styles.root}>
      <Button
        class={mobileIconButton}
        icon={<Menu size={19} />}
        onClick={() => props.nav.setMenuOpen(true)}
        title={props.locale.t("openCatalog")}
        aria-label={props.locale.t("openCatalog")}
      />
      <button type="button" class={styles.brand} onClick={props.nav.goHome}>
        <span class={styles.mark}>
          <Sparkles size={17} />
        </span>
        <span class={styles.brandName}>
          Solid <b class={styles.brandVersion}>v2</b>
        </span>
        <span class={styles.subtitle}>{props.locale.t("apiSource")}</span>
      </button>
      <Search nav={props.nav} locale={props.locale} />
      <div class={styles.actions}>
        <span class={styles.coverage}>
          {docs.length} {props.locale.t("apiCount")}
        </span>
        <a
          class={styles.version}
          href="https://www.npmjs.com/package/solid-js?activeTab=versions"
          target="_blank"
          rel="noreferrer"
        >
          <span>2.0.0-beta.32</span>
          <ExternalLink size={12} />
        </a>
        <Button
          class={styles.locale}
          size="small"
          icon={<Languages size={14} />}
          onClick={props.locale.toggle}
          title={props.locale.t("switchLanguage")}
          aria-label={props.locale.t("switchLanguage")}
        >
          <span class={styles.mobileLabel}>{props.locale.nextLabel()}</span>
        </Button>
        <Tooltip
          title={props.theme.isDark() ? props.locale.t("lightTheme") : props.locale.t("darkTheme")}
          placement="bottom"
          triggerRender={(triggerProps) => (
            <Button
              {...triggerProps}
              class={`${triggerProps.class ?? ""} ${iconButton}`}
              icon={
                <Show when={props.theme.isDark()} fallback={<Moon size={17} />}>
                  <Sun size={17} />
                </Show>
              }
              onClick={props.theme.toggle}
              aria-label={props.theme.isDark() ? props.locale.t("lightTheme") : props.locale.t("darkTheme")}
            />
          )}
        />
        <Tooltip
          title="Solid GitHub"
          placement="bottom"
          triggerRender={(triggerProps) => (
            <a
              {...triggerProps}
              class={`${triggerProps.class ?? ""} ${iconButton}`}
              href="https://github.com/solidjs/solid"
              target="_blank"
              rel="noreferrer"
              aria-label="Solid GitHub"
            >
              <Github size={17} />
            </a>
          )}
        />
      </div>
    </header>
  );
}
