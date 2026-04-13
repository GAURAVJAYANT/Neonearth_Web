const fs = require("fs");
const path = require("path");

async function takeScreenshot(page, name) {
  const screenshotDir = path.join(process.cwd(), "screenshots");
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }
  
  await page.screenshot({
    path: path.join(screenshotDir, `${name}.png`),
    fullPage: true
  });
}

module.exports = { takeScreenshot };
