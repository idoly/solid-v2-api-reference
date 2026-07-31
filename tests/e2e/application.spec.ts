import { expect, test } from "@playwright/test";

test("loads the generated reference and opens an API from search", async ({ page }) => {
  const errors: string[] = [];
  const scripts: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("response", (response) => {
    if (response.request().resourceType() === "script") scripts.push(new URL(response.url()).pathname);
  });

  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "Solid v2 API Reference" })).toBeVisible();
  await expect(page.getByText("121 / 121", { exact: true })).toBeVisible();
  expect(scripts.some((path) => /\/assets\/api-[^/]+\.js$/.test(path))).toBe(false);

  const topBar = page.locator("header").first();
  await topBar.getByRole("textbox", { name: /Search callable APIs/ }).fill("createMemo");
  await topBar.getByRole("button", { name: /createMemo/ }).click();

  await expect(page).toHaveURL(/#solid-js\/createMemo$/);
  await expect(page.getByRole("heading", { level: 1, name: "createMemo" })).toBeVisible();
  await expect.poll(() => scripts.some((path) => /\/assets\/api-[^/]+\.js$/.test(path))).toBe(true);

  await page.goBack();
  await expect(page).not.toHaveURL(/#/);
  await expect(page.getByRole("heading", { level: 1, name: "Solid v2 API Reference" })).toBeVisible();
  expect(errors).toEqual([]);
});

test("persists locale and theme preferences across reloads", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Switch language" }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  await expect(page.getByRole("heading", { level: 1, name: "Solid v2 中文接口参考" })).toBeVisible();

  await page.getByRole("button", { name: "切换到黑夜模式" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await expect.poll(() => page.evaluate(() => localStorage.getItem("solid-v2-theme"))).toBe("dark");

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  await expect(page.locator("html")).toHaveClass(/dark/);
  await expect(page.getByRole("heading", { level: 1, name: "Solid v2 中文接口参考" })).toBeVisible();
});

test("runs a browser demo through the production runtime", async ({ page }) => {
  await page.goto("/#solid-js/createUniqueId");
  await expect(page.getByRole("heading", { level: 1, name: "createUniqueId" })).toBeVisible();

  await page.getByRole("button", { name: "Run code" }).click();

  await expect(page.getByRole("heading", { level: 3, name: "createUniqueId" })).toBeVisible();
  const consolePanel = page.getByText("Console", { exact: true }).locator("..");
  await expect(consolePanel.getByText(/Generated IDs/)).toBeVisible();
});

test("supports catalog search on a mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  await page.getByRole("button", { name: "Open API catalog" }).click();
  const catalog = page.getByRole("complementary");
  await expect(catalog.getByRole("button", { name: "Close catalog" })).toBeVisible();

  await catalog.getByRole("searchbox", { name: "Search callable APIs" }).fill("createStore");
  await catalog.getByRole("button", { name: /createStore/ }).click();

  await expect(page).toHaveURL(/#solid-js\/createStore$/);
  await expect(page.getByRole("heading", { level: 1, name: "createStore" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Open API catalog" })).toBeVisible();
});
