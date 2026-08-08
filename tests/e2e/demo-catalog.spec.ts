import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";

type DemoRecord = {
  id: string;
  title: string;
  execution: "browser" | "server";
  codes: number[];
};

type Catalog = {
  schemaVersion: number;
  records: DemoRecord[];
};

const catalog = JSON.parse(readFileSync("data/catalog.json", "utf8")) as Catalog;
const demos = catalog.records.filter((record) => record.codes.length > 0);

async function exerciseRenderedControls(page: Page) {
  return page.locator('[data-demo-output="browser"]').evaluate(async (root) => {
    const controls = root.querySelectorAll("input, textarea, select, button").length;
    const snapshot = () =>
      JSON.stringify({
        html: root.innerHTML,
        controls: [...root.querySelectorAll("input, textarea, select, button")].map((control) => ({
          value: "value" in control ? control.value : undefined,
          checked: "checked" in control ? control.checked : undefined,
          disabled: "disabled" in control ? control.disabled : undefined,
        })),
      });
    let previous = snapshot();
    let changed = false;
    const settle = async () => {
      await Promise.resolve();
      await new Promise((resolve) => setTimeout(resolve, 0));
      const next = snapshot();
      if (next !== previous) changed = true;
      previous = next;
    };
    const dispatch = (element: Element, type: string) => element.dispatchEvent(new Event(type, { bubbles: true }));

    for (const input of root.querySelectorAll("input, textarea")) {
      if (input instanceof HTMLInputElement && ["checkbox", "radio"].includes(input.type)) {
        input.checked = !input.checked;
        dispatch(input, "change");
      } else if (input instanceof HTMLInputElement && input.type === "range") {
        const min = Number(input.min || 0);
        const max = Number(input.max || 100);
        input.value = String(Number(input.value) === min ? max : min);
        dispatch(input, "input");
      } else if (input instanceof HTMLInputElement && input.type === "number") {
        input.value = String(Number(input.value || 0) + 1);
        dispatch(input, "input");
      } else {
        input.value = `${input.value} updated`.trim();
        dispatch(input, "input");
      }
      await settle();
    }

    for (const select of root.querySelectorAll("select")) {
      if (select.options.length > 1) select.selectedIndex = (select.selectedIndex + 1) % select.options.length;
      dispatch(select, "change");
      await settle();
    }

    for (const button of [...root.querySelectorAll("button")]) {
      if (button.isConnected && !button.disabled) button.click();
      await settle();
    }

    return { controls, changed };
  });
}

test.describe("generated API demos in Chromium", () => {
  test.describe.configure({ mode: "serial" });

  for (const demo of demos) {
    test(`${demo.id} renders browser and console output`, async ({ page }) => {
      const browserErrors: string[] = [];
      page.on("pageerror", (error) => browserErrors.push(error.message));
      page.on("console", (message) => {
        if (message.type() === "error") browserErrors.push(message.text());
      });

      await page.goto(`/#${demo.id}`);
      await expect(page.getByRole("heading", { level: 1, name: demo.title, exact: true })).toBeVisible();

      const browserOutput = page.locator('[data-demo-output="browser"]');
      const consoleOutput = page.locator('[data-demo-output="console"]');
      const runButton = page.getByRole("button", { name: "Run code" });
      await runButton.click();

      await expect(consoleOutput.getByText("Click “Run code” to view console logs.", { exact: true })).toBeHidden({
        timeout: 12_000,
      });
      await expect(runButton).toBeEnabled();
      await expect(consoleOutput.locator('[data-log-level="error"]')).toHaveCount(0);

      const browserHtml = await browserOutput.evaluate((element) => element.innerHTML.trim());
      expect(browserHtml, `${demo.id} produced no browser output`).not.toBe("");

      const logCount = await consoleOutput.locator("[data-log-level]").count();
      const emptyConsole = consoleOutput.getByText("No console logs were produced.", { exact: true });
      if (logCount === 0) await expect(emptyConsole).toBeVisible();
      else await expect(emptyConsole).toHaveCount(0);

      if (demo.execution === "browser") {
        const interaction = await exerciseRenderedControls(page);
        if (interaction.controls > 0) {
          expect(interaction.changed, `${demo.id} controls produced no update`).toBe(true);
        }
      }

      await expect(consoleOutput.locator('[data-log-level="error"]')).toHaveCount(0);
      expect(browserErrors, `${demo.id} emitted browser diagnostics`).toEqual([]);
    });
  }
});
