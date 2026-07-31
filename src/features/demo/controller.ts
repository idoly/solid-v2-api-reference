import { createEffect, createMemo, createSignal, flush, onCleanup } from "solid-js";
import type { Doc } from "../../data/catalog";
import { highlightTsx } from "../../ui/highlight";
import type { Result } from "./model";

type Input = { doc: Pick<Doc, "id" | "execution">; code: string; exampleIndex: number };
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
    server: input.doc.execution === "server",
  }));
  const highlighted = createMemo(() => highlightTsx(`${source()}\n`));
  const hasPreview = createMemo(
    () =>
      demo().server || /\brender\s*\(|\bhydrate\s*\(|document\.(?:body|getElementById|createElement)/.test(source()),
  );

  // Commands use this snapshot because Solid strict mode rejects untracked reactive reads.
  let current: Snapshot = { id: "", index: 0, code: "", server: false };
  let execution = 0;
  let timer: number | undefined;
  const invalidateExecution = () => {
    execution += 1;
    setRunning(false);
    return execution;
  };
  onCleanup(() => {
    execution += 1;
    if (timer) window.clearTimeout(timer);
  });

  async function run(snapshot = current, code = source()) {
    const mount = getMount();
    if (running() || !mount) return;
    const executionId = ++execution;
    setRunning(true);
    setResult(undefined);
    try {
      const { execute } = await import("./runtime");
      if (executionId !== execution) return;
      const next = await execute({
        id: snapshot.id,
        index: snapshot.index,
        source: code,
        server: snapshot.server,
        mount,
        onUpdate: (update) => {
          if (executionId === execution) setResult(update);
        },
      });
      if (executionId === execution) setResult(next);
    } catch (error) {
      if (executionId !== execution) return;
      const message = error instanceof Error ? error.message : String(error);
      setResult({ logs: [{ level: "error", text: message }], html: "", error: message });
    } finally {
      if (executionId === execution) {
        setRunning(false);
        flush();
      }
    }
  }

  createEffect(
    () => demo(),
    (nextDemo) => {
      current = nextDemo;
      const scheduledExecution = invalidateExecution();
      setResult(undefined);
      setCopied(false);
      setSource(nextDemo.code);
      getMount()?.replaceChildren();
      queueMicrotask(() => {
        if (scheduledExecution === execution) void run(nextDemo, nextDemo.code);
      });
    },
  );

  const reset = () => {
    invalidateExecution();
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
