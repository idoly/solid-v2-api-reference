import { For, Show } from "solid-js";
import {
  ArrowRight,
  Braces,
  ChevronRight,
  CircleGauge,
  Code2,
  Database,
  Layers3,
  Server,
  Workflow,
  X,
  Zap,
} from "../../ui/icons";
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
  "grid min-h-[42px] w-full cursor-pointer grid-cols-[25px_1fr_24px_16px] items-center rounded bg-transparent px-2 py-1 text-left text-[13px] font-semibold text-[#4f5852] hover:bg-[#e8ede8] dark:text-[#bdc6bf] dark:hover:bg-[#252d27]";
const sidebarPanel =
  "fixed top-16 bottom-0 left-0 z-40 w-[340px] overflow-y-auto border-r border-[#d8ded9] bg-[#f7f9f6] px-[15px] pt-4 pb-[30px] transition-colors dark:border-line-dark dark:bg-panel-dark max-shell:w-[300px] max-mobile:top-0 max-mobile:z-[70] max-mobile:w-[min(86vw,320px)] max-mobile:pt-3 max-mobile:shadow-[20px_0_50px_rgba(0,0,0,.35)] max-mobile:transition-transform";
const sidebarLink =
  "grid min-h-[34px] w-full cursor-pointer grid-cols-[minmax(0,1fr)_auto_7px] items-center gap-2 rounded-[3px] px-[7px] py-[7px] pl-[9px] text-left font-mono text-xs leading-[1.45] hover:bg-[#eaf0e7] hover:text-[#303732] dark:hover:bg-[#252d27] dark:hover:text-[#e3e9e4]";
const activeLink = "bg-[#e9f4d5] font-medium text-[#3f5c1b] dark:bg-[#293620] dark:text-[#b8dc80]";
const inactiveLink = "bg-transparent text-[#68716b] dark:text-[#a8b2ab]";
const categoryChevron = "text-[#aab0ac] transition-transform";

export function Sidebar(props: { nav: Navigation; locale: Locale }) {
  const nav = props.nav;
  return (
    <>
      <aside
        class={`${sidebarPanel} ${nav.menuOpen() ? "max-mobile:translate-x-0" : "max-mobile:-translate-x-[102%]"}`}
      >
        <div class="hidden h-11 items-center justify-between px-[7px] pl-2.5 text-sm max-mobile:flex">
          <strong>{props.locale.t("publicApis")}</strong>
          <button
            class="grid size-[34px] place-items-center rounded-[5px] border border-[#d4d9d5] bg-white p-0 dark:border-[#39423c] dark:bg-surface-dark"
            onClick={() => nav.setMenuOpen(false)}
            aria-label={props.locale.t("closeCatalog")}
          >
            <X size={17} />
          </button>
        </div>
        <nav class="mt-2">
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
