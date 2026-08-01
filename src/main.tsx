import { ConfigProvider, Skeleton, Tooltip } from "@idoly/ant-design-solid";
import "@idoly/ant-design-solid/styles.css";
import { render } from "@solidjs/web";
import { Loading, Show, lazy } from "solid-js";
import { Home } from "./features/home/home";
import { createLocale } from "./features/i18n/locale";
import { createNavigation } from "./features/navigation/controller";
import { Sidebar } from "./features/navigation/sidebar";
import { TopBar } from "./features/navigation/topbar";
import { createAntTheme, createTheme } from "./features/theme";
import { iconButton } from "./ui/classes";
import { ArrowUp, Github } from "./ui/icons";
import styles from "./main.module.css";
import "./styles/global.css";

const Api = lazy(async () => ({ default: (await import("./features/api/api")).Api }));

function BackToTop(props: { label: string }) {
  const setupVisibility = (element: HTMLDivElement) => {
    const update = () => {
      element.hidden = window.scrollY <= 420;
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
  };

  return (
    <div ref={setupVisibility} class={styles.backTopSlot} hidden>
      <Tooltip title={props.label} placement="left">
        <button
          type="button"
          class={`${iconButton} ${styles.backTop}`}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label={props.label}
        >
          <ArrowUp size={17} />
        </button>
      </Tooltip>
    </div>
  );
}

function Footer() {
  return (
    <footer class={styles.footer}>
      <span>&copy; {new Date().getFullYear()} idoly. All rights reserved.</span>
      <a
        class={styles.footerLink}
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
    <ConfigProvider theme={createAntTheme(theme.isDark())}>
      <div class={styles.shell}>
        <TopBar nav={nav} theme={theme} locale={locale} />
        <Sidebar nav={nav} locale={locale} />
        <main class={styles.content}>
          <Loading
            fallback={
              <div class={styles.loading}>
                <Skeleton
                  active
                  title={{ width: "42%" }}
                  paragraph={{ rows: 7, width: ["100%", "92%", "96%", "84%", "100%", "88%", "64%"] }}
                />
              </div>
            }
          >
            <Show when={!nav.isHome()} fallback={<Home nav={nav} locale={locale} />}>
              <Api id={nav.activeId() ?? ""} locale={locale} />
            </Show>
          </Loading>
          <Footer />
        </main>
        <BackToTop label={locale.t("backToTop")} />
      </div>
    </ConfigProvider>
  );
}

const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");
render(() => <App />, root);
