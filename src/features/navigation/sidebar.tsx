import { For, Show } from "solid-js";
import {
  ArrowRight,
  Braces,
  ChevronRight,
  CircleGauge,
  Code2,
  Database,
  Layers3,
  SearchIcon,
  Server,
  Workflow,
  X,
  Zap,
} from "../../ui/icons";
import { iconButton } from "../../ui/classes";
import { groups } from "../../data/catalog";
import type { Locale } from "../i18n/locale";
import type { Navigation } from "./navigation";

const categoryIcons: Record<string, typeof Zap> = {
  reactivity: Zap,
  stores: Database,
  "lifecycle-actions": Workflow,
  "owners-scopes": CircleGauge,
  "async-interop": Workflow,
  "components-control-flow": Braces,
  "rendering-ssr": Server,
  "responses-navigation": ArrowRight,
  "dom-web-runtime": Layers3,
  "internal-compiler": Code2,
  types: Code2,
};

const categoryButton =
  "grid min-h-[42px] w-full cursor-pointer grid-cols-[25px_1fr_24px_16px] items-center rounded bg-transparent px-2 py-1 text-left text-[13px] font-semibold text-[#4f5852] transition-colors duration-150 hover:bg-[#e3ebe1] hover:text-[#303732] dark:text-[#c4cdc6] dark:hover:bg-[#303532] dark:hover:text-[#edf2ee] max-mobile:min-h-11";
const sidebarPanel =
  "fixed top-16 bottom-0 left-0 z-40 w-[340px] overflow-y-auto border-r border-[#d8ded9] bg-[#f7f9f6] px-[15px] pt-4 pb-[30px] transition-colors dark:border-line-dark dark:bg-panel-dark max-shell:w-[300px] max-mobile:top-0 max-mobile:z-[70] max-mobile:w-[min(86vw,320px)] max-mobile:pt-3 max-mobile:shadow-[20px_0_50px_rgba(0,0,0,.35)] max-mobile:transition-transform";
const sidebarLink =
  "grid min-h-[34px] w-full cursor-pointer grid-cols-[minmax(0,1fr)_auto_7px] items-center gap-2 rounded-[3px] px-[7px] py-[7px] pl-[9px] text-left font-mono text-xs leading-[1.45] transition-colors duration-150 hover:bg-[#e3ebe1] hover:text-[#303732] dark:hover:bg-[#303532] dark:hover:text-[#edf2ee] max-mobile:min-h-11";
const activeLink = "bg-[#e9f4d5] font-medium text-[#3f5c1b] dark:bg-[#252d22] dark:text-[#b8dc80]";
const inactiveLink = "bg-transparent text-[#68716b] dark:text-[#a8b2ab]";
const categoryChevron = "text-[#aab0ac] transition-transform";
const mobileSearch =
  "mt-2 hidden h-11 items-center gap-2 rounded-[5px] border border-[#cbd4cd] bg-white px-3 text-[#7c8780] focus-within:border-[#8caf4e] focus-within:shadow-[0_0_0_3px_rgba(184,239,74,.16)] dark:border-[#39423c] dark:bg-surface-dark dark:text-[#96a198] max-mobile:flex";
const mobileSearchInput =
  "min-w-0 flex-1 border-0 bg-transparent text-sm text-ink outline-0 dark:text-[#e2e8e3] [&::-webkit-search-cancel-button]:hidden";
const mobileResults = "hidden py-3 max-mobile:block";
const mobileResult =
  "grid min-h-11 w-full cursor-pointer grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-[4px] px-2.5 py-2 text-left text-[#465149] transition-colors duration-150 hover:bg-[#e3ebe1] hover:text-[#303732] dark:text-[#c4cdc6] dark:hover:bg-[#303532] dark:hover:text-[#edf2ee]";

