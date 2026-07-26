import { createMemo, createSignal, onSettled } from "solid-js";
import type { Locale } from "../i18n/locale";
import { docs, docsById, findDoc } from "../../data/catalog";

// API IDs keep `@` and `/` readable in the hash while legacy encoded links remain valid.
const readHash = () => {
  try {
    return decodeURIComponent(location.hash.slice(1));
  } catch {
    return location.hash.slice(1);
  }
};

const setHash = (id: string) => history.replaceState(null, "", `#${id}`);

export function createNavigation(locale: Locale) {
  const fallback = docsById.get("solid-js/createSignal") ?? docs[0];
  const initialId = readHash();
  if (docsById.has(initialId) && location.hash !== `#${initialId}`) setHash(initialId);
  const [isHome, setIsHome] = createSignal(!initialId || initialId === "home");
  const [activeId, setActiveId] = createSignal(docsById.has(initialId) ? initialId : fallback.id);
  const [query, setQuery] = createSignal("");
  const [menuOpen, setMenuOpen] = createSignal(false);
  const [expanded, setExpanded] = createSignal(new Set([fallback.category]));
  const activeDoc = createMemo(() => docsById.get(activeId()) ?? fallback);
  const results = createMemo(() => {
    const value = query().trim().toLowerCase();
    if (!value) return [];
    return docs
      .filter((doc) =>
        `${doc.title} ${locale.text(doc.definition)} ${locale.text(doc.useCase)} ${locale.category(doc.category)}`
          .toLowerCase()
          .includes(value),
      )
      .slice(0, 12);
  });

  const closePanels = () => {
    setQuery("");
    setMenuOpen(false);
  };

  const openDoc = (idOrTitle: string) => {
    const doc = findDoc(idOrTitle);
    if (!doc) return;
    setActiveId(doc.id);
    setIsHome(false);
    closePanels();
    setHash(doc.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goHome = () => {
    setIsHome(true);
    closePanels();
    history.replaceState(null, "", `${location.pathname}${location.search}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleCategory = (category: string) =>
    setExpanded((current) => {
      const next = new Set(current);
      if (!next.delete(category)) next.add(category);
      return next;
    });

  onSettled(() => {
    const handleHashChange = () => {
      const id = readHash();
      if (!id || id === "home") {
        setIsHome(true);
      } else if (docsById.has(id)) {
        setHash(id);
        setActiveId(id);
        setIsHome(false);
      }
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  });

  return {
    isHome,
    goHome,
    activeId,
    activeDoc,
    query,
    setQuery,
    results,
    menuOpen,
    setMenuOpen,
    expanded,
    openDoc,
    toggleCategory,
  };
}

export type Navigation = ReturnType<typeof createNavigation>;
