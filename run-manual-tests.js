const { chromium } = require('@playwright/test');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Start temporary server if port 3000 not active
const PORT = 3000;
const server = require('./server.js');

(async () => {
  console.log('--- EXECUTING MANUAL TESTS IN REAL CHROMIUM BROWSER ---');
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  // MT01: Empty Cart Checkout
  console.log('\n[MT01] Testing Empty Cart Checkout:');
  await page.goto(`http://localhost:${PORT}`);
  await page.fill('[data-testid="customer-name-input"]', 'Alice Smith');
  await page.click('[data-testid="place-order-button"]');

  const cartErrorVisible = await page.isVisible('[data-testid="cart-error"]');
  const cartErrorText = (await page.textContent('[data-testid="cart-error"]'))?.trim();
  const confirmationVisible1 = await page.isVisible('[data-testid="order-confirmation"]');
  const btnEnabled1 = await page.isEnabled('[data-testid="place-order-button"]');

  console.log('  - Cart Error Visible:', cartErrorVisible);
  console.log('  - Cart Error Text:', cartErrorText);
  console.log('  - Confirmation Visible:', confirmationVisible1);
  console.log('  - Button Remains Enabled:', btnEnabled1);

  await page.screenshot({ path: path.join(__dirname, 'screenshots', 'manual-mt01-empty-cart.png'), fullPage: true });

  // MT02: Rapid Double-Click Protection
  console.log('\n[MT02] Testing Rapid Double-Click Protection:');
  const page2 = await context.newPage();
  await page2.goto(`http://localhost:${PORT}`);
  await page2.click('[data-testid="add-to-cart-P001"]');
  await page2.click('[data-testid="add-to-cart-P002"]');
  await page2.fill('[data-testid="customer-name-input"]', 'Speedy Submitter');

  const placeBtn = page2.locator('[data-testid="place-order-button"]');
  // Dispatch two clicks in rapid succession (< 10ms)
  await Promise.all([
    placeBtn.click(),
    placeBtn.click()
  ]);

  const confirmationCount = await page2.locator('[data-testid="order-confirmation"]').count();
  const confirmationVisible2 = await page2.isVisible('[data-testid="order-confirmation"]');
  const refCode = (await page2.textContent('[data-testid="confirmed-order-reference"]'))?.trim();
  const customerName = (await page2.textContent('[data-testid="confirmed-customer-name"]'))?.trim();
  const orderTotal = (await page2.textContent('[data-testid="confirmed-order-total"]'))?.trim();
  const btnDisabled2 = await page2.isDisabled('[data-testid="place-order-button"]');

  console.log('  - Confirmation Count:', confirmationCount);
  console.log('  - Confirmation Visible:', confirmationVisible2);
  console.log('  - Reference Code Generated:', refCode);
  console.log('  - Customer Name:', customerName);
  console.log('  - Order Total:', orderTotal);
  console.log('  - Place Order Button Disabled:', btnDisabled2);

  await page2.screenshot({ path: path.join(__dirname, 'screenshots', 'manual-mt02-rapid-double-click.png'), fullPage: true });

  await browser.close();
  console.log('\n--- MANUAL TESTS COMPLETED SUCCESSFULLY ---');
  process.exit(0);
})();
