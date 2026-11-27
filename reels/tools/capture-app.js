// Capture MedWise app screens at phone size for Reels (assets/).
// Usage: start the app (npx vite --port=3000), then:
//   node reels/tools/capture-app.js [baseUrl=http://127.0.0.1:3000] [outDir=ai-video-editor/assets/app]
const { chromium } = require('playwright');
const fs = require('fs');

const base = process.argv[2] || 'http://127.0.0.1:3000';
const out = process.argv[3] || 'ai-video-editor/assets/app';
const shots = [
  ['01-landing', '/'],
  ['02-ecg-home', '/ecg.html#/home'],
  ['03-placement', '/ecg.html#/placement'],
  ['04-learn', '/ecg.html#/learn'],
  ['05-practice', '/ecg.html#/practice'],
  ['06-emergency', '/ecg.html#/emergency'],
  ['07-exam', '/ecg.html#/exam'],
  ['08-lab', '/ecg.html#/lab'],
  ['09-heart-lab', '/ecg-lab.html'],
];

(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  for (const [name, path] of shots) {
    await page.goto(base + path, { waitUntil: 'networkidle' }).catch(() => {});
    await page.waitForTimeout(3000); // splash + animations settle
    await page.screenshot({ path: `${out}/${name}.png` });
    console.log('saved', `${out}/${name}.png`);
  }
  await browser.close();
})();
