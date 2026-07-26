export function readPreference<const T extends string>(key: string, values: readonly T[]): T | undefined {
  try {
    const value = localStorage.getItem(key);
    return values.includes(value as T) ? (value as T) : undefined;
  } catch {
    return undefined;
  }
}

export function writePreference(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage is optional; controllers still apply the preference for the current page.
  }
}
