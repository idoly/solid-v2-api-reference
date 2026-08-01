export function hasInteractiveControls(source) {
  return /\bon(?:Click|Input|Change)=|\baddEvent(?:Listener)?\s*\(/.test(source);
}

export async function exerciseInteractiveControls(document, window, Solid) {
  const root = document.getElementById("root");
  let previous = interactiveSnapshot(document);
  let changed = false;
  const trackChange = () => {
    const next = interactiveSnapshot(document);
    if (next !== previous) changed = true;
    previous = next;
  };

  for (const input of root?.querySelectorAll("input, textarea") ?? []) {
    if (input instanceof window.HTMLInputElement && ["checkbox", "radio"].includes(input.type)) {
      input.checked = !input.checked;
      input.dispatchEvent(new window.Event("change", { bubbles: true }));
    } else if (input instanceof window.HTMLInputElement && input.type === "range") {
      const min = Number(input.min || 0);
      const max = Number(input.max || 100);
      const midpoint = min + (max - min) / 2;
      input.value = String(Number(input.value) === midpoint ? min : midpoint);
      input.dispatchEvent(new window.Event("input", { bubbles: true }));
    } else if (input instanceof window.HTMLInputElement && input.type === "number") {
      input.value = String(Number(input.value || 0) + 1);
      input.dispatchEvent(new window.Event("input", { bubbles: true }));
    } else {
      input.value = `${input.value} updated`.trim();
      input.dispatchEvent(new window.Event("input", { bubbles: true }));
    }
    Solid.flush();
    trackChange();
  }

  for (const select of root?.querySelectorAll("select") ?? []) {
    if (select.options.length > 1) select.selectedIndex = (select.selectedIndex + 1) % select.options.length;
    select.dispatchEvent(new window.Event("change", { bubbles: true }));
    Solid.flush();
    trackChange();
  }

  for (const button of root?.querySelectorAll("button") ?? []) {
    if (!button.disabled) button.click();
    Solid.flush();
    await Promise.resolve();
    trackChange();
  }

  await new Promise((resolve) => setTimeout(resolve, 0));
  Solid.flush();
  trackChange();
  if (!changed) throw new Error("Interactive controls did not produce an observable update");
}

function interactiveSnapshot(document) {
  const controls = [...document.querySelectorAll("input, textarea, select, button")].map((control) => ({
    tag: control.tagName,
    value: "value" in control ? control.value : undefined,
    checked: "checked" in control ? control.checked : undefined,
    disabled: "disabled" in control ? control.disabled : undefined,
    className: control.className,
  }));
  return JSON.stringify({ body: document.body.innerHTML, controls });
}
