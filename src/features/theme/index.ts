import { theme, type ConfigThemeConfig } from "@idoly/ant-design-solid";
import { createSignal } from "solid-js";
import { readPreference, writePreference } from "../../lib/preferences";

const key = "solid-v2-theme";
const themes = ["light", "dark"] as const;
type Name = (typeof themes)[number];

function apply(name: Name) {
  document.documentElement.classList.toggle("dark", name === "dark");
  document.documentElement.style.colorScheme = name;
  document
    .querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    ?.setAttribute("content", name === "dark" ? "#151517" : "#f7f8f5");
}

export function createAntTheme(isDark: boolean): ConfigThemeConfig {
  return {
    algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: {
      colorPrimary: isDark ? "#a5ce62" : "#6f981d",
      colorInfo: "#148f82",
      colorText: isDark ? "#e3e8e4" : "#202522",
      colorTextSecondary: isDark ? "#a8b2ab" : "#717a74",
      colorBgContainer: isDark ? "#1d1d20" : "#fdfefd",
      colorBorder: isDark ? "#46464f" : "#d5ddd6",
      borderRadius: "5px",
      fontFamily: 'system-ui, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif',
    },
  };
}

export function createTheme() {
  const initial =
    readPreference(key, themes) ?? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  const [name, setName] = createSignal<Name>(initial);
  apply(initial);

  const toggle = () => {
    const next = name() === "dark" ? "light" : "dark";
    setName(next);
    writePreference(key, next);
    apply(next);
  };

  return {
    isDark: () => name() === "dark",
    toggle,
  };
}

export type Theme = ReturnType<typeof createTheme>;
