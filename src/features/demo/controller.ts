import { createEffect, createMemo, createSignal, onCleanup } from "solid-js";
import Prism from "prismjs";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import type { Doc } from "../../data/catalog";
import { execute, isServer, type Result } from "./runtime";

type Input = { doc: Doc; code: string; exampleIndex: number };
type Snapshot = { id: string; index: number; code: string; server: boolean };

async function writeClipboard(source: string) {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(source);
  const textarea = Object.assign(document.createElement("textarea"), { value: source });
  Object.assign(textarea.style, { position: "fixed", opacity: "0" });
  document.body.append(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

export function createController(input: Input, getMount: () => HTMLDivElement | undefined) {
  const [running, setRunning] = createSignal(false);
  const [result, setResult] = createSignal<Result>();
  const [copied, setCopied] = createSignal(false);
  const [source, setSource] = createSignal("");
  const demo = createMemo<Snapshot>(() => ({
    id: input.doc.id,
    index: input.exampleIndex,
    code: input.code,
    server: isServer(input.doc.id),
  }));
  const highlighted = createMemo(() => Prism.highlight(`${source()}\n`, Prism.languages.tsx, "tsx"));
  const hasPreview = createMemo(
    () =>
      demo().server || /\brender\s*\(|\bhydrate\s*\(|document\.(?:body|getElementById|createElement)/.test(source()),
  );

  // Commands use this snapshot because Solid strict mode rejects untracked reactive reads.
  let current: Snapshot = { id: "", index: 0, code: "", server: false };
  let timer: number | undefined;
  onCleanup(() => timer && window.clearTimeout(timer));

  async function run(snapshot = current, code = source()) {
    const mount = getMount();
    if (running() || !mount) return;
    setRunning(true);
    setResult(undefined);
    try {
      setResult(await execute({ id: snapshot.id, index: snapshot.index, source: code, mount }));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setResult({ logs: [{ level: "error", text: message }], html: "", error: message });
    } finally {
      setRunning(false);
    }
  }

  createEffect(
    () => demo(),
    (nextDemo) => {
      current = nextDemo;
      setResult(undefined);
      setCopied(false);
      setSource(nextDemo.code);
      setRunning(false);
      getMount()?.replaceChildren();
      queueMicrotask(() => void run(nextDemo, nextDemo.code));
    },
  );

  const reset = () => {
    setResult(undefined);
    setCopied(false);
    setSource(current.code);
    getMount()?.replaceChildren();
  };

  const copy = async () => {
    await writeClipboard(source());
    setCopied(true);
    if (timer) window.clearTimeout(timer);
    timer = window.setTimeout(() => setCopied(false), 1800);
  };

  const edit = (source: string) => {
    setCopied(false);
    setSource(source);
  };

  const insertTab = (event: KeyboardEvent & { currentTarget: HTMLTextAreaElement }) => {
    if (event.key !== "Tab" || current.server) return;
    event.preventDefault();
    event.currentTarget.setRangeText("  ", event.currentTarget.selectionStart, event.currentTarget.selectionEnd, "end");
    setSource(event.currentTarget.value);
  };

  return {
    running,
    result,
    copied,
    source,
    edit,
    demo,
    highlighted,
    hasPreview,
    run,
    reset,
    copy,
    insertTab,
  };
}
