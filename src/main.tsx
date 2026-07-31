import { render } from "@solidjs/web";
import { Show, lazy } from "solid-js";
import { Home } from "./features/home";
import { createLocale } from "./features/i18n/locale";
import { createNavigation } from "./features/navigation/navigation";
import { Sidebar } from "./features/navigation/sidebar";
import { TopBar } from "./features/navigation/topbar";
import { createTheme } from "./features/theme/theme";
import { Github } from "./ui/icons";
import "./tailwind.css";

const Api = lazy(async () => ({ default: (await import("./features/api")).Api }));

function Footer() {
  return (
    <footer class="mx-auto flex max-w-[1320px] items-center justify-between gap-4 border-t border-[#d8ded9] px-9 py-7 text-xs text-[#717a74] dark:border-line-dark dark:text-[#a8b2ab] max-shell:px-6 max-mobile:flex-col max-mobile:items-center max-mobile:px-[19px] max-mobile:py-6 max-mobile:text-center">
      <span>&copy; {new Date().getFullYear()} idoly. All rights reserved.</span>
      <a
        class="inline-flex min-w-0 items-center gap-1.5 [overflow-wrap:anywhere] text-[#42675f] transition-colors hover:text-[#274b43] dark:text-[#9bc9bf] dark:hover:text-[#b9ded5]"
        href="https://github.com/idoly"
        target="_blank"
        rel="noreferrer"
        aria-label="idoly on GitHub"
      >
        <Github size={14} />
        github.com/idoly
      </a>
    </footer>
  );
}

function App() {
  const locale = createLocale();
  const nav = createNavigation(locale);
  const theme = createTheme();

  return (
    <div class="min-h-screen bg-[#f1f4f0] font-sans text-ink transition-colors dark:bg-canvas-dark dark:text-[#e3e8e4]">
      <TopBar nav={nav} theme={theme} locale={locale} />
      <Sidebar nav={nav} locale={locale} />
      <main class="ml-[340px] min-h-[calc(100vh-64px)] bg-transparent pt-16 transition-colors dark:bg-code max-shell:ml-[300px] max-mobile:ml-0 max-mobile:min-h-[calc(100vh-57px)] max-mobile:pt-[57px]">
        <Show when={!nav.isHome()} fallback={<Home nav={nav} locale={locale} />}>
          <Api id={nav.activeId() ?? ""} locale={locale} />
        </Show>
        <Footer />
      </main>
    </div>
  );
}

const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");
render(() => <App />, root);
