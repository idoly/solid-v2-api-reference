import { createSignal } from "solid-js";
import type { Text } from "../../data/catalog";
import { readPreference, writePreference } from "../../lib/preferences";
import { categories, metadata, messages, type Code, type Key } from "./messages";

const key = "solid-v2-locale";

function read(): Code {
  return readPreference(key, ["zh-CN", "en"] as const) ?? "en";
}

function sync(locale: Code) {
  const { lang, title, description } = metadata[locale];
  document.documentElement.lang = lang;
  document.title = title;
  document.querySelector<HTMLMetaElement>('meta[name="description"]')?.setAttribute("content", description);
}

export function createLocale() {
  const initial = read();
  const [code, setCode] = createSignal<Code>(initial);
  sync(initial);

  const select = (next: Code) => {
    setCode(next);
    sync(next);
    writePreference(key, next);
  };

  return {
    isEnglish: () => code() === "en",
    t: (key: Key) => messages[code()][key],
    text: (value: Text) => value[code()],
    category: (category: string) => categories[code()][category] ?? category,
    toggle: () => select(code() === "zh-CN" ? "en" : "zh-CN"),
    select,
  };
}

export type Locale = ReturnType<typeof createLocale>;
