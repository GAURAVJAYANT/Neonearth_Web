const { test } = require('@playwright/test');

test('Debug Cushions Dropdown Structure', async ({ page }) => {
  test.setTimeout(60000);
  
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  console.log('✅ Page loaded');
  
  // Wait for page to stabilize
  await page.waitForTimeout(2000);
  
  // Hover Pillows menu
  const pillowsMenu = page.locator('nav.header-navigation-bar ul.header-navigation-list li.top-level-item a.top-level-link span.label-text', { hasText: 'Pillows' });
  await pillowsMenu.waitFor({ state: 'visible', timeout: 5000 });
  await pillowsMenu.hover();
  console.log('✅ Hovered Pillows menu');
  
  await page.waitForTimeout(2000);
  
  // Take screenshot to see dropdown
  await page.screenshot({ path: 'dropdown-pillows.png', fullPage: true });
  console.log('📸 Screenshot 1: Pillows dropdown');
  
  // Try to find Cushions with different selectors
  console.log('\n🔍 Searching for Cushions with different methods...');
  
  // Method 1: getByRole with name filter
  try {
    const cushionsRole = page.getByRole('link', { name: /Cushions/ });
    const count1 = await cushionsRole.count();
    console.log(`✅ getByRole('link', { name: /Cushions/ }) found: ${count1} elements`);
    if (count1 > 0) {
      const box = await cushionsRole.first().boundingBox();
      console.log(`   Position: x=${box?.x}, y=${box?.y}`);
      const text = await cushionsRole.first().textContent();
      console.log(`   Text: "${text}"`);
    }
  } catch (e) {
    console.log(`❌ getByRole failed: ${e.message.split('\n')[0]}`);
  }
  
  // Method 2: getByText
  try {
    const cushionsText = page.getByText('Cushions', { exact: true });
    const count2 = await cushionsText.count();
    console.log(`✅ getByText('Cushions', { exact: true }) found: ${count2} elements`);
    if (count2 > 0) {
      const box = await cushionsText.first().boundingBox();
      console.log(`   Position: x=${box?.x}, y=${box?.y}`);
    }
  } catch (e) {
    console.log(`❌ getByText failed: ${e.message.split('\n')[0]}`);
  }
  
  // Method 3: CSS locator a with text
  try {
    const cushionsA = page.locator('a').filter({ hasText: 'Cushions' });
    const count3 = await cushionsA.count();
    console.log(`✅ locator('a').filter({ hasText: 'Cushions' }) found: ${count3} elements`);
    if (count3 > 0) {
      const box = await cushionsA.first().boundingBox();
      console.log(`   Position: x=${box?.x}, y=${box?.y}`);
      const html = await cushionsA.first().innerHTML();
      console.log(`   HTML: ${html.substring(0, 100)}...`);
    }
  } catch (e) {
    console.log(`❌ CSS locator failed: ${e.message.split('\n')[0]}`);
  }
  
  // Method 4: Check page HTML for Cushions
  const pageHTML = await page.content();
  const cushionsMatches = pageHTML.match(/Cushions/g);
  console.log(`\n✅ Word "Cushions" appears ${cushionsMatches ? cushionsMatches.length : 0} times in page HTML`);
  
  // Method 5: Hover different Cushions candidates and see what appears
  console.log('\n🔄 Testing hover on Cushions candidates...');
  const allLinks = page.locator('a');
  const count = await allLinks.count();
  console.log(`Found ${count} total links on page`);
  
  for (let i = 0; i < Math.min(count, 30); i++) {
    const text = await allLinks.nth(i).textContent();
    if (text && text.includes('Cushion')) {
      console.log(`  [${i}] "${text}"`);
      
      // Try hovering this element
      try {
        await allLinks.nth(i).hover();
        await page.waitForTimeout(1000);
        
        // Check if Square Seat Cushion appears
        const squareSeat = page.getByText('Square Seat Cushion', { exact: true });
        const isVisible = await squareSeat.isVisible().catch(() => false);
        console.log(`      → After hover: Square Seat Cushion visible? ${isVisible}`);
        
        if (isVisible) {
          console.log(`      ✅ THIS IS THE CORRECT CUSHIONS LINK!`);
          await page.screenshot({ path: `cushions-submenu-found.png`, fullPage: true });
        }
      } catch (e) {
        // Hover failed, skip
      }
    }
  }
  
  console.log('\n✅ Debug complete');
});
