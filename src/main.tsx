import "./styles/ant-design.css";
import "./styles/global.css";
import BackTop from "@idoly/ant-design-solid/back-top";
import ConfigProvider from "@idoly/ant-design-solid/config-provider";
import Skeleton from "@idoly/ant-design-solid/skeleton";
import { render } from "@solidjs/web";
import { Loading, Show, lazy } from "solid-js";
import { Home } from "./features/home/home";
import { createLocale } from "./features/i18n/locale";
import { createNavigation } from "./features/navigation/controller";
import { Sidebar } from "./features/navigation/sidebar";
import { TopBar } from "./features/navigation/topbar";
import { createTheme } from "./features/theme";
import { iconButton } from "./ui/classes";
import { ArrowUp, Github } from "./ui/icons";
import styles from "./main.module.css";

const Api = lazy(async () => ({ default: (await import("./features/api/api")).Api }));

function BackToTop(props: { label: string }) {
  return (
    <BackTop
      class={`${iconButton} ${styles.backTop}`}
      classNames={{ root: styles.backTopSlot }}
      visibilityHeight={420}
      tooltip={props.label}
      icon={<ArrowUp size={17} />}
      aria-label={props.label}
    />
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
    <ConfigProvider theme={theme.antTheme()}>
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
