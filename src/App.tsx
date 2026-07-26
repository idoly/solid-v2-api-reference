import {
  For,
  Show,
  createEffect,
  createMemo,
  createSignal,
  onSettled,
} from "solid-js";
import {
  ArrowRight,
  Braces,
  Check,
  ChevronRight,
  CircleGauge,
  Code2,
  Database,
  ExternalLink,
  Github,
  Layers3,
  Menu,
  Play,
  RotateCcw,
  Search,
  Server,
  Sparkles,
  Workflow,
  X,
  Zap,
} from "./icons";
import Prism from "prismjs";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import { compileBrowserDemo, executeBrowserDemo, executeServerDemo, requiresServerDemo, type DemoExecution } from "./code-runner";
import { categoryOrder, docs, docsByCategory, type ApiEntry as DocEntry } from "./generated-api-catalog";
import "./styles.css";

const categoryIcons: Record<string, typeof Zap> = {
  "响应式": Zap,
  "Store": Database,
  "生命周期与 Action": Workflow,
  "Owner 与作用域": CircleGauge,
  "异步与互操作": Workflow,
  "组件与控制流": Braces,
  "渲染与 SSR": Server,
  "响应与导航": ArrowRight,
  "DOM 与 Web 运行时": Layers3,
  "内部与编译器接口": Code2,
  "类型": Code2,
};

function InlineDoc(props: { text: string }) {
  const parts = createMemo(() => props.text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean));
  return <For each={parts()}>{(part) => {
    if (part.startsWith("`") && part.endsWith("`")) return <code>{part.slice(1, -1)}</code>;
    if (part.startsWith("**") && part.endsWith("**")) return <strong>{part.slice(2, -2)}</strong>;
    if (part.startsWith("*") && part.endsWith("*")) return <em>{part.slice(1, -1)}</em>;
    return part;
  }}</For>;
}

