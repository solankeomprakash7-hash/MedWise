// Capture an HTML graphic as 1080x1920 PNG frames with Puppeteer.
// Usage: node tools/capture.js <page.html> <outDir> [seconds=1] [fps=30]
// The page may define window.seek(t) (t in seconds) to draw the frame at time t;
// otherwise every frame is the same still.
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
  const [page_, outDir, secs = '1', fps = '30'] = process.argv.slice(2);
  if (!page_ || !outDir) { console.error('usage: node tools/capture.js page.html outDir [seconds] [fps]'); process.exit(1); }
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1920 });
  await page.goto('file://' + path.resolve(page_), { waitUntil: 'networkidle0' });
  await page.evaluate(() => document.fonts && document.fonts.ready);
  const n = Math.round(Number(secs) * Number(fps));
  for (let i = 0; i < n; i++) {
    await page.evaluate(t => window.seek && window.seek(t), i / Number(fps));
    await page.screenshot({ path: path.join(outDir, `f${String(i).padStart(5, '0')}.png`), omitBackground: true });
  }
  await browser.close();
  console.log(`${n} frames -> ${outDir}`);
})();
