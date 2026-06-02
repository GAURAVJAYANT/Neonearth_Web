const { test, expect } = require("../utils/fixtures");
const NewTapestryData = require("../data/NewTapestryData");

async function robustClick(page, locator, label) {
  await locator.waitFor({ state: "visible", timeout: 30000 });
  await expect(locator).toBeEnabled({ timeout: 10000 });
  await locator.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1500);

  for (let attempt = 1; attempt <= 4; attempt++) {
    console.log(`${label} click attempt #${attempt}...`);

    try {
      await locator.click({ force: true, timeout: 10000 });
      console.log(`Clicked ${label} on attempt #${attempt}`);
      return;
    } catch (error) {
      console.log(
        `${label} attempt #${attempt} failed: ${error.message.split("\n")[0]}`,
      );
      await page.waitForTimeout(1000 * attempt);
    }
  }

  console.log(`${label} click attempts failed. Falling back to DOM click...`);
  await locator.evaluate((button) => button.click());
}

test.describe("Tapestry GenAI E2E", () => {
  test.describe.configure({ retries: 2 });
  test.setTimeout(300000);

  const firstCategory = NewTapestryData[0];
  const firstProduct = firstCategory.products[0];

  test(`Tapestry GenAI - ${firstCategory.category} -> ${firstProduct.name}`, async ({
    page,
    newTapestryHomePage,
    productPage,
    cartPage,
    checkoutPage,
  }) => {
    console.log(
      `Running GenAI: ${firstCategory.category} -> ${firstProduct.name}`,
    );

    await newTapestryHomePage.open();
    await newTapestryHomePage.navigate(
      firstCategory.category,
      firstProduct.name,
    );

    if (firstProduct.customOptions) {
      console.log("Settle time before custom options...");
      await page.waitForTimeout(5000);
      await productPage.handleCustomOptions(firstProduct.customOptions);
    }

    await productPage.personalizeDesign();

    const generateWithNeonAIButton = page.getByRole("button", {
      name: "plus Generate With Neon AI",
    });

    await generateWithNeonAIButton.waitFor({
      state: "visible",
      timeout: 30000,
    });
    await robustClick(page, generateWithNeonAIButton, "Generate With Neon AI");

    const ideaInput = page.getByRole("textbox", {
      name: "Enter your idea here...",
    });
    await ideaInput.waitFor({ state: "visible", timeout: 30000 });
    await ideaInput.fill("Micheal Jackson");

    await expect(ideaInput).toHaveValue("Micheal Jackson");
    console.log("Entered GenAI prompt: Micheal Jackson");

    const generateNowButton = page.getByRole("button", {
      name: "Generate Now",
    });
    await generateNowButton.waitFor({ state: "visible", timeout: 60000 });
    await productPage.smartClick(generateNowButton);
    console.log("Clicked Generate Now");

    await productPage.previewBtn.waitFor({ state: "visible", timeout: 120000 });
    console.log("Preview button is available after GenAI generation");

    await productPage.addToCart();
    await cartPage.goToCart();
    await cartPage.dismissPopup();
    await cartPage.secureCheckout();
    await checkoutPage.waitForCheckoutToLoad();
    await checkoutPage.fillStripePayment({ cvc: "123" });
    await checkoutPage.placeOrder();
    await checkoutPage.verifySuccess();
  });
});
