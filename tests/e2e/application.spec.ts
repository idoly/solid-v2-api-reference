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
  await expect(page.getByText("91 / 91", { exact: true })).toBeVisible();
  const sidebarBox = await page.getByRole("complementary").boundingBox();
  const homeBox = await page.locator("main article").boundingBox();
  expect(sidebarBox?.width).toBeGreaterThanOrEqual(299);
  expect(sidebarBox?.width).toBeLessThanOrEqual(321);
  expect(homeBox?.width).toBeGreaterThanOrEqual(950);
  expect(await page.evaluate(() => document.body.scrollWidth)).toBe(1280);
  expect(scripts.some((path) => /\/assets\/api-[^/]+\.js$/i.test(path))).toBe(false);

  const version = page.getByRole("link", { name: /2.0.0-rc.0/ });
  await expect(version).toHaveCSS("white-space", "nowrap");
  const category = page.getByRole("button", { name: "Reactivity", exact: true });
  const catalogLink = page.getByRole("button", { name: /createSignal core/ });
  const responseCategory = page.getByRole("button", { name: "Responses", exact: true });
  await expect(page.getByTitle("Responses", { exact: true })).toBeVisible();
  await responseCategory.click();
  const longCatalogLink = page.getByRole("button", { name: /getExpectedRedirectStatus web/ });
  await expect(longCatalogLink).toHaveAttribute("title", "getExpectedRedirectStatus");
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
  const [lightBackTopBox, lightTooltipBox] = await Promise.all([
    lightBackTop.boundingBox(),
    lightTooltip.boundingBox(),
  ]);
  expect(lightBackTopBox).not.toBeNull();
  expect(lightTooltipBox).not.toBeNull();
  expect(lightTooltipBox!.x + lightTooltipBox!.width).toBeLessThan(lightBackTopBox!.x);
  expect(
    Math.abs(lightTooltipBox!.y + lightTooltipBox!.height / 2 - (lightBackTopBox!.y + lightBackTopBox!.height / 2)),
  ).toBeLessThanOrEqual(2);
  const interactionStyle = (element: Element) => {
    const style = getComputedStyle(element);
    return {
      color: style.color,
      backgroundColor: style.backgroundColor,
      borderColor: style.borderColor,
      boxShadow: style.boxShadow,
      transform: style.transform,
    };
  };
  const lightBackHover = await lightBackTop.evaluate(interactionStyle);
  const lightThemeButton = page.getByRole("button", { name: "Switch to dark mode" });
  await lightThemeButton.hover();
  await page.waitForTimeout(180);
  expect(await lightThemeButton.evaluate(interactionStyle)).toEqual(lightBackHover);
  await page.mouse.move(0, 200);
  await page.keyboard.press("Tab");
  await lightBackTop.focus();
  await page.waitForTimeout(180);
  const lightBackFocus = await lightBackTop.evaluate((element) => getComputedStyle(element).boxShadow);
  await page.keyboard.press("Tab");
  await lightThemeButton.focus();
  await page.waitForTimeout(180);
  expect(lightBackFocus).toBe(await lightThemeButton.evaluate((element) => getComputedStyle(element).boxShadow));
  await lightBackTop.evaluate((element) => {
    element.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
      },
      { capture: true, once: true },
    );
  });
  await lightBackTop.click();
  await page.mouse.move(0, 200);
  await page.waitForTimeout(180);
  await expect(lightBackTop).toBeFocused();
  expect(await lightBackTop.evaluate((element) => getComputedStyle(element).boxShadow)).not.toBe(lightBackFocus);
  await lightBackTop.click();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  expect(errors).toEqual([]);
});

