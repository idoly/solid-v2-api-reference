import { Button, Modal, Tooltip, type ButtonProps } from "@idoly/ant-design-solid";
import type { JSX } from "@solidjs/web";
import { Show, createSignal } from "solid-js";
import type { Doc } from "../../data/catalog";
import { iconButton, primaryIconButton } from "../../ui/classes";
import { Check, Copy, Maximize2, Play, RotateCcw, X } from "../../ui/icons";
import type { Locale } from "../i18n/locale";
import { createController } from "./controller";
import { CodeEditor } from "./editor";
import { DemoOutput } from "./output";
import styles from "./lab.module.css";

type Props = {
  doc: Pick<Doc, "id" | "title" | "execution">;
  code: string;
  exampleIndex: number;
  locale: Locale;
};

type ToolButtonProps = {
  class: string;
  icon: JSX.Element;
  label: string;
  onClick: () => void;
  type?: ButtonProps["type"];
  loading?: boolean;
  disabled?: boolean;
};

function ToolButton(props: ToolButtonProps) {
  return (
    <Tooltip title={props.label} placement="top" class={styles.contents}>
      <Button
        type={props.type}
        class={props.class}
        icon={props.icon}
        loading={props.loading}
        disabled={props.disabled}
        onClick={props.onClick}
        aria-label={props.label}
      />
    </Tooltip>
  );
}

export function Lab(props: Props) {
  let mount: HTMLDivElement | undefined;
  const [editorOpen, setEditorOpen] = createSignal(false);
  const { running, result, copied, source, edit, demo, highlighted, hasPreview, run, reset, copy, insertTab } =
    createController(props, () => mount);

  const openEditor = () => setEditorOpen(true);
  const closeEditor = () => setEditorOpen(false);
  const runExpanded = () => {
    closeEditor();
    void run();
  };
  const copyIcon = () => (
    <Show when={copied()} fallback={<Copy size={15} />}>
      <Check size={15} />
    </Show>
  );
  const copyLabel = () => (copied() ? props.locale.t("copiedCode") : props.locale.t("copyCode"));
  const runLabel = () => (running() ? props.locale.t("running") : props.locale.t("runCode"));

  return (
    <div class={styles.root}>
      <div class={styles.controls}>
        <span class={styles.panelTitle}>{props.locale.t("editor")}</span>
        <div class={styles.controlActions}>
          <ToolButton
            class={iconButton}
            icon={<Play size={15} />}
            label={runLabel()}
            loading={running()}
            disabled={running()}
            onClick={() => void run()}
          />
          <ToolButton
            class={iconButton}
            icon={<Maximize2 size={15} />}
            label={props.locale.t("expandEditor")}
            onClick={openEditor}
          />
          <ToolButton class={iconButton} icon={copyIcon()} label={copyLabel()} onClick={() => void copy()} />
          <ToolButton
            class={iconButton}
            icon={<RotateCcw size={15} />}
            label={props.locale.t("resetDemo")}
            onClick={reset}
          />
        </div>
      </div>

      <div class={styles.codePane}>
        <CodeEditor
          variant="inline"
          highlighted={highlighted}
          source={source}
          edit={edit}
          insertTab={insertTab}
          readOnly={() => demo().server}
          label={() => props.locale.t("editorLabel")}
        />
      </div>

      <DemoOutput
        result={result}
        hasPreview={hasPreview}
        locale={props.locale}
        setMount={(element) => (mount = element)}
      />

      <Modal
        open={editorOpen()}
        width="min(92vw, 1180px)"
        centered
        footer={null}
        closable={false}
        mask={{ enabled: true, blur: true, closable: true }}
        onCancel={closeEditor}
        classNames={{ wrapper: styles.modalWrapper, container: styles.modalContainer, body: styles.modalBody }}
      >
        <div class={styles.dialogShell}>
          <header class={styles.dialogHeader}>
            <h2 id="expanded-editor-title" class={styles.dialogTitle}>
              {props.doc.title} - {props.locale.t("editorLabel")}
            </h2>
            <ToolButton
              class={iconButton}
              icon={<X size={16} />}
              label={props.locale.t("closeEditor")}
              onClick={closeEditor}
            />
          </header>
          <CodeEditor
            variant="dialog"
            highlighted={highlighted}
            source={source}
            edit={edit}
            insertTab={insertTab}
            readOnly={() => demo().server}
            label={() => props.locale.t("editorLabel")}
          />
          <footer class={styles.dialogFooter}>
            <ToolButton
              class={iconButton}
              icon={<RotateCcw size={15} />}
              label={props.locale.t("resetDemo")}
              onClick={reset}
            />
            <ToolButton class={iconButton} icon={copyIcon()} label={copyLabel()} onClick={() => void copy()} />
            <ToolButton
              type="primary"
              class={primaryIconButton}
              icon={<Play size={15} />}
              label={runLabel()}
              loading={running()}
              disabled={running()}
              onClick={runExpanded}
            />
          </footer>
        </div>
      </Modal>
    </div>
  );
}
