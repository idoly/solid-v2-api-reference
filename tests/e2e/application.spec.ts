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
  const brand = page.getByRole("button", { name: /Solid v2/ });
  await brand.click();
  await page.waitForTimeout(180);
  await expect(brand).toHaveCSS("box-shadow", "none");
  await expect(page.getByText("121 / 121", { exact: true })).toBeVisible();
  const sidebarBox = await page.getByRole("complementary").boundingBox();
  const homeBox = await page.locator("main article").boundingBox();
  expect(sidebarBox?.width).toBeGreaterThanOrEqual(299);
  expect(sidebarBox?.width).toBeLessThanOrEqual(321);
  expect(homeBox?.width).toBeGreaterThanOrEqual(950);
  expect(await page.evaluate(() => document.body.scrollWidth)).toBe(1280);
  expect(scripts.some((path) => /\/assets\/api-[^/]+\.js$/i.test(path))).toBe(false);

  const version = page.getByRole("link", { name: /2.0.0-beta.29/ });
  await expect(version).toHaveCSS("white-space", "nowrap");
  const category = page.getByRole("button", { name: "Reactivity", exact: true });
  const catalogLink = page.getByRole("button", { name: /createSignal core/ });
  await expect(category).toHaveCSS("font-size", "14px");
  await expect(catalogLink).toHaveCSS("font-size", "13px");
  await catalogLink.hover();
  await expect(catalogLink).toHaveCSS("background-color", "rgb(227, 235, 225)");

  const topBar = page.locator("header").first();
  await topBar.getByRole("textbox", { name: /Search callable APIs/ }).fill("createMemo");
  await topBar.getByRole("button", { name: /createMemo/ }).click();

  await expect(page).toHaveURL(/#solid-js\/createMemo$/);
  await expect(page.getByRole("heading", { level: 1, name: "createMemo" })).toBeVisible();
  await expect.poll(() => scripts.some((path) => /\/assets\/api-[^/]+\.js$/i.test(path))).toBe(true);

  await page.goBack();
  await expect(page).not.toHaveURL(/#/);
  await expect(page.getByRole("heading", { level: 1, name: "Solid v2 API Reference" })).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  const lightBackTop = page.getByRole("button", { name: "Back to top" });
  await expect(lightBackTop).toBeVisible();
  await expect(lightBackTop).toHaveCSS("background-color", "rgb(253, 254, 253)");
  await expect(lightBackTop).toHaveCSS("border-color", "rgb(198, 208, 200)");
  await expect(lightBackTop).toHaveCSS("border-radius", "6px");
  await lightBackTop.hover();
  await expect(lightBackTop).toHaveCSS("background-color", "rgb(237, 244, 229)");
  await expect(lightBackTop).toHaveCSS("border-color", "rgb(120, 155, 69)");
  const lightTooltip = page.getByRole("tooltip");
  await expect(lightTooltip).toHaveCSS("color", "rgb(255, 255, 255)");
  await expect(lightTooltip).toHaveCSS("background-color", "rgb(32, 37, 34)");
  await lightBackTop.focus();
  await page.waitForTimeout(180);
  const lightBackFocus = await lightBackTop.evaluate((element) => getComputedStyle(element).boxShadow);
  const lightThemeButton = page.getByRole("button", { name: "Switch to dark mode" });
  await lightThemeButton.focus();
  await page.waitForTimeout(180);
  expect(lightBackFocus).toBe(await lightThemeButton.evaluate((element) => getComputedStyle(element).boxShadow));
  expect(errors).toEqual([]);
});

