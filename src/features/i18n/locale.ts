import { createSignal } from "solid-js";
import type { Text } from "../../data/catalog-index";
import { readPreference, writePreference } from "../../lib/preferences";
import { defaultLocale, localeCodes, localeOptions, nextLocale, type Code } from "./config";
import { categories, metadata, messages, type Key } from "./messages";

const key = "solid-v2-locale";

function read(): Code {
  return readPreference(key, localeCodes) ?? defaultLocale;
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
    t: (key: Key) => messages[code()]?.[key] ?? messages[defaultLocale][key],
    text: (value: Text) => value[code()] ?? value[defaultLocale],
    category: (category: string) => categories[code()]?.[category] ?? categories[defaultLocale][category] ?? category,
    nextLabel: () => localeOptions[nextLocale(code())].shortLabel,
    toggle: () => select(nextLocale(code())),
    select,
  };
}

export type Locale = ReturnType<typeof createLocale>;
