import Button from "@idoly/ant-design-solid/button";
import Collapse from "@idoly/ant-design-solid/collapse";
import Drawer from "@idoly/ant-design-solid/drawer";
import Input from "@idoly/ant-design-solid/input";
import { For, Show } from "solid-js";
import {
  ArrowRight,
  Braces,
  ChevronRight,
  CircleGauge,
  Code2,
  Database,
  Layers3,
  SearchIcon,
  Server,
  Workflow,
  X,
  Zap,
} from "../../ui/icons";
import { iconButton } from "../../ui/classes";
import { groups, packageScope } from "../../data/catalog-index";
import type { Locale } from "../i18n/locale";
import type { Navigation } from "./controller";

const categoryIcons: Record<string, typeof Zap> = {
  reactivity: Zap,
  stores: Database,
  "lifecycle-actions": Workflow,
  "owners-scopes": CircleGauge,
  "async-interop": Workflow,
  "components-control-flow": Braces,
  "rendering-ssr": Server,
  "responses-navigation": ArrowRight,
  "dom-web-runtime": Layers3,
  "internal-compiler": Code2,
  types: Code2,
};

import styles from "./sidebar.module.css";

function CatalogContent(props: { nav: Navigation; locale: Locale }) {
  const nav = props.nav;
  return (
    <>
      <Input
        type="search"
        value={nav.query()}
        onChange={(event) => nav.setQuery(event.currentTarget.value)}
        onClear={() => nav.setQuery("")}
        placeholder={props.locale.t("searchPlaceholder")}
        aria-label={props.locale.t("searchLabel")}
        prefix={<SearchIcon size={16} />}
        allowClear
        classNames={{ root: styles.mobileSearch, input: styles.mobileSearchInput }}
      />
      <Show when={nav.query().trim()}>
        <div class={styles.mobileResults}>
          <Show
            when={nav.results().length}
            fallback={<span class={styles.mobileEmpty}>{props.locale.t("noResults")}</span>}
          >
            <For each={nav.results()}>
              {(doc) => (
                <button type="button" class={styles.mobileResult} onClick={() => nav.openDoc(doc.id)}>
                  <span class={styles.mobileResultName}>{doc.title}</span>
                  <small class={styles.mobilePackage}>{packageScope(doc.packageName)}</small>
                </button>
              )}
            </For>
          </Show>
        </div>
      </Show>
      <nav class={nav.query().trim() ? styles.hiddenMobileNav : undefined}>
        <Collapse
          class={styles.collapseRoot}
          ghost
          bordered={false}
          activeKey={[...nav.expanded()]}
          onChange={(keys) =>
            nav.setExpandedCategories(
              (Array.isArray(keys) ? keys : keys === undefined ? [] : [keys]).map((key) => String(key)),
            )
          }
          expandIconPosition="end"
          expandIcon={({ isActive }) => (
            <span class={`${styles.chevron} ${isActive ? styles.chevronActive : ""}`}>
              <ChevronRight size={14} />
            </span>
          )}
          classNames={{ header: styles.collapseHeader, title: styles.collapseTitle, body: styles.collapseBody }}
          items={groups.map((group) => {
            const Icon = categoryIcons[group.category] ?? Code2;
            return {
              key: group.category,
              label: (
                <span class={styles.categoryLabel}>
                  <span class={styles.categoryIcon}>
                    <Icon size={16} />
                  </span>
                  <span class={styles.categoryName}>{props.locale.category(group.category)}</span>
                </span>
              ),
              extra: <small class={styles.categoryCount}>{group.docs.length}</small>,
              children: (
                <For each={group.docs}>
                  {(doc) => (
                    <button
                      type="button"
                      class={`${styles.link} ${nav.activeId() === doc.id && !nav.isHome() ? styles.activeLink : ""}`}
                      aria-current={nav.activeId() === doc.id && !nav.isHome() ? "page" : undefined}
                      onClick={() => nav.openDoc(doc.id)}
                    >
                      <span class={styles.linkName}>{doc.title}</span>
                      <small class={styles.package}>{packageScope(doc.packageName)}</small>
                      <i class={nav.activeId() === doc.id && !nav.isHome() ? styles.activeDot : styles.inactiveDot} />
                    </button>
                  )}
                </For>
              ),
            };
          })}
        />
      </nav>
    </>
  );
}

export function Sidebar(props: { nav: Navigation; locale: Locale }) {
  return (
    <>
      <aside class={styles.sidebar} aria-label={props.locale.t("publicApis")}>
        <CatalogContent nav={props.nav} locale={props.locale} />
      </aside>
      <Drawer
        rootClass={styles.drawerRoot}
        classNames={{
          section: styles.drawerSection,
          header: styles.drawerHeader,
          title: styles.drawerTitle,
          body: styles.drawerBody,
          mask: styles.drawerMask,
        }}
        open={props.nav.menuOpen()}
        placement="left"
        width="min(86vw, 320px)"
        title={props.locale.t("publicApis")}
        closable={false}
        maskClosable
        keyboard
        zIndex={70}
        extra={
          <Button
            class={iconButton}
            icon={<X size={17} />}
            onClick={() => props.nav.setMenuOpen(false)}
            aria-label={props.locale.t("closeCatalog")}
          />
        }
        onClose={() => props.nav.setMenuOpen(false)}
      >
        <CatalogContent nav={props.nav} locale={props.locale} />
      </Drawer>
    </>
  );
}