export function Sidebar(props: { nav: Navigation; locale: Locale }) {
  const nav = props.nav;
  return (
    <>
      <aside
        class={`${sidebarPanel} ${nav.menuOpen() ? "max-mobile:translate-x-0" : "max-mobile:-translate-x-[102%]"}`}
      >
        <div class="hidden h-11 items-center justify-between px-[7px] pl-2.5 text-sm max-mobile:flex">
          <strong>{props.locale.t("publicApis")}</strong>
          <button class={iconButton} onClick={() => nav.setMenuOpen(false)} aria-label={props.locale.t("closeCatalog")}>
            <X size={17} />
          </button>
        </div>
        <div class={mobileSearch}>
          <SearchIcon size={16} />
          <input
            class={mobileSearchInput}
            type="search"
            value={nav.query()}
            onInput={(event) => nav.setQuery(event.currentTarget.value)}
            placeholder={props.locale.t("searchPlaceholder")}
            aria-label={props.locale.t("searchLabel")}
          />
          <Show when={nav.query()}>
            <button
              class="grid size-8 shrink-0 cursor-pointer place-items-center border-0 bg-transparent p-0"
              onClick={() => nav.setQuery("")}
              aria-label={props.locale.t("clearSearch")}
            >
              <X size={14} />
            </button>
          </Show>
        </div>
        <Show when={nav.query().trim()}>
          <div class={mobileResults}>
            <Show
              when={nav.results().length}
              fallback={
                <span class="block px-2.5 py-4 text-sm text-muted dark:text-[#9ca79f]">
                  {props.locale.t("noResults")}
                </span>
              }
            >
              <For each={nav.results()}>
                {(doc) => (
                  <button class={mobileResult} onClick={() => nav.openDoc(doc.id)}>
                    <span class="min-w-0 break-words font-mono text-xs">{doc.title}</span>
                    <small class="font-mono text-[9px] text-[#929994]">
                      {doc.packageName === "solid-js" ? "core" : "web"}
                    </small>
                  </button>
                )}
              </For>
            </Show>
          </div>
        </Show>
        <nav class={`mt-2 ${nav.query().trim() ? "max-mobile:hidden" : ""}`}>
          <For each={groups}>
            {(group) => {
              const Icon = categoryIcons[group.category] ?? Code2;
              return (
                <div class="my-0.5">
                  <button class={categoryButton} onClick={() => nav.toggleCategory(group.category)}>
                    <Icon size={16} />
                    <span>{props.locale.category(group.category)}</span>
                    <small class="text-center font-mono text-[11px] text-[#858d87]">{group.docs.length}</small>
                    <span class={`${categoryChevron} ${nav.expanded().has(group.category) ? "rotate-90" : "rotate-0"}`}>
                      <ChevronRight size={14} />
                    </span>
                  </button>
                  <Show when={nav.expanded().has(group.category)}>
                    <div class="relative mt-px mb-[7px] ml-[18px] border-l border-[#dce1dd] pl-[14px] dark:border-[#343c36]">
                      <For each={group.docs}>
                        {(doc) => (
                          <button
                            class={`${sidebarLink} ${
                              nav.activeId() === doc.id && !nav.isHome() ? activeLink : inactiveLink
                            }`}
                            onClick={() => nav.openDoc(doc.id)}
                          >
                            <span class="min-w-0 [overflow-wrap:anywhere]">{doc.title}</span>
                            <small class="font-mono text-[9px] text-[#9aa19c]">
                              {doc.packageName === "solid-js" ? "core" : "web"}
                            </small>
                            <i
                              class={
                                nav.activeId() === doc.id && !nav.isHome()
                                  ? "size-[5px] rounded-full bg-[#7ca625]"
                                  : "size-[5px] rounded-full bg-transparent"
                              }
                            />
                          </button>
                        )}
                      </For>
                    </div>
                  </Show>
                </div>
              );
            }}
          </For>
        </nav>
      </aside>
      <Show when={nav.menuOpen()}>
        <button
          class="fixed inset-0 z-[60] border-0 bg-[rgba(20,25,22,.37)] mobile:hidden"
          onClick={() => nav.setMenuOpen(false)}
          aria-label={props.locale.t("closeOverlay")}
        />
      </Show>
    </>
  );
}