test("persists locale and theme preferences across reloads", async ({ page }) => {
  await page.goto("/");

  const localeButton = page.getByRole("button", { name: "Switch language" });
  const themeButton = page.getByRole("button", { name: "Switch to dark mode" });
  const githubLink = page.getByRole("link", { name: "Solid GitHub" });
  const focusShadow = async (locator: typeof localeButton) => {
    await page.keyboard.press("Tab");
    await locator.focus();
    await page.waitForTimeout(180);
    return locator.evaluate((element) => getComputedStyle(element).boxShadow);
  };
  const keyboardFocusShadow = await focusShadow(themeButton);
  expect(await focusShadow(localeButton)).toBe(keyboardFocusShadow);
  expect(await focusShadow(githubLink)).toBe(keyboardFocusShadow);

  await localeButton.evaluate((element) => {
    element.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
      },
      { capture: true, once: true },
    );
  });
  await localeButton.click();
  await page.mouse.move(0, 200);
  await page.waitForTimeout(180);
  await expect(localeButton).toBeFocused();
  expect(await localeButton.evaluate((element) => getComputedStyle(element).boxShadow)).not.toBe(keyboardFocusShadow);

  await localeButton.click();
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  await expect(page.getByRole("heading", { level: 1, name: "Solid v2 中文接口参考" })).toBeVisible();

  await page.getByRole("button", { name: "切换到深色模式" }).click();
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
  const interactionStyle = (element: Element) => {
    const style = getComputedStyle(element);
    return {
      color: style.color,
      backgroundColor: style.backgroundColor,
      borderColor: style.borderColor,
      boxShadow: style.boxShadow,
      transform: style.transform,
    };
  };
  const darkBackHover = await darkBackTop.evaluate(interactionStyle);
  const darkThemeButton = page.getByRole("button", { name: "切换到浅色模式" });
  await darkThemeButton.hover();
  await page.waitForTimeout(180);
  expect(await darkThemeButton.evaluate(interactionStyle)).toEqual(darkBackHover);
  await page.mouse.move(0, 200);
  await page.keyboard.press("Tab");
  await darkBackTop.focus();
  await page.waitForTimeout(180);
  const darkBackFocus = await darkBackTop.evaluate((element) => getComputedStyle(element).boxShadow);
  await page.keyboard.press("Tab");
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
  const expandedRunButton = editorDialog.getByRole("button", { name: "Run code" });
  await expect(expandedRunButton).toHaveCSS("width", "34px");
  await expect(expandedRunButton).toHaveCSS("height", "34px");
  await expect(expandedRunButton).toHaveCSS("padding", "0px");
  await expect(expandedRunButton).toHaveCSS("background-color", "rgb(111, 152, 29)");
  await expect(expandedRunButton).toHaveCSS("border-color", "rgb(111, 152, 29)");
  await expect(expandedRunButton).toHaveCSS("box-shadow", "none");
  await editorDialog.getByRole("button", { name: "Close editor" }).click();
  await expect(editorDialog).toBeHidden();
  await expect(page.getByText("Click “Run code” to view console logs.", { exact: true })).toBeVisible();
  expect(runtimeRequests).toEqual([]);

  const interactionStyle = (element: Element) => {
    const style = getComputedStyle(element);
    return {
      color: style.color,
      backgroundColor: style.backgroundColor,
      borderColor: style.borderColor,
      boxShadow: style.boxShadow,
      transform: style.transform,
    };
  };
  const runButton = page.getByRole("button", { name: "Run code" });
  await runButton.hover();
  await page.waitForTimeout(180);
  const editorButtonHover = await runButton.evaluate(interactionStyle);
  const editorTooltip = page.getByRole("tooltip", { name: "Run code" });
  const [runButtonBox, editorTooltipBox, editorToolbarBox] = await Promise.all([
    runButton.boundingBox(),
    editorTooltip.boundingBox(),
    runButton.locator("xpath=ancestor::div[contains(@class, 'controls')][1]").boundingBox(),
  ]);
  expect(runButtonBox).not.toBeNull();
  expect(editorTooltipBox).not.toBeNull();
  expect(editorToolbarBox).not.toBeNull();
  expect(editorTooltipBox!.y + editorTooltipBox!.height).toBeLessThan(runButtonBox!.y);
  expect(
    Math.abs(editorTooltipBox!.x + editorTooltipBox!.width / 2 - (runButtonBox!.x + runButtonBox!.width / 2)),
  ).toBeLessThanOrEqual(2);
  expect(runButtonBox!.y).toBeGreaterThanOrEqual(editorToolbarBox!.y);
  expect(runButtonBox!.y + runButtonBox!.height).toBeLessThanOrEqual(editorToolbarBox!.y + editorToolbarBox!.height);
  const topBarThemeButton = page.getByRole("button", { name: "Switch to dark mode" });
  await topBarThemeButton.hover();
  await page.waitForTimeout(180);
  expect(await topBarThemeButton.evaluate(interactionStyle)).toEqual(editorButtonHover);
  const topBarTooltip = page.getByRole("tooltip", { name: "Switch to dark mode" });
  const [topBarButtonBox, topBarTooltipBox] = await Promise.all([
    topBarThemeButton.boundingBox(),
    topBarTooltip.boundingBox(),
  ]);
  expect(topBarButtonBox).not.toBeNull();
  expect(topBarTooltipBox).not.toBeNull();
  expect(topBarTooltipBox!.y).toBeGreaterThan(topBarButtonBox!.y + topBarButtonBox!.height);

  await runButton.click();
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
  await expect(consoleBody).toHaveText("Click “Run code” to view console logs.");
  await expect(page.getByText("Click “Run code” to view page output.", { exact: true })).toBeVisible();

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
  await expect(page.getByText("No console logs were produced.", { exact: true })).toBeVisible();
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
