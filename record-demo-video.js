const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const videoDir = path.join(__dirname, 'videos');
if (!fs.existsSync(videoDir)) {
  fs.mkdirSync(videoDir, { recursive: true });
}

// Ensure local server is running
const http = require('http');
const requestListener = require('./server.js');
const PORT = 3000;
const localServer = http.createServer(requestListener);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

(async () => {
  console.log('--- STARTING PLAYWRIGHT AUTOMATED VIDEO RECORDING ---');

  await new Promise((resolve) => localServer.listen(PORT, resolve));
  console.log(`Local test server listening on http://localhost:${PORT}`);

  const browser = await chromium.launch({
    headless: true
  });

  const context = await browser.newContext({
    recordVideo: {
      dir: videoDir,
      size: { width: 1280, height: 720 }
    },
    viewport: { width: 1280, height: 720 }
  });

  const page = await context.newPage();

  // Helper for human-paced demonstration
  async function step(description, duration = 1200) {
    console.log(`[VIDEO STEP] ${description}`);
    await sleep(duration);
  }

  // SCENE 1: Welcome & Landing Page
  await page.goto(`http://localhost:${PORT}`);
  await step('Loaded Mini Checkout application homepage', 2000);

  // SCENE 2: Empty Cart Validation (MT01)
  await step('Demonstrating MT01: Attempting checkout with empty cart', 1000);
  await page.fill('[data-testid="customer-name-input"]', 'Alice Smith');
  await step('Entered customer name with empty cart', 1200);
  await page.click('[data-testid="place-order-button"]');
  await step('Clicked Place Order - Empty cart alert displayed', 2500);

  // Clear name for next scenario
  await page.fill('[data-testid="customer-name-input"]', '');

  // SCENE 3: Product Catalogue & Cart Addition
  await step('Adding Wireless Headphones (P001) to cart', 1000);
  await page.click('[data-testid="add-to-cart-P001"]');
  await step('Wireless Headphones added to cart (₹1,499.00)', 1500);

  // SCENE 4: Required Field Validation & Error Recovery (TC02)
  await step('Demonstrating TC02: Submitting without customer name', 1000);
  await page.click('[data-testid="place-order-button"]');
  await step('Inline validation error visible ("Customer name is required")', 2500);

  await step('Preserving cart state and recovering with valid name', 1000);
  await page.fill('[data-testid="customer-name-input"]', 'Jane Doe');
  await step('Typed valid name - error cleared immediately', 1500);

  // SCENE 5: Quantity Adjustments & Exact Financial Calculations (TC03)
  await step('Demonstrating TC03: Increasing Wireless Headphones qty to 2', 1000);
  await page.click('[data-testid="increase-qty-P001"]');
  await step('Subtotal updated to ₹2,998.00 (calculated in integer paise)', 2000);

  await step('Adding second product: Smart Watch (P002)', 1000);
  await page.click('[data-testid="add-to-cart-P002"]');
  await step('Smart Watch added; Grand Total updated to ₹5,497.00', 2000);

  await step('Decreasing Wireless Headphones qty back to 1', 1000);
  await page.click('[data-testid="decrease-qty-P001"]');
  await step('Subtotal adjusted; Grand Total updated to ₹3,998.00', 2000);

  // SCENE 6: Concurrency Protection & Successful Order Confirmation (TC01 & MT02)
  await step('Demonstrating TC01 & MT02: Rapid double-click protection', 1000);
  await page.fill('[data-testid="customer-name-input"]', 'Test Customer');
  await step('Prepared final order for Test Customer', 1500);

  // Trigger rapid clicks synchronously
  await page.evaluate(() => {
    const btn = document.getElementById('place-order-btn');
    btn.click();
    btn.click();
  });
  await step('Rapid double-click triggered - Synchronous lock engaged', 2000);

  // SCENE 7: Inspecting Confirmed Order
  await step('Order Confirmed! Displaying unique reference code & totals', 3500);

  await page.close();
  await context.close();
  await browser.close();

  console.log('--- RECORDING COMPLETED ---');

  // Find generated video
  const files = fs.readdirSync(videoDir);
  const webmFile = files.find((f) => f.endsWith('.webm'));
  if (webmFile) {
    const oldPath = path.join(videoDir, webmFile);
    const newPath = path.join(videoDir, 'mini-checkout-demo.webm');
    fs.renameSync(oldPath, newPath);
    console.log(`Video saved to: ${newPath}`);

    // If ffmpeg available, convert to mp4
    const ffmpegPath = 'C:\\Users\\aadit\\AppData\Local\\ms-playwright\\ffmpeg-1013\\ffmpeg-win64.exe';
    if (fs.existsSync(ffmpegPath)) {
      const { execSync } = require('child_process');
      const mp4Path = path.join(videoDir, 'mini-checkout-demo.mp4');
      console.log('Converting .webm to .mp4 using Playwright ffmpeg...');
      execSync(`"${ffmpegPath}" -y -i "${newPath}" -c:v libx264 -pix_fmt yuv420p "${mp4Path}"`);
      console.log(`MP4 video successfully generated: ${mp4Path}`);
    }
  }

  process.exit(0);
})();
