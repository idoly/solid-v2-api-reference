export const localeCodes = ["en", "zh-CN"] as const;
export type Code = (typeof localeCodes)[number];

export const defaultLocale: Code = "en";

export const localeOptions: Record<Code, { shortLabel: string; nativeName: string }> = {
  en: { shortLabel: "EN", nativeName: "English" },
  "zh-CN": { shortLabel: "中", nativeName: "中文" },
};

export function resolveLocale(value: unknown): Code {
  const requested = String(value ?? "")
    .trim()
    .toLowerCase();
  const exact = localeCodes.find((code) => code.toLowerCase() === requested);
  if (exact) return exact;

  const language = requested.split(/[-_]/, 1)[0];
  return localeCodes.find((code) => code.toLowerCase().split("-", 1)[0] === language) ?? defaultLocale;
}

export function nextLocale(current: Code): Code {
  const index = localeCodes.indexOf(current);
  return localeCodes[(index + 1) % localeCodes.length];
}
