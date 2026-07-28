import { render } from "@solidjs/web";
import { Show } from "solid-js";
import { Api } from "./features/api";
import { Home } from "./features/home";
import { createLocale } from "./features/i18n/locale";
import { createNavigation } from "./features/navigation/navigation";
import { Sidebar } from "./features/navigation/sidebar";
import { TopBar } from "./features/navigation/topbar";
import { createTheme } from "./features/theme/theme";
import "./tailwind.css";

function App() {
  const locale = createLocale();
  const nav = createNavigation(locale);
  const theme = createTheme();

  return (
    <div class="min-h-screen bg-[#f1f4f0] font-sans text-ink transition-colors dark:bg-[#111512] dark:text-[#e3e8e4]">
      <TopBar nav={nav} theme={theme} locale={locale} />
      <Sidebar nav={nav} locale={locale} />
      <main class="ml-[340px] pt-16 max-shell:ml-[300px] max-mobile:ml-0 max-mobile:pt-[57px]">
        <Show when={!nav.isHome()} fallback={<Home nav={nav} locale={locale} />}>
          <Api doc={nav.activeDoc()} locale={locale} />
        </Show>
      </main>
    </div>
  );
}

const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");
render(() => <App />, root);
