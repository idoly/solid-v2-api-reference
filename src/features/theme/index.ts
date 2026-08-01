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

export function createTheme() {
  const initial =
    readPreference(key, themes) ?? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  const [name, setName] = createSignal<Name>(initial);
  apply(initial);

  const isDark = () => name() === "dark";
  const antTheme = (): ConfigThemeConfig => {
    const dark = isDark();
    return {
      algorithm: dark ? theme.darkAlgorithm : theme.defaultAlgorithm,
      token: {
        colorPrimary: dark ? "#a5ce62" : "#6f981d",
        colorInfo: "#148f82",
        colorText: dark ? "#e3e8e4" : "#202522",
        colorTextSecondary: dark ? "#a8b2ab" : "#717a74",
        colorBgContainer: dark ? "#1d1d20" : "#fdfefd",
        colorBorder: dark ? "#46464f" : "#d5ddd6",
        borderRadius: "5px",
        fontFamily: 'system-ui, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif',
      },
    };
  };

  const toggle = () => {
    const next = isDark() ? "light" : "dark";
    setName(next);
    writePreference(key, next);
    apply(next);
  };

  return {
    antTheme,
    isDark,
    toggle,
  };
}

export type Theme = ReturnType<typeof createTheme>;
