import { createMemo, createSignal, onSettled } from "solid-js";
import { docs, docsById, findDoc } from "../../data/catalog-index";
import type { Locale } from "../i18n/locale";

// API IDs keep `@` and `/` readable in the hash while legacy encoded links remain valid.
function readHash() {
  const hash = location.hash.slice(1);
  try {
    return decodeURIComponent(hash);
  } catch {
    return hash;
  }
}

function routeUrl(id?: string) {
  return id ? `#${id}` : `${location.pathname}${location.search}`;
}

function writeRoute(id: string | undefined, mode: "push" | "replace") {
  const method = mode === "push" ? history.pushState : history.replaceState;
  method.call(history, null, "", routeUrl(id));
}

export function createNavigation(locale: Locale) {
  const fallback = docsById.get("solid-js/createSignal") ?? docs[0];
  if (!fallback) throw new Error("The API catalog is empty");

  const initialId = readHash();
  const initialDoc = docsById.get(initialId);
  if (initialDoc && location.hash !== `#${initialDoc.id}`) writeRoute(initialDoc.id, "replace");
  else if (!initialDoc && location.hash) writeRoute(undefined, "replace");

  // `undefined` is the home route; a document ID is the only other route state.
  const [activeId, setActiveId] = createSignal<string | undefined>(initialDoc?.id);
  const [query, setQuery] = createSignal("");
  const [menuOpen, setMenuOpen] = createSignal(false);
  const [expanded, setExpanded] = createSignal(new Set([initialDoc?.category ?? fallback.category]));
  const isHome = () => activeId() === undefined;
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
  const revealCategory = (category: string) =>
    setExpanded((current) => (current.has(category) ? current : new Set([...current, category])));

  const openDoc = (idOrTitle: string) => {
    const doc = findDoc(idOrTitle);
    if (!doc) return;
    setActiveId(doc.id);
    revealCategory(doc.category);
    closePanels();
    writeRoute(doc.id, "push");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goHome = () => {
    setActiveId(undefined);
    closePanels();
    writeRoute(undefined, "push");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleCategory = (category: string) =>
    setExpanded((current) => {
      const next = new Set(current);
      if (!next.delete(category)) next.add(category);
      return next;
    });

  onSettled(() => {
    const syncFromUrl = () => {
      const doc = docsById.get(readHash());
      setActiveId(doc?.id);
      if (doc) revealCategory(doc.category);
      closePanels();
      if (doc && location.hash !== `#${doc.id}`) writeRoute(doc.id, "replace");
      else if (!doc && location.hash) writeRoute(undefined, "replace");
    };
    window.addEventListener("hashchange", syncFromUrl);
    window.addEventListener("popstate", syncFromUrl);
    return () => {
      window.removeEventListener("hashchange", syncFromUrl);
      window.removeEventListener("popstate", syncFromUrl);
    };
  });

  return {
    isHome,
    goHome,
    activeId,
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
