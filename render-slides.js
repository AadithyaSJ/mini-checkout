const { chromium } = require('@playwright/test');
const path = require('path');

(async () => {
  console.log('--- RENDERING 1920x1080 PRESENTATION SLIDES ---');
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  const slides = ['slide1', 'slide2', 'slide3', 'slide4', 'slide5'];

  for (const s of slides) {
    const htmlPath = 'file:///' + path.join(__dirname, 'slides', `${s}.html`).replace(/\\/g, '/');
    await page.goto(htmlPath);
    await page.waitForTimeout(300);
    const outPng = path.join(__dirname, 'slides', `${s}.png`);
    await page.screenshot({ path: outPng, fullPage: true });
    console.log(`Rendered: ${outPng}`);
  }

  await browser.close();
  console.log('--- ALL SLIDES RENDERED TO HIGH-RES PNG ---');
})();