test("persists locale and theme preferences across reloads", async ({ page }) => {
  await page.goto("/");

  const localeButton = page.getByRole("button", { name: "Switch language" });
  const themeButton = page.getByRole("button", { name: "Switch to dark mode" });
  const githubLink = page.getByRole("link", { name: "Solid GitHub" });
  const focusShadow = async (locator: typeof localeButton) => {
    await locator.focus();
    await page.waitForTimeout(180);
    return locator.evaluate((element) => getComputedStyle(element).boxShadow);
  };
  expect(await focusShadow(themeButton)).toBe(await focusShadow(localeButton));
  expect(await focusShadow(githubLink)).toBe(await focusShadow(localeButton));

  await localeButton.click();
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  await expect(page.getByRole("heading", { level: 1, name: "Solid v2 中文接口参考" })).toBeVisible();

  await page.getByRole("button", { name: "切换到黑夜模式" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute("content", "#151517");
  await expect(page.getByRole("complementary")).toHaveCSS("background-color", "rgb(21, 21, 23)");
  await expect.poll(() => page.evaluate(() => localStorage.getItem("solid-v2-theme"))).toBe("dark");

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  await expect(page.locator("html")).toHaveClass(/dark/);
  await expect(page.getByRole("heading", { level: 1, name: "Solid v2 中文接口参考" })).toBeVisible();
  await page.goto("/#solid-js/createSignal");
  await expect(page.getByRole("heading", { level: 1, name: "createSignal" })).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  const darkBackTop = page.getByRole("button", { name: "返回顶部" });
  await expect(darkBackTop).toBeVisible();
  await expect(darkBackTop).toHaveCSS("background-color", "rgb(29, 29, 32)");
  await expect(darkBackTop).toHaveCSS("border-color", "rgb(70, 81, 73)");
  await darkBackTop.hover();
  await expect(darkBackTop).toHaveCSS("background-color", "rgb(41, 49, 39)");
  await expect(darkBackTop).toHaveCSS("border-color", "rgb(117, 147, 75)");
  const darkTooltip = page.getByRole("tooltip");
  await expect(darkTooltip).toHaveCSS("color", "rgb(32, 37, 34)");
  await expect(darkTooltip).toHaveCSS("background-color", "rgb(237, 242, 238)");
  await darkBackTop.focus();
  await page.waitForTimeout(180);
  const darkBackFocus = await darkBackTop.evaluate((element) => getComputedStyle(element).boxShadow);
  const darkThemeButton = page.getByRole("button", { name: "切换到日间模式" });
  await darkThemeButton.focus();
  await page.waitForTimeout(180);
  expect(darkBackFocus).toBe(await darkThemeButton.evaluate((element) => getComputedStyle(element).boxShadow));
});

test("runs a browser demo through the production runtime", async ({ page }) => {
  const runtimeRequests: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/__solid_api_")) runtimeRequests.push(request.url());
  });
  await page.goto("/#solid-js/createUniqueId");
  await expect(page.getByRole("heading", { level: 1, name: "createUniqueId" })).toBeVisible();

  await page.getByRole("button", { name: "Expand editor" }).click();
  const editorDialog = page.getByRole("dialog");
  await expect(editorDialog).toBeVisible();
  await expect(editorDialog.getByRole("textbox", { name: "Code editor" })).toBeVisible();
  await editorDialog.getByRole("button", { name: "Close editor" }).click();
  await expect(editorDialog).toBeHidden();
  await expect(page.getByText("Run the code to inspect console output.", { exact: true })).toBeVisible();
  expect(runtimeRequests).toEqual([]);

  await page.getByRole("button", { name: "Run code" }).click();
  await expect.poll(() => runtimeRequests.length).toBeGreaterThan(0);

  await expect(page.getByText("Editor", { exact: true })).toBeVisible();
  await expect(page.getByText("Browser", { exact: true })).toHaveCSS("background-color", "rgb(238, 242, 238)");
  await expect(page.getByRole("heading", { level: 3, name: "createUniqueId" })).toBeVisible();
  const consolePanel = page.getByText("Console", { exact: true }).locator("..");
  const consoleBody = consolePanel.locator(":scope > div");
  await expect(consolePanel.getByText(/Generated IDs/)).toBeVisible();
  await expect(consolePanel).toHaveCSS("overflow-y", "hidden");
  await expect(consoleBody).toHaveCSS("overflow-y", "auto");
  await page.getByRole("button", { name: "Restore the original example and clear output" }).click();
  await expect(consolePanel.getByText(/Generated IDs/)).toBeHidden();
  await expect(consoleBody).toHaveText("Run the code to inspect console output.");
  await expect(page.getByText("DOM output will appear here after execution.", { exact: true })).toBeVisible();

  await page.goto("/#@solidjs/web/Loading");
  await expect(page.getByRole("heading", { level: 1, name: "Loading" })).toBeVisible();
  const loadingSource = await page.getByRole("textbox", { name: "Code editor" }).inputValue();
  expect(loadingSource.match(/from "@solidjs\/web"/g)).toHaveLength(1);
  expect(loadingSource).toContain('import { Loading, render } from "@solidjs/web";');
  await page.getByRole("button", { name: "Run code" }).click();
  await expect(page.getByRole("heading", { level: 3, name: "Loading boundary" })).toBeVisible();
  await expect(page.getByRole("paragraph").filter({ hasText: /^State: idle$/ })).toBeVisible();
  await page.getByRole("button", { name: "Start loading" }).click();
  await expect(page.getByRole("paragraph").filter({ hasText: /^State: loading$/ })).toBeVisible();
  await page.getByRole("button", { name: "Resolve content" }).click();
  await expect(page.getByRole("paragraph").filter({ hasText: /^State: content ready$/ })).toBeVisible();
  await expect(page.getByText("The program produced no console output.", { exact: true })).toBeVisible();
});

test("supports catalog search on a mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  await page.getByRole("button", { name: "Open API catalog" }).click();
  const catalog = page.getByRole("dialog", { name: "Public APIs" });
  await expect(catalog.getByRole("button", { name: "Close catalog" })).toBeVisible();

  await catalog.getByRole("searchbox", { name: "Search callable APIs" }).fill("createStore");
  await catalog.getByRole("button", { name: /createStore/ }).click();

  await expect(page).toHaveURL(/#solid-js\/createStore$/);
  await expect(page.getByRole("heading", { level: 1, name: "createStore" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Open API catalog" })).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await expect(page.getByRole("button", { name: "Back to top" })).toBeHidden();
});
