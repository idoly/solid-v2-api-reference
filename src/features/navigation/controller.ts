import { createMemo, createSignal, onSettled } from "solid-js";
import { docs, docsById, findDoc } from "../../data/catalog-index";
import type { Locale } from "../i18n/locale";
import { createHashRoute } from "./route";

export function createNavigation(locale: Locale) {
  const route = createHashRoute();
  const fallback = docsById.get("solid-js/createSignal") ?? docs[0];
  if (!fallback) throw new Error("The API catalog is empty");

  const initialDoc = docsById.get(route.read());
  if (initialDoc && !route.matches(initialDoc.id)) route.replace(initialDoc.id);
  else if (!initialDoc && !route.matches()) route.replace();

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
    route.push(doc.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goHome = () => {
    setActiveId(undefined);
    closePanels();
    route.push();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const setExpandedCategories = (categories: readonly string[]) => setExpanded(new Set(categories));

  onSettled(() =>
    route.subscribe(() => {
      const doc = docsById.get(route.read());
      setActiveId(doc?.id);
      if (doc) revealCategory(doc.category);
      closePanels();
      if (doc && !route.matches(doc.id)) route.replace(doc.id);
      else if (!doc && !route.matches()) route.replace();
    }),
  );

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
    setExpandedCategories,
  };
}

export type Navigation = ReturnType<typeof createNavigation>;
