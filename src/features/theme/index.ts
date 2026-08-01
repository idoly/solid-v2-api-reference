import type { ConfigThemeConfig } from "@idoly/ant-design-solid/config-provider";
import theme from "@idoly/ant-design-solid/theme";
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
    const control = {
      color: dark ? "#dce4de" : "#536058",
      background: dark ? "#1d1d20" : "#fdfefd",
      border: dark ? "#465149" : "#c6d0c8",
      hoverColor: dark ? "#dce8cf" : "#405c20",
      hoverBackground: dark ? "#293127" : "#edf4e5",
      hoverBorder: dark ? "#75934b" : "#789b45",
    };
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
      components: {
        Button: {
          defaultColor: control.color,
          defaultBg: control.background,
          defaultBorderColor: control.border,
          defaultHoverColor: control.hoverColor,
          defaultHoverBg: control.hoverBackground,
          defaultHoverBorderColor: control.hoverBorder,
          defaultActiveColor: control.hoverColor,
          defaultActiveBg: control.hoverBackground,
          defaultActiveBorderColor: control.hoverBorder,
          defaultShadow: "var(--app-control-inset)",
          focusRing: "var(--app-control-focus-shadow)",
          activeTransform: "scale(0.97)",
        },
        FloatButton: {
          defaultColor: control.color,
          defaultBg: control.background,
          defaultBorderColor: control.border,
          defaultHoverColor: control.hoverColor,
          defaultHoverBg: control.hoverBackground,
          defaultHoverBorderColor: control.hoverBorder,
          boxShadow: "var(--app-control-inset)",
          focusRing: "var(--app-control-focus-shadow)",
          activeTransform: "scale(0.97)",
        },
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
