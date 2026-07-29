import { createMemo, createSignal, onSettled } from "solid-js";
import { docs, docsById, findDoc } from "../../data/catalog";
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

function showDocInUrl(id: string) {
  history.replaceState(null, "", `#${id}`);
}

function showHomeInUrl() {
  history.replaceState(null, "", `${location.pathname}${location.search}`);
}

export function createNavigation(locale: Locale) {
  const fallback = docsById.get("solid-js/createSignal") ?? docs[0];
  if (!fallback) throw new Error("The API catalog is empty");

  const initialId = readHash();
  const initialDoc = docsById.get(initialId);
  if (initialDoc && location.hash !== `#${initialDoc.id}`) showDocInUrl(initialDoc.id);
  else if (!initialDoc && location.hash) showHomeInUrl();

  // `undefined` is the home route; a document ID is the only other route state.
  const [activeId, setActiveId] = createSignal<string | undefined>(initialDoc?.id);
  const [query, setQuery] = createSignal("");
  const [menuOpen, setMenuOpen] = createSignal(false);
  const [expanded, setExpanded] = createSignal(new Set([fallback.category]));
  const isHome = () => activeId() === undefined;
  const activeDoc = createMemo(() => docsById.get(activeId() ?? "") ?? fallback);
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
    closePanels();
    showDocInUrl(doc.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goHome = () => {
    setActiveId(undefined);
    closePanels();
    showHomeInUrl();
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
      const doc = docsById.get(id);
      setActiveId(doc?.id);
      closePanels();
      if (doc) showDocInUrl(doc.id);
      else if (location.hash) showHomeInUrl();
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
