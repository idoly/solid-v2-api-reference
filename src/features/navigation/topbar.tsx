import { Show } from "solid-js";
import { Check, ExternalLink, Github, Languages, Menu, Moon, Sparkles, Sun } from "../../ui/icons";
import { iconButton, mobileIconButton } from "../../ui/classes";
import { docs } from "../../data/catalog";
import type { Locale } from "../i18n/locale";
import type { Theme } from "../theme/theme";
import { Search } from "./search";
import type { Navigation } from "./navigation";

const styles = {
  root: "fixed inset-x-0 top-0 z-50 grid h-16 grid-cols-[254px_minmax(300px,560px)_1fr] items-center gap-6 border-b border-[#d8ded9] bg-[rgba(251,252,250,.97)] px-[22px] shadow-[0_2px_10px_rgba(32,42,35,.035)] backdrop-blur-[14px] transition-colors dark:border-line-dark dark:bg-[rgba(18,22,19,.96)] max-shell:grid-cols-[224px_minmax(250px,1fr)_auto] max-shell:gap-[14px] max-mobile:h-[57px] max-mobile:grid-cols-[34px_1fr_auto] max-mobile:gap-2 max-mobile:px-[11px]",
  brand:
    "flex cursor-pointer items-center gap-[9px] border-0 bg-transparent p-0 font-display text-[17px] font-extrabold max-mobile:text-[15px]",
  mark: "grid size-[30px] place-items-center rounded-md border border-[#9aca37] bg-accent text-[#19210f] max-mobile:size-7",
  subtitle:
    "ml-[3px] border-l border-[#cfd4d0] pl-[11px] font-mono text-xs font-medium text-[#929994] dark:border-[#3b443e] max-mobile:hidden",
  actions: "flex items-center justify-end gap-2",
  coverage:
    "inline-flex min-h-[31px] items-center gap-1.5 rounded border border-[#cee3aa] bg-[#f3f8ea] px-2.5 font-mono text-[11px] text-[#527321] dark:border-[#40532f] dark:bg-[#20291b] dark:text-[#afd37a] max-shell:hidden",
  locale:
    "inline-flex min-h-[31px] cursor-pointer items-center gap-1.5 rounded border border-[#d2d9d3] bg-surface px-2 font-mono text-[10px] font-medium text-[#536058] dark:border-[#39423c] dark:bg-surface-dark dark:text-[#bdc6bf]",
  version:
    "inline-flex min-h-[31px] items-center gap-1.5 rounded border border-[#d2d9d3] bg-surface px-2.5 font-mono text-[11px] dark:border-[#39423c] dark:bg-surface-dark max-mobile:hidden",
} as const;

type Props = { nav: Navigation; theme: Theme; locale: Locale };

export function TopBar(props: Props) {
  return (
    <header class={styles.root}>
      <button
        class={mobileIconButton}
        onClick={() => props.nav.setMenuOpen(true)}
        title={props.locale.t("openCatalog")}
        aria-label={props.locale.t("openCatalog")}
      >
        <Menu size={19} />
      </button>
      <button class={styles.brand} onClick={props.nav.goHome}>
        <span class={styles.mark}>
          <Sparkles size={17} />
        </span>
        <span>
          Solid <b class="text-accent-strong">v2</b>
        </span>
        <span class={styles.subtitle}>{props.locale.t("apiSource")}</span>
      </button>
      <Search nav={props.nav} locale={props.locale} />
      <div class={styles.actions}>
        <span class={styles.coverage}>
          <Check size={13} />
          {docs.length} {props.locale.t("apiCount")}
        </span>
        <a
          class={styles.version}
          href="https://www.npmjs.com/package/solid-js?activeTab=versions"
          target="_blank"
          rel="noreferrer"
        >
          2.0.0-beta.27 <ExternalLink size={12} />
        </a>
        <button
          class={styles.locale}
          onClick={props.locale.toggle}
          title={props.locale.t("switchLanguage")}
          aria-label={props.locale.t("switchLanguage")}
        >
          <Languages size={14} />
          {props.locale.nextLabel()}
        </button>
        <button
          class={iconButton}
          onClick={props.theme.toggle}
          title={props.theme.isDark() ? props.locale.t("lightTheme") : props.locale.t("darkTheme")}
          aria-label={props.theme.isDark() ? props.locale.t("lightTheme") : props.locale.t("darkTheme")}
        >
          <Show when={props.theme.isDark()} fallback={<Moon size={17} />}>
            <Sun size={17} />
          </Show>
        </button>
        <a
          class={iconButton}
          href="https://github.com/solidjs/solid"
          target="_blank"
          rel="noreferrer"
          title="Solid GitHub"
          aria-label="Solid GitHub"
        >
          <Github size={17} />
        </a>
      </div>
    </header>
  );
}
