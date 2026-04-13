async function waitFor(page, locator) {
  await page.locator(locator).waitFor({ state: "visible" });
}

module.exports = { waitFor };
