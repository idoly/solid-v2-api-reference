import { createSignal } from "solid-js";
import { readPreference, writePreference } from "../../lib/preferences";

const key = "solid-v2-theme";
const themes = ["light", "dark"] as const;
type Name = (typeof themes)[number];

function apply(name: Name) {
  document.documentElement.classList.toggle("dark", name === "dark");
  document.documentElement.style.colorScheme = name;
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
