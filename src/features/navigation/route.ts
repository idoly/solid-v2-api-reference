// Keeps URL mechanics independent from navigation and catalog state.
export function createHashRoute() {
  const read = () => {
    const hash = location.hash.slice(1);
    try {
      return decodeURIComponent(hash);
    } catch {
      return hash;
    }
  };

  const url = (id?: string) => (id ? `#${id}` : `${location.pathname}${location.search}`);
  const matches = (id?: string) => (id ? location.hash === `#${id}` : !location.hash);
  const write = (id: string | undefined, mode: "push" | "replace") => {
    if (mode === "push") history.pushState(null, "", url(id));
    else history.replaceState(null, "", url(id));
  };

  const subscribe = (listener: () => void) => {
    window.addEventListener("hashchange", listener);
    window.addEventListener("popstate", listener);
    return () => {
      window.removeEventListener("hashchange", listener);
      window.removeEventListener("popstate", listener);
    };
  };

  return {
    read,
    matches,
    push: (id?: string) => {
      if (!matches(id)) write(id, "push");
    },
    replace: (id?: string) => write(id, "replace"),
    subscribe,
  };
}