function DemoLab(props: { doc: DocEntry; code: string; exampleIndex: number }) {
  const [running, setRunning] = createSignal(false);
  const [execution, setExecution] = createSignal<DemoExecution>();
  const [editableCode, setEditableCode] = createSignal(props.code);
  const highlightedCode = createMemo(() => Prism.highlight(`${editableCode()}\n`, Prism.languages.tsx, "tsx"));
  const hasDomOutput = createMemo(() => requiresServerDemo(props.doc.id) || /\brender\s*\(|\bhydrate\s*\(|document\.(?:body|getElementById|createElement)/.test(editableCode()));
  let mount!: HTMLDivElement;
  let highlightLayer!: HTMLPreElement;

  createEffect(
    () => `${props.doc.id}:${props.exampleIndex}`,
    () => {
      setExecution(undefined);
      setEditableCode(props.code);
      setRunning(false);
      mount?.replaceChildren();
      queueMicrotask(() => { void run(); });
    },
  );

  async function run() {
    if (running()) return;
    setRunning(true);
    setExecution(undefined);
    let result: DemoExecution;
    if (requiresServerDemo(props.doc.id)) {
      result = await executeServerDemo(props.doc.id, props.exampleIndex);
    } else {
      try {
        const compiled = await compileBrowserDemo(editableCode());
        result = await executeBrowserDemo(compiled, mount);
      } catch (error) {
        const message = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
        result = { logs: [{ level: "error", text: message }], html: "", error: message };
      }
    }
    if (requiresServerDemo(props.doc.id) && result.html) mount.innerHTML = result.html;
    setExecution(result);
    setRunning(false);
  }

  const reset = () => {
    setExecution(undefined);
    setEditableCode(props.code);
    mount.replaceChildren();
  };

  return (
    <div class="demo-lab">
      <div class="lab-top"><button class="run-button" onClick={run} disabled={running()}><Play size={15} />{running() ? "正在运行" : "运行代码"}</button><button class="icon-button" onClick={reset} title="恢复原始示例并清空输出" aria-label="恢复原始示例并清空输出"><RotateCcw size={15} /></button></div>
      <div class="lab-code-pane standalone"><div class="code-editor"><pre ref={highlightLayer} class="code-highlight" aria-hidden="true"><code class="language-tsx" innerHTML={highlightedCode()} /></pre><textarea value={editableCode()} onInput={(event) => setEditableCode(event.currentTarget.value)} onScroll={(event) => { highlightLayer.scrollTop = event.currentTarget.scrollTop; highlightLayer.scrollLeft = event.currentTarget.scrollLeft; }} onKeyDown={(event) => { if (event.key === "Tab" && !requiresServerDemo(props.doc.id)) { event.preventDefault(); event.currentTarget.setRangeText("  ", event.currentTarget.selectionStart, event.currentTarget.selectionEnd, "end"); setEditableCode(event.currentTarget.value); } }} readonly={requiresServerDemo(props.doc.id)} spellcheck={false} wrap="off" aria-label="示例代码编辑器" /></div></div>
      <div class="runtime-output">
        <div class="runtime-results">
          <div class={hasDomOutput() ? "runtime-preview" : "runtime-preview hidden"}><header class="browser-panel-title">浏览器</header><div ref={mount} class="runtime-mount" /><Show when={!execution()}><span>运行后在这里显示 DOM。</span></Show><Show when={execution() && !execution()?.html}><span>代码执行后没有保留 DOM 内容。</span></Show></div>
          <div class="runtime-console">
            <header>控制台</header>
            <Show when={execution()} fallback={<span class="console-empty">点击“运行代码”查看日志。</span>}>
              <Show when={execution()?.logs.length} fallback={<span class="console-empty">当前程序没有 Console 输出。</span>}>
                <For each={execution()?.logs}>{(entry) => <div class={`console-${entry.level}`}><i>{entry.level}</i><pre>{entry.text}</pre></div>}</For>
              </Show>
            </Show>
          </div>
        </div>
      </div>
    </div>
  );
}

function DocPage(props: { doc: DocEntry }) {
  const [example, setExample] = createSignal(0);
  createEffect(
    () => props.doc.id,
    () => {
      setExample(0);
    },
  );
  const exampleCodes = createMemo(() => props.doc.codes);

  return (
    <article class="doc-page">
      <div class="breadcrumb"><span>源码导出</span><ChevronRight size={13} /><span>{props.doc.packageName}</span><ChevronRight size={13} /><span>{props.doc.category}</span></div>
      <header class="doc-hero">
        <div class="doc-title-line">
          <span class="api-kind">API</span>
          <h1>{props.doc.title}</h1>
          <span class="api-package">{props.doc.packageName}</span>
          <Show when={props.doc.internal}><span class="api-status internal">内部</span></Show>
          <Show when={props.doc.deprecated}><span class="api-status deprecated">已弃用</span></Show>
          <a class="source-link" href={props.doc.sourceUrl} target="_blank" rel="noreferrer">查看源码<Code2 size={14} /></a>
        </div>
      </header>

      <section class="doc-section feature-section">
        <div class="section-title"><span>01</span><div><h2>介绍</h2></div></div>
        <div class="api-spec">
          <div class="api-description"><p><InlineDoc text={props.doc.definition} /> <InlineDoc text={props.doc.useCase} /></p></div>
          <div class="contract-section">
            <div class="spec-subtitle"><h3>调用</h3><Show when={props.doc.overloads.length > 1}><span>{props.doc.overloads.length} 种调用方式</span></Show></div>
          <For each={props.doc.overloads}>{(overload) => (
            <div class="overload">
              <div class="overload-header"><code>{props.doc.title}{overload.signature}</code></div>
              <div class="parameter-table">
                <div class="parameter-head"><span>入参</span><span>类型</span><span>说明</span></div>
                <Show when={overload.parameters.length} fallback={<div class="no-parameters">该签名没有入参。</div>}>
                  <For each={overload.parameters}>{(parameter) => (
                    <div class="parameter-row">
                      <div><code>{parameter.name}</code><small>{parameter.optional ? "可选" : "必选"}</small></div>
                      <code>{parameter.type}</code>
                      <p><InlineDoc text={parameter.description} /></p>
                    </div>
                  )}</For>
                </Show>
              </div>
            </div>
          )}</For>
          </div>
          <Show when={props.doc.relatedTypes.length}>
            <div class="types-section">
              <div class="related-types-title"><h3>类型</h3><span>{props.doc.relatedTypes.length} 个相关定义</span></div>
              <For each={props.doc.relatedTypes}>{(relatedType) => (
                <div class="related-type">
                  <div class="related-type-head"><div><code>{relatedType.name}</code><p><InlineDoc text={relatedType.description} /></p></div><a href={relatedType.sourceUrl} target="_blank" rel="noreferrer">源码<ExternalLink size={12} /></a></div>
                  <pre><code>{relatedType.declaration}</code></pre>
                </div>
              )}</For>
            </div>
          </Show>
        </div>
      </section>

      <section class="doc-section demo-section">
        <div class="section-title"><span>02</span><div><h2>使用</h2></div></div>
        <Show when={exampleCodes().length > 0} fallback={<div class="empty-case"><Code2 size={22} /><p>当前没有通过真实执行验证的完整 Demo；页面不会用片段或动画冒充运行结果。</p></div>}>
          <Show when={exampleCodes().length > 1}><div class="example-tabs"><For each={exampleCodes()}>{(_, index) => <button class={{ active: example() === index() }} onClick={() => setExample(index())}>示例 {index() + 1}</button>}</For></div></Show>
          <DemoLab doc={props.doc} code={exampleCodes()[example()]} exampleIndex={example()} />
        </Show>
      </section>
      <div class="doc-pager">
        <span>共 {docs.length} 个公开可调用 API，内容由当前安装包的源码和类型入口生成</span><Check size={16} />
      </div>
    </article>
  );
}

function App() {
  const defaultDoc = docs.find((doc) => doc.id === "solid-js/createSignal") ?? docs[0];
  const initialId = decodeURIComponent(location.hash.slice(1));
  const [selectedId, setSelectedId] = createSignal(docs.some((doc) => doc.id === initialId) ? initialId : defaultDoc.id);
  const [query, setQuery] = createSignal("");
  const [menuOpen, setMenuOpen] = createSignal(false);
  const [expanded, setExpanded] = createSignal<string[]>([defaultDoc.category]);
  const selected = createMemo(() => docs.find((doc) => doc.id === selectedId()) ?? defaultDoc);
  const filtered = createMemo(() => {
    const value = query().trim().toLowerCase();
    if (!value) return [];
    return docs.filter((doc) => `${doc.title} ${doc.definition} ${doc.useCase} ${doc.category}`.toLowerCase().includes(value)).slice(0, 12);
  });

  const openDoc = (idOrTitle: string) => {
    const doc = docs.find((item) => item.id === idOrTitle || item.title === idOrTitle);
    if (!doc) return;
    setSelectedId(doc.id);
    setQuery("");
    setMenuOpen(false);
    history.replaceState(null, "", `#${encodeURIComponent(doc.id)}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleCategory = (category: string) => setExpanded((items) => items.includes(category) ? items.filter((item) => item !== category) : [...items, category]);

  onSettled(() => {
    const onHash = () => {
      const id = decodeURIComponent(location.hash.slice(1));
      if (docs.some((doc) => doc.id === id)) setSelectedId(id);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  });

  return (
    <div class="app-shell">
      <header class="topbar">
        <button class="icon-button mobile-menu" onClick={() => setMenuOpen(true)} title="打开源码目录" aria-label="打开源码目录"><Menu size={19} /></button>
        <button class="brand" onClick={() => openDoc(defaultDoc.id)}><span class="brand-mark"><Sparkles size={17} /></span><span>Solid <b>v2</b></span><span class="brand-sub">API 源码</span></button>
        <div class="top-search"><Search size={16} /><input value={query()} onInput={(event) => setQuery(event.currentTarget.value)} placeholder={`搜索 ${docs.length} 个可调用 API`} aria-label="搜索可调用 API" /><Show when={query()}><button onClick={() => setQuery("")} aria-label="清除搜索"><X size={14} /></button></Show><Show when={query()}><div class="search-results"><Show when={filtered().length} fallback={<span>没有找到匹配导出</span>}><For each={filtered()}>{(doc) => <button onClick={() => openDoc(doc.id)}><div><code>{doc.title}</code><small>{doc.packageName}</small></div><ChevronRight size={14} /></button>}</For></Show></div></Show></div>
        <div class="top-actions"><span class="coverage-pill"><Check size={13} />{docs.length} 个 API</span><a class="version-pill" href="https://www.npmjs.com/package/solid-js?activeTab=versions" target="_blank" rel="noreferrer">2.0.0-beta.25 <ExternalLink size={12} /></a><a class="icon-button" href="https://github.com/solidjs/solid" target="_blank" rel="noreferrer" title="Solid GitHub" aria-label="Solid GitHub"><Github size={17} /></a></div>
      </header>

      <aside class={["sidebar", { open: menuOpen() }]}>
        <div class="sidebar-mobile-head"><strong>公开 API</strong><button class="icon-button" onClick={() => setMenuOpen(false)} aria-label="关闭目录"><X size={17} /></button></div>
        <div class="sidebar-summary"><span>可调用接口</span><strong>Solid v2 API</strong><small>{categoryOrder.length} 类 · {docs.length} 个调用入口</small></div>
        <nav><For each={docsByCategory}>{(group) => {
          const Icon = categoryIcons[group.category] ?? Code2;
          return <div class="nav-group"><button class="category-button" onClick={() => toggleCategory(group.category)}><Icon size={16} /><span>{group.category}</span><small>{group.docs.length}</small><ChevronRight size={14} /></button><Show when={expanded().includes(group.category)}><div class="doc-links"><For each={group.docs}>{(doc) => <button class={{ active: selectedId() === doc.id }} onClick={() => openDoc(doc.id)}><span>{doc.title}</span><small>{doc.packageName === "solid-js" ? "core" : "web"}</small><i /></button>}</For></div></Show></div>;
        }}</For></nav>
      </aside>
      <Show when={menuOpen()}><button class="scrim" onClick={() => setMenuOpen(false)} aria-label="关闭目录遮罩" /></Show>

      <main><DocPage doc={selected()} /></main>
    </div>
  );
}

export default App;
